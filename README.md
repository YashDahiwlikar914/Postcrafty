# Postcrafty

Postcrafty is a multi-user X post generator for any niche. It uses each user's style profile to produce posts and threads that feel like their own voice.

## Features

- Style profile onboarding from sample posts
- Prompted generation and AI-suggested topics
- Single post or thread mode (3-7 tweets)
- Tone control (Professional, Casual, Edgy)
- Hook and hashtag suggestions after generation
- Auto-saved post history with pin and delete actions
- NextAuth Google login with server-side user isolation

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS with CSS variable theme tokens
- NextAuth (Google OAuth)
- NVIDIA NIM (default) or Anthropic Claude
- Vercel KV (source of truth) + localStorage cache

## Quick Start

### Prerequisites

- Node.js 18+
- Google OAuth credentials
- NVIDIA NIM API key or Anthropic API key
- Vercel KV credentials

### Installation

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and set:

```env
AI_PROVIDER=nim
NIM_API_KEY=your_nvidia_nim_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
```

Generate a strong NextAuth secret:

```bash
openssl rand -base64 32
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Quality Checks

```bash
npm run lint
npm run build
```

## OAuth Setup (Google)

In Google Cloud Console, create an OAuth Web Client and add redirect URIs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://<your-domain>/api/auth/callback/google`

Also set `NEXTAUTH_URL` to the same base URL for each environment.

## Deployment (Vercel)

1. Import this repo into Vercel.
2. Configure environment variables for Production (and Preview if needed):
   - `AI_PROVIDER`
   - `NIM_API_KEY` (if `AI_PROVIDER=nim`)
   - `ANTHROPIC_API_KEY` (if `AI_PROVIDER=claude`)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
3. Attach Vercel KV to the project.
4. Deploy.

## Routes

- `/` - Generation dashboard
- `/login` - Google sign-in page
- `/style-setup` - Style profile onboarding
- `/history` - Saved post history
- `/drafts` - Legacy route that redirects to `/history`

## API Routes

- `/api/auth/[...nextauth]`
- `/api/generate`
- `/api/analyze-style`
- `/api/suggest-topics`
- `/api/drafts`
- `/api/drafts/[id]`

## Data and Security Model

- User identity comes from server session only (`getSessionUserId`).
- Client never supplies `userId`.
- KV keys are namespaced per user:
  - `style:${userId}`
  - `drafts:${userId}:${draftId}`
- Unauthenticated users are redirected to `/login`.
- If KV is configured and style profile is missing, app routes redirect to `/style-setup`.

## Usage

1. Sign in with Google.
2. Complete style setup by pasting 5-10 sample posts.
3. Generate a post or thread using prompted mode or suggested topics.
4. Review saved content in `/history`.
5. Optionally pin/delete entries and use hook/hashtag suggestions.

## Troubleshooting

### Invalid header value during generation

If you see an error like `Headers.append ... invalid header value`, your API key env value likely contains extra text or newlines.

- `NIM_API_KEY` must contain only the raw key value.
- `AI_PROVIDER` must be set in its own separate variable.
- Redeploy after fixing env vars.

### History not loading

- Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set.
- Without KV, history APIs return `503` and UI shows a storage configuration error.

### Google login issues

- Confirm `NEXTAUTH_URL` matches the deployed domain.
- Confirm Google redirect URI matches exactly:
  - `https://<your-domain>/api/auth/callback/google`

### Slow generation

- NIM free tier can take 30-60 seconds.
- Claude is usually faster but requires a valid Anthropic key.

## License

MIT
