'use server';

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod'; 

// 1. Initialize Groq
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// 2. Define the schema for validation (optional, but good for type safety)
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

// Helper to clean Markdown JSON (e.g. ```json ... ```)
function cleanJson(text: string) {
  return text.replace(/```json|```/g, '').trim();
}

export async function analyzeArgument(argumentText: string, topic: string) {
  try {
    // 3. Use 'generateText' instead of 'generateObject' to avoid SDK version conflicts
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'), 
      system: `
        You are a rigorous Logic Analyst.
        Analyze the debate argument provided.
        
        CRITICAL INSTRUCTION:
        You MUST return valid, parseable JSON only.
        Do not include any text before or after the JSON.
        
        Expected JSON Format:
        {
          "claim_summary": "string (max 15 words)",
          "fallacies": ["string", "string"],
          "evidence_score": number (0-10),
          "fact_check": { "status": "PASS" | "WARN" | "FAIL", "correction": "string" },
          "feedback": "string (max 15 words)"
        }
      `,
      prompt: `
        Topic: "${topic}"
        Argument: "${argumentText}"
      `,
    });

    // 4. Manual Parse & Validate
    const cleaned = cleanJson(text);
    const parsed = JSON.parse(cleaned);
    
    // Optional: Validate with Zod to ensure structure is correct
    // If it fails validation, it falls to the catch block
    const validated = AnalysisSchema.parse(parsed);

    return validated;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    
    // 5. Robust Fallback
    return {
      claim_summary: "Analysis unavailable",
      fallacies: ["System Error"],
      evidence_score: 5,
      fact_check: { status: "WARN" as const, correction: "Could not verify at this time." },
      feedback: "AI Analyst is temporarily offline."
    };
  }
}