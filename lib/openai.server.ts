import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runOpenAI(prompt: string) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a writing assistant that delivers polished, student-friendly output.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.28,
    top_p: 0.95,
    max_tokens: 320,
  });

  return response.choices?.[0]?.message?.content?.trim() ?? '';
}
