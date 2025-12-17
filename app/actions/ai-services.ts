import OpenAI from "openai";

// 'use server' REMOVED intentionally. 
// This file is a utility library for your actions, not a set of actions itself.

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1"
});

const MODELS = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];

// --- 1. UTILITY: EXTRACT JSON (Exported) ---
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

// --- 2. UTILITY: GENERATE WITH FALLBACK (Exported) ---
export async function generateWithFallback(promptText: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) return "";
  
  try {
    // Try Fast Model
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: promptText }],
      model: MODELS[0], 
      temperature: 0.85, 
      max_tokens: 600,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (e) {
    console.error("Primary AI Failed, trying backup...");
    try {
        // Try Smart Model
        const backup = await openai.chat.completions.create({
            messages: [{ role: "user", content: promptText }],
            model: MODELS[1], 
            temperature: 0.85,
            max_tokens: 600,
        });
        return backup.choices[0]?.message?.content || "";
    } catch (finalErr) {
        throw new Error("AI Service Unavailable");
    }
  }
}

// --- 3. MODERATION ACTION ---
export async function moderateContent(text: string) {
  try {
    const prompt = `
      Analyze this text: "${text}"
      Does it contain insults, cursing, or hostility?
      Return JSON: { "is_hostile": boolean, "intensity": "low" | "high" }
    `;
    const rawText = await generateWithFallback(prompt);
    return JSON.parse(extractJson(rawText));
  } catch (e) {
    return { is_hostile: false, intensity: "low" }; 
  }
}

// --- 4. REBUTTAL GENERATION (With Indian Politics Mode) ---
export async function generateAiRebuttal(
  topic: string, 
  aiStance: string, 
  chatHistory: string[], 
  isHostile: boolean = false,
  mode: string = "GENERAL"
) {
  try {
    let context = "";

    // Context Switching
    if (mode === "POLITICS_INDIA") {
      context = `
        CONTEXT: This is a debate specifically about INDIAN POLITICS.
        - References: Use examples from the Indian Constitution, Supreme Court verdicts, Lok Sabha, and history.
        - Tone: Passionate, intellectual, and sharp (like a seasoned Indian news panelist).
        - Vocabulary: Use terms like "Bill," "Act," "Ordinance," "Constitutional Bench."
      `;
    } else {
      context = `
        CONTEXT: This is a general logical debate.
        - References: Use global logic, philosophy, and standard facts.
        - Tone: Professional, logical, and structured.
      `;
    }

    let prompt = "";

    if (isHostile) {
      // 🤬 TOXIC MODE
      prompt = `
        ${context}
        You are in a heated argument. The opponent was rude.
        TOPIC: "${topic}"
        YOUR STANCE: "${aiStance}"
        
        INSTRUCTIONS:
        1. ROAST THEM BACK. 
        2. ${mode === "POLITICS_INDIA" ? "Mock their lack of knowledge about India's ground reality." : "Mock their logical fallacies."}
        3. Be savage but logical.
        4. Keep it short (2-3 sentences).
        
        DEBATE HISTORY:
        ${chatHistory.slice(-3).join("\n")}
        
        YOUR RESPONSE (Savage comeback):
      `;
    } else {
      // 🧠 NORMAL MODE
      prompt = `
        ${context}
        You are a world-class debater.
        TOPIC: "${topic}"
        YOUR STANCE: "${aiStance}"
        
        INSTRUCTIONS:
        1. Dismantle the opponent's logic.
        2. Be direct, sharp, and confident.
        3. Do not be polite. Fight for your side.
        4. Keep it short (max 2 sentences).
        
        DEBATE HISTORY:
        ${chatHistory.slice(-3).join("\n")}
        
        YOUR RESPONSE (Direct rebuttal):
      `;
    }
    
    return await generateWithFallback(prompt);
  } catch (error) {
    return "I need a moment to process your argument.";
  }
}