// lib/engine/report.ts — Final Report (spec §8). Assembles the 16 sections from real transcript data.
// Never invents investment amounts, valuations, revenue, customer numbers, commitments, term sheets or offers.
import type { Startup, Persona, Verdict, CommitteeDecision, EvidenceRecord, ResearchSource, Question, Answer, Message, Finding } from '../db/types';
import { EVIDENCE_LABELS, summarizeEvidence } from './evidence';
import { unanswered } from './decision';

export interface ReportInput {
  startup: Startup;
  personas: Persona[];
  messages: Message[];
  questions: Question[];
  answers: Answer[];
  followups: { id: string; parent_question_id?: string; session_id: string; question: string; reason?: string }[];
  evidence: EvidenceRecord[];
  sources: ResearchSource[];
  findings: Finding[];
  verdicts: Verdict[];
  decision: CommitteeDecision | null;
  mode: string;
  aiConfigured: boolean;
}

const VERDICT_COLOR: Record<string, string> = { YES: '#10b981', NO: '#ef4444', CONDITIONAL_YES: '#f59e0b', MORE_DILIGENCE: '#6366f1' };

function answerFor(q: Question, answers: Answer[]): Answer | undefined {
  return answers.find((a) => a.question_id === q.id);
}

export function buildReport(input: ReportInput): { report_json: Record<string, unknown>; report_markdown: string } {
  const { startup, personas, messages, questions, answers, evidence, sources, findings, verdicts, decision } = input;
  const unansweredList = unanswered(questions, answers);
  const evidenceBy = summarizeEvidence(evidence);
  const strong = evidence.filter((e) => e.classification === 'externally_verified' || e.classification === 'document_supported').map((e) => e.claim);
  const weak = evidence.filter((e) => e.classification === 'unverified' || e.classification === 'unknown' || e.classification === 'contradicted').map((e) => e.claim);
  const verifiedCount = evidenceBy.externally_verified + evidenceBy.document_supported;
  const totalEvidence = evidence.length;

  // 12. investor-by-investor verdicts
  const verdictList = verdicts.map((v) => {
    const p = personas.find((x) => x.id === v.persona_id);
    return { persona: p?.role ?? p?.name ?? v.persona_id, verdict: v.verdict, rationale: v.rationale, risks: v.risks_json };
  });

  const report_json: Record<string, unknown> = {
    disclaimer: 'This is a SIMULATED assessment produced by an AI investment committee. It is NOT a real investment offer, valuation, or prediction of actual investor decisions. Personas are fictional simulations and do not impersonate real investors. No investment amount, valuation, revenue, customer count, commitment, term sheet or funding offer is stated unless actually provided by the founder as input.',
    generated_at: new Date().toISOString(),
    mode: input.mode,
    ai_configured: input.aiConfigured,
    // 1. Executive summary
    executive_summary: {
      startup: startup.name,
      stage: startup.stage ?? 'Not stated',
      sector: startup.sector ?? 'Not stated',
      committee_decision: decision?.decision ?? 'MORE_DILIGENCE',
      decision_summary: decision?.summary ?? 'No decision generated yet.',
      verdicts: verdictList,
    },
    // 2. Startup overview
    startup_overview: {
      name: startup.name,
      tagline: startup.tagline ?? '',
      stage: startup.stage ?? 'Not stated',
      sector: startup.sector ?? 'Not stated',
      business_model: startup.business_model ?? 'Not stated',
      description: startup.description ?? '',
      website: startup.website ?? '',
      funding_ask: startup.funding_ask_usd != null ? { amount_usd: startup.funding_ask_usd, currency: startup.currency ?? 'USD' } : { note: 'Funding ask not stated. Valuation cannot be determined.' },
      equity_offered: startup.equity_offered_pct != null ? { pct: startup.equity_offered_pct } : { note: 'Equity offered not stated.' },
    },
    // 3. Business model
    business_model: {
      description: startup.business_model ?? 'Not stated by founder.',
      financial_metrics: findings.filter((f) => f.category === 'financial').map((f) => ({ finding: f.finding, severity: f.severity })),
    },
    // 4. Market assessment
    market_assessment: {
      claims: evidence.filter((e) => e.classification === 'externally_verified' || e.classification === 'unverified' || e.classification === 'unknown').map((e) => ({ claim: e.claim, classification: EVIDENCE_LABELS[e.classification] })),
      sources: sources.map((s) => ({ url: s.url, title: s.title, retrieved_at: s.retrieved_at, access_outcome: s.access_outcome, evidence_tier: s.evidence_tier })),
    },
    // 5. Competitor analysis
    competitor_analysis: {
      findings: findings.filter((f) => f.category === 'market' || f.category === 'strategy').map((f) => ({ finding: f.finding, severity: f.severity })),
      note: 'Competitor pricing and features are only stated where an external source or uploaded document supports them. Otherwise unverified.',
    },
    // 6. Customer validation
    customer_validation: {
      evidence: evidence.filter((e) => /customer|paying|renew|traction|revenue|user/i.test(e.claim)).map((e) => ({ claim: e.claim, classification: EVIDENCE_LABELS[e.classification] })),
    },
    // 7. Product and technology assessment
    product_technology: {
      findings: findings.filter((f) => f.category === 'product' || f.category === 'team').map((f) => ({ finding: f.finding, severity: f.severity })),
    },
    // 8. Financial assessment
    financial_assessment: {
      findings: findings.filter((f) => f.category === 'financial').map((f) => ({ finding: f.finding, severity: f.severity })),
      note: 'No financial figures are stated unless provided by the founder or supported by an uploaded document. Valuation cannot be determined from insufficient information.',
    },
    // 9. Founder assessment
    founder_assessment: {
      findings: findings.filter((f) => f.category === 'team' || /founder/i.test(f.finding)).map((f) => ({ finding: f.finding, severity: f.severity })),
    },
    // 10. Risk register
    risk_register: findings.map((f) => ({ risk: f.finding, severity: f.severity, category: f.category })),
    // 11. Evidence ledger
    evidence_ledger: {
      summary: evidenceBy,
      total: totalEvidence,
      verified_count: verifiedCount,
      records: evidence.map((e) => ({ claim: e.claim, classification: EVIDENCE_LABELS[e.classification], confidence: e.confidence, note: e.supporting_text })),
    },
    // 12. investor-by-investor verdicts
    investor_verdicts: verdictList,
    // 13. Committee decision
    committee_decision: decision ? {
      decision: decision.decision,
      summary: decision.summary,
      agreement: decision.agreement_json,
      disagreement: decision.disagreement_json,
      biggest_risks: decision.biggest_risks_json,
      strongest_evidence: decision.strongest_evidence_json,
      weakest_evidence: decision.weakest_evidence_json,
      unanswered: decision.unanswered_questions_json,
      reconsider_conditions: decision.reconsider_conditions_json,
    } : { decision: 'MORE_DILIGENCE', summary: 'No decision generated yet.' },
    // 14. Critical unanswered questions
    unanswered_questions: unansweredList,
    // 15. Conditions for reconsideration
    reconsideration_conditions: decision?.reconsider_conditions_json ?? [],
    // 16. Recommended next steps
    next_steps: [
      ...(verifiedCount < totalEvidence && totalEvidence > 0 ? ['Provide evidence for unverified claims (external sources or documents).'] : []),
      ...(unansweredList.length ? [`Answer the ${unansweredList.length} unanswered question(s) raised by the committee.`] : []),
      ...(strong.length ? ['Keep the verified strengths visible — they are the core of the case.'] : []),
      'Before approaching real investors, close the evidence gaps the committee identified.',
    ],
  };

  const md = renderMarkdown(report_json, verdictList, decision);
  return { report_json, report_markdown: md };
}

function renderMarkdown(r: Record<string, unknown>, verdicts: { persona: string; verdict: string; rationale: string }[], decision: { decision: string; summary: string } | null): string {
  const s = (r.executive_summary as Record<string, unknown>);
  const so = (r.startup_overview as Record<string, unknown>);
  const lead = [
    `# Investment Evaluation Report — ${(so.name as string) ?? 'Startup'}`,
    '',
    `**Committee decision:** ${(s.committee_decision as string) ?? 'MORE_DILIGENCE'}`,
    `**Generated:** ${(r.generated_at as string)?.slice(0, 10)}`,
    '',
    `> ${r.disclaimer}`,
    '',
  ];
  const sections: string[] = [];
  sections.push('## 1. Executive summary', '', `Startup: **${so.name}** (${(so.stage as string) ?? 'stage not stated'})`, '', decision ? `**Decision:** ${decision.decision} — ${decision.summary}` : 'No decision yet.', '');
  sections.push('## 2. Startup overview', '', `- Name: ${so.name}`, `- Stage: ${so.stage ?? 'Not stated'}`, `- Sector: ${so.sector ?? 'Not stated'}`, `- Business model: ${so.business_model ?? 'Not stated'}`, `- Website: ${so.website ?? 'Not stated'}`, `- Description: ${so.description ?? ''}`, '');
  sections.push('## 3. Business model', '', `- ${so.business_model ?? 'Not stated by founder.'}`, '');
  sections.push('## 4. Market assessment', '', ...((r.market_assessment as { claims: { claim: string; classification: string }[] }).claims.map((c) => `- ${c.claim} — *${c.classification}*`)), '');
  sections.push('## 5. Competitor analysis', '', ...((r.competitor_analysis as { findings: { finding: string; severity: string }[] }).findings.map((f) => `- ${f.finding} (${f.severity})`)), '');
  sections.push('## 6. Customer validation', '', ...((r.customer_validation as { evidence: { claim: string; classification: string }[] }).evidence.map((e) => `- ${e.claim} — *${e.classification}*`)), '');
  sections.push('## 7. Product and technology assessment', '', ...((r.product_technology as { findings: { finding: string; severity: string }[] }).findings.map((f) => `- ${f.finding} (${f.severity})`)), '');
  sections.push('## 8. Financial assessment', '', ...((r.financial_assessment as { findings: { finding: string; severity: string }[] }).findings.map((f) => `- ${f.finding} (${f.severity})`)), '', '> No financial figures are stated unless provided by the founder or a document. Valuation cannot be determined from insufficient information.', '');
  sections.push('## 9. Founder assessment', '', ...((r.founder_assessment as { findings: { finding: string; severity: string }[] }).findings.map((f) => `- ${f.finding} (${f.severity})`)), '');
  sections.push('## 10. Risk register', '', ...((r.risk_register as { risk: string; severity: string }[]).map((f) => `- ${f.risk} (${f.severity})`)), '');
  sections.push('## 11. Evidence ledger', '', ...((r.evidence_ledger as { records: { claim: string; classification: string }[] }).records.map((e) => `- ${e.claim} — *${e.classification}*`)), '');
  sections.push('## 12. Investor-by-investor verdicts', '', ...verdicts.map((v) => `- **${v.persona}:** ${v.verdict} — ${v.rationale}`), '');
  sections.push('## 13. Committee decision', '', `**${decision ? decision.decision : 'MORE_DILIGENCE'}** — ${decision ? decision.summary : 'No decision yet.'}`, '');
  sections.push('## 14. Critical unanswered questions', '', ...((r.unanswered_questions as string[]).map((q) => `- ${q}`)), '');
  sections.push('## 15. Conditions for reconsideration', '', ...((r.reconsideration_conditions as string[]).map((c) => `- ${c}`)), '');
  sections.push('## 16. Recommended next steps', '', ...((r.next_steps as string[]).map((n) => `- ${n}`)), '');
  sections.push('---', '', '**Simulated assessment.** Not a real investment offer, valuation, or prediction. Fictional personas.', '');
  return [...lead, ...sections].join('\n');
}
