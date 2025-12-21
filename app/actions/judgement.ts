'use server'

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { revalidatePath } from 'next/cache';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function endRoundAndJudge(roundId: string) {
  // 1. Fetch Round
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

  // 3. Generate Judgment (WITH ADVANCED GEN Z LOGIC + FALLBACK)
  const systemPrompt = `
    You are the Supreme Judge of a debate.
    Topic: "${round.topic}"
    Mode: "${round.mode}"

    Decide the winner and create a "Scouting Report".
    
    OUTPUT JSON:
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

    SCORING ADJUSTMENTS (THE "STYLE SWITCH" RULE):
    1. **Global Override Check**:
       - Scan the USER'S text for slang triggers (e.g., "no cap", "bet", "bruh", "damn", "rizz", "deadass").
       - **IF DETECTED**: The User has activated "Gen Z Override". **IGNORE** standard professional rules. Rate strictly on "Aura", "Roast Quality", and Logic.
    
    2. **If NO Override is detected**:
       - **"POLITICS_INDIA" / "GENERAL"**: Penalize slang, emojis, and lack of professionalism.
       - **"ADULT"**: Do NOT penalize profanity. Judge on dominance.
       - **"GENZ"**: Slang is required. Reward funny insults.
  `;

  let textResponse = "";

  try {
    // ATTEMPT 1: Try the High-Quality Model (70b)
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      prompt: `TRANSCRIPT:\n\n${transcript}`,
    });
    textResponse = text;

  } catch (error) {
    console.warn("⚠️ 70b Model Rate Limited. Switching to Fallback (8b)...");
    
    // ATTEMPT 2: Fallback to Faster Model (8b)
    try {
      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'), // Uses different rate limit bucket
        system: systemPrompt,
        prompt: `TRANSCRIPT:\n\n${transcript}`,
      });
      textResponse = text;
    } catch (secondError) {
      console.error("❌ Both models failed:", secondError);
      textResponse = "{}"; 
    }
  }

  // 4. Parse JSON (WITH FALLBACK SAFETY)
  let result;
  try {
    const cleanJson = textResponse.replace(/```json|```/g, '').trim();
    result = JSON.parse(cleanJson);
  } catch (error) {
    console.error("JSON Parse Error or AI Failure:", textResponse);
    // FALLBACK: Return a Draw so the game finishes gracefully
    result = {
        winner: "Draw",
        winnerName: "Draw",
        scores: { playerA: 50, playerB: 50 },
        reasoning: "The debate was inconclusive due to high server load.",
        feedback: ["Please try again later."],
        user_analysis: null 
    };
  }

  // 5. Save to Database
  
  // A. Save Round Result
  await prisma.round.update({
    where: { id: roundId },
    data: {
      status: 'COMPLETED',
      scorecard: result,
    }
  });

  // B. Save AI Memory (Safe Wrapped)
  const humanParticipant = round.participants.find(p => p.role !== 'AI');
  
  if (humanParticipant && humanParticipant.userId && result.user_analysis) {
    try {
      await prisma.user.update({
        where: { id: humanParticipant.userId },
        data: {
          // @ts-ignore
          aiMemory: result.user_analysis 
        }
      });
    } catch (e) {
      console.warn("Failed to save AI Memory:", e);
    }
  }

  revalidatePath(`/debate/${roundId}`);
  return { success: true };
}