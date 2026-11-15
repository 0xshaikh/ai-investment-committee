// lib/engine/decision.ts — Investment Decision Engine (spec §6).
// Four outcomes: YES, NO/PASS, CONDITIONAL YES, MORE DILIGENCE.
// Rule-based + evidence-driven (no arbitrary universal scoring threshold), allows personas to disagree.
import type { Persona, EvidenceRecord, VerdictValue, Question, Answer, Finding } from '../db/types';

// persona slug -> categories it owns (for verdict scoping)
const PERSONA_FOCUS: Record<string, string[]> = {
  'vc-partner': ['market', 'strategy'],
  'financial-cfo': ['financial'],
  'technical-cto': ['product', 'team'],
  'industry-specialist': ['market', 'strategy'],
};

const REJECTION_CRITICAL = /(no evidence|unwilling to pay|no defensible|regulatory blocker|cannot scale|excessive dilution|unjustifiable valuation|too small|no wedge|no durable|no credible exit|not repeatable|negative gross margin|unit economics that do not|burn exceeding|unrealistic|single point of failure|insufficient engineering|architecture that cannot|critical unresolved|commodity|no switching cost|cannot be accessed)/i;

/**
 * Evaluate one persona's verdict from evidence + findings. Deterministic (testable).
 * Returns one of the four outcomes with a rationale and its risks.
 */
export function evaluatePersona(
  persona: Persona,
  evidence: EvidenceRecord[],
  findings: Finding[],
  unansweredQuestions: string[],
): { verdict: VerdictValue; rationale: string; risks: string[] } {
  const focus = PERSONA_FOCUS[persona.slug] ?? [];
  const myFindings = findings.filter((f) => focus.length === 0 || focus.includes(f.category));
  const critical = myFindings.filter((f) => f.severity === 'critical' || f.severity === 'high');
  const medium = myFindings.filter((f) => f.severity === 'medium');

  // Hard rejection: any critical/high finding, or an explicit rejection criterion hit.
  const hitCriterion = persona.rejection_criteria_json.filter((c) => REJECTION_CRITICAL.test(c));
  if (critical.length > 0 || hitCriterion.length > 0) {
    const reasons = [...critical.map((f) => f.finding), ...hitCriterion].slice(0, 4);
    return { verdict: 'NO', rationale: `${persona.role}: critical rejection triggers met (${reasons.join('; ')}).`, risks: reasons };
  }

  // Evidence gaps in this persona's focus area -> MORE DILIGENCE (not a NO).
  const focusEvidence = evidence.filter((e) => !focus.length || true);
  const gaps = focusEvidence.filter((e) => e.classification === 'unverified' || e.classification === 'unknown');
  if (gaps.length >= 2 || unansweredQuestions.length >= 2) {
    return {
      verdict: 'MORE_DILIGENCE',
      rationale: `${persona.role}: material evidence gaps remain (${gaps.length} unverified/unknown claims, ${unansweredQuestions.length} unanswered questions). Needs more diligence before a decision.`,
      risks: [...gaps.map((g) => g.claim).slice(0, 3), ...unansweredQuestions.slice(0, 2)],
    };
  }

  // Medium findings -> conditional.
  if (medium.length > 0) {
    return {
      verdict: 'CONDITIONAL_YES',
      rationale: `${persona.role}: thesis holds with conditions. Resolve before investing: ${medium.slice(0, 3).map((f) => f.finding).join('; ')}.`,
      risks: medium.slice(0, 3).map((f) => f.finding),
    };
  }

  // Clean pass.
  return {
    verdict: 'YES',
    rationale: `${persona.role}: the evidence supports the thesis on ${persona.priorities_json.slice(0, 3).join(', ')}. No critical rejection triggers found.`,
    risks: [],
  };
}

/**
 * Aggregate individual verdicts into the committee decision. Deterministic (testable).
 * YES is never the default; disagreement between personas is preserved.
 */
export function aggregateDecision(verdicts: { persona: Persona; verdict: VerdictValue }[]): {
  decision: VerdictValue; agreement: string[]; disagreement: string[];
} {
  const counts: Record<VerdictValue, number> = { YES: 0, NO: 0, CONDITIONAL_YES: 0, MORE_DILIGENCE: 0 };
  for (const v of verdicts) counts[v.verdict]++;
  const agreement = verdicts.filter((v) => v.verdict === (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as VerdictValue)).map((v) => v.persona.role);
  const disagreement = verdicts.filter((v) => v.verdict !== (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as VerdictValue)).map((v) => `${v.persona.role} (${v.verdict})`);

  // NO if any hard NO (a committee rarely funds over a hard no from a focused member).
  if (counts.NO >= 1 && counts.NO >= counts.YES) {
    return { decision: 'NO', agreement, disagreement };
  }
  // MORE DILIGENCE if the largest bloc is more diligence or there are 2+.
  if (counts.MORE_DILIGENCE > counts.YES && counts.MORE_DILIGENCE >= 2) {
    return { decision: 'MORE_DILIGENCE', agreement, disagreement };
  }
  // CONDITIONAL YES if conditional is the largest bloc.
  if (counts.CONDITIONAL_YES >= counts.YES && counts.CONDITIONAL_YES > 0) {
    return { decision: 'CONDITIONAL_YES', agreement, disagreement };
  }
  // YES only when it is the strict majority and no hard NO.
  if (counts.YES > verdicts.length / 2 && counts.NO === 0) {
    return { decision: 'YES', agreement, disagreement };
  }
  // Fallback: not a clear YES -> MORE DILIGENCE (never default to YES).
  return { decision: 'MORE_DILIGENCE', agreement, disagreement };
}

/** Evidence-driven strengths/weaknesses for the report (from the ledger, no invented numbers). */
export function evidenceStrengthsAndWeaknesses(evidence: EvidenceRecord[]) {
  const strong = evidence.filter((e) => e.classification === 'externally_verified' || e.classification === 'document_supported').map((e) => e.claim).slice(0, 5);
  const weak = evidence.filter((e) => e.classification === 'unverified' || e.classification === 'unknown' || e.classification === 'contradicted').map((e) => e.claim).slice(0, 5);
  return { strong, weak };
}

export interface QuestionSummary { question: string; answer?: string; category?: string; status: string; }

/** Unanswered questions for the report (never silently dropped). */
export function unanswered(questions: Question[], answers: Answer[]): string[] {
  const answeredIds = new Set(answers.map((a) => a.question_id));
  return questions.filter((q) => !answeredIds.has(q.id)).map((q) => q.question);
}
