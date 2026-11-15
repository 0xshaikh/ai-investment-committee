# Deployment

## Target architecture

- **Frontend + API routes:** Vercel
- **Database + Auth + Storage:** Supabase
- **AI:** configured provider (OpenRouter/Gemini/Groq) via server env

## Prerequisites (what is required, honestly identified)

This repository was built and tested **locally** (Next.js production build, unit tests, live API end-to-end). A live deploy requires **external accounts that are not present in this environment**:

- A **Supabase** project (for Postgres, Auth, Storage) — no Supabase credentials are configured in this environment.
- A **Vercel** account/token (for hosting) — no Vercel token is configured (`npx vercel whoami` fails).
- At least one **AI provider** key (OpenRouter/Gemini/Groq) — these ARE available in this environment.

Without Supabase + Vercel credentials, a live deployment cannot be completed. This is a genuine external blocker, not a hidden failure.

## Steps once credentials are available

1. **Supabase:** create project → run the three migrations → create the `startup-documents` bucket (public=false) with path-scoped RLS → note URL, anon key, service role key.
2. **Vercel:** `vercel login` (or set `VERCEL_TOKEN`) → `vercel link`.
3. **Env:** set all production variables (see [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)) in the Vercel project and locally.
4. **Deploy:** `vercel --prod`.
5. **Verify (mandatory):** a successful build/command is NOT proof. After deploy, open the production URL and test: homepage, signup, login, protected dashboard, backend connectivity, a real AI workflow (meeting start + one answer), and browser console/server errors.

## Local verification already performed

- `npm run build` — production build succeeds (all 21 routes).
- `npx tsc --noEmit` — clean.
- `npx vitest run` — 32/32 unit tests pass.
- Live server (`npm start`) — all public pages 200; API e2e (signup → startup → meeting → answer → follow-up) verified with real AI (OpenRouter).
