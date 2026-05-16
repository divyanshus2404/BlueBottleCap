# BluebottleCap

A minimal, production-ready Next.js app for instant AI text rewriting, explanation, formalization, and expansion.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your OpenAI API key:
   ```bash
   echo "OPENAI_API_KEY=your_api_key_here" > .env.local
   ```
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

- `POST /api/rewrite`
- `POST /api/explain`
- `POST /api/formalize`
- `POST /api/expand`

Each route accepts `{ text: string }` and returns `{ result: string }`.
