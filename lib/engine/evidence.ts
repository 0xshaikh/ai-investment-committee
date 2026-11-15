// lib/engine/evidence.ts — Evidence Ledger. Deterministic classification rules (testable).
// Every material claim is classified; assumptions are never converted into facts.
import type { EvidenceClass } from '../db/types';
import type { Repo } from '../db';

export interface ClaimAssessment {
  claim: string;
  classification: EvidenceClass;
  confidence: number; // 0..1
  reason: string;
}

/**
 * Classify a claim from available evidence signals. Deterministic.
 * Rules (priority order): contradicted > externally_verified > document_supported >
 * founder_reported > modelled_assumption > unverified > unknown.
 */
export function classifyClaim(claim: string, signals: {
  hasExternalSource?: boolean;
  documentSupported?: boolean;
  founderStated?: boolean;
  contradicted?: boolean;
  explicitlyUnknown?: boolean;
  modelled?: boolean;
}): ClaimAssessment {
  if (signals.explicitlyUnknown) {
    return { claim, classification: 'unknown', confidence: 0, reason: 'Founder could not provide evidence; explicitly marked unknown.' };
  }
  if (signals.contradicted) {
    return { claim, classification: 'contradicted', confidence: 0.9, reason: 'A later statement contradicts an earlier claim on the same fact.' };
  }
  if (signals.hasExternalSource) {
    return { claim, classification: 'externally_verified', confidence: 0.85, reason: 'Verified against an external source with a retrievable URL and date.' };
  }
  if (signals.documentSupported) {
    return { claim, classification: 'document_supported', confidence: 0.6, reason: 'Supported by an uploaded document (deck/financials), not independently verified.' };
  }
  if (signals.founderStated) {
    return { claim, classification: 'founder_reported', confidence: 0.3, reason: 'Stated by the founder; no independent evidence yet. Treat as reported, not verified.' };
  }
  if (signals.modelled) {
    return { claim, classification: 'modelled_assumption', confidence: 0.15, reason: 'A modelled assumption — not a fact. Must be validated before use.' };
  }
  return { claim, classification: 'unverified', confidence: 0, reason: 'No evidence found. Do not treat as fact.' };
}

/** Build a search query for a claim (for the market intelligence engine). */
export function claimToSearchQuery(claim: string): string {
  return claim.replace(/["“”]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
}

/** Human labels for the evidence ledger UI. */
export const EVIDENCE_LABELS: Record<EvidenceClass, string> = {
  externally_verified: 'Externally verified',
  founder_reported: 'Founder-reported',
  document_supported: 'Document-supported',
  modelled_assumption: 'Modelled assumption',
  unverified: 'Unverified',
  unknown: 'Unknown',
  contradicted: 'Contradicted',
};

export const EVIDENCE_BADGE: Record<EvidenceClass, string> = {
  externally_verified: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  document_supported: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  founder_reported: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  modelled_assumption: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  unverified: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  unknown: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  contradicted: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

/** Persist an evidence record to the repo (dedupe by claim within a session). */
export async function recordEvidence(
  repo: Repo, sessionId: string, startupId: string | undefined,
  claim: string, assessment: ClaimAssessment,
): Promise<void> {
  const existing = (await repo.listEvidence(sessionId)).find((e) => e.claim === claim);
  await repo.upsertEvidence({
    id: existing?.id, session_id: sessionId, startup_id: startupId,
    claim, classification: assessment.classification,
    supporting_text: assessment.reason, source_ids_json: [], confidence: assessment.confidence,
  });
}

/** Aggregate evidence for a session into a summary by classification. */
export function summarizeEvidence(records: { classification: EvidenceClass }[]) {
  const by: Record<string, number> = { externally_verified: 0, founder_reported: 0, document_supported: 0, modelled_assumption: 0, unverified: 0, unknown: 0, contradicted: 0 };
  for (const r of records) by[r.classification] = (by[r.classification] ?? 0) + 1;
  return by;
}
