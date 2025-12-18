'use server'

import { prisma } from '@/lib/prisma'

export async function checkOpponentJoined(roundId: string) {
  // Count how many non-moderator participants are in the round
  const count = await prisma.participant.count({
    where: {
      roundId: roundId,
      role: { not: 'MODERATOR' }
    }
  });

  // If we have 2 or more humans, the game is ready
  return count >= 2;
}