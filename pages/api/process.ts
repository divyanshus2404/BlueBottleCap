import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrompt } from '../../lib/prompt';
import { runOpenAI } from '../../lib/openai.server';
import { rateLimit } from '../../lib/ratelimit.server';
import { initSentry, captureException } from '../../lib/sentry.server';
import { trackEvent } from '../../lib/analytics.server';

initSentry();

type ActionType = 'rewrite' | 'explain' | 'formalize' | 'expand';

const validTypes: ActionType[] = ['rewrite', 'explain', 'formalize', 'expand'];

type RateRecord = {
  count: number;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __bbcapRateLimitStore: Map<string, RateRecord> | undefined;
}

const fallback = (action: ActionType, value: string) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  const firstSentence = clean.split('.').filter(Boolean)[0] ?? clean;

  switch (action) {
    case 'rewrite':
      return `Polished: ${clean.replace(/\s+/g, ' ').trim()} — smoother phrasing without changing the meaning.`;
    case 'explain':
      return `Explain: ${firstSentence}. In simple terms: ${firstSentence.toLowerCase()}.`;
    case 'formalize':
      return `Formal: ${clean}. Presented with a professional tone and precise wording.`;
    case 'expand':
      return `Expand: ${clean}. Additional details and structure added for clarity.`;
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

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';

  const rl = await rateLimit(ip, 60, 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests. Try again in a moment.' });
  }

  const trimmedText = text.trim().slice(0, 1000);
  const useMock = !process.env.OPENAI_API_KEY;

  if (useMock) {
    const result = fallback(action, trimmedText);
    return res.status(200).json({ result, mock: true });
  }

  try {
    const prompt = getPrompt(action, trimmedText);
    const model = action === 'rewrite' || action === 'formalize' ? 'gpt-3.5-turbo' : 'gpt-4o-mini';
    const maxTokens = action === 'rewrite' || action === 'formalize' ? 200 : 260;
    const result = await runOpenAI(prompt, model, maxTokens);
    trackEvent('process', { action, mock: false });
    return res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    captureException(error);
    const message = error instanceof Error ? error.message : 'Unable to process the request.';
    const result = fallback(action, trimmedText);
    trackEvent('process', { action, mock: true });
    return res.status(200).json({ result, mock: true, warning: message });
  }
}
