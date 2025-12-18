import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/encryption';

// 1. Initialize Groq
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY, 
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { roundId } = await req.json();

  // 2. Fetch Round Context
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      arguments: {
        orderBy: { createdAt: 'asc' },
        include: { participant: true },
      },
    },
  });

  if (!round) return new Response('Round not found', { status: 404 });

  // 3. Prepare Chat History
  const messages: any[] = round.arguments.map((arg) => {
    try {
      const text = decrypt(arg.contentEncrypted, arg.iv);
      const role = arg.participant.role === 'AI' ? 'assistant' : 'user';
      return { role, content: text };
    } catch {
      return null;
    }
  }).filter(Boolean);

  // 4. LOGIC MIGRATED FROM ai-services.ts
  // We determine the system prompt based on the "Mode" and "Stance"
  
  const userSide = round.userSide || 'For';
  const aiStance = userSide === 'For' ? 'Against' : 'For';
  const mode = round.mode || 'GENERAL';

  let modeInstructions = "";

  // --- LOGIC PORTED FROM ai-services.ts ---
  if (mode === "POLITICS_INDIA") {
    modeInstructions = `
      CONTEXT: This is a debate specifically about INDIAN POLITICS.
      - References: Use examples from the Indian Constitution, Supreme Court verdicts, Lok Sabha, and history.
      - Tone: Passionate, intellectual, and sharp (like a seasoned Indian news panelist).
      - Vocabulary: Use terms like "Bill," "Act," "Ordinance," "Constitutional Bench."
    `;
  } else {
    modeInstructions = `
      CONTEXT: This is a general logical debate.
      - References: Use global logic, philosophy, and standard facts.
      - Tone: Professional, logical, and structured.
    `;
  }

  const systemPrompt = `
    You are a skilled debater in a formal "Arguely" debate.
    Topic: "${round.topic}"
    Your Stance: ${aiStance} (You are arguing AGAINST the user).
    
    ${modeInstructions}

    INSTRUCTIONS:
    - Your goal is to win the debate via logic and persuasion.
    - Keep your response under 100 words.
    - Address the user's latest point specifically.
    - If the user is hostile or rude, be savage and roast them back logically.
    - Do not use "As an AI" or filler phrases.
  `;

  // 5. Stream Text using Groq
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'), // Using the smart model
    system: systemPrompt,
    messages: messages,
    async onFinish({ text }) {
      // --- SAVE TO DATABASE ---
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
          data: {
            contentEncrypted,
            iv,
            roundId,
            participantId: aiParticipant.id,
          }
        });
      } catch (error) {
        console.error("Failed to save AI response:", error);
      }
    },
  });

  // 6. Return Stream
  return result.toTextStreamResponse();
}