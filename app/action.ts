'use server'

import { encrypt, decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- FIXED IMPORTS ---
import { generateAiRebuttal } from '@/app/actions/ai-services';
import { analyzeArgument } from '@/app/actions/ai-analyst'; 
// ---------------------

// --- ACTION 1: FAST (User Only) ---
export async function submitUserArgument(formData: FormData) {
  const userArgumentText = formData.get('argument') as string;
  const roundId = formData.get('roundId') as string;
  const participantId = formData.get('participantId') as string;

  if (!userArgumentText || !roundId || !participantId) throw new Error("Missing fields");

  // Save User Argument
  const { contentEncrypted, iv } = encrypt(userArgumentText);
  await prisma.argument.create({
    data: { contentEncrypted, iv, roundId, participantId }
  });

  // Refresh UI
  revalidatePath(`/debate/${roundId}`);
  return { success: true };
}

// --- ACTION 2: PARALLEL AI (Turbo Mode) ---
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

  // Prepare History
  const chatHistory = round.arguments.map(arg => {
    try {
      const text = decrypt(arg.contentEncrypted, arg.iv);
      const role = arg.participant.role === 'AI' ? 'AI' : 'Opponent';
      return `${role}: ${text}`;
    } catch { return ""; }
  });

  // EXECUTE PARALLEL
  const [analysis, aiResponseText] = await Promise.all([
    analyzeArgument(userArgumentText, round.topic),
    generateAiRebuttal(round.topic, "Against", chatHistory)
  ]);

  // Save Analysis
  const lastUserArg = round.arguments[round.arguments.length - 1];
  if (lastUserArg) {
    await prisma.argument.update({
      where: { id: lastUserArg.id },
      data: { aiAnalysis: analysis as any }
    });
  }

  // Ensure AI Participant
  let aiParticipant = await prisma.participant.findFirst({
    where: { roundId, role: 'AI' }
  });

  if (!aiParticipant) {
    aiParticipant = await prisma.participant.create({
      data: { roundId, role: 'AI' } 
    });
  }

  // Save AI Response
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