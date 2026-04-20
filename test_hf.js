import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function test() {
  try {
    console.log("Calling Hugging Face API...");
    const response = await hf.chatCompletion({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 100,
    });
    console.log("Response:", response.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err);
    if (err.httpResponse && err.httpResponse.body) {
      console.error("Response body:", err.httpResponse.body);
    }
  }
}

test();
