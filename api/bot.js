import { sendMessage } from '../utils/telegram.js';
import { getAIResponse } from '../utils/ai.js';

export default async function handler(req, res) {
  // Telegram webhooks send POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    const update = req.body;

    // Validate that this is a standard message containing text
    if (!update || !update.message || !update.message.text) {
      // Return 200 to prevent Telegram from retrying
      return res.status(200).json({ status: 'ignored' });
    }

    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const text = update.message.text.trim();

    console.log(`Received message from ${userId}: ${text}`);

    // Handle basic commands
    if (text === '/start') {
      await sendMessage(chatId, "👋 Welcome! I am your AI assistant. Send me a message and I'll do my best to help you.");
      return res.status(200).json({ status: 'ok' });
    }

    if (text === '/help') {
      await sendMessage(chatId, "🤖 **Help**\n\nJust send me any text message and I will reply using AI.\n\n*Note:* Since I run on Vercel Serverless, my memory might clear occasionally if I'm inactive for a while.");
      return res.status(200).json({ status: 'ok' });
    }

    // Process AI response
    const reply = await getAIResponse(userId, text);
    
    // Send response back via Telegram API
    await sendMessage(chatId, reply);

    // Return 200 OK so Telegram knows the webhook succeeded
    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error("Webhook Processing Error:", error);
    // Even if an error occurs, we usually return 200 to stop Telegram retries, 
    // but a 500 can be used if we specifically want Telegram to retry later.
    // For Vercel, it's safer to return 200 and handle our own errors.
    return res.status(200).json({ error: 'Internal server error handled gracefully' });
  }
}
