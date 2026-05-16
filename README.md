# BluebottleCap

A minimal, production-ready Next.js app for instant AI text rewriting, explanation, formalization, and expansion.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example env file and add your OpenAI API key:
   ```bash
   cp .env.local.example .env.local
   ```
   Then open `.env.local` and add your key.
3. Run locally:
   ```bash
   npm run dev
   ```

## Features

- One-screen, minimal UI
- Rewrite, Explain, Formalize, Expand actions
- Copy and Clear controls
- Daily free usage limit
- Tailwind CSS styling
- Next.js App Router with API routes

## API Routes

- `POST /api/process`

Request body:
```json
{
   "text": "Your text here",
   "type": "rewrite" | "explain" | "formalize" | "expand"
}
```

Response:
> If no OpenAI API key is configured, the app will use a local fallback response for UI testing.
```json
{
   "result": "Improved output"
}
```
