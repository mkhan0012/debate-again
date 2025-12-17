'use server'

import { encrypt, decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Imports for AI logic
import { generateAiRebuttal, moderateContent } from '@/app/actions/ai-services'; 
import { analyzeArgument } from '@/app/actions/ai-analyst'; 

// --- ACTION 1: SUBMIT USER ARGUMENT ---
export async function submitUserArgument(formData: FormData) {
  const userArgumentText = formData.get('argument') as string;
  const roundId = formData.get('roundId') as string;
  const participantId = formData.get('participantId') as string;

  // Validate inputs
  if (!userArgumentText || !roundId || !participantId) {
    throw new Error("Missing required fields");
  }

  // 1. Encrypt the argument text
  const { contentEncrypted, iv } = encrypt(userArgumentText);

  // 2. Save to Database
  await prisma.argument.create({
    data: { 
      contentEncrypted, 
      iv, 
      roundId, 
      participantId 
    }
  });

  // 3. Refresh the page data
  revalidatePath(`/debate/${roundId}`);
  return { success: true };
}

// --- ACTION 2: TRIGGER AI RESPONSE ---
export async function triggerAiResponse(roundId: string, userArgumentText: string) {
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { 
      arguments: { 
        orderBy: { createdAt: 'asc' },
        include: { participant: true }
      } 
    }
  });

  if (!round) return { error: "Round not found" };

  // 1. Check for Hostility first
  const moderation = await moderateContent(userArgumentText);
  const isHostile = moderation?.is_hostile || false;

  // 2. Determine AI Stance & Debate Mode
  // We use (round as any) because Prisma types might not have updated yet in your editor
  const userSide = (round as any).userSide || "For"; 
  const aiStance = userSide === "For" ? "Against" : "For";
  const mode = (round as any).mode || "GENERAL"; // <--- NEW: Get the selected mode

  // 3. Prepare Chat History for Context
  // FIX: Added (arg: any) to prevent the build error
  const chatHistory = round.arguments.map((arg: any) => {
    try {
      const text = decrypt(arg.contentEncrypted, arg.iv);
      const role = arg.participant.role === 'AI' ? 'AI' : 'Opponent';
      return `${role}: ${text}`;
    } catch { return ""; }
  });

  // 4. Generate Analysis & Rebuttal (Parallel)
  const [analysis, aiResponseText] = await Promise.all([
    analyzeArgument(userArgumentText, round.topic),
    // Pass the 'mode' to the AI service here vvv
    generateAiRebuttal(round.topic, aiStance, chatHistory, isHostile, mode)
  ]);

  // 5. Update Analysis on the User's Last Argument
  const lastUserArg = round.arguments[round.arguments.length - 1];
  if (lastUserArg) {
    await prisma.argument.update({
      where: { id: lastUserArg.id },
      data: { aiAnalysis: analysis as any }
    });
  }

  // 6. Ensure AI Participant Exists
  let aiParticipant = await prisma.participant.findFirst({
    where: { roundId, role: 'AI' }
  });

  if (!aiParticipant) {
    aiParticipant = await prisma.participant.create({
      data: { roundId, role: 'AI' } 
    });
  }

  // 7. Save AI Response
  const aiEncrypted = encrypt(aiResponseText);
  await prisma.argument.create({
    data: {
      contentEncrypted: aiEncrypted.contentEncrypted,
      iv: aiEncrypted.iv,
      roundId,
      participantId: aiParticipant.id,
    }
  });

  revalidatePath(`/debate/${roundId}`);
  return { success: true };
}