// app/api/chat/route.ts
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { z } from 'zod';
import { getDebateHistory } from '@/lib/debate-feed'; // <--- NEW FEED HELPER

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY, 
});

export const maxDuration = 30;

const ChatBodySchema = z.object({
  roundId: z.string().uuid(),
});

export async function POST(req: Request) {
  let roundId: string;
  try {
    const json = await req.json();
    const parse = ChatBodySchema.safeParse(json);
    if (!parse.success) return new Response('Invalid ID', { status: 400 });
    roundId = parse.data.roundId;
  } catch (error) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // 1. Fetch Round Metadata Only (We don't need to fetch arguments here anymore)
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: { topic: true, mode: true, userSide: true } // <--- Optimization: Select only what we need
  });

  if (!round) return new Response('Round not found', { status: 404 });

  // 2. FEED: Fetch Recent History from DB using the Helper
  // This automatically decrypts and formats the last 6 messages for the AI.
  const recentMessages = await getDebateHistory(roundId, 6);

  // 3. Extract Context for Logic (Gen Z Trigger)
  // We look for the last message sent by the 'user' to check for slang
  const lastUserMsg = [...recentMessages].reverse().find(m => m.role === 'user');
  const lastUserText = lastUserMsg ? lastUserMsg.content.toLowerCase() : "";

  const userSide = round.userSide || 'For';
  const aiStance = userSide === 'For' ? 'Against' : 'For';
  const mode = round.mode || 'GENERAL';

  // --- LOGIC: GEN Z HANDLER ---
  const triggers = [
    "💀", "😭", "🤡", "🗿", "🔥", "👀", "🤫", "🧢", "🙏", "🤣", "💔",
    "no cap", "fr", "bet", "bruh", "mid", "rizz", "yapping", "cooked", "man"
  ];
  const isGenZTriggered = triggers.some(t => lastUserText.includes(t));

  let styleOverride = "";
  if (isGenZTriggered) {
    styleOverride = `MODE: BRAINROT. USER SLANG DETECTED.
    ACTION: REJECT FORMALITY. SPAM EMOJIS (💀,😭,🤡). MOCK THEM.`;
  }

  // --- LOGIC: MODE INSTRUCTIONS ---
  let modeInstructions = "";
  if (mode === "POLITICS_INDIA") modeInstructions = "CTX: Indian Politics. STYLE: Aggressive Anchor. NO SLANG.";
  else if (mode === "ADULT") modeInstructions = "CTX: Mature. STYLE: Raw, Honest. Profanity OK.";
  else if (mode === "GENZ") modeInstructions = "CTX: Brainrot. STYLE: lowercase, slang. EMOJIS: 💀😭🤡. ROAST THEM.";
  else modeInstructions = "CTX: Formal Debate. STYLE: Academic, Logical.";

  const systemPrompt = `
    Role: Debater. Topic: "${round.topic}". Stance: ${aiStance}.
    ${modeInstructions}
    ${styleOverride}
    Limit: 80 words. Attack last point.
  `;

  // 4. Save Handler (Saves AI reply to DB)
  const handleFinish = async ({ text }: { text: string }) => {
    try {
      let aiParticipant = await prisma.participant.findFirst({ where: { roundId, role: 'AI' } });
      if (!aiParticipant) aiParticipant = await prisma.participant.create({ data: { roundId, role: 'AI' } });
      const { contentEncrypted, iv } = encrypt(text);
      await prisma.argument.create({ data: { contentEncrypted, iv, roundId, participantId: aiParticipant.id } });
    } catch (error) { console.error("Save failed:", error); }
  };

  // 5. Stream with Fallback
  try {
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages: recentMessages as any, // <--- Fed from the Database
      onFinish: handleFinish,
    });
    return result.toTextStreamResponse();
  } catch (error) {
    const result = streamText({
      model: groq('llama-3.1-8b-instant'),
      system: systemPrompt,
      messages: recentMessages as any,
      onFinish: handleFinish,
    });
    return result.toTextStreamResponse();
  }
}