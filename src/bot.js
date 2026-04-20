import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/index.js';
import { getAIResponse, clearUserHistory } from './ai.js';

// Ensure the bot token is available
if (!config.botToken) {
  console.error('CRITICAL ERROR: BOT_TOKEN is not defined in the environment variables.');
  process.exit(1);
}

// Initialize the Telegram bot with polling mode
const bot = new TelegramBot(config.botToken, { polling: true });

console.log('🤖 Telegram AI Bot is starting...');
console.log(`🧠 Using AI Provider: ${config.aiProvider}`);

/**
 * Handle the /start command
 */
bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `Hello! 👋 I am your AI assistant powered by ${config.aiProvider === 'openai' ? 'OpenAI' : 'Hugging Face'}.\n\n` +
    `I can help you answer questions, brainstorm ideas, or just chat. ` +
    `I also remember the context of our conversation!\n\n` +
    `Send me a message to get started, or type /help to see available commands.`;
  
  bot.sendMessage(chatId, welcomeMessage);
});

/**
 * Handle the /help command
 */
bot.onText(/^\/help$/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `Here are the available commands:\n\n` +
    `/start - Show the welcome message\n` +
    `/help - Show this instruction message\n` +
    `/clear - Forget our conversation history and start fresh\n\n` +
    `Just type normally to chat with me!`;
  
  bot.sendMessage(chatId, helpMessage);
});

/**
 * Handle the /clear command to reset user history
 */
bot.onText(/^\/clear$/, (msg) => {
  const chatId = msg.chat.id;
  clearUserHistory(chatId);
  bot.sendMessage(chatId, "🧹 Memory cleared! I have forgotten our previous conversation. Let's start fresh.");
});

/**
 * Handle all incoming text messages (that aren't commands)
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore messages that are empty, not text, or are commands
  if (!text || text.startsWith('/')) {
    return;
  }

  try {
    // Show typing indicator to the user while waiting for the AI
    await bot.sendChatAction(chatId, 'typing');

    // Get the response from the AI logic
    const reply = await getAIResponse(chatId, text);

    // Send the reply back to the user
    await bot.sendMessage(chatId, reply);

  } catch (error) {
    console.error(`Error processing message from chat ${chatId}:`, error);
    bot.sendMessage(chatId, 'Sorry, something went wrong while processing your message. Please try again.');
  }
});

// Handle polling errors gracefully
bot.on('polling_error', (error) => {
  console.error(`Polling error: ${error.code} - ${error.message}`);
});

console.log('✅ Bot is running and ready to receive messages.');
