'use server'

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function endRoundAndJudge(roundId: string) {
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      arguments: {
        include: { participant: { include: { user: true } } },
        orderBy: { createdAt: 'asc' }
      },
      participants: { include: { user: true } }
    }
  });

  if (!round) throw new Error("Round not found");

  const transcript = round.arguments.map(arg => {
    try {
      const text = decrypt(arg.contentEncrypted, arg.iv);
      const role = arg.participant.role;
      return `${role === 'AI' ? 'AI' : 'User'}: ${text}`;
    } catch (e) { return null; }
  }).filter(Boolean).join("\n");

  // OPTIMIZATION: Minimized System Prompt to save ~100 tokens
  const systemPrompt = `
    Role: Judge. Topic: "${round.topic}". Mode: "${round.mode}".
    Task: Decide winner & analyze.
    
    JSON OUTPUT ONLY:
    {
      "winner": "Player A" | "Player B" | "AI" | "Draw",
      "winnerName": "string",
      "scores": { "playerA": number, "playerB": number },
      "reasoning": "string",
      "feedback": ["string"],
      "user_analysis": {
          "play_style": "string",
          "detected_weakness": "string",
          "tip_for_next_ai": "string"
      }
    }

    RULES:
    - GEN Z MODE: Use emojis in reasoning (💀, 🤡). Judge on "Aura".
    - NORMAL: Judge on Logic.
  `;

  let textResponse = "";

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      prompt: `TRANSCRIPT:\n${transcript}`,
    });
    textResponse = text;
  } catch (error) {
    try {
      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'),
        system: systemPrompt,
        prompt: `TRANSCRIPT:\n${transcript}`,
      });
      textResponse = text;
    } catch (secondError) {
      textResponse = "{}"; 
    }
  }

  let result;
  try {
    const start = textResponse.indexOf('{');
    const end = textResponse.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("No JSON");
    result = JSON.parse(textResponse.substring(start, end + 1));
  } catch (error) {
    result = {
        winner: "Draw",
        winnerName: "Draw",
        scores: { playerA: 50, playerB: 50 },
        reasoning: "Server overload. Draw declared.",
        feedback: ["Try again later."],
        user_analysis: null 
    };
  }

  await prisma.round.update({
    where: { id: roundId },
    data: { status: 'COMPLETED', scorecard: result }
  });

  const human = round.participants.find(p => p.role !== 'AI');
  if (human?.userId && result.user_analysis) {
    try {
      await prisma.user.update({
        where: { id: human.userId },
        // @ts-ignore
        data: { aiMemory: result.user_analysis }
      });
    } catch (e) {}
  }

  revalidatePath(`/debate/${roundId}`);
  return { success: true };
}