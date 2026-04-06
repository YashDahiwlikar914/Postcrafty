# Postcrafty

Vibe coded. Multi-user X post generator where each user gets their own style profile, so generated posts actually sound like them and not like a language model cosplaying as a human.

## What it does

- Builds a style profile from sample posts you paste in
- Generates single posts or threads (3-7 tweets) from a prompt or AI-suggested topics
- Tone control: Professional, Casual, or Edgy
- Suggests hooks and hashtags after generation
- Saves post history with pin and delete support
- Google login via NextAuth, full server-side user isolation

## Stack

Next.js 14 (App Router), Tailwind CSS, NextAuth, Vercel KV, and either NVIDIA NIM or Anthropic Claude as the AI backend.

## Setup

You need Node 18+, Google OAuth credentials, an NVIDIA NIM or Anthropic API key, and Vercel KV credentials.

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
AI_PROVIDER=nim
NIM_API_KEY=your_nvidia_nim_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000 or https://<your-domain>
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
```

Generate a `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Then:

```bash
npm run dev
```

Open `http://localhost:3000`.

Run `npm run lint` and `npm run build` before pushing anything.

## Google OAuth

In Google Cloud Console, create an OAuth Web Client and add these redirect URIs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://<your-domain>/api/auth/callback/google`

Also add Authorised JavaScript origins:
- Local: `http://localhost:3000`
- Production: `https://<your-domain>`

`NEXTAUTH_URL` has to match the base URL exactly, per environment.

## Deploy to Vercel

Import the repo, configure all the env vars listed above under Production (and Preview if you care about it), attach Vercel KV to the project, and deploy.

## Routes

- `/` - Generation dashboard
- `/login` - Google sign-in
- `/style-setup` - Style profile onboarding
- `/history` - Saved posts
- `/drafts` - Legacy, redirects to `/history`

## API Routes

- `/api/auth/[...nextauth]`
- `/api/generate`
- `/api/analyze-style`
- `/api/suggest-topics`
- `/api/drafts`
- `/api/drafts/[id]`

## Security model

User identity comes from the server session only via `getSessionUserId`. The client never sends a `userId`. KV keys are namespaced per user (`style:${userId}`, `drafts:${userId}:${draftId}`). Unauthenticated requests redirect to `/login`. If KV is set up but a style profile is missing, app routes redirect to `/style-setup`.

## How to use it

1. Sign in with Google.
2. Paste 5-10 sample posts in style setup.
3. Generate from a prompt or pick a suggested topic.
4. Review history at `/history`.
5. Pin or delete entries, grab hook and hashtag suggestions.

## Troubleshooting

**Invalid header value during generation.** Your `NIM_API_KEY` has extra text or a newline in it. The value must be the raw key only. `AI_PROVIDER` goes in its own variable. Redeploy after fixing.

**History not loading.** `KV_REST_API_URL` or `KV_REST_API_TOKEN` isn't set. Without KV, history APIs return `503`.

**Google login broken.** Check that `NEXTAUTH_URL` matches your deployed domain and the Google redirect URI is exactly `https://<your-domain>/api/auth/callback/google`.

**Slow generation.** NIM free tier runs 30-60 seconds. Claude is faster if you have a valid Anthropic key.

## License

MIT
