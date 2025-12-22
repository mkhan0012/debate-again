'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod'; 

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

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

export async function analyzeArgument(argumentText: string, topic: string) {
  // OPTIMIZATION: Shortened System Prompt (Saves ~100 tokens per call)
  const systemPrompt = `
    Role: Logic Analyst. Task: Evaluate debate argument.
    
    RETURN JSON ONLY:
    {
      "claim_summary": "max 15 words",
      "fallacies": ["name of fallacy" or "None"],
      "evidence_score": number (0-10),
      "fact_check": { "status": "PASS" | "WARN" | "FAIL", "correction": "brief correction if needed" },
      "feedback": "max 15 words"
    }
  `;

  const userPrompt = `Topic: "${topic}"\nArg: "${argumentText}"`;

  let textResponse = "";

  try {
    // ATTEMPT 1: High Quality (70b)
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'), 
      system: systemPrompt,
      prompt: userPrompt,
    });
    textResponse = text;

  } catch (error) {
    console.warn("⚠️ Analyst 70b Limit. Swapping to 8b.");
    try {
      // ATTEMPT 2: Fallback (8b)
      const { text } = await generateText({
        model: groq('llama-3.1-8b-instant'), 
        system: systemPrompt,
        prompt: userPrompt,
      });
      textResponse = text;
    } catch (e) {
      console.error("❌ Analyst Failed:", e);
      return fallbackResult(); // Return safe default instead of crashing
    }
  }

  // OPTIMIZATION: Robust Parsing (Finds JSON inside text)
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

function fallbackResult() {
  return {
    claim_summary: "Analysis unavailable",
    fallacies: ["None"],
    evidence_score: 5,
    fact_check: { status: "WARN" as const, correction: "System overload." },
    feedback: "AI is temporarily offline."
  };
}