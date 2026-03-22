# LessonLens Mobile

Mobile-first tutoring website using Next.js + Cloudflare Workers AI.

## What Changed

- Rebuilt the main app as a mobile-first web experience.
- Replaced Gemini API usage with Cloudflare AI API routes.
- Unified homepage and app flow under `/`.
- Added Cloudflare environment configuration support.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Cloudflare Workers AI (server-side calls)

## Run Locally

```bash
cd lessonlens
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Environment Variables

Set these in `.env.local`:

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
```

## How To Link To Your Cloudflare Account

1. Create an API token in Cloudflare dashboard:
    - Profile > API Tokens > Create Token.
    - Use a custom token with permissions:
      - `Account > Workers AI > Read`
      - `Account > Workers AI > Edit` (recommended for full inference access)
    - Scope it to the account you will use.
2. Copy your Account ID:
    - Cloudflare dashboard > right sidebar > Account ID.
3. Paste both values into `.env.local`.
4. Pick a model slug and set `CLOUDFLARE_AI_MODEL`:
    - Example text model: `@cf/meta/llama-3.1-8b-instruct`
5. Restart your dev server after changing env vars.
6. Test by sending a message from the app.

## Next Steps

1. Deploy this Next.js app (Vercel or Cloudflare Pages).
2. Add the same 3 env vars in your hosting provider.
3. If you want image/screen understanding, switch to a Cloudflare vision-capable model and adapt the analyze route input format.
4. Add rate limiting and auth before public launch.

## Troubleshooting

- `Cloudflare AI is not configured`: missing `CLOUDFLARE_ACCOUNT_ID` or `CLOUDFLARE_API_TOKEN`.
- `Unauthorized` / `Forbidden`: token permissions or wrong account scope.
- Empty response: try a different model in `CLOUDFLARE_AI_MODEL`.
