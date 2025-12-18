'use server'

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai'; // <--- CHANGED: Import generateText instead of generateObject
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function endRoundAndJudge(roundId: string) {
  // 1. Fetch Round & Arguments
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      arguments: {
        include: { participant: { include: { user: true } } },
        orderBy: { createdAt: 'asc' }
      },
      participants: true
    }
  });

  if (!round) throw new Error("Round not found");

  // 2. Format Transcript
  const transcript = round.arguments.map(arg => {
    try {
      const text = decrypt(arg.contentEncrypted, arg.iv);
      const username = arg.participant.user?.username || 'AI';
      const role = arg.participant.role;
      return `${role === 'AI' ? 'AI_OPPONENT' : username}: "${text}"`;
    } catch (e) {
      return null;
    }
  }).filter(Boolean).join("\n\n");

  // 3. Generate Text (instead of Object) to avoid "json_schema" errors
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `
      You are the Supreme Judge of a debate.
      Topic: "${round.topic}"
      Mode: "${round.mode}"

      Your goal is to decide the winner and provide scores.
      
      OUTPUT FORMAT:
      You must output a single VALID JSON object. Do not wrap it in markdown code blocks.
      The JSON must strictly follow this structure:
      {
        "winner": "Player A" | "Player B" | "AI" | "Draw",
        "winnerName": "string (username of winner)",
        "scores": {
          "playerA": number (0-100),
          "playerB": number (0-100)
        },
        "reasoning": "string (max 2 sentences)",
        "feedback": ["string (point 1)", "string (point 2)", "string (point 3)"]
      }

      INSTRUCTIONS:
      1. Analyze the transcript objectively.
      2. If Mode is PVP, identify humans by username. Player A is the first speaker, Player B is the second.
      3. If Mode is GENERAL, judge Human vs AI.
    `,
    prompt: `TRANSCRIPT:\n\n${transcript}`,
  });

  // 4. Parse the JSON manually
  let scorecard;
  try {
    // Clean up potential markdown code blocks (e.g. ```json ... ```)
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    scorecard = JSON.parse(cleanJson);
  } catch (error) {
    console.error("JSON Parse Error:", text);
    throw new Error("Failed to parse Judge's decision.");
  }

  // 5. Save to Database
  await prisma.round.update({
    where: { id: roundId },
    data: {
      status: 'COMPLETED',
      scorecard: scorecard,
    }
  });

  revalidatePath(`/debate/${roundId}`);
  return { success: true };
}