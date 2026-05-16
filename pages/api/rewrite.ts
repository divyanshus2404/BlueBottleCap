import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrompt } from '../../lib/prompt';
import { runOpenAI } from '../../lib/openai.server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { text } = req.body as { text?: string };

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const prompt = getPrompt('rewrite', text);
    const result = await runOpenAI(prompt);
    return res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to process rewrite request' });
  }
}
