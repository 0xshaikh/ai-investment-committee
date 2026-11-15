// lib/db/supabase.ts — PRODUCTION adapter (Supabase Postgres + Auth). RLS enforces isolation.
// NOTE: cannot be exercised without a live Supabase project; the local adapter is used for dev/test.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, supabaseConfigured } from '../env';
import type { Repo } from './repo';
import type { Profile, Startup, StartupDocument, PitchDeck, ExtractedContent, Persona, Session, Message, Question, Answer, FollowUp, EvidenceRecord, ResearchSource, Verdict, CommitteeDecision, EvaluationReport, UsageRecord, PricingPlan, Finding } from './types';

function client(): SupabaseClient {
  if (!supabaseConfigured()) throw new Error('Supabase not configured');
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

async function mapProfile(row: { id: string; email: string; full_name?: string; role: string }): Promise<Profile> {
  return { id: row.id, email: row.email, full_name: row.full_name, role: row.role as Profile['role'] };
}

export const supabaseRepo: Repo = {
  mode: 'supabase',

  async signUp(email, password, fullName) {
    const c = client();
    const { data, error } = await c.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error || !data.user) return { user: null, error: error?.message ?? 'Sign up failed' };
    const profile: Profile = { id: data.user.id, email: data.user.email ?? email, full_name: fullName, role: 'founder' };
    return { user: profile };
  },
  async signIn(email, password) {
    const c = client();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { user: null, error: error?.message ?? 'Sign in failed' };
    return { user: { id: data.user.id, email: data.user.email ?? email, role: 'founder' } };
  },
  async signOut() { await client().auth.signOut(); },
  async getSessionUser() {
    const c = client();
    const { data: { user } } = await c.auth.getUser();
    if (!user) return null;
    const { data } = await c.from('profiles').select('*').eq('id', user.id).single();
    if (!data) return { id: user.id, email: user.email ?? '', role: 'founder' as const };
    return mapProfile(data);
  },

  async listPersonas() { const { data } = await client().from('investor_personas').select('*').eq('active', true); return (data ?? []) as unknown as Persona[]; },
  async listPlans() { const { data } = await client().from('pricing_plans').select('*').eq('active', true); return (data ?? []) as unknown as PricingPlan[]; },

  async createStartup(data) { const { data: d, error } = await client().from('startups').insert(data).select().single(); if (error) throw new Error(error.message); return d as Startup; },
  async listStartups(ownerId) { const { data } = await client().from('startups').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }); return (data ?? []) as unknown as Startup[]; },
  async getStartup(id) { const { data } = await client().from('startups').select('*').eq('id', id).single(); return (data as Startup) ?? null; },
  async updateStartup(id, data) { const { data: d, error } = await client().from('startups').update(data).eq('id', id).select().single(); if (error) throw new Error(error.message); return d as Startup; },

  async saveDocument(doc) { const { data, error } = await client().from('startup_documents').insert(doc).select().single(); if (error) throw new Error(error.message); return data as StartupDocument; },
  async listDocuments(startupId) { const { data } = await client().from('startup_documents').select('*').eq('startup_id', startupId); return (data ?? []) as unknown as StartupDocument[]; },
  async getDocument(id) { const { data } = await client().from('startup_documents').select('*').eq('id', id).single(); return (data as StartupDocument) ?? null; },
  async deleteDocument(id) { await client().from('startup_documents').delete().eq('id', id); },

  async createDeck(deck) { const { data, error } = await client().from('pitch_decks').insert(deck).select().single(); if (error) throw new Error(error.message); return data as PitchDeck; },
  async updateDeckStatus(id, status, pageCount) { await client().from('pitch_decks').update({ extraction_status: status, ...(pageCount != null ? { page_count: pageCount } : {}) }).eq('id', id); },
  async saveExtractedContent(c) { await client().from('extracted_pitch_content').insert(c); },
  async listExtractedContent(deckId) { const { data } = await client().from('extracted_pitch_content').select('*').eq('deck_id', deckId).order('slide_index'); return (data ?? []) as unknown as ExtractedContent[]; },

  async createSession(s) { const { data, error } = await client().from('investor_sessions').insert(s).select().single(); if (error) throw new Error(error.message); return data as Session; },
  async getSession(id) { const { data } = await client().from('investor_sessions').select('*').eq('id', id).single(); return (data as Session) ?? null; },
  async listSessions(ownerId) { const { data } = await client().from('investor_sessions').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }); return (data ?? []) as unknown as Session[]; },
  async listSessionsByStartup(startupId) { const { data } = await client().from('investor_sessions').select('*').eq('startup_id', startupId).order('created_at', { ascending: false }); return (data ?? []) as unknown as Session[]; },
  async updateSession(id, data) { await client().from('investor_sessions').update(data).eq('id', id); },
  async completeSession(id) { await client().from('investor_sessions').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id); },

  async addMessage(m) { const { data, error } = await client().from('investor_messages').insert(m).select().single(); if (error) throw new Error(error.message); return data as Message; },
  async listMessages(sessionId) { const { data } = await client().from('investor_messages').select('*').eq('session_id', sessionId).order('created_at'); return (data ?? []) as unknown as Message[]; },
  async addQuestion(q) { const { data, error } = await client().from('investor_questions').insert(q).select().single(); if (error) throw new Error(error.message); return data as Question; },
  async listQuestions(sessionId) { const { data } = await client().from('investor_questions').select('*').eq('session_id', sessionId).order('sequence'); return (data ?? []) as unknown as Question[]; },
  async updateQuestionStatus(id, status) { await client().from('investor_questions').update({ status }).eq('id', id); },
  async addAnswer(a) { const { data, error } = await client().from('investor_answers').insert(a).select().single(); if (error) throw new Error(error.message); return data as Answer; },
  async listAnswers(sessionId) { const { data } = await client().from('investor_answers').select('*').eq('session_id', sessionId).order('created_at'); return (data ?? []) as unknown as Answer[]; },
  async addFollowUp(f) { const { data, error } = await client().from('follow_up_questions').insert(f).select().single(); if (error) throw new Error(error.message); return data as FollowUp; },
  async listFollowUps(sessionId) { const { data } = await client().from('follow_up_questions').select('*').eq('session_id', sessionId); return (data ?? []) as unknown as FollowUp[]; },
  async addFinding(f) { const { data, error } = await client().from('diligence_findings').insert(f).select().single(); if (error) throw new Error(error.message); return data as Finding; },
  async listFindings(sessionId) { const { data } = await client().from('diligence_findings').select('*').eq('session_id', sessionId); return (data ?? []) as unknown as Finding[]; },

  async upsertEvidence(e) { const { data, error } = await client().from('evidence_records').upsert(e).select().single(); if (error) throw new Error(error.message); return data as EvidenceRecord; },
  async listEvidence(sessionId) { const { data } = await client().from('evidence_records').select('*').eq('session_id', sessionId); return (data ?? []) as unknown as EvidenceRecord[]; },
  async addSource(s) { const { data, error } = await client().from('research_sources').insert(s).select().single(); if (error) throw new Error(error.message); return data as ResearchSource; },
  async listSources(sessionId) { const { data } = await client().from('research_sources').select('*').eq('session_id', sessionId); return (data ?? []) as unknown as ResearchSource[]; },

  async upsertVerdict(v) { const { data, error } = await client().from('investor_verdicts').upsert(v).select().single(); if (error) throw new Error(error.message); return data as Verdict; },
  async listVerdicts(sessionId) { const { data } = await client().from('investor_verdicts').select('*').eq('session_id', sessionId); return (data ?? []) as unknown as Verdict[]; },
  async saveDecision(d) { const { data, error } = await client().from('committee_decisions').upsert(d).select().single(); if (error) throw new Error(error.message); return data as CommitteeDecision; },
  async getDecision(sessionId) { const { data } = await client().from('committee_decisions').select('*').eq('session_id', sessionId).single(); return (data as CommitteeDecision) ?? null; },
  async saveReport(r) { const { data, error } = await client().from('evaluation_reports').upsert(r).select().single(); if (error) throw new Error(error.message); return data as EvaluationReport; },
  async getReport(sessionId) { const { data } = await client().from('evaluation_reports').select('*').eq('session_id', sessionId).single(); return (data as EvaluationReport) ?? null; },
  async listReports(ownerId) { const { data } = await client().from('evaluation_reports').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false }); return (data ?? []) as unknown as EvaluationReport[]; },

  async recordUsage(u) { await client().from('usage_records').insert(u); },
  async listUsage(ownerId) { const { data } = await client().from('usage_records').select('*').eq('user_id', ownerId).order('created_at', { ascending: false }).limit(100); return (data ?? []) as unknown as UsageRecord[]; },
  async logAudit(action, entityType, entityId, metadata) {
    const { data: { user } } = await client().auth.getUser();
    await client().from('audit_logs').insert({ user_id: user?.id, action, entity_type: entityType, entity_id: entityId, metadata_json: metadata ?? {} });
  },
};
