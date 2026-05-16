import type { NextApiRequest, NextApiResponse } from 'next';

// Placeholder for Firebase Auth server-side endpoints.
// Implement sign-in, sign-up, and session verification here using Firebase Admin SDK.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(501).json({ error: 'Not implemented. Integrate Firebase Admin SDK here.' });
}
