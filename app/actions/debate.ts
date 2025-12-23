// app/actions/debate.ts
'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { headers } from 'next/headers'
import { logActivity } from './logger'

// --- RATE LIMITING ---
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000; 
const MAX_DEBATES_PER_MIN = 3; 

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
  if (validTimestamps.length >= MAX_DEBATES_PER_MIN) return false;
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

// --- VALIDATION ---
const CreateDebateSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters long").max(100),
  position: z.enum(["For", "Against"]),
  mode: z.enum(["GENERAL", "PVP"]), // Matches your UI options
  persona: z.enum(['LOGIC_LORD', 'ROAST_MASTER', 'GENTLE_GUIDE']).optional().default('LOGIC_LORD'),
})

// FIX: Add 'prevState' as first argument to satisfy useActionState signature
export async function createDebate(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || !session.userId) redirect('/login')

  // 1. Check Rate Limit
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return { error: "You are creating debates too fast. Please wait." }
  }

  // 2. Parse Inputs
  const rawData = {
    topic: formData.get('topic'),
    position: formData.get('position'),
    mode: formData.get('mode'),
    persona: formData.get('persona') 
  }

  const result = CreateDebateSchema.safeParse(rawData)
  
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input" }
  }

  let roundId: string;

  try {
    const round = await prisma.round.create({
      data: {
        topic: result.data.topic,
        status: "ACTIVE",
        userSide: result.data.position,
        mode: result.data.mode,
        // Ensure you ran the migration for 'aiPersona' field, otherwise remove this line
        aiPersona: result.data.persona, 
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

    // Log it
    await logActivity({
      eventType: 'DEBATE_START',
      pageUrl: `/debate/${roundId}`,
      action: `Started debate: ${result.data.topic}`,
      metadata: { mode: result.data.mode, persona: result.data.persona }
    });

  } catch (error) {
    console.error("Create Error:", error)
    return { error: "System Error: Could not create debate." }
  }

  redirect(`/debate/${roundId}`)
}