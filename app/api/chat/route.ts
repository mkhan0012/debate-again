import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/encryption';
import { z } from 'zod';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY, 
});

export const maxDuration = 30;

// Validate Input
const ChatBodySchema = z.object({
  roundId: z.string().uuid(),
});

export async function POST(req: Request) {
  // 1. Validation
  let roundId: string;
  try {
    const json = await req.json();
    const parse = ChatBodySchema.safeParse(json);
    if (!parse.success) return new Response('Invalid ID', { status: 400 });
    roundId = parse.data.roundId;
  } catch (error) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // 2. Fetch Round
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      arguments: {
        orderBy: { createdAt: 'asc' },
        include: { participant: { include: { user: true } } },
      },
      participants: { include: { user: true } }
    },
  });

  if (!round) return new Response('Round not found', { status: 404 });

  const opponent = round.participants.find(p => p.role !== 'AI');
  const opponentName = opponent?.user?.username || "Debater";

  // 3. Prepare History & Capture Last Message
  let lastUserText = "";
  const messages: any[] = round.arguments.map((arg) => {
    try {
      const text = decrypt(arg.contentEncrypted, arg.iv);
      const role = arg.participant.role === 'AI' ? 'assistant' : 'user';
      if (role === 'user') lastUserText = text.toLowerCase(); 
      return { role, content: text };
    } catch {
      return null;
    }
  }).filter(Boolean);

  const userSide = round.userSide || 'For';
  const aiStance = userSide === 'For' ? 'Against' : 'For';
  const mode = round.mode || 'GENERAL';

  // --- FEATURE: DYNAMIC GEN Z TRIGGER ---
  const genZKeywords = [
    "no cap", "fr", "bet", "bruh", "cringe", "mid", "rizz", 
    "yapping", "cooked", "based", "sus", "finna", "gyatt", "fanum", 
    "bro", "damn", "skull", "deadass"
  ];
  
  const isGenZTriggered = genZKeywords.some(word => lastUserText.includes(word));

  let styleOverride = "";
  if (isGenZTriggered) {
    styleOverride = `
      🚨 STYLE OVERRIDE: ACTIVE 🚨
      The user used slang ("${lastUserText.substring(0, 15)}...").
      - IMMEDIATE ACTION: SWITCH TO GEN Z MODE.
      - FORGET being professional. Be toxic/funny.
      - USE: "bro", "fr", "💀", "cooked".
    `;
  }

  // --- STRONG MODE INSTRUCTIONS (Optimized for 8b Model) ---
  let modeInstructions = "";

  if (mode === "POLITICS_INDIA") {
    modeInstructions = `
      CONTEXT: Indian Politics (Serious).
      - STYLE: TV News Anchor (Arnab style).
      - KEYWORDS: Constitution, Supreme Court, Bill, Act.
      - NOTE: Be sharp and aggressive, but no slang.
    `;
  } 
  else if (mode === "ADULT") {
    modeInstructions = `
      CONTEXT: Adult/Uncensored (Mature).
      - STYLE: Raw, Dark, Realist.
      - PERMISSION: You CAN swear (f*ck, sh*t) if it fits the argument.
      - GOAL: Be brutally honest.
    `;
  } 
  else if (mode === "GENZ") {
    modeInstructions = `
      CONTEXT: Gen Z / Brainrot (Funny).
      - CRITICAL RULE: DO NOT WRITE LIKE A ROBOT.
      - STYLE: lowercase only. use slang. act bored or savage.
      - VOCAB: "no cap", "bet", "mid", "L take", "cooked", "touch grass", "yap session".
      - EMOJIS: Use 💀, 😭, 🤡 after insults.
      - EXAMPLE RESPONSE: "bro really thinks he did something 💀. that logic is mid at best."
    `;
  }
  else {
    modeInstructions = `
      CONTEXT: Professional Debate (Formal).
      - STYLE: Academic, Logical, Polite.
      - NO slang. NO emojis.
    `;
  }

  // --- MEMORY ---
  let memoryContext = "";
  if (opponent?.user?.aiMemory) {
    const memory = opponent.user.aiMemory as any;
    memoryContext = `[SCOUTING REPORT] User Weakness: "${memory.detected_weakness}". Exploit this.`;
  }

  const turnCount = round.arguments.length;
  let dynamicInstructions = turnCount < 6 
    ? `STRATEGY: "THE BAIT". Ask a short question to trap them.` 
    : `STRATEGY: "THE KILL". Roast their logic. Be definitive.`;

  // 4. Final System Prompt
  const systemPrompt = `
    You are a skilled debater.
    Topic: "${round.topic}"
    Stance: ${aiStance} (Against User).
    
    ${modeInstructions}
    
    ${styleOverride}

    ${memoryContext}
    ${dynamicInstructions}

    INSTRUCTIONS:
    - Keep response SHORT (under 80 words).
    - If Gen Z mode is active, NEVER be formal.
    - Attack the user's last point directly.
  `;

  // 5. Stream using 8b-instant (Fast & Free)
  const result = streamText({
    model: groq('llama-3.1-8b-instant'), // <--- PRIMARY MODEL
    system: systemPrompt,
    messages: messages,
    async onFinish({ text }) {
      try {
        let aiParticipant = await prisma.participant.findFirst({
          where: { roundId, role: 'AI' }
        });
        if (!aiParticipant) {
          aiParticipant = await prisma.participant.create({
             data: { roundId, role: 'AI' } 
          });
        }
        const { contentEncrypted, iv } = encrypt(text);
        await prisma.argument.create({
          data: { contentEncrypted, iv, roundId, participantId: aiParticipant.id }
        });
      } catch (error) { console.error("Save failed:", error); }
    },
  });

  return result.toTextStreamResponse();
}