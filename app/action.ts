'use server'

import { encrypt } from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

// Import AI Services (Keep these if you have them)
import { analyzeArgument } from '@/app/actions/ai-analyst'; 
import { moderatePvpChat } from '@/app/actions/moderator'; 

// --- ACTION 1: CREATE NEW ROUND ---
export async function createRound(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    redirect('/login');
  }

  const topic = formData.get('topic') as string;
  const mode = formData.get('mode') as string || 'GENERAL';

  if (!topic) return;

  // ⚠️ CRITICAL FIX: 
  // PvP rounds must start as 'WAITING' to appear in the Lobby.
  // Solo rounds (GENERAL) start as 'ACTIVE' immediately.
  const initialStatus = mode === 'PVP' ? 'WAITING' : 'ACTIVE';

  const round = await prisma.round.create({
    data: {
      topic,
      mode,
      status: initialStatus, // <--- THIS IS THE KEY LINE
      userSide: 'For',
      participants: {
        create: {
          userId: session.userId as string, 
          role: 'DEBATER',
        }
      }
    }
  });

  // Force the Lobby to update immediately
  revalidatePath('/lobby');

  redirect(`/debate/${round.id}`);
}

// ... (Keep submitUserArgument as it is) ...
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

  // B. Fetch Round Context
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { topic: true, mode: true }
  });

  if (!round) return { error: "Round not found" };

  // C. Run AI Analyst (The Coach) - For everyone
  if (round.topic) {
    const analysisResult = await analyzeArgument(userArgumentText, round.topic);
    
    await prisma.argument.update({
      where: { id: newArgument.id },
      data: { aiAnalysis: analysisResult as any }
    });
  }

  // D. Run AI Moderator (The Referee) - ONLY for PvP
  if (round.mode === 'PVP') {
    const moderatorCorrection = await moderatePvpChat(round.topic, userArgumentText);

    if (moderatorCorrection) {
      // Find/Create Moderator Bot
      let moderator = await prisma.participant.findFirst({
        where: { roundId, role: 'MODERATOR' }
      });

      if (!moderator) {
        moderator = await prisma.participant.create({
          data: { roundId, role: 'MODERATOR' }
        });
      }

      // Post Correction
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
  return { success: true };
}