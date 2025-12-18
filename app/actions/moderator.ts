'use server'

import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function moderatePvpChat(topic: string, argument: string) {
  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `
        You are a strict AI Referee for a debate on: "${topic}".
        
        PROTOCOL:
        1. IGNORE opinions, predictions, generalizations, sarcasm, or logic/reasoning errors.
        2. IGNORE slight inaccuracies (e.g., saying "100 years" instead of "102 years").
        3. ONLY INTERVENE if the user states a specific, objective fact that is FALSE (e.g., wrong dates, wrong statistics, false scientific laws, misquoting a specific document).
        
        OUTPUT FORMAT:
        - If the statement is an opinion or factually acceptable: Reply ONLY the word "PASS".
        - If there is a clear factual lie: Reply starting with "⚠️ Fact Check: " followed by the correction (max 1 sentence).
      `,
      prompt: `User Statement: "${argument}"`,
      temperature: 0.1, // Very low creativity to ensure strict logic
    });

    const cleanText = text.trim();

    // If the AI says PASS (or hallucinates a short "OK"), we stay silent.
    if (cleanText.toUpperCase().includes("PASS") || cleanText.length < 5) {
      return null;
    }

    // Double check it starts with the alert prefix, if not, force it.
    if (!cleanText.startsWith("⚠️ Fact Check:")) {
      return `⚠️ Fact Check: ${cleanText}`;
    }

    return cleanText;

  } catch (error) {
    console.error("Moderator Error:", error);
    return null; // Fail silently so the game doesn't break
  }
}