---
name: evidence-and-provenance
description: Use to record, classify, and verify every material claim. Every claim gets a classification and confidence; assumptions are never converted into facts.
---

# Evidence & Provenance

## Purpose
Maintain the Evidence Ledger: every material claim classified by how it is supported, with source URLs, dates, and confidence — so the committee reasons on evidence, not assertion.

## Classification (mutually exclusive)
- **Externally verified** — supported by an external source with a retrievable URL and date.
- **Founder-reported** — stated by the founder; no independent evidence yet.
- **Document-supported** — supported by an uploaded document (deck/financials), not independently verified.
- **Modelled assumption** — an assumption used in a model; must be validated before use.
- **Unverified** — no evidence found; do not treat as fact.
- **Unknown** — evidence explicitly unavailable.
- **Contradicted** — a later statement conflicts with an earlier claim on the same fact.

## Decision rules
- **Never convert an assumption into a fact.**
- An inaccessible document is a **failed attempt**, not evidence.
- If the founder says 100 customers but only 12 pay, record 12 paying customers.
- Record source URL, date, supporting excerpt, and confidence for every verified claim.
- If evidence is unavailable, label the claim unknown/unverified — do not fabricate.

## Outputs
`evidence_records` (claim, classification, confidence, supporting text, source ids) and `research_sources` (url, retrieved_at, access_outcome, evidence_tier).

## Limitations
- The engine classifies evidence; it cannot conjure evidence that does not exist.
- External verification is bounded by search-provider availability.

## Evaluation criteria
- Every material claim has a classification.
- Verified claims carry retrievable, dated sources.
- Assumptions are labeled, never promoted to facts.
- No fabricated sources, statistics, competitor prices, or demand.
