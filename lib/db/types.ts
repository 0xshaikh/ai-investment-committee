// lib/db/types.ts — domain types shared by both data adapters (Supabase + local dev).
export type Role = 'founder' | 'admin';
export type DocType = 'pitch_deck' | 'financials' | 'supporting';
export type VerdictValue = 'YES' | 'NO' | 'CONDITIONAL_YES' | 'MORE_DILIGENCE';
export type EvidenceClass = 'externally_verified' | 'founder_reported' | 'document_supported' | 'modelled_assumption' | 'unverified' | 'unknown' | 'contradicted';
export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface Profile { id: string; email: string; full_name?: string; role: Role; }
export interface Startup {
  id: string; owner_id: string; org_id?: string; name: string; tagline?: string;
  stage?: string; sector?: string; business_model?: string; description?: string;
  website?: string; country?: string; currency?: string;
  funding_ask_usd?: number; equity_offered_pct?: number; created_at: string; updated_at: string;
}
export interface StartupDocument { id: string; startup_id: string; owner_id: string; doc_type: DocType; name: string; storage_path: string; mime_type: string; size_bytes?: number; created_at: string; }
export interface PitchDeck { id: string; startup_id: string; owner_id: string; document_id?: string; page_count?: number; extraction_status: 'pending'|'processing'|'done'|'failed'; created_at: string; }
export interface ExtractedContent { id: string; deck_id: string; startup_id: string; slide_index: number; raw_text?: string; claims_json?: unknown; financial_json?: unknown; created_at?: string; }
export interface Persona {
  id: string; slug: string; name: string; role: string; thesis: string;
  priorities_json: string[]; risk_tolerance: string; questioning_strategy_json: { category: string; risk_focus: string; q: string }[];
  rejection_criteria_json: string[];
}
export interface Session {
  id: string; startup_id: string; owner_id: string; status: SessionStatus;
  current_persona_id?: string; current_question_id?: string;
  progress_json: Record<string, unknown>; started_at: string; completed_at?: string; created_at: string;
}
export interface Message { id: string; session_id: string; persona_id?: string; sender: 'founder'|'investor'|'system'; content: string; created_at: string; }
export interface Question { id: string; session_id: string; persona_id?: string; question: string; category?: string; risk_focus?: string; sequence: number; status: 'asked'|'answered'|'skipped'; created_at: string; }
export interface Answer { id: string; question_id: string; session_id: string; persona_id?: string; answer_text?: string; confidence?: string; analyzed_json?: unknown; created_at: string; }
export interface FollowUp { id: string; parent_question_id?: string; session_id: string; question: string; reason?: string; created_at: string; }
export interface EvidenceRecord { id: string; session_id?: string; startup_id?: string; claim: string; claim_id?: string; classification: EvidenceClass; supporting_text?: string; source_ids_json: string[]; confidence?: number; }
export interface ResearchSource { id: string; session_id?: string; startup_id?: string; claim_id?: string; url: string; title?: string; source_type?: string; access_outcome?: string; evidence_tier?: string; retrieved_at: string; }
export interface Verdict { id: string; session_id: string; persona_id: string; verdict: VerdictValue; rationale: string; risks_json: string[]; evidence_strengths_json: string[]; created_at?: string; }
export interface CommitteeDecision { id: string; session_id: string; decision: VerdictValue; summary: string; agreement_json: string[]; disagreement_json: string[]; biggest_risks_json: string[]; strongest_evidence_json: string[]; weakest_evidence_json: string[]; unanswered_questions_json: string[]; reconsider_conditions_json: string[]; created_at?: string; }
export interface EvaluationReport { id: string; session_id: string; startup_id: string; owner_id: string; report_json: Record<string, unknown>; report_markdown?: string; status: 'draft'|'final'; created_at: string; }
export interface UsageRecord { id: string; user_id: string; action: string; tokens_used?: number; cost_usd?: number; created_at: string; }
export interface Finding { id: string; session_id: string; persona_id?: string; category: string; finding: string; severity: 'low'|'medium'|'high'|'critical'; evidence_ids_json: string[]; created_at?: string; }
export interface PricingPlan { id: string; slug: string; name: string; price_usd_monthly?: number; price_inr_monthly?: number; features_json: string[]; }

export interface MeetingTranscript {
  messages: Message[]; questions: Question[]; answers: Answer[];
  followups: FollowUp[]; verdicts: Verdict[]; decision?: CommitteeDecision;
}
