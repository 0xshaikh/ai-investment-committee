# Environment Setup

## Variables

`.env.example` documents every variable. Real credentials go in `.env` (gitignored via `.env*`).

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | prod | Supabase project URL. If absent → local file-backed adapter |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod | Supabase anon key (public; used for auth + RLS-scoped client) |
| `SUPABASE_SERVICE_ROLE_KEY` | prod (server) | Server-side privileged access (storage, admin). Never exposed to client |
| `NEXT_PUBLIC_STORAGE_BUCKET` | prod | Storage bucket name (default `startup-documents`) |
| `OPENROUTER_API_KEY` | at least one AI key | OpenRouter (default model `anthropic/claude-3.5-sonnet`) |
| `OPENROUTER_MODEL` | no | Override OpenRouter model |
| `GEMINI_API_KEY` | alt | Gemini (`gemini-2.0-flash` default) |
| `GEMINI_MODEL` | no | Override Gemini model |
| `GROQ_API_KEY` | alt | Groq (`llama-3.3-70b-versatile` default) |
| `GROQ_MODEL` | no | Override Groq model |
| `TAVILY_API_KEY` | no | Web search for market intelligence |
| `SERPER_API_KEY` | no | Alternate web search provider |
| `MAX_UPLOAD_MB` | no | Max upload size (default 20) |

## Local development (no external credentials)

Without Supabase variables the app runs in **local mode**: a file-backed adapter (`.localdata/db.json`) provides the same `Repo` contract, auth is a local cookie session, and uploads go to `.localdata/uploads/`. Everything except Supabase-dependent features works. AI meetings require at least one AI key; without one, meeting start returns a clear configuration error (no fake AI responses).

## Production prerequisites

1. A Supabase project (Postgres + Auth + Storage).
2. Apply migrations: `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_seed.sql`.
3. Create the storage bucket (`startup-documents`) with RLS policies for the user's own path.
4. Set production env vars (Supabase URL/anon/service keys, storage bucket, at least one AI key, search key).
5. Deploy to Vercel (see [DEPLOYMENT.md](DEPLOYMENT.md)).

## Secrets hygiene

- Never commit `.env` (gitignored). `.env.example` has names/descriptions only, no credentials.
- Server secrets (`SUPABASE_SERVICE_ROLE_KEY`, AI keys) are only read server-side and never serialized to the client.
