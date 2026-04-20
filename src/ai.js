import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { config } from '../config/index.js';

// Initialize OpenAI client
const openai = config.openaiApiKey 
  ? new OpenAI({ apiKey: config.openaiApiKey }) 
  : null;

// Initialize Hugging Face client
const hf = config.huggingfaceApiKey 
  ? new HfInference(config.huggingfaceApiKey) 
  : null;

// In-memory storage for user conversation history
// Note: In a production environment, you might want to use Redis or a database.
const userContexts = new Map();

// Maximum number of messages to keep in memory per user
const MAX_HISTORY_LENGTH = 10;

/**
 * Gets the conversation history for a user, or initializes it if empty.
 * @param {number} userId - The Telegram user ID.
 * @returns {Array} Array of message objects.
 */
function getUserHistory(userId) {
  if (!userContexts.has(userId)) {
    // Initialize with a system message to set the AI's persona
    userContexts.set(userId, [
      { role: 'system', content: 'You are a helpful, friendly, and concise Telegram AI assistant.' }
    ]);
  }
  return userContexts.get(userId);
}

/**
 * Adds a message to the user's history and truncates if it exceeds the limit.
 * @param {number} userId - The Telegram user ID.
 * @param {string} role - The role of the message sender ('user' or 'assistant').
 * @param {string} content - The message text.
 */
function addMessageToHistory(userId, role, content) {
  const history = getUserHistory(userId);
  history.push({ role, content });

  // Keep the system message + the last MAX_HISTORY_LENGTH messages
  if (history.length > MAX_HISTORY_LENGTH + 1) {
    // Remove the oldest message (at index 1, right after the system message)
    history.splice(1, 1);
  }
}

/**
 * Gets an AI response using the configured provider.
 * @param {number} userId - The Telegram user ID for context.
 * @param {string} userMessage - The message from the user.
 * @returns {Promise<string>} The AI's response text.
 */
export async function getAIResponse(userId, userMessage) {
  addMessageToHistory(userId, 'user', userMessage);
  const history = getUserHistory(userId);

  try {
    let reply = '';

    if (config.aiProvider === 'openai') {
      if (!openai) throw new Error('OpenAI API key is missing.');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: history,
        max_tokens: 500, // Limit response length if needed
      });
      
      reply = response.choices[0].message.content;

    } else if (config.aiProvider === 'huggingface') {
      if (!hf) throw new Error('Hugging Face API key is missing.');
      
      // Using a chat model from Hugging Face
      // Note: Model availability depends on the HF API. This is a common conversational model.
      const response = await hf.chatCompletion({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: history,
        max_tokens: 500,
      });
      
      reply = response.choices[0].message.content;

    } else {
      throw new Error(`Unsupported AI provider: ${config.aiProvider}`);
    }

    // Add the AI's reply to the history
    addMessageToHistory(userId, 'assistant', reply);
    return reply;

  } catch (error) {
    console.error(`Error with ${config.aiProvider} API:`, error.message);
    // Do not add the error message to the history, just return it so the user knows
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}

/**
 * Clears the conversation history for a user (useful for a /reset command).
 * @param {number} userId - The Telegram user ID.
 */
export function clearUserHistory(userId) {
  userContexts.delete(userId);
}
