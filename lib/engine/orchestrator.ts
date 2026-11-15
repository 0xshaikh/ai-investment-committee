// lib/engine/orchestrator.ts — Investor Meeting orchestrator (spec §5, §4.4).
// Drives the adversarial loop: one question at a time, analyze, follow-up, next risk, next persona, finalize.
import type { Repo } from '../db';
import type { Persona, Session, Startup } from '../db/types';
import { callAI } from '../ai/provider';
import { analyzeAnswer, generateFollowUp, detectContradiction, pickNextQuestion } from './questioning';
import { evaluatePersona, aggregateDecision, unanswered } from './decision';
import { classifyClaim, recordEvidence } from './evidence';
import { buildReport } from './report';

const PERSONA_ORDER = ['vc-partner', 'financial-cfo', 'technical-cto', 'industry-specialist'];

/** Hard cap on questions per persona (base + follow-ups) so the meeting always terminates. */
const MAX_QUESTIONS_PER_PERSONA = 6;

function progress(s: Session): { personaIndex: number; asked: Record<string, string[]>; followUps: number; counts: Record<string, number> } {
  const p = (s.progress_json ?? {}) as { personaIndex?: number; asked?: Record<string, string[]>; followUps?: number; counts?: Record<string, number> };
  return { personaIndex: p.personaIndex ?? 0, asked: p.asked ?? {}, followUps: p.followUps ?? 0, counts: p.counts ?? {} };
}

export async function startMeeting(repo: Repo, session: Session, personas: Persona[]): Promise<{ question: string; persona: Persona }> {
  const persona = personas.find((p) => p.slug === PERSONA_ORDER[0]) ?? personas[0];
  await repo.updateSession(session.id, { current_persona_id: persona.id, progress_json: { personaIndex: 0, asked: {}, followUps: 0 } });
  const q = persona.questioning_strategy_json[0];
  const created = await repo.addQuestion({ session_id: session.id, persona_id: persona.id, question: q.q, category: q.category, risk_focus: q.risk_focus, sequence: 1, status: 'asked' });
  await repo.updateSession(session.id, { current_question_id: created.id });
  await repo.addMessage({ session_id: session.id, persona_id: persona.id, sender: 'investor', content: q.q });
  return { question: q.q, persona };
}

/** Return the next question to ask, or null if the meeting is complete. */
export async function askNext(repo: Repo, session: Session, personas: Persona[], depth = 0): Promise<{ question: string; persona: Persona; done: boolean } | null> {
  // Always operate on the freshest persisted state (the caller's session object can be stale
  // after a persona advance — reading it again avoids an infinite advance loop).
  const fresh = (await repo.getSession(session.id)) ?? session;
  const cur = progress(fresh);
  const persona = personas.find((p) => p.slug === PERSONA_ORDER[cur.personaIndex]) ?? personas[cur.personaIndex];
  if (!persona) return null;

  // Hard safety: never recurse deeper than the number of personas.
  if (depth > PERSONA_ORDER.length) return { question: '', persona, done: true };

  const asked = cur.asked[persona.id] ?? [];
  const askedCount = cur.counts[persona.id] ?? 0;

  // Per-persona question cap reached -> advance to the next persona (or finalize).
  if (askedCount >= MAX_QUESTIONS_PER_PERSONA) {
    return await advancePersona(repo, fresh, personas, cur, persona, depth);
  }

  const next = pickNextQuestion(persona, asked);
  if (next) {
    const seq = asked.length + 1;
    const created = await repo.addQuestion({ session_id: session.id, persona_id: persona.id, question: next.q, category: next.category, risk_focus: next.risk_focus, sequence: seq, status: 'asked' });
    await repo.updateSession(session.id, { current_persona_id: persona.id, current_question_id: created.id, progress_json: { ...cur, asked: { ...cur.asked, [persona.id]: [...asked, next.category] }, counts: { ...cur.counts, [persona.id]: askedCount + 1 } } });
    await repo.addMessage({ session_id: session.id, persona_id: persona.id, sender: 'investor', content: next.q });
    return { question: next.q, persona, done: false };
  }

  // persona's base bank exhausted -> next persona, or finalize
  return await advancePersona(repo, fresh, personas, cur, persona, depth);
}

async function advancePersona(
  repo: Repo, session: Session, personas: Persona[], cur: ReturnType<typeof progress>, persona: Persona, depth: number,
): Promise<{ question: string; persona: Persona; done: boolean } | null> {
  const nextIndex = cur.personaIndex + 1;
  if (nextIndex < PERSONA_ORDER.length) {
    const np = personas.find((p) => p.slug === PERSONA_ORDER[nextIndex]) ?? personas[nextIndex];
    await repo.updateSession(session.id, { current_persona_id: np.id, progress_json: { ...cur, personaIndex: nextIndex } });
    return askNext(repo, session, personas, depth + 1);
  }
  return { question: '', persona, done: true };
}

/** Process a founder answer; returns the next action (follow-up, next question, or finalize). */
export async function answerQuestion(
  repo: Repo, session: Session, personas: Persona[], startup: Startup,
  questionId: string, answerText: string,
): Promise<{ type: 'followup' | 'next' | 'finalize'; text: string; persona: Persona; contradiction?: boolean }> {
  const questions = await repo.listQuestions(session.id);
  const q = questions.find((x) => x.id === questionId);
  const persona = q ? (personas.find((p) => p.id === q.persona_id) ?? personas[0]) : personas[0];
  const answers = await repo.listAnswers(session.id);

  const analysis = await analyzeAnswer(q?.question ?? '', answerText, persona.role);
  const contradiction = detectContradiction(answers, q?.question ?? '', answerText);

  await repo.addAnswer({ question_id: questionId, session_id: session.id, persona_id: persona.id, answer_text: answerText, confidence: analysis.evasive ? 'low' : analysis.confidence > 0.7 ? 'high' : 'medium', analyzed_json: analysis });
  await repo.updateQuestionStatus(questionId, 'answered');
  await repo.addMessage({ session_id: session.id, persona_id: persona.id, sender: 'founder', content: answerText });

  // Record evidence classification for the claim embedded in the question.
  const claim = q?.question ?? answerText;
  const assessment = classifyClaim(claim, { founderStated: true, contradicted: contradiction.contradicted });
  await recordEvidence(repo, session.id, startup.id, claim.slice(0, 160), assessment);

  // If evasive or weak -> specific follow-up (one at a time).
  if (analysis.evasive || analysis.confidence < 0.5) {
    const fu = await generateFollowUp(q?.question ?? '', answerText, persona.role, persona.thesis);
    if (fu) {
      const cur = progress(session);
      const created = await repo.addFollowUp({ parent_question_id: questionId, session_id: session.id, question: fu.question, reason: fu.reason });
      await repo.addQuestion({ session_id: session.id, persona_id: persona.id, question: fu.question, category: q?.category, risk_focus: fu.reason, sequence: (await repo.listQuestions(session.id)).length + 1, status: 'asked' });
      await repo.addMessage({ session_id: session.id, persona_id: persona.id, sender: 'investor', content: fu.question });
      await repo.updateSession(session.id, { current_question_id: created.id, progress_json: { ...cur, counts: { ...cur.counts, [persona.id]: (cur.counts[persona.id] ?? 0) + 1 } } });
      return { type: 'followup', text: fu.question, persona, contradiction: contradiction.contradicted };
    }
  }

  const nextQ = await askNext(repo, session, personas);
  if (!nextQ) return { type: 'finalize', text: '', persona, contradiction: contradiction.contradicted };
  if (nextQ.done) return { type: 'finalize', text: '', persona, contradiction: contradiction.contradicted };
  return { type: 'next', text: nextQ.question, persona, contradiction: contradiction.contradicted };
}

/** Finalize the session: per-persona verdicts -> committee decision -> report -> mark complete. */
export async function finalizeSession(repo: Repo, session: Session, personas: Persona[], startup: Startup) {
  const evidence = await repo.listEvidence(session.id);
  const questions = await repo.listQuestions(session.id);
  const answers = await repo.listAnswers(session.id);
  const findings = await repo.listFindings(session.id);
  const unansweredQ = unanswered(questions, answers);

  // per-persona verdicts (rule-based, evidence-driven)
  const verdicts: { persona: Persona; verdict: ReturnType<typeof evaluatePersona>['verdict']; rationale: string; risks: string[] }[] = [];
  for (const persona of personas) {
    const v = evaluatePersona(persona, evidence, findings, unansweredQ);
    await repo.upsertVerdict({ session_id: session.id, persona_id: persona.id, verdict: v.verdict, rationale: v.rationale, risks_json: v.risks, evidence_strengths_json: [] });
    verdicts.push({ persona, ...v });
  }

  const agg = aggregateDecision(verdicts.map((v) => ({ persona: v.persona, verdict: v.verdict })));
  const decision = await repo.saveDecision({
    session_id: session.id,
    decision: agg.decision,
    summary: agg.decision === 'NO' ? 'The committee does not pass this startup at this time.' : agg.decision === 'CONDITIONAL_YES' ? 'The committee would invest subject to resolving the conditions below.' : agg.decision === 'MORE_DILIGENCE' ? 'The committee needs more evidence before deciding.' : 'The committee would invest.',
    agreement_json: agg.agreement,
    disagreement_json: agg.disagreement,
    biggest_risks_json: findings.filter((f) => f.severity === 'high' || f.severity === 'critical').map((f) => f.finding),
    strongest_evidence_json: evidence.filter((e) => e.classification === 'externally_verified').map((e) => e.claim),
    weakest_evidence_json: evidence.filter((e) => e.classification === 'unverified' || e.classification === 'unknown').map((e) => e.claim),
    unanswered_questions_json: unansweredQ,
    reconsider_conditions_json: findings.filter((f) => f.severity === 'medium' || f.severity === 'high').map((f) => f.finding),
  });

  await repo.completeSession(session.id);

  // build + save the 16-section report
  const messages = await repo.listMessages(session.id);
  const sources = await repo.listSources(session.id);
  const verdictRows = await repo.listVerdicts(session.id);
  const followups = await repo.listFollowUps(session.id);
  const { report_json, report_markdown } = buildReport({
    startup, personas, messages, questions, answers, followups, evidence, sources,
    findings, verdicts: verdictRows, decision, mode: repo.mode, aiConfigured: true,
  });
  const report = await repo.saveReport({ session_id: session.id, startup_id: startup.id, owner_id: session.owner_id, report_json, report_markdown, status: 'final' });
  return { decision, report };
}
