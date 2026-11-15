-- VCroom.app — AI Investment Committee
-- Migration 0002: Row Level Security + helper functions
-- Enforces user-level data isolation. Users can never access another user's private startup data.

-- Admin check helper (server-side authorized; never frontend-only)
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
$$;

-- Session owner helper for child tables (messages, questions, answers, etc.)
create or replace function public.session_owner(sid uuid) returns uuid language sql stable as $$
  select owner_id from public.investor_sessions where id = sid
$$;

-- Startup owner helper for startup-scoped child tables
create or replace function public.startup_owner(sid uuid) returns uuid language sql stable as $$
  select owner_id from public.startups where id = sid
$$;

-- ---------- profiles ----------
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- ---------- organizations ----------
alter table public.organizations enable row level security;
drop policy if exists "orgs_all_own" on public.organizations;
create policy "orgs_all_own" on public.organizations for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

-- ---------- startups ----------
alter table public.startups enable row level security;
drop policy if exists "startups_all_own" on public.startups;
create policy "startups_all_own" on public.startups for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

-- ---------- startup_documents ----------
alter table public.startup_documents enable row level security;
drop policy if exists "docs_all_own" on public.startup_documents;
create policy "docs_all_own" on public.startup_documents for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

-- ---------- pitch_decks ----------
alter table public.pitch_decks enable row level security;
drop policy if exists "decks_all_own" on public.pitch_decks;
create policy "decks_all_own" on public.pitch_decks for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

-- ---------- extracted_pitch_content (scoped via deck -> startup) ----------
alter table public.extracted_pitch_content enable row level security;
drop policy if exists "extracted_all_own" on public.extracted_pitch_content;
create policy "extracted_all_own" on public.extracted_pitch_content for all
  using (public.startup_owner(startup_id) = auth.uid() or public.is_admin())
  with check (public.startup_owner(startup_id) = auth.uid() or public.is_admin());

-- ---------- investor_personas (public read, admin write) ----------
alter table public.investor_personas enable row level security;
drop policy if exists "personas_select" on public.investor_personas;
create policy "personas_select" on public.investor_personas for select using (active = true or public.is_admin());
drop policy if exists "personas_write" on public.investor_personas;
create policy "personas_write" on public.investor_personas for all using (public.is_admin()) with check (public.is_admin());

-- ---------- investor_sessions ----------
alter table public.investor_sessions enable row level security;
drop policy if exists "sessions_all_own" on public.investor_sessions;
create policy "sessions_all_own" on public.investor_sessions for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

-- ---------- child tables (scoped via session_owner) ----------
alter table public.investor_messages enable row level security;
drop policy if exists "messages_all_own" on public.investor_messages;
create policy "messages_all_own" on public.investor_messages for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.investor_questions enable row level security;
drop policy if exists "questions_all_own" on public.investor_questions;
create policy "questions_all_own" on public.investor_questions for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.investor_answers enable row level security;
drop policy if exists "answers_all_own" on public.investor_answers;
create policy "answers_all_own" on public.investor_answers for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.follow_up_questions enable row level security;
drop policy if exists "followups_all_own" on public.follow_up_questions;
create policy "followups_all_own" on public.follow_up_questions for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.research_sources enable row level security;
drop policy if exists "sources_all_own" on public.research_sources;
create policy "sources_all_own" on public.research_sources for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.evidence_records enable row level security;
drop policy if exists "evidence_all_own" on public.evidence_records;
create policy "evidence_all_own" on public.evidence_records for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.diligence_findings enable row level security;
drop policy if exists "findings_all_own" on public.diligence_findings;
create policy "findings_all_own" on public.diligence_findings for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.investor_verdicts enable row level security;
drop policy if exists "verdicts_all_own" on public.investor_verdicts;
create policy "verdicts_all_own" on public.investor_verdicts for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.committee_decisions enable row level security;
drop policy if exists "decisions_all_own" on public.committee_decisions;
create policy "decisions_all_own" on public.committee_decisions for all
  using (public.session_owner(session_id) = auth.uid() or public.is_admin())
  with check (public.session_owner(session_id) = auth.uid() or public.is_admin());

alter table public.evaluation_reports enable row level security;
drop policy if exists "reports_all_own" on public.evaluation_reports;
create policy "reports_all_own" on public.evaluation_reports for all using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());

alter table public.financial_metrics enable row level security;
drop policy if exists "metrics_all_own" on public.financial_metrics;
create policy "metrics_all_own" on public.financial_metrics for all
  using (public.startup_owner(startup_id) = auth.uid() or public.is_admin())
  with check (public.startup_owner(startup_id) = auth.uid() or public.is_admin());

-- ---------- billing & audit (user-scoped) ----------
alter table public.subscriptions enable row level security;
drop policy if exists "subs_all_own" on public.subscriptions;
create policy "subs_all_own" on public.subscriptions for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

alter table public.usage_records enable row level security;
drop policy if exists "usage_all_own" on public.usage_records;
create policy "usage_all_own" on public.usage_records for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

alter table public.audit_logs enable row level security;
drop policy if exists "audit_insert" on public.audit_logs;
create policy "audit_insert" on public.audit_logs for insert with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "audit_select" on public.audit_logs;
create policy "audit_select" on public.audit_logs for select using (user_id = auth.uid() or public.is_admin());

-- ---------- pricing_plans (public read, admin write) ----------
alter table public.pricing_plans enable row level security;
drop policy if exists "plans_select" on public.pricing_plans;
create policy "plans_select" on public.pricing_plans for select using (active = true or public.is_admin());
drop policy if exists "plans_write" on public.pricing_plans;
create policy "plans_write" on public.pricing_plans for all using (public.is_admin()) with check (public.is_admin());

-- ---------- trigger: keep profiles in sync with auth.users ----------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'trial', 'trialing')
  on conflict do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
