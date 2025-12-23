'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod'; 
import { headers } from 'next/headers';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// --- 1. RATE LIMITING (Simple In-Memory) ---
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 10;      

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS) return false;

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

const AnalysisSchema = z.object({
  claim_summary: z.string(),
  fallacies: z.array(z.string()),
  evidence_score: z.number(),
  fact_check: z.object({
    status: z.enum(["PASS", "WARN", "FAIL"]),
    correction: z.string(),
  }),
  feedback: z.string(),
});

// --- 2. DEFINE PERSONAS ---
type AnalystPersona = 'LOGIC_LORD' | 'ROAST_MASTER' | 'GENTLE_GUIDE';

const PERSONA_PROMPTS: Record<AnalystPersona, string> = {
  LOGIC_LORD: `Role: Strict Academic Logic Professor. Tone: Cold, precise, and ruthless. Focus purely on logical structure.`,
  ROAST_MASTER: `Role: Sarcastic Debate Comedian. Tone: Funny, slightly mean, roasting bad logic. Use slang/jokes if the argument is weak.`,
  GENTLE_GUIDE: `Role: Kindergarten Teacher. Tone: Super encouraging, simple words, focuses on growth. Start with a compliment.`,
};

// Update function signature to accept 'persona'
export async function analyzeArgument(
  argumentText: string, 
  topic: string,
  persona: AnalystPersona = 'LOGIC_LORD' // Default
) {
  // 1. Safety Check
  const ip = (await headers()).get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return fallbackResult("Rate limit exceeded. Please wait.");
  }

  // 2. Select the correct System Prompt
  const personaInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.LOGIC_LORD;

  const systemPrompt = `
    ${personaInstruction}
    Task: Evaluate debate argument.
    
    RETURN JSON ONLY:
    {
      "claim_summary": "max 15 words",
      "fallacies": ["name of fallacy" or "None"],
      "evidence_score": number (0-10),
      "fact_check": { "status": "PASS" | "WARN" | "FAIL", "correction": "brief correction if needed" },
      "feedback": "max 15 words matching the persona tone"
    }
  `;

  const userPrompt = `Topic: "${topic}"\nArg: "${argumentText}"`;
  let textResponse = "";

  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'), 
      system: systemPrompt,
      prompt: userPrompt,
    });
    textResponse = text;

  } catch (error) {
    console.warn("⚠️ Analyst 70b Limit. Swapping to 8b.");
    try {
      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'), 
        system: systemPrompt,
        prompt: userPrompt,
      });
      textResponse = text;
    } catch (e) {
      console.error("❌ Analyst Failed:", e);
      return fallbackResult(); 
    }
  }

  try {
    const start = textResponse.indexOf('{');
    const end = textResponse.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error("No JSON");
    
    const cleanJson = textResponse.substring(start, end + 1);
    const parsed = JSON.parse(cleanJson);
    return AnalysisSchema.parse(parsed);

  } catch (error) {
    console.error("JSON Parse Error:", textResponse);
    return fallbackResult();
  }
}

function fallbackResult(customFeedback?: string) {
  return {
    claim_summary: "Analysis unavailable",
    fallacies: ["None"],
    evidence_score: 5,
    fact_check: { status: "WARN" as const, correction: customFeedback || "System overload." },
    feedback: customFeedback || "AI is temporarily offline."
  };
}