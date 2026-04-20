# first-ai-agent

A production-ready Telegram AI bot built with Node.js, designed to be deployed on Vercel using Webhooks.

## Features
- **Serverless Architecture**: Runs on Vercel Functions.
- **Webhook Integration**: Real-time message handling without polling.
- **AI Powered**: Integrated with OpenAI's GPT models.
- **Persistent Memory**: Simple context management for conversations.
- **Modular Code**: Clean separation between API handlers and utilities.

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up environment variables in Vercel:
   - `BOT_TOKEN`: Your Telegram Bot Token.
   - `OPENAI_API_KEY`: Your OpenAI API Key.
4. Deploy to Vercel.
5. Set the webhook:
   `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_VERCEL_URL>/api/bot`
