import { describe, it, expect } from 'vitest';
import { evaluatePersona, aggregateDecision } from '@/lib/engine/decision';
import type { Persona, EvidenceRecord, Finding, VerdictValue } from '@/lib/db/types';

const persona = (slug: string, role: string, rejection: string[] = []): Persona => ({
  id: slug, slug, name: role, role, thesis: 'test', priorities_json: ['a'], risk_tolerance: 'medium',
  questioning_strategy_json: [], rejection_criteria_json: rejection,
});

const finding = (category: string, severity: Finding['severity'], text: string): Finding => ({
  id: 'f1', session_id: 's1', persona_id: undefined, category, finding: text, severity, evidence_ids_json: [],
});

const ev = (classification: EvidenceRecord['classification']): EvidenceRecord => ({
  id: 'e1', session_id: 's1', startup_id: undefined, claim: 'x', classification, supporting_text: '', source_ids_json: [], confidence: 0.5,
});

describe('evaluatePersona', () => {
  it('hard NO on a critical finding in the persona focus', () => {
    const p = persona('vc-partner', 'VC Partner');
    const r = evaluatePersona(p, [ev('externally_verified')], [finding('market', 'critical', 'No defensible moat')], []);
    expect(r.verdict).toBe('NO');
    expect(r.risks.length).toBeGreaterThan(0);
  });

  it('hard NO when a rejection criterion matches', () => {
    const p = persona('financial-cfo', 'CFO', ['unjustifiable valuation']);
    const r = evaluatePersona(p, [ev('document_supported')], [], []);
    expect(r.verdict).toBe('NO');
  });

  it('MORE_DILIGENCE on evidence gaps, never a NO and never a YES', () => {
    const p = persona('technical-cto', 'CTO');
    const r = evaluatePersona(p, [ev('unverified'), ev('unknown')], [], []);
    expect(r.verdict).toBe('MORE_DILIGENCE');
  });

  it('CONDITIONAL_YES on medium findings', () => {
    const p = persona('industry-specialist', 'Industry Specialist');
    const r = evaluatePersona(p, [ev('document_supported')], [finding('market', 'medium', 'Switching costs unclear')], []);
    expect(r.verdict).toBe('CONDITIONAL_YES');
  });

  it('YES only with clean evidence, no gaps, no findings', () => {
    const p = persona('vc-partner', 'VC Partner');
    const r = evaluatePersona(p, [ev('externally_verified'), ev('document_supported')], [], []);
    expect(r.verdict).toBe('YES');
  });
});

describe('aggregateDecision', () => {
  const v = (role: string, verdict: VerdictValue) => ({ persona: persona(role.toLowerCase().replace(/\s/g, '-'), role), verdict });

  it('never defaults to YES when votes are mixed', () => {
    const r = aggregateDecision([v('VC', 'CONDITIONAL_YES'), v('CFO', 'PASS' as VerdictValue), v('CTO', 'MORE_DILIGENCE')]);
    expect(r.decision).not.toBe('YES');
  });

  it('a single hard NO among a majority-positive committee never yields YES (mixed signals)', () => {
    const r = aggregateDecision([v('VC', 'YES'), v('CFO', 'NO'), v('CTO', 'CONDITIONAL_YES'), v('Specialist', 'YES')]);
    // No clear majority (NO=1, YES=2, COND=1) -> not a YES; disagreement preserved.
    expect(r.decision).not.toBe('YES');
    expect(r.disagreement.length).toBeGreaterThan(0);
  });

  it('two or more NO forces NO', () => {
    const r = aggregateDecision([v('VC', 'NO'), v('CFO', 'NO'), v('CTO', 'CONDITIONAL_YES'), v('Specialist', 'YES')]);
    expect(r.decision).toBe('NO');
  });

  it('preserves disagreement between personas', () => {
    const r = aggregateDecision([v('VC', 'CONDITIONAL_YES'), v('CFO', 'NO'), v('CTO', 'MORE_DILIGENCE'), v('Specialist', 'CONDITIONAL_YES')]);
    expect(r.agreement.length).toBeGreaterThan(0);
    expect(r.disagreement.length).toBeGreaterThan(0);
  });

  it('returns CONDITIONAL_YES when conditional is the largest bloc', () => {
    const r = aggregateDecision([v('VC', 'CONDITIONAL_YES'), v('Specialist', 'CONDITIONAL_YES'), v('CTO', 'YES'), v('CFO', 'MORE_DILIGENCE')]);
    expect(r.decision).toBe('CONDITIONAL_YES');
  });

  it('returns MORE_DILIGENCE when two+ members want more diligence and no YES majority', () => {
    const r = aggregateDecision([v('VC', 'MORE_DILIGENCE'), v('CFO', 'MORE_DILIGENCE'), v('CTO', 'YES'), v('Specialist', 'YES')]);
    // YES = 2, MD = 2, no strict majority -> not YES, and MD bloc >= 2
    expect(r.decision).toBe('MORE_DILIGENCE');
  });

  it('YES only on strict majority with no hard NO', () => {
    const r = aggregateDecision([v('VC', 'YES'), v('CFO', 'YES'), v('CTO', 'YES'), v('Specialist', 'CONDITIONAL_YES')]);
    expect(r.decision).toBe('YES');
  });
});
