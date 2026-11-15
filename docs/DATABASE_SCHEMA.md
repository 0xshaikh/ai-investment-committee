# Database Schema

23 tables, defined in `supabase/migrations/0001_schema.sql` (schema + FKs + indexes), `0002_rls.sql` (RLS + helpers), `0003_seed.sql` (fictional personas + pricing).

## Tables

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with auth user; role (founder/admin), display name |
| `organizations` | Optional org grouping (multi-startup accounts) |
| `startups` | Company profile: name, stage, sector, business model, funding ask, equity offered |
| `startup_documents` | Uploaded docs (deck, financials, supporting); type/size/mime restricted |
| `pitch_decks` | Deck metadata + extraction status |
| `extracted_pitch_content` | Per-slide text, claims JSON, financial JSON |
| `investor_personas` | Seeded fictional personas (thesis, priorities, risk tolerance, questioning strategy, rejection criteria) |
| `investor_sessions` | A meeting: current persona/question, progress JSON, status |
| `investor_messages` | Meeting transcript (investor/founder/system) |
| `investor_questions` | Questions asked, per persona, sequence, status |
| `investor_answers` | Founder answers, confidence, analyzed JSON |
| `follow_up_questions` | Follow-ups generated from weak/vague answers |
| `research_sources` | External sources (URL, title, type, evidence tier, retrieved_at) |
| `evidence_records` | Evidence ledger: claim, classification, supporting text, source ids, confidence |
| `financial_metrics` | Extracted financials (never fabricated) |
| `diligence_findings` | Per-category findings with severity (low/medium/high/critical) |
| `investor_verdicts` | Per-persona verdict (YES/NO/CONDITIONAL_YES/MORE_DILIGENCE) + rationale |
| `committee_decisions` | Aggregate decision + agreement/disagreement, risks, strongest/weakest evidence, unanswered questions, reconsider conditions |
| `evaluation_reports` | 16-section report (JSON + markdown), status |
| `subscriptions` | Pricing plan per user |
| `usage_records` | Token/cost/action logging |
| `audit_logs` | Security/audit events |

## Relationships

- `startups.owner_id → profiles.id` (user-level ownership)
- `startup_documents.startup_id → startups.id`
- `pitch_decks.startup_id → startups.id`, `pitch_decks.document_id → startup_documents.id`
- `extracted_pitch_content.deck_id → pitch_decks.id`
- `investor_sessions.startup_id → startups.id`, `investor_sessions.owner_id → profiles.id`
- `investor_messages/questions/answers/follow_up_questions → investor_sessions.id`
- `evidence_records`, `financial_metrics`, `diligence_findings → investor_sessions.id` (or `startups.id`)
- `investor_verdicts → investor_sessions.id` + `investor_personas.id`
- `committee_decisions → investor_sessions.id`
- `evaluation_reports → investor_sessions.id` + `startups.id` + `profiles.id`

All FKs are indexed (see `0001_schema.sql`).

## Row Level Security

`0002_rls.sql` enables RLS on every table and defines:

- `is_admin()` — role = 'admin' (server-side check, never frontend-only)
- `session_owner(sid)` — true if the session belongs to the current user
- `startup_owner(sid)` — true if the startup belongs to the current user

Policies: a user can **only** select/insert/update/delete rows where they are the owner (or the row is a globally-readable config table like `investor_personas` / pricing). Admin can manage everything. **Users can never access another user's private startup data** — enforced at the DB level and double-checked server-side in every route.

## Local dev adapter

When no `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, `lib/db/local.ts` provides the same `Repo` contract backed by `.localdata/db.json`. It mirrors the schema and enforces the same ownership checks in code. It is clearly labeled "local/demo mode" in responses.
