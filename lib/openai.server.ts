import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runOpenAI(prompt: string, model = 'gpt-3.5-turbo', maxTokens = 220) {
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a premium student writing assistant. Deliver polished, clear, and concise text using student-friendly tone when appropriate.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.28,
    top_p: 0.95,
    max_tokens: maxTokens,
  });

  return response.choices?.[0]?.message?.content?.trim() ?? '';
}
