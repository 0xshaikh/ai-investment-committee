// lib/db/local.ts — LOCAL DEV / DEMO adapter.
// Used ONLY when Supabase env vars are absent. File-backed JSON store for a runnable,
// testable product. NOT a substitute for Supabase in production. Clearly labeled.
// Auth here uses hashed passwords + a session token (dev only, not production security).
import { createHash, randomUUID } from 'crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Repo } from './repo';
import type {
  Profile, Startup, StartupDocument, PitchDeck, ExtractedContent, Persona, Session,
  Message, Question, Answer, FollowUp, EvidenceRecord, ResearchSource, Verdict,
  CommitteeDecision, EvaluationReport, UsageRecord, PricingPlan, Finding,
} from './types';
import { SEED_PERSONAS, SEED_PLANS } from './seed-data';

const DATA_DIR = join(process.cwd(), '.localdata');
const DB_FILE = join(DATA_DIR, 'db.json');

// On read-only / serverless filesystems (e.g. Vercel) the file-backed store can't persist,
// so fall back to an in-memory store. The demo still runs end-to-end; data resets on cold start.
let memDB: DB | null = null;
let fileWritable: boolean | null = null;

function canWriteFile(): boolean {
  if (fileWritable !== null) return fileWritable;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(join(DATA_DIR, '.probe'), 'ok');
    fileWritable = true;
  } catch {
    fileWritable = false;
  }
  return fileWritable;
}

interface LocalUser { id: string; email: string; full_name?: string; role: 'founder'|'admin'; salt: string; password_hash: string; }
interface DB {
  users: LocalUser[]; tokens: Record<string, string>; profiles: Profile[];
  startups: Startup[]; documents: StartupDocument[]; decks: PitchDeck[]; extracted: ExtractedContent[];
  sessions: Session[]; messages: Message[]; questions: Question[]; answers: Answer[];
  followups: FollowUp[]; evidence: EvidenceRecord[]; sources: ResearchSource[];
  verdicts: Verdict[]; decisions: CommitteeDecision[]; reports: EvaluationReport[];
  usage: UsageRecord[]; findings: Finding[];
}

let activeToken: string | null = null;

function emptyDB(): DB {
  return { users: [], tokens: {}, profiles: [], startups: [], documents: [], decks: [], extracted: [], sessions: [], messages: [], questions: [], answers: [], followups: [], evidence: [], sources: [], verdicts: [], decisions: [], reports: [], usage: [], findings: [] };
}

function load(): DB {
  if (memDB) return memDB;
  if (!canWriteFile()) return emptyDB();
  if (!existsSync(DB_FILE)) return emptyDB();
  try { return JSON.parse(readFileSync(DB_FILE, 'utf8')); } catch { return emptyDB(); }
}
function save(db: DB) {
  if (!canWriteFile()) { memDB = db; return; }
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch {
    memDB = db;
  }
}
function hash(pw: string, salt: string) { return createHash('sha256').update(salt + pw).digest('hex'); }
const now = () => new Date().toISOString();
const uid = () => randomUUID();

function persona(id: string) { return SEED_PERSONAS.find((p) => p.id === id); }
function toProfile(u: LocalUser): Profile { return { id: u.id, email: u.email, full_name: u.full_name, role: u.role }; }

export const localRepo: Repo = {
  mode: 'local',
  setToken(t: string | null) { activeToken = t; },

  async signUp(email, password, fullName) {
    const db = load();
    if (db.users.some((u) => u.email === email)) return { user: null, error: 'Email already registered' };
    const salt = uid();
    const u: LocalUser = { id: uid(), email, full_name: fullName, role: 'founder', salt, password_hash: hash(password, salt) };
    db.users.push(u);
    db.profiles.push({ id: u.id, email, full_name: fullName, role: 'founder' });
    const token = uid();
    db.tokens[token] = u.id;
    save(db);
    activeToken = token;
    return { user: toProfile(u), token };
  },
  async signIn(email, password) {
    const db = load();
    const u = db.users.find((x) => x.email === email);
    if (!u) return { user: null, error: 'Invalid email or password' };
    if (u.password_hash !== hash(password, u.salt)) return { user: null, error: 'Invalid email or password' };
    const token = uid();
    db.tokens[token] = u.id;
    save(db);
    activeToken = token;
    return { user: toProfile(u), token };
  },
  async signOut() {
    const db = load();
    if (activeToken) delete db.tokens[activeToken];
    save(db);
    activeToken = null;
  },
  async getSessionUser() {
    if (!activeToken) return null;
    const db = load();
    const userId = db.tokens[activeToken];
    if (!userId) return null;
    const u = db.users.find((x) => x.id === userId);
    return u ? toProfile(u) : null;
  },

  async listPersonas() { return SEED_PERSONAS; },
  async listPlans() { return SEED_PLANS; },

  async createStartup(data) {
    const db = load();
    const s: Startup = { ...data, id: uid(), created_at: now(), updated_at: now() };
    db.startups.push(s); save(db); return s;
  },
  async listStartups(ownerId) { return load().startups.filter((s) => s.owner_id === ownerId).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
  async getStartup(id) { return load().startups.find((s) => s.id === id) ?? null; },
  async updateStartup(id, data) {
    const db = load(); const s = db.startups.find((x) => x.id === id);
    if (!s) return null; Object.assign(s, data, { updated_at: now() }); save(db); return s;
  },

  async saveDocument(doc) { const db = load(); const d: StartupDocument = { ...doc, id: uid(), created_at: now() }; db.documents.push(d); save(db); return d; },
  async listDocuments(startupId) { return load().documents.filter((d) => d.startup_id === startupId); },
  async getDocument(id) { return load().documents.find((d) => d.id === id) ?? null; },
  async deleteDocument(id) { const db = load(); db.documents = db.documents.filter((d) => d.id !== id); save(db); },

  async createDeck(deck) { const db = load(); const d: PitchDeck = { ...deck, id: uid(), created_at: now() }; db.decks.push(d); save(db); return d; },
  async updateDeckStatus(id, status, pageCount) {
    const db = load(); const d = db.decks.find((x) => x.id === id);
    if (d) { d.extraction_status = status; if (pageCount != null) d.page_count = pageCount; save(db); }
  },
  async saveExtractedContent(c) { const db = load(); db.extracted.push({ ...c, id: uid(), created_at: now() }); save(db); },
  async listExtractedContent(deckId) { return load().extracted.filter((e) => e.deck_id === deckId); },

  async createSession(s) { const db = load(); const x: Session = { ...s, id: uid(), started_at: now(), created_at: now() }; db.sessions.push(x); save(db); return x; },
  async getSession(id) { return load().sessions.find((s) => s.id === id) ?? null; },
  async listSessions(ownerId) { return load().sessions.filter((s) => s.owner_id === ownerId).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
  async listSessionsByStartup(startupId) { return load().sessions.filter((s) => s.startup_id === startupId).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
  async updateSession(id, data) { const db = load(); const s = db.sessions.find((x) => x.id === id); if (s) { Object.assign(s, data); save(db); } },
  async completeSession(id) { const db = load(); const s = db.sessions.find((x) => x.id === id); if (s) { s.status = 'completed'; s.completed_at = now(); save(db); } },

  async addMessage(m) { const db = load(); const x: Message = { ...m, id: uid(), created_at: now() }; db.messages.push(x); save(db); return x; },
  async listMessages(sessionId) { return load().messages.filter((m) => m.session_id === sessionId).sort((a, b) => a.created_at.localeCompare(b.created_at)); },
  async addQuestion(q) { const db = load(); const x: Question = { ...q, id: uid(), created_at: now() }; db.questions.push(x); save(db); return x; },
  async listQuestions(sessionId) { return load().questions.filter((q) => q.session_id === sessionId).sort((a, b) => a.sequence - b.sequence); },
  async updateQuestionStatus(id, status) { const db = load(); const q = db.questions.find((x) => x.id === id); if (q) { q.status = status; save(db); } },
  async addAnswer(a) { const db = load(); const x: Answer = { ...a, id: uid(), created_at: now() }; db.answers.push(x); save(db); return x; },
  async listAnswers(sessionId) { return load().answers.filter((a) => a.session_id === sessionId).sort((a, b) => a.created_at.localeCompare(b.created_at)); },
  async addFollowUp(f) { const db = load(); const x: FollowUp = { ...f, id: uid(), created_at: now() }; db.followups.push(x); save(db); return x; },
  async listFollowUps(sessionId) { return load().followups.filter((f) => f.session_id === sessionId); },
  async addFinding(f) { const db = load(); const x: Finding = { ...f, id: uid(), created_at: now() }; db.findings.push(x); save(db); return x; },
  async listFindings(sessionId) { return load().findings.filter((f) => f.session_id === sessionId); },

  async upsertEvidence(e) {
    const db = load();
    if (e.id) { const i = db.evidence.findIndex((x) => x.id === e.id); if (i >= 0) { db.evidence[i] = { ...db.evidence[i], ...e, id: e.id }; save(db); return db.evidence[i]; } }
    const x: EvidenceRecord = { ...e, id: uid() }; db.evidence.push(x); save(db); return x;
  },
  async listEvidence(sessionId) { return load().evidence.filter((e) => e.session_id === sessionId); },
  async addSource(s) { const db = load(); const x: ResearchSource = { ...s, id: uid(), retrieved_at: now() }; db.sources.push(x); save(db); return x; },
  async listSources(sessionId) { return load().sources.filter((s) => s.session_id === sessionId); },

  async upsertVerdict(v) {
    const db = load();
    const existing = db.verdicts.find((x) => x.session_id === v.session_id && x.persona_id === v.persona_id);
    if (existing) { Object.assign(existing, v); save(db); return existing; }
    const x: Verdict = { ...v, id: uid(), created_at: now() }; db.verdicts.push(x); save(db); return x;
  },
  async listVerdicts(sessionId) { return load().verdicts.filter((v) => v.session_id === sessionId); },
  async saveDecision(d) {
    const db = load();
    const existing = db.decisions.find((x) => x.session_id === d.session_id);
    if (existing) { Object.assign(existing, d); save(db); return existing; }
    const x: CommitteeDecision = { ...d, id: uid(), created_at: now() }; db.decisions.push(x); save(db); return x;
  },
  async getDecision(sessionId) { return load().decisions.find((d) => d.session_id === sessionId) ?? null; },
  async saveReport(r) {
    const db = load();
    const existing = db.reports.find((x) => x.session_id === r.session_id);
    if (existing) { Object.assign(existing, r); save(db); return existing; }
    const x: EvaluationReport = { ...r, id: uid(), created_at: now() }; db.reports.push(x); save(db); return x;
  },
  async getReport(sessionId) { return load().reports.find((r) => r.session_id === sessionId) ?? null; },
  async listReports(ownerId) { return load().reports.filter((r) => r.owner_id === ownerId).sort((a, b) => b.created_at.localeCompare(a.created_at)); },

  async recordUsage(u) { const db = load(); db.usage.push({ ...u, id: uid(), created_at: now() }); save(db); },
  async listUsage(ownerId) { return load().usage.filter((u) => u.user_id === ownerId).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
  async logAudit(_action, _entityType, _entityId, _metadata) { /* dev no-op; audit is best-effort */ },
};
