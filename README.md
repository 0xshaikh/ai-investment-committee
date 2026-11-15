# VCroom.app — AI Investment Committee

**Prepare for the investor who will challenge every assumption.**

VCroom is an AI Investor Simulation & Startup Due Diligence platform. A founder uploads a startup pitch and faces a simulated investment committee of four fictional investor archetypes — a Venture Capital Partner, a Financial Investor / CFO, a Technical Investor / CTO and an Industry Specialist — that pressure-tests the pitch with difficult, evidence-driven questions, one at a time. It returns individual verdicts and a single committee decision (**YES / NO / CONDITIONAL YES / MORE DILIGENCE**) backed by a 16-section professional evaluation report.

This is **not** a generic AI chatbot, a pitch-deck analyzer, or a motivational business coach. The committee is deliberately skeptical: it challenges weak claims, asks specific follow-ups, detects contradictions, and separates facts from assumptions. It never automatically praises a founder.

> **Simulated assessment only.** The personas are fictional archetypes. They do not impersonate real investors and no real firm has evaluated your startup. The output is not an investment offer, financial advice, or a prediction of real investor decisions.

## Stack

- **Frontend / backend:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4
- **Database:** Supabase PostgreSQL (production) **or** a local file-backed adapter (development, no credentials needed)
- **Auth:** Supabase Auth (production) / local session (development) — user-level data isolation enforced by RLS
- **Storage:** Supabase Storage (production) / local `uploads/` (development)
- **AI:** provider abstraction — OpenRouter > Gemini > Groq (configurable via env); structured outputs, retry, timeout, token/cost tracking
- **Search:** Tavily / Serper for market intelligence (optional; claims without a provider are labeled unverified)

## Quick start (local, no external credentials)

```bash
npm install
# optional: put OPENROUTER_API_KEY / GEMINI_API_KEY / GROQ_API_KEY in .env to enable AI meetings
cp .env.example .env
npm run dev
# open http://localhost:3000
```

Without any AI key the site runs (auth, startup creation, uploads, extraction) and AI-gated features show a clear configuration error. Meetings require an AI provider.

## Tests

```bash
npx vitest run        # unit tests (evidence, decision, questioning, contradiction)
npm run build         # type-check + production build
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system architecture, data flow, module boundaries
- [docs/REPOSITORY_AUDIT.md](docs/REPOSITORY_AUDIT.md) — audit of 13 inspected repos: licenses, reuse decisions, attribution
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — 23 tables, FKs, indexes, RLS, isolation
- [docs/AI_ENGINE.md](docs/AI_ENGINE.md) — provider abstraction, questioning, evidence, decision engines
- [docs/INVESTOR_SKILLS.md](docs/INVESTOR_SKILLS.md) — the 12 skill modules and 4 personas
- [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) — env vars, local vs Supabase, deploy prerequisites
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Vercel + Supabase deployment steps
- [docs/TESTING.md](docs/TESTING.md) — test strategy, scenarios, results
- [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) — honest list of incomplete/blocked features

## License

See the repository license file. Third-party code was only reused where its license permits, with attribution (see [docs/REPOSITORY_AUDIT.md](docs/REPOSITORY_AUDIT.md)); no-license repositories were used as study-only references.
