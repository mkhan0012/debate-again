import 'dotenv/config';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

async function main() {
  try {
    console.log("Testing Groq...");
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Say hello!" }],
      model: "llama-3.1-8b-instant",
    });
    console.log("Response:", completion.choices[0]?.message?.content);
    console.log("✅ SUCCESS");
  } catch (e) {
    console.error("❌ Failed:", e);
  }
}
main();