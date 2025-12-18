'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function getOpenChambers() {
  // 1. Check Session (Optional: Remove if you want public viewing)
  const session = await getSession();
  
  // 2. Fetch all PVP rounds that are currently WAITING
  const chambers = await prisma.round.findMany({
    where: {
      mode: 'PVP',
      status: 'WAITING', 
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      participants: {
        where: { role: 'DEBATER' },
        include: { user: true }
      }
    }
  });

  return chambers;
}