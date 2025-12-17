'use server';

import { generateWithFallback, extractJson } from "./ai-services";

export async function analyzeArgument(argumentText: string, topic: string) {
  const prompt = `
    Analyze this debate argument.
    TOPIC: "${topic}"
    ARGUMENT: "${argumentText}"

    Output ONLY valid JSON.
    {
      "claim_summary": "string (15 words max)",
      "fallacies": ["string"],
      "evidence_score": number (0-10),
      "fact_check": { "status": "PASS" | "WARN" | "FAIL", "correction": "string" },
      "feedback": "string (15 words max)"
    }
  `;

  try {
    const rawText = await generateWithFallback(prompt);
    const cleanJson = extractJson(rawText);
    return JSON.parse(cleanJson);
  } catch (error) {
    return {
      claim_summary: "Analysis unavailable",
      fallacies: [],
      evidence_score: 5,
      fact_check: { status: "WARN", correction: "System busy" },
      feedback: "AI Analyst is recalibrating."
    };
  }
}