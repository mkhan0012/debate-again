// app/actions/debate.ts
'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const CreateDebateSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters long"),
  position: z.enum(["For", "Against"]),
  mode: z.enum(["GENERAL", "POLITICS_INDIA"]), // <--- Add validation
})

export async function createDebate(topic: string, position: string, mode: string) {
  const session = await getSession()
  if (!session || !session.userId) redirect('/login')

  // Validate inputs
  const result = CreateDebateSchema.safeParse({ topic, position, mode })
  
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input data";
    return { error: firstError }
  }

  let roundId: string;

  try {
    const round = await prisma.round.create({
      data: {
        topic: result.data.topic,
        status: "ACTIVE",
        userSide: result.data.position,
        mode: result.data.mode, // <--- Save the mode
      }
    })

    await prisma.participant.create({
      data: {
        userId: String(session.userId),
        roundId: round.id,
        role: "DEBATER", 
      }
    })

    roundId = round.id;
  } catch (error) {
    console.error("Failed to create debate:", error)
    return { error: "System Error" }
  }

  redirect(`/debate/${roundId}`)
}