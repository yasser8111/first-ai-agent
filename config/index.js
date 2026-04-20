import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN,
  aiProvider: process.env.AI_PROVIDER || 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY,
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
};
