// lib/engine/questioning.ts — Adversarial Questioning Engine (spec §4.4).
// One difficult question at a time, wait for the answer, analyze it, detect contradictions,
// ask specific follow-ups, challenge unsupported claims, move on only when appropriate.
import type { Persona, Question, Answer } from '../db/types';
import { callAI } from '../ai/provider';

export interface AnswerAnalysis {
  confidence: number; // 0..1 that the answer is substantive and supports the claim
  evasive: boolean; // vague / avoided answering
  contradictionDetected: boolean;
  evidenceGaps: string[];
  summary: string;
}

/** Pure rule-based next-question picker (testable, no AI). */
export function pickNextQuestion(
  persona: Persona,
  askedCategories: string[],
): { category: string; risk_focus: string; q: string } | null {
  const bank = persona.questioning_strategy_json;
  // Priority: categories not yet asked, in bank order.
  for (const item of bank) {
    if (!askedCategories.includes(item.category)) return item;
  }
  // All categories asked — deepen the least-covered risk_focus once more.
  const seen: Record<string, number> = {};
  for (const c of askedCategories) seen[c] = (seen[c] ?? 0) + 1;
  let best: { category: string; risk_focus: string; q: string } | null = null;
  let bestCount = Infinity;
  for (const item of bank) {
    const n = seen[item.category] ?? 0;
    if (n < bestCount) { best = item; bestCount = n; }
  }
  return best;
}

/**
 * Analyze a founder's answer to an investor question.
 * Uses AI (structured output) with a deterministic fallback for keyword evasiveness.
 */
export async function analyzeAnswer(
  question: string, answer: string, personaName: string,
): Promise<AnswerAnalysis> {
  const prompt = `You are the ${personaName} in an investment committee meeting. The investor asked:
"${question}"

The founder answered: "${answer}"

Assess the answer. Return JSON:
{
  "confidence": <0..1 how substantively the answer addresses the question>,
  "evasive": <bool did the founder avoid/dodge or give a vague answer>,
  "contradictionDetected": <bool false unless evidence of a contradiction is in the answer>,
  "evidenceGaps": ["<what evidence is still missing>"],
  "summary": "<1-2 sentence assessment>"
}
Rules: never praise automatically; a vague or unsupported answer gets low confidence and evasive=true. Never convert an assumption into a fact.`;
  try {
    const res = await callAI(prompt, { jsonMode: true, temperature: 0.2, retries: 1, timeoutMs: 45000 });
    const j = (res.json ?? {}) as Partial<AnswerAnalysis>;
    return {
      confidence: typeof j.confidence === 'number' ? Math.max(0, Math.min(1, j.confidence)) : 0.3,
      evasive: Boolean(j.evasive),
      contradictionDetected: Boolean(j.contradictionDetected),
      evidenceGaps: Array.isArray(j.evidenceGaps) ? j.evidenceGaps.slice(0, 5) : [],
      summary: typeof j.summary === 'string' && j.summary ? j.summary : 'Answer received.',
    };
  } catch {
    // deterministic fallback — no fake AI result
    const vague = /(i don't know|not sure|can't say|maybe|perhaps|it depends|we're exploring|let me get back)/i.test(answer);
    return { confidence: vague ? 0.2 : 0.5, evasive: vague, contradictionDetected: false, evidenceGaps: vague ? ['Founder did not provide a specific, evidence-backed answer.'] : [], summary: vague ? 'Answer appears evasive; no concrete evidence given.' : 'Answer received; needs evidence verification.' };
  }
}

/** Generate a specific follow-up question based on the actual answer (challenge unsupported claims). */
export async function generateFollowUp(
  question: string, answer: string, personaName: string, personaFocus: string,
): Promise<{ question: string; reason: string } | null> {
  const prompt = `You are the ${personaName} in an investment committee. Focus: ${personaFocus}.
The investor asked: "${question}"
The founder answered: "${answer}"

If the answer is specific and fully evidence-backed, return {"followUp": null}.
Otherwise ask ONE precise follow-up that tests the biggest remaining gap in this answer, returning:
{"followUp": {"question": "<one difficult, specific question>", "reason": "<why this is the biggest unresolved risk>"}}
Rules: ask one question at a time. Never praise. Never accept vague answers. Challenge unsupported claims specifically.`;
  try {
    const res = await callAI(prompt, { jsonMode: true, temperature: 0.3, retries: 1, timeoutMs: 45000 });
    const j = res.json as { followUp?: { question?: string; reason?: string } | null } | null;
    const fu = j?.followUp;
    if (fu && typeof fu.question === 'string' && fu.question.trim()) {
      return { question: fu.question.trim(), reason: typeof fu.reason === 'string' ? fu.reason : 'Follow-up on the largest remaining risk.' };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect a contradiction between the latest answer and earlier answers on related claims.
 * Rule-based keyword overlap check (deterministic, testable).
 */
export function detectContradiction(
  prevAnswers: Answer[], currentQuestion: string, currentAnswer: string,
): { contradicted: boolean; against?: string; reason?: string } {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const cur = norm(currentAnswer);
  const curWords = new Set(cur.split(' ').filter((w) => w.length > 3));
  for (const prev of prevAnswers) {
    if (!prev.answer_text) continue;
    const prevWords = new Set(norm(prev.answer_text).split(' ').filter((w) => w.length > 3));
    // shared meaningful tokens indicating the same topic
    const shared = [...curWords].filter((w) => prevWords.has(w));
    if (shared.length >= 3) {
      // numeric conflict heuristic: different numbers on the same claimed metric
      const nums = (s: string) => (s.match(/\d[\d,.]*/g) ?? []).map((n) => n.replace(/[,.]/g, ''));
      const a = new Set(nums(currentAnswer)); const b = new Set(nums(prev.answer_text));
      const common = [...a].filter((n) => b.has(n));
      const uniqueA = [...a].filter((n) => !b.has(n));
      if (common.length === 0 && uniqueA.length > 0 && a.size > 0 && b.size > 0) {
        return { contradicted: true, against: prev.answer_text.slice(0, 120), reason: `Numbers in the latest answer (${[...a].slice(0, 3).join(', ')}) do not match an earlier answer about the same topic.` };
      }
    }
  }
  return { contradicted: false };
}
