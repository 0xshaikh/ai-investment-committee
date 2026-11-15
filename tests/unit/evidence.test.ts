import { describe, it, expect } from 'vitest';
import { classifyClaim, claimToSearchQuery, summarizeEvidence } from '@/lib/engine/evidence';

describe('classifyClaim (evidence ledger)', () => {
  it('classifies an explicitly unknown claim as unknown', () => {
    const r = classifyClaim('MRR', { explicitlyUnknown: true });
    expect(r.classification).toBe('unknown');
    expect(r.confidence).toBe(0);
  });

  it('gives contradicted priority over external source', () => {
    const r = classifyClaim('We have 100 customers', { contradicted: true, hasExternalSource: true, founderStated: true });
    expect(r.classification).toBe('contradicted');
    expect(r.confidence).toBeGreaterThan(0.8);
  });

  it('classifies externally verified with high confidence', () => {
    const r = classifyClaim('TAM $50B', { hasExternalSource: true });
    expect(r.classification).toBe('externally_verified');
    expect(r.confidence).toBe(0.85);
  });

  it('classifies document-supported below external', () => {
    const r = classifyClaim('Margins 60%', { documentSupported: true, founderStated: true });
    expect(r.classification).toBe('document_supported');
    expect(r.confidence).toBe(0.6);
  });

  it('classifies founder-reported low confidence, never as fact', () => {
    const r = classifyClaim('12 paying customers', { founderStated: true });
    expect(r.classification).toBe('founder_reported');
    expect(r.confidence).toBeLessThan(0.4);
  });

  it('classifies modelled assumption as assumption not fact', () => {
    const r = classifyClaim('Projected ARR', { modelled: true });
    expect(r.classification).toBe('modelled_assumption');
    expect(r.confidence).toBeLessThan(0.2);
  });

  it('defaults to unverified when no evidence', () => {
    const r = classifyClaim('Some claim', {});
    expect(r.classification).toBe('unverified');
    expect(r.confidence).toBe(0);
  });

  it('never converts an assumption into a fact', () => {
    // If only modelled, it must not come back as verified/reported.
    const r = classifyClaim('Market share', { modelled: true });
    expect(['externally_verified', 'document_supported', 'founder_reported']).not.toContain(r.classification);
  });
});

describe('claimToSearchQuery', () => {
  it('strips quotes and collapses whitespace', () => {
    expect(claimToSearchQuery('  "We  have 100   customers"  ')).toBe('We have 100 customers');
  });
  it('caps length at 120', () => {
    const q = claimToSearchQuery('a'.repeat(300));
    expect(q.length).toBe(120);
  });
});

describe('summarizeEvidence', () => {
  it('counts by classification', () => {
    const s = summarizeEvidence([
      { classification: 'externally_verified' },
      { classification: 'founder_reported' },
      { classification: 'founder_reported' },
      { classification: 'contradicted' },
    ]);
    expect(s.externally_verified).toBe(1);
    expect(s.founder_reported).toBe(2);
    expect(s.contradicted).toBe(1);
  });
});
