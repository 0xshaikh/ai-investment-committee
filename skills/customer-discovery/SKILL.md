---
name: customer-discovery
description: Use when validating whether customers actually want the product. Distinguishes real, paying, renewing customers from aspirational counts.
---

# Customer Discovery

## Purpose
Test whether the problem is real and urgent and whether customers will pay — not whether the founder claims they will.

## Inputs
- Founder traction claims (customer count, paying count, renewals, revenue).
- Uploaded documents / analytics (optional).

## Question patterns
- "How many are paying?" — a count of total customers is not proof of paying customers.
- "How many renewed?" — churn/renewal distinguishes real retention.
- "What is monthly recurring revenue?" — MRR is evidence; a customer list is not.
- "What do they use today instead of you?" — the do-nothing option is a real competitor.
- "Who signs the PO and how long is the sales cycle?" — buying behaviour.

## Decision rules
- If the founder says 100 customers but only 12 pay, record **12 paying customers**, not 100.
- Never convert a customer count into revenue without evidence.
- If evidence is absent, classify the claim unverified/unknown.
- A nice-to-have is not an urgent problem; test urgency.

## Outputs
`evidence_records` for each traction claim, with classification and confidence.

## Limitations
- No CRM/analytics access — traction is founder-reported or document-supported unless externally verified.
- Sales-cycle and willingness-to-pay data depend on the founder's answers.

## Evaluation criteria
- Paying count, renewals, and MRR are separated from total counts.
- Evidence gaps are explicit, not silently assumed.
- Urgency and willingness to pay are questioned, not accepted at face value.
