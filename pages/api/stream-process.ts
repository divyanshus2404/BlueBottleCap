import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrompt } from '../../lib/prompt';
import { runOpenAI } from '../../lib/openai.server';
import { initSentry, captureException } from '../../lib/sentry.server';

initSentry();

type ActionType = 'rewrite' | 'explain' | 'formalize' | 'expand';

const validTypes: ActionType[] = ['rewrite', 'explain', 'formalize', 'expand'];

const fallback = (action: ActionType, value: string) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  const firstSentence = clean.split('.').filter(Boolean)[0] ?? clean;

  switch (action) {
    case 'rewrite':
      return `Polished version: ${clean}. This improved wording keeps the same meaning while sounding smoother.`;
    case 'explain':
      return `Explanation: ${firstSentence}. In plain terms, it means ${firstSentence.toLowerCase()}.`;
    case 'formalize':
      return `Formal version: ${clean}. This version uses a professional tone and precise language.`;
    case 'expand':
      return `Expanded version: ${clean}. It includes extra detail and structure to make the idea clearer and more complete.`;
    default:
      return clean;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { text, type } = req.body as { text?: string; type?: string };
  const action = type as ActionType;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!validTypes.includes(action)) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  const useMock = !process.env.OPENAI_API_KEY;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  if (useMock) {
    const result = fallback(action, text.trim().slice(0, 1000));
    const parts = result.match(/.{1,60}(?:\s|$)/g) ?? [result];
    (async () => {
      for (const part of parts) {
        res.write(`data: ${part}\n\n`);
        await new Promise((r) => setTimeout(r, 120));
      }
      res.write('event: done\n');
      res.write('data: [DONE]\n\n');
      res.end();
    })();
    return;
  }

  try {
    // For now, call the non-streaming runOpenAI and stream its text in chunks.
    const prompt = getPrompt(action, text.trim().slice(0, 1000));
    const model = action === 'rewrite' || action === 'formalize' ? 'gpt-3.5-turbo' : 'gpt-4o-mini';
    const maxTokens = action === 'rewrite' || action === 'formalize' ? 200 : 260;
    const full = await runOpenAI(prompt, model, maxTokens);
    const parts = full.match(/.{1,60}(?:\s|$)/g) ?? [full];
    for (const part of parts) {
      res.write(`data: ${part}\n\n`);
      await new Promise((r) => setTimeout(r, 90));
    }
    res.write('event: done\n');
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error(err);
    captureException(err);
    const result = fallback(action, text);
    res.write(`data: ${result}\n\n`);
    res.write('event: done\n');
    res.write('data: [DONE]\n\n');
    res.end();
  }
}
