export async function sendMessage(chatId, text) {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error("Error: BOT_TOKEN is not defined in environment variables.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API Error:', errorText);
    }
  } catch (error) {
    console.error('Error sending message via Telegram:', error.message);
  }
}
