import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrompt } from '../../lib/prompt';
import { runOpenAI } from '../../lib/openai.server';

const validTypes = ['rewrite', 'explain', 'formalize', 'expand'] as const;
type ActionType = (typeof validTypes)[number];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { text, type } = req.body as { text?: string; type?: string };

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!validTypes.includes(type as ActionType)) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  const fallback = (action: ActionType, value: string) => {
    const clean = value.replace(/\s+/g, ' ').trim();
    const firstSentence = clean.split('.').filter(Boolean)[0] ?? clean;

    switch (action) {
      case 'rewrite':
        return `Polished version: ${clean.replace(/\s+/g, ' ').trim()}. This improved wording keeps the same meaning while sounding smoother.`;
      case 'explain':
        return `Explanation: ${firstSentence}. In plain terms, this means ${firstSentence.toLowerCase()}.`;
      case 'formalize':
        return `Formal version: ${clean}. This version uses a professional tone and precise language.`;
      case 'expand':
        return `Expanded version: ${clean}. It includes extra detail and structure to make the idea clearer and more complete.`;
      default:
        return clean;
    }
  };

  const useMock = !process.env.OPENAI_API_KEY;

  if (useMock) {
    const result = fallback(type as ActionType, text);
    return res.status(200).json({ result, mock: true });
  }

  try {
    const prompt = getPrompt(type as ActionType, text);
    const result = await runOpenAI(prompt);
    return res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unable to process the request.';
    const result = fallback(type as ActionType, text);
    return res.status(200).json({ result, mock: true, warning: message });
  }
}
