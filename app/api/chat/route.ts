import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/encryption';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY, 
});

export const maxDuration = 30;

export async function POST(req: Request) {
  // --- SAFETY CHECK ---
  let roundId;
  try {
    const body = await req.json();
    roundId = body.roundId;
  } catch (error) {
    return new Response('Invalid JSON body', { status: 400 });
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
      if (role === 'user') lastUserText = text.toLowerCase(); // Capture for analysis
      return { role, content: text };
    } catch {
      return null;
    }
  }).filter(Boolean);

  const userSide = round.userSide || 'For';
  const aiStance = userSide === 'For' ? 'Against' : 'For';
  const mode = round.mode || 'GENERAL';

  // --- FEATURE: DYNAMIC GEN Z TRIGGER ---
  // Added "bro" and "damn" as requested
  const genZKeywords = [
    "no cap", "fr", "bet", "bruh", "cringe", "mid", "rizz", 
    "yapping", "cooked", "based", "sus", "finna", "gyatt", "fanum",
    "bro", "damn" // <--- NEW TRIGGERS
  ];
  
  const isGenZTriggered = genZKeywords.some(word => lastUserText.includes(word));

  let styleOverride = "";
  if (isGenZTriggered) {
    styleOverride = `
      🚨 STYLE OVERRIDE TRIGGERED 🚨
      The user used a trigger word ("${lastUserText.substring(0, 15)}...").
      - IMMEDIATE ACTION: Switch to Gen Z/Slang Persona.
      - TONE: If the mode was "ADULT", combine swearing with slang (Toxic Gen Z).
      - KEYWORDS: Use "bro", "damn", "fr", "💀" back at them.
      - RULE: Mock them for trying to be cool.
    `;
  }

  // --- STANDARD MODE INSTRUCTIONS ---
  let modeInstructions = "";

  if (mode === "POLITICS_INDIA") {
    modeInstructions = `
      CONTEXT: Indian Politics.
      - TONE: Professional, Sharp, TV Anchor style.
      - CONTENT: Constitution, Laws, Facts.
      - RULE: No slang unless triggered.
    `;
  } 
  else if (mode === "ADULT") {
    modeInstructions = `
      CONTEXT: Adult/Uncensored.
      - TONE: Raw, unfiltered, mature.
      - PERMISSION: Profanity is ALLOWED.
      - NOTE: Usually serious/gritty, BUT if 'Style Override' is active, switch to Gen Z slang immediately.
    `;
  } 
  else {
    modeInstructions = `
      CONTEXT: General Formal Debate.
      - TONE: Intellectual, Logical.
      - RULE: maintain professionalism unless triggered.
    `;
  }

  // --- MEMORY & STRATEGY ---
  let memoryContext = "";
  if (opponent?.user?.aiMemory) {
    const memory = opponent.user.aiMemory as any;
    memoryContext = `[SCOUTING REPORT] Weakness: "${memory.detected_weakness}". Exploit this.`;
  }

  const turnCount = round.arguments.length;
  let dynamicInstructions = turnCount < 6 
    ? `STRATEGY: "THE TRAP". Ask questions. Be polite.` 
    : `STRATEGY: "DOMINATION". Be authoritative. Crush their logic.`;

  // 4. Final System Prompt
  const systemPrompt = `
    You are a skilled debater in a formal "Arguely" debate.
    Topic: "${round.topic}"
    Stance: ${aiStance} (Against User).
    Opponent: "${opponentName}"
    
    ${modeInstructions}
    
    ${styleOverride}  <-- This overrides the mode if triggered

    ${memoryContext}
    ${dynamicInstructions}

    INSTRUCTIONS:
    - Win via logic.
    - Keep response under 100 words.
  `;

  // 5. Stream
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
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