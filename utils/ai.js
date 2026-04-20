import { HfInference } from '@huggingface/inference';

// Simple in-memory storage for conversation history
// Note: This resets on each Vercel cold start, which is expected in serverless.
const userMemory = new Map();
const MAX_HISTORY = 10;
const MAX_INPUT_LENGTH = 1000;

export async function getAIResponse(userId, text) {
  // Guard: Prevent extremely long messages
  if (text.length > MAX_INPUT_LENGTH) {
    return "⚠️ Your message is too long! Please keep it under 1000 characters.";
  }

  // Guard: Ensure API key is available
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.error("FATAL: HUGGINGFACE_API_KEY is not set in environment variables.");
    return "⚠️ Bot is not configured correctly. Missing AI API key.";
  }

  const hf = new HfInference(apiKey);

  // Initialize conversation history for this user
  if (!userMemory.has(userId)) {
    userMemory.set(userId, [
      { role: 'system', content: 'You are a helpful, friendly, and concise Telegram AI assistant.' }
    ]);
  }

  const history = userMemory.get(userId);
  history.push({ role: 'user', content: text });

  // Trim history to stay within limits (keep system prompt + last MAX_HISTORY messages)
  if (history.length > MAX_HISTORY + 1) {
    history.splice(1, 1);
  }

  try {
    console.log(`Calling Hugging Face API for user ${userId}...`);
    const response = await hf.chatCompletion({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: history,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;
    console.log(`Got reply for user ${userId}: ${reply.substring(0, 50)}...`);

    // Save assistant's reply to history
    history.push({ role: 'assistant', content: reply });

    return reply;
  } catch (error) {
    console.error("Hugging Face API Error:", error.message);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
