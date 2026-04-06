# Postcraft — Agent Instructions

## Project Scope
- Postcraft is a multi-user X post generator for any niche/domain.
- Personalization comes from each user's style profile and session context.

## Source Of Truth
- Auth/session: NextAuth (Google OAuth).
- Data isolation: userId must come from server session only.
- Persistence: Vercel KV is source of truth; localStorage is cache only.

## Non-Negotiables
- Never accept `userId` from client input.
- Every API route that reads/writes user data must gate via server session.
- Keep user data namespaced in KV:
  - `style:${userId}`
  - `drafts:${userId}:${draftId}`
- Do not reintroduce niche hardcoding (no cybersecurity-specific prompt constraints).

## Runtime Behavior
- Unauthenticated users are redirected to `/login`.
- If KV is configured and user has no style profile, redirect to `/style-setup`.
- Suggested topics must be tailored to the user's style profile when available.

## Prompt Rules
- Generation prompts must infer audience/domain from user style profile + topic.
- Tone selector modifies style; it must not override user voice.
- Output must be only post/thread content (no labels/explanations).

## Commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Required Env Vars
- AI: `NIM_API_KEY`, `AI_PROVIDER`, `ANTHROPIC_API_KEY` (optional)
- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- KV: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

## UI/Theming Constraints
- Use CSS variable tokens for all colors (no hardcoded hex/classes in components).
- Keep glassmorphism only on cards/panels/sidebar; not on primary page background.
- Buttons are solid emerald with void text.
- Dark/light mode is class-based on `<html>` and persisted in `postcraft-theme`.
