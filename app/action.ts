'use server'

import { encrypt, decrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

import { analyzeArgument } from '@/app/actions/ai-analyst'; 
import { moderatePvpChat } from '@/app/actions/moderator'; 

// --- ACTION 1: CREATE NEW ROUND ---
export async function createRound(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const topic = formData.get('topic') as string;
  const mode = formData.get('mode') as string || 'GENERAL';

  if (!topic) return;

  const initialStatus = mode === 'PVP' ? 'WAITING' : 'ACTIVE';

  const round = await prisma.round.create({
    data: {
      topic,
      mode,
      status: initialStatus,
      userSide: 'For',
      participants: {
        create: {
          userId: session.userId as string, 
          role: 'DEBATER',
        }
      }
    }
  });

  revalidatePath('/lobby');
  redirect(`/debate/${round.id}`);
}

// --- ACTION 2: SUBMIT ARGUMENT (FAST - NO ANALYSIS) ---
export async function submitUserArgument(formData: FormData) {
  const userArgumentText = formData.get('argument') as string;
  const roundId = formData.get('roundId') as string;
  const participantId = formData.get('participantId') as string;

  if (!userArgumentText || !roundId || !participantId) {
    throw new Error("Missing required fields");
  }

  // A. Encrypt & Save User Argument
  const { contentEncrypted, iv } = encrypt(userArgumentText);

  const newArgument = await prisma.argument.create({
    data: { 
      contentEncrypted, 
      iv, 
      roundId, 
      participantId 
    }
  });

  // B. Run AI Moderator (Referee) - Only for PVP (Must be fast)
  // We keep this here because it's critical for safety/rules
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { topic: true, mode: true }
  });

  if (round?.mode === 'PVP' && round.topic) {
    const moderatorCorrection = await moderatePvpChat(round.topic, userArgumentText);
    if (moderatorCorrection) {
      let moderator = await prisma.participant.findFirst({
        where: { roundId, role: 'MODERATOR' }
      });
      if (!moderator) {
        moderator = await prisma.participant.create({
          data: { roundId, role: 'MODERATOR' }
        });
      }
      const modEncrypted = encrypt(moderatorCorrection);
      await prisma.argument.create({
        data: {
          contentEncrypted: modEncrypted.contentEncrypted,
          iv: modEncrypted.iv,
          roundId,
          participantId: moderator.id,
        }
      });
    }
  }

  revalidatePath(`/debate/${roundId}`);
  
  // RETURN THE ID so we can analyze it later
  return { success: true, argumentId: newArgument.id };
}

// --- ACTION 3: TRIGGER ANALYSIS (DELAYED) ---
export async function triggerAnalysis(argumentId: string) {
  const argument = await prisma.argument.findUnique({
    where: { id: argumentId },
    include: { round: true }
  });

  if (!argument || !argument.round.topic) return;

  try {
     const text = decrypt(argument.contentEncrypted, argument.iv);
     const analysisResult = await analyzeArgument(text, argument.round.topic);
     
     await prisma.argument.update({
       where: { id: argumentId },
       data: { aiAnalysis: analysisResult as any }
     });

     revalidatePath(`/debate/${argument.roundId}`);
     return { success: true };
  } catch (e) {
     console.error("Analysis Failed:", e);
     return { error: "Failed" };
  }
}