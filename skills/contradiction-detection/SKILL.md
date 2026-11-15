---
name: contradiction-detection
description: Use to compare answers and claims across the meeting for conflicts. Flags when a new statement contradicts an earlier one, and surfaces it to the committee.
---

# Contradiction Detection

## Purpose
Detect when the founder's statements conflict with each other or with external evidence — a key diligence signal that the committee must surface, not ignore.

## Inputs
- Current answer and the question it answers.
- Prior answers and claims (evidence ledger).
- External evidence records (if any).

## Detection methods
1. **Numeric conflict** — different numbers on the same claimed metric across answers (e.g., 100 customers then 12 paying on the same claim).
2. **Direct contradiction** — an answer explicitly negates an earlier statement (e.g., "we have no churn" then "churn is 20%").
3. **Claim vs evidence** — a founder claim contradicted by an externally verified source.
4. **Assumption promoted to fact** — a modelled assumption later stated as fact.

## Decision rules
- A detected contradiction reclassifies the earlier claim as **contradicted**.
- Surface the contradiction to the committee and ask a clarifying follow-up.
- Never silently drop a contradiction; it is a finding.
- Distinguish a contradiction (same fact, conflicting values) from a refinement (more detail on the same fact).

## Outputs
`evidence_records` (classification `contradicted`), `diligence_findings`, and a clarifying follow-up question.

## Limitations
- Only detects contradictions between stated/recorded facts; cannot detect a lie with no conflicting record.
- Numeric detection is heuristic (same-topic token overlap).

## Evaluation criteria
- Contradictions are detected and reclassified.
- Clarifying follow-ups are issued.
- No contradiction is silently dropped.
