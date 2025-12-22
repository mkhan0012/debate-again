// lib/debate-feed.ts
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

// Define the exact message shape the AI SDK expects
export type DebateMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Default limit is 12 (last 6 turns from each side) to save tokens
export async function getDebateHistory(roundId: string, limit: number = 12): Promise<DebateMessage[]> {
  
  // 1. Fetch LAST 'limit' arguments (Database Level Pruning)
  // 'take: -limit' grabs the end of the list efficiently
  const argumentsList = await prisma.argument.findMany({
    where: { roundId },
    orderBy: { createdAt: 'asc' },
    take: -limit, 
    include: {
      participant: {
        select: { role: true } // We only need the role
      }
    }
  });

  // 2. Format & Map Roles
  const history = argumentsList.map((arg) => {
    try {
      const text = decrypt(arg.contentEncrypted, arg.iv);
      const role = arg.participant.role;

      // A. AI's own previous replies
      if (role === 'AI') {
        return { role: 'assistant' as const, content: text };
      }

      // B. Moderator/Referee Interventions (Important Context)
      if (role === 'MODERATOR') {
        return { 
          role: 'system' as const, 
          content: `[REFEREE NOTICE]: ${text}` 
        };
      }

      // C. The Human User (Opponent)
      return { role: 'user' as const, content: text };

    } catch (e) {
      return null;
    }
  }).filter((msg): msg is DebateMessage => msg !== null); // Removes nulls & fixes Types

  return history;
}