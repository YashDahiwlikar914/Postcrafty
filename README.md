# Postcraft

AI-powered content creation for X posts across any niche. Generate posts in your unique voice with style fingerprinting, thread support, and smart suggestions.

## Features

- **Style Profile System**: Analyzes your writing style to generate authentic-sounding posts
- **Generation Modes**: Prompted input or AI-suggested trending topics
- **Thread Support**: Create multi-tweet threads with drag-and-drop reordering
- **Tone Control**: Professional, Casual, or Edgy tones
- **Smart Suggestions**: Alternative hooks and relevant hashtags
- **Draft Management**: Auto-save, pin, search, and filter your drafts
- **Modern UI**: Beautiful dark theme with custom color palette

## Quick Start

### Prerequisites

- Node.js 18+ 
- NVIDIA NIM API key (free) or Anthropic API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

```env
NIM_API_KEY=your_nvidia_nim_api_key
AI_PROVIDER=nim
ANTHROPIC_API_KEY=your_anthropic_api_key  # Optional fallback
NEXTAUTH_SECRET=openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KV_REST_API_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_rest_api_token
```

### Getting API Keys

**NVIDIA NIM (Free):**
1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up for the free Developer Program
3. Get your API key from the dashboard

**Anthropic Claude (Optional):**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

**Google OAuth (Required for login):**
1. Open Google Cloud Console
2. Create OAuth Web credentials
3. Add authorized redirect URI: `/api/auth/callback/google`
4. Copy Client ID and Client Secret

**NextAuth Secret:**
```bash
openssl rand -base64 32
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure Environment Variables:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add `NIM_API_KEY`, `AI_PROVIDER`, and optionally `ANTHROPIC_API_KEY`

4. **Configure Vercel KV:**
   - Go to your Vercel project dashboard
   - Storage → Create Database → KV
   - Select Redis (Upstash) free tier
   - Connect to your project

### Environment Variables for Production

Make sure these are set in your Vercel dashboard:
- `NIM_API_KEY` - Your NVIDIA NIM API key
- `AI_PROVIDER` - Set to `nim` or `claude`
- `ANTHROPIC_API_KEY` - Only if using Claude fallback
- `NEXTAUTH_SECRET` - Random secret string
- `NEXTAUTH_URL` - Your Vercel app URL
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

## Usage

### 1. Set Up Your Style Profile

1. Go to `/style-setup`
2. Paste 5-10 of your past X posts
3. Click "Analyze Style"
4. Your style profile will be saved and used for all future generations

### 2. Generate Posts

**Prompted Mode:**
- Enter a topic or angle
- Select tone (Professional/Casual/Edgy)
- Choose Single or Thread mode
- Click "Generate Post"

**Suggested Topics Mode:**
- Switch to "Suggested Topics"
- Click to load AI-tailored trending topics for your profile
- Select a topic to generate

### 3. Manage Drafts

- All generated posts auto-save to Vercel KV (localStorage used as cache)
- Pin important drafts
- Search and filter by tone
- Re-open drafts for editing

### 4. Optimize Posts

- Click "Hook & Hashtag Suggestions" after generation
- Try alternative opening hooks
- Add relevant hashtags

## Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **AI**: NVIDIA NIM (Llama 3.3 70B) or Anthropic Claude
- **Storage**: Vercel KV (server source of truth) + localStorage cache
- **Deployment**: Vercel

### Key Components

- `/app/api/generate` - Main generation endpoint
- `/app/api/analyze-style` - Style profile analysis
- `/app/api/suggest-topics` - Trending topic suggestions
- `lib/ai.ts` - AI provider abstraction
- `lib/kv.ts` - Vercel KV helpers
- `lib/prompts.ts` - Prompt templates

## Current Status

- Multi-user auth is implemented with NextAuth + Google OAuth.
- App routes are protected behind login (`/login` for unauthenticated users).
- Per-user KV namespacing is active:
  - Style profile: `style:${userId}`
  - Drafts: `drafts:${userId}:${draftId}`
- API routes derive `userId` from server session only (never from client input).
- Drafts use Vercel KV as source of truth with localStorage as client cache.
- Onboarding redirect to `/style-setup` is enforced when KV is configured and style profile is missing.
- Theme toggle is implemented with class-based dark/light mode and persisted in localStorage (`postcraft-theme`).

## Performance Notes

- **NIM API Response Time**: 30-60 seconds (free tier)
- **Claude API Response Time**: 5-15 seconds (paid tier)
- **Style Profile**: Stored in Vercel KV for persistence
- **Drafts**: Stored in localStorage for instant access

## Troubleshooting

### "Analyzing..." stuck on Style Setup

- The NIM API is slow (30-60 seconds) - this is normal for the free tier
- Check your API key is correct
- Try switching to Claude if you have an API key

### No style profile being used

- Vercel KV is not available in local development
- Style profile will work when deployed to Vercel
- The app will still work with a default style profile

### Google login issues

- Verify `NEXTAUTH_URL=http://localhost:3000` in local development.
- Verify Google OAuth redirect URI includes:
  - `http://localhost:3000/api/auth/callback/google`
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.

### Generation errors

- Check your API key is valid
- Verify you have credits remaining
- Try switching AI providers

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
