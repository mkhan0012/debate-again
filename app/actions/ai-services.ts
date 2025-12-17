// NO 'use server' HERE - This file exports utility functions
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1"
});

const MODELS = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];

// --- UTILITY (Sync) ---
export function extractJson(text: string) {
  try {
    let cleaned = text.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
    return cleaned;
  } catch (e) {
    return "{}";
  }
}

// --- UTILITY (Async) ---
export async function generateWithFallback(promptText: string): Promise<string> {
  // If API key is missing during build, don't crash, just return empty (for static analysis)
  if (!process.env.GROQ_API_KEY) return "";

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: promptText }],
      model: MODELS[0], // Fast model
      temperature: 0.6,
      max_tokens: 500,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (e) {
    console.error("Primary AI Failed, trying backup...");
    try {
        const backup = await openai.chat.completions.create({
            messages: [{ role: "user", content: promptText }],
            model: MODELS[1], // Smart model
            temperature: 0.6,
            max_tokens: 500,
        });
        return backup.choices[0]?.message?.content || "";
    } catch (finalErr) {
        console.error("All AI models failed");
        throw new Error("AI Service Unavailable");
    }
  }
}

// --- SERVER ACTIONS (Async Only) ---
// These are called from the client
export async function moderateContent(text: string) {
  'use server'; // Action Directive
  try {
    const prompt = `Check for hate speech. Return JSON: { "safe": boolean }. Text: "${text}"`;
    const rawText = await generateWithFallback(prompt);
    return JSON.parse(extractJson(rawText));
  } catch (e) {
    return { safe: true }; 
  }
}

export async function generateAiRebuttal(topic: string, position: string, chatHistory: string[]) {
  'use server'; // Action Directive
  try {
    const prompt = `Topic: ${topic}. Stance: ${position}. History: ${chatHistory.slice(-3)}. Write 1 sentence rebuttal.`;
    return await generateWithFallback(prompt);
  } catch (error) {
    return "I need a moment to think.";
  }
}