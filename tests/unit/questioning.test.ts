import { describe, it, expect } from 'vitest';
import { pickNextQuestion, detectContradiction, analyzeAnswer } from '@/lib/engine/questioning';
import type { Persona, Answer } from '@/lib/db/types';

const persona: Persona = {
  id: 'vc', slug: 'vc-partner', name: 'VC Partner', role: 'VC Partner', thesis: 't', priorities_json: [],
  risk_tolerance: 'high',
  questioning_strategy_json: [
    { category: 'market', risk_focus: 'TAM', q: 'How did you calculate your obtainable market?' },
    { category: 'strategy', risk_focus: 'moat', q: 'What is your defensible advantage?' },
    { category: 'traction', risk_focus: 'growth', q: 'What is your monthly growth rate?' },
  ],
  rejection_criteria_json: [],
};

describe('pickNextQuestion', () => {
  it('returns the first unasked category in bank order', () => {
    const q = pickNextQuestion(persona, []);
    expect(q?.category).toBe('market');
  });

  it('skips already-asked categories', () => {
    const q = pickNextQuestion(persona, ['market']);
    expect(q?.category).toBe('strategy');
  });

  it('deepens the least-covered category when all have been asked', () => {
    const q = pickNextQuestion(persona, ['market', 'strategy', 'traction']);
    expect(q).not.toBeNull();
  });

  it('returns null for an empty question bank', () => {
    const p = { ...persona, questioning_strategy_json: [] };
    expect(pickNextQuestion(p, [])).toBeNull();
  });
});

describe('detectContradiction', () => {
  const prev = (text: string): Answer => ({ id: 'a1', question_id: 'q1', session_id: 's1', answer_text: text, created_at: '' });

  it('detects numeric conflict on the same metric', () => {
    const r = detectContradiction([prev('We have 100 paying customers')], 'How many paying customers?', 'We have 12 paying customers');
    expect(r.contradicted).toBe(true);
    expect(r.reason).toBeTruthy();
  });

  it('does not flag when numbers agree', () => {
    const r = detectContradiction([prev('We have 100 paying customers')], 'How many?', 'We have 100 paying customers');
    expect(r.contradicted).toBe(false);
  });

  it('does not flag unrelated answers', () => {
    const r = detectContradiction([prev('Our margin is 60 percent')], 'How many customers?', 'We have 40 customers');
    expect(r.contradicted).toBe(false);
  });
});

describe('analyzeAnswer deterministic fallback', () => {
  it('flags vague answers as evasive with low confidence (no AI)', async () => {
    const r = await analyzeAnswer('What is your MRR?', 'I am not sure, maybe we are exploring', 'CFO');
    expect(r.evasive).toBe(true);
    expect(r.confidence).toBeLessThan(0.4);
    expect(r.evidenceGaps.length).toBeGreaterThan(0);
  });

  it('treats a specific answer as non-evasive', async () => {
    const r = await analyzeAnswer('What is your MRR?', 'We have 12 paying customers and MRR of $4,200', 'CFO');
    expect(r.evasive).toBe(false);
  });
});
