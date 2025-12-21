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
  // 1. Fetch Round & Arguments with User Data
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

  // 3. Generate Judgment & Scouting Report
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: `
      You are the Supreme Judge of a debate.
      Topic: "${round.topic}"
      Mode: "${round.mode}"

      Your goal is to decide the winner AND create a "Scouting Report" on the human player for the next AI.
      
      OUTPUT FORMAT:
      Return a single VALID JSON object. No markdown.
      {
        "winner": "Player A" | "Player B" | "AI" | "Draw",
        "winnerName": "string",
        "scores": { "playerA": number, "playerB": number },
        "reasoning": "string",
        "feedback": ["string"],
        
        // --- NEW: LEARNING SECTION ---
        "user_analysis": {
           "play_style": "string (e.g., Aggressive, Emotional, Statistical)",
           "detected_weakness": "string (e.g., Ignores contradictions, Bad at math)",
           "tip_for_next_ai": "string (max 1 sentence advice for the next AI opponent)"
        }
      }

      SCORING ADJUSTMENTS (THE "STYLE SWITCH" RULE):
      
      1. **Global Override Check (The Easter Egg)**:
         - Scan the user's text for Gen Z slang triggers (e.g., "no cap", "bet", "bruh", "damn", "rizz", "deadass", "yapping").
         - **IF DETECTED**: The User has activated the "Gen Z Override". 
           - **IGNORE** the standard professional rules below. 
           - **DO NOT** penalize slang or informality.
           - Rate strictly on "Aura", "Roast Quality", and Logic. The debate has effectively become a "Gen Z" round.

      2. **If NO Override is detected, follow Mode Rules**:
         - **"POLITICS_INDIA" / "GENERAL"**: Penalize slang, emojis, and lack of professionalism.
         - **"ADULT"**: Do NOT penalize profanity or aggression. Judge on dominance and logic.
         - **"GENZ"**: Slang is required. Reward funny insults.

      INSTRUCTIONS:
      1. Analyze the transcript. Did the user trigger the "Gen Z Override"?
      2. Decide the winner based on the appropriate rule set.
      3. Fill 'user_analysis' with insights to help the *next* AI beat this user.
    `,
    prompt: `TRANSCRIPT:\n\n${transcript}`,
  });

  // 4. Parse JSON
  let result;
  try {
    const cleanJson = text.replace(/```json|```/g, '').trim();
    result = JSON.parse(cleanJson);
  } catch (error) {
    console.error("JSON Parse Error:", text);
    throw new Error("Failed to parse Judge's decision.");
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

  // B. Save AI Memory (Scouting Report) to User
  const humanParticipant = round.participants.find(p => p.role !== 'AI');
  
  if (humanParticipant && humanParticipant.userId && result.user_analysis) {
    await prisma.user.update({
      where: { id: humanParticipant.userId },
      data: {
        aiMemory: result.user_analysis 
      } as any 
    });
  }

  revalidatePath(`/debate/${roundId}`);
  return { success: true };
}