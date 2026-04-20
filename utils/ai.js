import OpenAI from 'openai';

// Vercel serverless environment means memory resets occasionally.
// This simple object acts as memory during the lifecycle of the lambda.
const userMemory = new Map();
const MAX_HISTORY = 10;
const MAX_INPUT_LENGTH = 1000;

export async function getAIResponse(userId, text) {
  // Prevent extremely long messages
  if (text.length > MAX_INPUT_LENGTH) {
    return "⚠️ Your message is too long! Please keep it under 1000 characters.";
  }

  // Ensure OPENAI_API_KEY is available
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is not defined in environment variables.");
    return "I am currently unconfigured. Missing AI provider API key.";
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Initialize memory for this user if it doesn't exist
  if (!userMemory.has(userId)) {
    userMemory.set(userId, [
      { role: 'system', content: 'You are a helpful, friendly, and concise Telegram AI assistant.' }
    ]);
  }

  const history = userMemory.get(userId);
  history.push({ role: 'user', content: text });

  // Keep history length within limits (System prompt + last MAX_HISTORY messages)
  if (history.length > MAX_HISTORY + 1) {
    history.splice(1, 1); // Remove the oldest message after system prompt
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: history,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;
    
    // Add assistant's reply to history
    history.push({ role: 'assistant', content: reply });
    
    return reply;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
