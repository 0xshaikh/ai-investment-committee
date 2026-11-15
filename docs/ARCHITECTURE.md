# Architecture

## Principles

- **Simplest reliable architecture** that supports the product. No unnecessary microservices.
- Next.js App Router as the single server-side application; API routes are the backend.
- Data adapter pattern: `lib/db` exposes one `Repo` interface; `getRepo()` returns the Supabase adapter (production) or the local file-backed adapter (dev) depending on env. All domain logic is adapter-agnostic.
- AI provider abstraction in `lib/ai/provider.ts` so the product is not locked to one model.
- Structured AI orchestration in `lib/engine/*` — pure, testable functions for evidence, questioning, decision, market and report.

## Layers

```
app/                      Next.js App Router
  api/auth/*              signup, login, logout, me
  api/startups/*          CRUD, documents (secure upload), deck extraction, sessions
  api/sessions/*          meeting state, answer, finalize, report
  dashboard/*             dashboard, startup workspace, meeting room, report (client components)
  page.tsx, login, signup, about, contact, terms, privacy, disclaimer
components/               FaqAccordion, etc.
lib/
  env.ts                  validated env access (server secrets never exposed to client)
  ai/provider.ts          callAI: OpenRouter > Gemini > Groq, retry/timeout/JSON/extractJson
  db/types.ts             domain types
  db/repo.ts              Repo interface (the adapter contract)
  db/local.ts             local file-backed adapter (.localdata/db.json) — dev, no creds
  db/supabase.ts          Supabase adapter (RLS, storage, auth) — production
  db/seed-data.ts         fictional personas + pricing plans
  auth.ts                 session/token helpers (cookie vcroom_token)
  api.ts                  json/bad/guard helpers (server-side auth guard)
  engine/
    evidence.ts           classifyClaim (deterministic), recordEvidence, summarize
    questioning.ts        pickNextQuestion, analyzeAnswer, generateFollowUp, detectContradiction
    decision.ts           evaluatePersona, aggregateDecision (YES never default)
    market.ts             marketResearch + web search (Tavily/Serper), URL+date
    report.ts             buildReport — 16 sections, never invents figures
    orchestrator.ts       startMeeting, answerQuestion, finalizeSession (meeting loop)
skills/*/SKILL.md         12 skill modules (investor persona engine, DD, questioning, etc.)
supabase/migrations/      0001 schema, 0002 RLS, 0003 seed
tests/unit/               vitest unit tests for the engines
```

## Data flow

1. **Signup/login** → token cookie (`vcroom_token`), profile row, RLS-scoped.
2. **Create startup** → `startups` row owned by the user.
3. **Upload deck** → secure upload (size/type restricted, untrusted input) → `pdfjs-dist` extracts slide text → claims identified.
4. **Start meeting** → `investor_sessions` row → `startMeeting` seeds the first persona question (via AI).
5. **Answer** → `answerQuestion`: analyze → classify evidence → detect contradiction → follow-up or next question (one at a time) → advance personas under a per-persona cap → finalize.
6. **Finalize** → per-persona verdicts → committee decision (aggregate) → 16-section report → mark complete.

## User isolation

Server-side ownership checks (`guard` → `requireUser` → `startup.owner_id === user.id` / `session.owner_id === user.id`) on every route, plus Supabase RLS policies. A user can never read or write another user's startup, session, or report.

## Background processing

Longer research tasks run inline within the request (market research, report generation). The orchestrator is request-scoped; a task queue / background worker is a documented future enhancement (see KNOWN_LIMITATIONS) and was not introduced to avoid unnecessary complexity.
