-- VCroom.app — AI Investment Committee
-- Migration 0001: schema (tables, foreign keys, indexes)
-- Target: Supabase Postgres. users = Supabase Auth (auth.users); profiles is the app profile.

-- 1. profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'founder' check (role in ('founder','admin')),
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'App profile for an authenticated user. users = Supabase Auth auth.users.';

-- 2. organizations (a founder''s company/account)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  industry text,
  created_at timestamptz not null default now()
);

-- 3. startups
create table if not exists public.startups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  name text not null,
  tagline text,
  stage text, -- pre-seed / seed / Series A
  sector text,
  business_model text,
  description text,
  website text,
  country text,
  currency text default 'USD',
  funding_ask_usd numeric,
  equity_offered_pct numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. startup_documents (secure file records; files live in Supabase Storage)
create table if not exists public.startup_documents (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('pitch_deck','financials','supporting')),
  name text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- 5. pitch_decks
create table if not exists public.pitch_decks (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid references public.startup_documents(id) on delete set null,
  page_count integer,
  extraction_status text not null default 'pending' check (extraction_status in ('pending','processing','done','failed')),
  created_at timestamptz not null default now()
);

-- 6. extracted_pitch_content
create table if not exists public.extracted_pitch_content (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.pitch_decks(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  slide_index integer not null,
  raw_text text,
  claims_json jsonb,
  financial_json jsonb,
  created_at timestamptz not null default now(),
  unique (deck_id, slide_index)
);

-- 7. investor_personas (4 seeded fictional archetypes)
create table if not exists public.investor_personas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null,
  thesis text not null,
  priorities_json jsonb not null default '[]',
  risk_tolerance text not null, -- low / medium / high
  questioning_strategy_json jsonb not null default '[]',
  rejection_criteria_json jsonb not null default '[]',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8. investor_sessions
create table if not exists public.investor_sessions (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  current_persona_id uuid references public.investor_personas(id),
  current_question_id uuid,
  progress_json jsonb not null default '{}',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 9. investor_messages
create table if not exists public.investor_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.investor_sessions(id) on delete cascade,
  persona_id uuid references public.investor_personas(id),
  sender text not null check (sender in ('founder','investor','system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- 10. investor_questions
create table if not exists public.investor_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.investor_sessions(id) on delete cascade,
  persona_id uuid references public.investor_personas(id),
  question text not null,
  category text,
  risk_focus text,
  sequence integer not null default 1,
  status text not null default 'asked' check (status in ('asked','answered','skipped')),
  created_at timestamptz not null default now()
);

-- 11. investor_answers
create table if not exists public.investor_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.investor_questions(id) on delete cascade,
  session_id uuid not null references public.investor_sessions(id) on delete cascade,
  persona_id uuid references public.investor_personas(id),
  answer_text text,
  answer_audio_path text,
  confidence text, -- low / medium / high (AI assessment)
  analyzed_json jsonb,
  created_at timestamptz not null default now()
);

-- 12. follow_up_questions
create table if not exists public.follow_up_questions (
  id uuid primary key default gen_random_uuid(),
  parent_question_id uuid references public.investor_questions(id) on delete cascade,
  session_id uuid not null references public.investor_sessions(id) on delete cascade,
  question text not null,
  reason text,
  created_at timestamptz not null default now()
);

-- 13. research_sources
create table if not exists public.research_sources (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.investor_sessions(id) on delete cascade,
  startup_id uuid references public.startups(id) on delete cascade,
  claim_id text,
  url text not null,
  title text,
  source_type text, -- web / report / dataset / doc
  access_outcome text, -- retrieved / failed / blocked
  evidence_tier text, -- primary / secondary / tertiary
  retrieved_at timestamptz not null default now()
);

-- 14. evidence_records
create table if not exists public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.investor_sessions(id) on delete cascade,
  startup_id uuid references public.startups(id) on delete cascade,
  claim text not null,
  claim_id text,
  classification text not null check (classification in
    ('externally_verified','founder_reported','document_supported','modelled_assumption','unverified','unknown','contradicted')),
  supporting_text text,
  source_ids_json jsonb default '[]',
  confidence numeric check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);

-- 15. financial_metrics
create table if not exists public.financial_metrics (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  metric_name text not null, -- mrr / arpu / cac / ltv / burn / runway / gross_margin / revenue
  value numeric,
  unit text,
  period text, -- monthly / annual / lifetime
  source_type text, -- founder_reported / document_supported / modelled_assumption
  created_at timestamptz not null default now()
);

-- 16. diligence_findings
create table if not exists public.diligence_findings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.investor_sessions(id) on delete cascade,
  startup_id uuid references public.startups(id) on delete cascade,
  persona_id uuid references public.investor_personas(id),
  category text not null, -- market / product / financial / team / tech / legal / risk
  finding text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  evidence_ids_json jsonb default '[]',
  created_at timestamptz not null default now()
);

-- 17. investor_verdicts
create table if not exists public.investor_verdicts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.investor_sessions(id) on delete cascade,
  persona_id uuid not null references public.investor_personas(id),
  verdict text not null check (verdict in ('YES','NO','CONDITIONAL_YES','MORE_DILIGENCE')),
  rationale text not null,
  risks_json jsonb default '[]',
  evidence_strengths_json jsonb default '[]',
  created_at timestamptz not null default now(),
  unique (session_id, persona_id)
);

-- 18. committee_decisions
create table if not exists public.committee_decisions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.investor_sessions(id) on delete cascade,
  decision text not null check (decision in ('YES','NO','CONDITIONAL_YES','MORE_DILIGENCE')),
  summary text not null,
  agreement_json jsonb default '[]',
  disagreement_json jsonb default '[]',
  biggest_risks_json jsonb default '[]',
  strongest_evidence_json jsonb default '[]',
  weakest_evidence_json jsonb default '[]',
  unanswered_questions_json jsonb default '[]',
  reconsider_conditions_json jsonb default '[]',
  created_at timestamptz not null default now()
);

-- 19. evaluation_reports
create table if not exists public.evaluation_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.investor_sessions(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  report_json jsonb not null,
  report_markdown text,
  status text not null default 'draft' check (status in ('draft','final')),
  created_at timestamptz not null default now()
);

-- 20. subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null default 'trial' check (plan in ('trial','founder','pro','business')),
  status text not null default 'active' check (status in ('active','canceled','past_due','trialing')),
  provider text default 'manual',
  provider_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- 21. usage_records
create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  tokens_used integer default 0,
  cost_usd numeric default 0,
  created_at timestamptz not null default now()
);

-- 22. audit_logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata_json jsonb default '{}',
  ip text,
  created_at timestamptz not null default now()
);

-- 23. pricing_plans (configurable, not hardcoded)
create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price_usd_monthly numeric,
  price_inr_monthly numeric,
  features_json jsonb default '[]',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_startups_owner on public.startups(owner_id);
create index if not exists idx_documents_startup on public.startup_documents(startup_id);
create index if not exists idx_documents_owner on public.startup_documents(owner_id);
create index if not exists idx_sessions_startup on public.investor_sessions(startup_id);
create index if not exists idx_sessions_owner on public.investor_sessions(owner_id);
create index if not exists idx_messages_session on public.investor_messages(session_id);
create index if not exists idx_questions_session on public.investor_questions(session_id);
create index if not exists idx_answers_question on public.investor_answers(question_id);
create index if not exists idx_evidence_startup on public.evidence_records(startup_id);
create index if not exists idx_findings_startup on public.diligence_findings(startup_id);
create index if not exists idx_verdicts_session on public.investor_verdicts(session_id);
create index if not exists idx_reports_owner on public.evaluation_reports(owner_id);
create index if not exists idx_usage_user on public.usage_records(user_id);
create index if not exists idx_audit_user on public.audit_logs(user_id);
