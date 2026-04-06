# Postcrafty — Project Plan

## Overview

Postcrafty is a multi-user content dashboard for generating and managing X posts for any niche or audience. It supports prompted generation, AI-suggested topics, thread creation, tone control, style fingerprinting, hooks/hashtag suggestions, and per-user post history.

The output should reflect each user's voice (via style profile), not generic assistant phrasing.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | Unified frontend + API routes |
| Styling | Tailwind CSS + CSS variables | Class-based dark/light mode |
| AI (primary) | NVIDIA NIM — Llama 3.3 70B | OpenAI-compatible API |
| AI (fallback) | Anthropic Claude API | Controlled by `AI_PROVIDER` |
| Auth | NextAuth + Google OAuth | Session-based user identity |
| Storage | Vercel KV + localStorage cache | KV is source of truth |
| Deployment | Vercel | Native Next.js workflow |

---

## Required Environment Variables

### AI
- `NIM_API_KEY`
- `AI_PROVIDER` (`nim` or `claude`)
- `ANTHROPIC_API_KEY` (optional)

### Auth
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### KV
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

---

## Architecture Constraints

### 1) Multi-user Data Isolation
- userId must always be derived from server session.
- Never trust client-provided identifiers.
- KV keys must be namespaced by user:
  - `style:${userId}`
  - `drafts:${userId}:${draftId}`

### 2) Auth Gating
- Unauthenticated users are redirected to `/login`.
- All data API routes require valid session.

### 3) Onboarding
- If KV is configured and `style:${userId}` does not exist, redirect to `/style-setup`.
- Returning users go directly to `/`.

### 4) Prompting Rules
- Infer audience/domain from style profile + topic (no fixed niche).
- Tone selector modifies delivery only; it must not replace user voice.
- Output must be post/thread text only (no labels/explanations).

---

## Core Product Features

### Style Profile System
- Users paste 5–10 sample posts.
- `/api/analyze-style` extracts writing profile and stores in KV.
- Profile is injected into all generation requests.

### Generation Modes
- Prompted mode: user provides topic/angle.
- Suggested mode: AI proposes relevant topics tailored to user profile.

### Tone Selector
- Professional / Casual / Edgy modifiers.

### Thread Mode
- 3–7 tweet output, parseable format, with a strong opening and clear closing CTA.

### Hook + Hashtag Suggestions
- Follow-up generation returns 3 hook alternatives + 3–5 hashtags.

### History Management
- Save/read/update/delete history entries via KV per user.
- localStorage mirrors server state as a client cache.

---

## UI/Theme Requirements

- Glassmorphism on cards/panels/sidebar only.
- Background is solid with subtle radial depth (not glass).
- Dark/light mode toggles via `<html class="dark|light">`.
- Theme preference persisted in `localStorage['postcrafty-theme']`.
- Buttons are solid emerald with void text.

---

## App Routes (Current)

- `/` — Generation panel
- `/login` — Google sign-in
- `/style-setup` — Style onboarding
- `/history` — Post history management
- `/drafts` — Legacy route redirecting to `/history`

### API Routes (Current)
- `/api/auth/[...nextauth]`
- `/api/generate`
- `/api/analyze-style`
- `/api/suggest-topics`
- `/api/drafts`
- `/api/drafts/[id]`

---

## Validation Checklist

- `npm run lint` passes
- `npm run build` passes
- Auth works locally with Google OAuth callback URI
- Session-gated APIs reject unauthenticated access
- Cross-user access to style/history is impossible by design
