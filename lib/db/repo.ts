// lib/db/repo.ts — repository interface. Implemented by supabase.ts (production) and local.ts (dev/demo).
import type {
  Profile, Startup, StartupDocument, PitchDeck, ExtractedContent, Persona, Session,
  Message, Question, Answer, FollowUp, EvidenceRecord, ResearchSource, Verdict,
  CommitteeDecision, EvaluationReport, UsageRecord, PricingPlan, EvidenceClass, DocType, Finding,
} from './types';

export interface Repo {
  mode: 'supabase' | 'local';
  /** Local adapter only: set the active dev session token (Supabase uses cookies directly). */
  setToken?(token: string | null): void;
  // auth (Supabase Auth in prod; local session in dev)
  signUp(email: string, password: string, fullName?: string): Promise<{ user: Profile | null; error?: string; token?: string }>;
  signIn(email: string, password: string): Promise<{ user: Profile | null; error?: string; token?: string }>;
  signOut(): Promise<void>;
  getSessionUser(): Promise<Profile | null>;

  // personas & plans
  listPersonas(): Promise<Persona[]>;
  listPlans(): Promise<PricingPlan[]>;

  // startups
  createStartup(data: Omit<Startup, 'id' | 'created_at' | 'updated_at'>): Promise<Startup>;
  listStartups(ownerId: string): Promise<Startup[]>;
  getStartup(id: string): Promise<Startup | null>;
  updateStartup(id: string, data: Partial<Startup>): Promise<Startup | null>;

  // documents
  saveDocument(doc: Omit<StartupDocument, 'id' | 'created_at'>): Promise<StartupDocument>;
  listDocuments(startupId: string): Promise<StartupDocument[]>;
  getDocument(id: string): Promise<StartupDocument | null>;
  deleteDocument(id: string): Promise<void>;

  // decks & extraction
  createDeck(deck: Omit<PitchDeck, 'id' | 'created_at'>): Promise<PitchDeck>;
  updateDeckStatus(id: string, status: PitchDeck['extraction_status'], pageCount?: number): Promise<void>;
  saveExtractedContent(c: Omit<ExtractedContent, 'id' | 'created_at'>): Promise<void>;
  listExtractedContent(deckId: string): Promise<ExtractedContent[]>;

  // sessions
  createSession(s: Omit<Session, 'id' | 'created_at' | 'started_at'>): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  listSessions(ownerId: string): Promise<Session[]>;
  listSessionsByStartup(startupId: string): Promise<Session[]>;
  updateSession(id: string, data: Partial<Session>): Promise<void>;
  completeSession(id: string): Promise<void>;

  // meeting transcript
  addMessage(m: Omit<Message, 'id' | 'created_at'>): Promise<Message>;
  listMessages(sessionId: string): Promise<Message[]>;
  addQuestion(q: Omit<Question, 'id' | 'created_at'>): Promise<Question>;
  listQuestions(sessionId: string): Promise<Question[]>;
  updateQuestionStatus(id: string, status: Question['status']): Promise<void>;
  addAnswer(a: Omit<Answer, 'id' | 'created_at'>): Promise<Answer>;
  listAnswers(sessionId: string): Promise<Answer[]>;
  addFollowUp(f: Omit<FollowUp, 'id' | 'created_at'>): Promise<FollowUp>;
  listFollowUps(sessionId: string): Promise<FollowUp[]>;
  addFinding(f: Omit<Finding, 'id' | 'created_at'>): Promise<Finding>;
  listFindings(sessionId: string): Promise<Finding[]>;

  // evidence & research
  upsertEvidence(e: Omit<EvidenceRecord, 'id'> & { id?: string }): Promise<EvidenceRecord>;
  listEvidence(sessionId: string): Promise<EvidenceRecord[]>;
  addSource(s: Omit<ResearchSource, 'id' | 'retrieved_at'>): Promise<ResearchSource>;
  listSources(sessionId: string): Promise<ResearchSource[]>;

  // verdicts / decision / report
  upsertVerdict(v: Omit<Verdict, 'id' | 'created_at'> & { id?: string }): Promise<Verdict>;
  listVerdicts(sessionId: string): Promise<Verdict[]>;
  saveDecision(d: Omit<CommitteeDecision, 'id' | 'created_at'>): Promise<CommitteeDecision>;
  getDecision(sessionId: string): Promise<CommitteeDecision | null>;
  saveReport(r: Omit<EvaluationReport, 'id' | 'created_at'>): Promise<EvaluationReport>;
  getReport(sessionId: string): Promise<EvaluationReport | null>;
  listReports(ownerId: string): Promise<EvaluationReport[]>;

  // usage & audit
  recordUsage(u: Omit<UsageRecord, 'id' | 'created_at'>): Promise<void>;
  listUsage(ownerId: string): Promise<UsageRecord[]>;
  logAudit(action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>): Promise<void>;
}

export type { EvidenceClass, DocType };
