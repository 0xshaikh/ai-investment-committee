# VCroom — Repository Audit

**Product:** AI Investment Committee (brand: **VCroom.app**)
**Audit date:** 2026-11-15
**Purpose:** Evidence-based review of 13 candidate GitHub repositories before reuse. Each entry states what the repository actually does, what is useful to this product, what may legally be reused, what must be studied only, the license and attribution obligations, known limitations, and the concrete integration decision.

> **Rule applied throughout:** no code, dataset, or reference material is copied without respecting its license. No proprietary investor identities, private transcripts, or copyrighted datasets are reused. No integration is claimed as "successful" unless it is actually wired and verified. Where a license is absent, the repository is treated as **study-only** — its ideas may inform our design, but its code is not copied.

---

## Summary of decisions

| # | Repository | License | Decision |
|---|---|---|---|
| 1 | questflowai/investorskills | MIT | **Reuse** skill format + persona patterns (attribution) |
| 2 | kothari-nikunj/nock | MIT | **Reuse** question-bank + principles (attribution) |
| 3 | riddhi2106/VentureValuator | **none** | **Study only** — no code copy |
| 4 | jayvar03/Verdict | **none** | **Study only** — no code copy |
| 5 | samalyarov/startup-due-diligence | Unlicense | **Reuse** role decomposition + report structure |
| 6 | affaan-m/everything-claude-code (ECC) | MIT | **Reuse** methodology (skills already installed locally) |
| 7 | anthropics/financial-services | Apache-2.0 | **Reuse** agent/prompt templates (attribution + NOTICE) |
| 8 | lu90/industry-research-skill | Apache-2.0 | **Reuse** Evidence Ledger + claim routing (attribution + NOTICE) |
| 9 | tronghieu/agent-skills | MIT | **Reuse** skill authoring conventions (attribution) |
| 10 | j4flmao/agent-skills | MIT | **Reuse** skill conventions (attribution) |
| 11 | binaryshrey/DemoDay-AI | Apache-2.0 | **Reuse** architecture reference (attribution); avoid paid voice/avatars |
| 12 | yugbagrodia/PitchWise-Startup-Pitch-Simulator | **none** | **Study only** — do NOT use ML dataset or models |
| 13 | danverbraganza/jujutsu-skill | MIT | **Not adopted** — git is sufficient; no unnecessary technology |

---

## 1. questflowai/investorskills

- **URL:** https://github.com/questflowai/investorskills
- **What it does:** An open-source library that turns durable investing judgment into portable, structured `SKILL.md` skill packages for AI finance agents. Contains a skill template, an investment schema spec, reading/podcast/YouTube lists, and example skills distilling how great investors think, filter opportunities, size risk, and act under uncertainty.
- **What is useful:** The **skill package format** (`templates/skill.template.md`), the **schema** (`docs/spec.md`), and the pattern of expressing an investor's *thesis → priorities → risk rules → invalidation criteria* as structured text. This maps directly onto our requirement for four distinct fictional investor personas, each with its own thesis, priorities, risk tolerance, questioning strategy, and rejection criteria.
- **What can be reused:** The `SKILL.md` authoring pattern and the persona/mental-model structuring idea. MIT permits reuse with attribution.
- **What should only be studied:** The specific investor content is oriented to public-market trading judgment, not early-stage venture diligence. Its examples should be studied for structure, not transcribed as our personas.
- **License and attribution:** MIT. Copyright notice + MIT license text retained if any file is copied. We will **adapt the format, not copy files verbatim** — attribution in `docs/INVESTOR_SKILLS.md` and repo `THIRD_PARTY_NOTICES.md`.
- **Known limitations:** Built for a markets/harness context (Questflow); no venture-stage diligence logic; content is opinion distilled from specific investors (not universally applicable).
- **Integration decision:** **ADAPT** — borrow the skill-file format and persona-structuring approach to author our 12 skill files and 4 personas. No file-for-file copy; attribution required.

## 2. kothari-nikunj/nock

- **URL:** https://github.com/kothari-nikunj/nock
- **What it does:** Two Claude skills. `nock/` reads a founder's pitch deck and returns (1) the questions a seed/Series-A investor would ask mapped to slides, (2) what the deck answers well, (3) gaps and red-flag patterns, (4) an insight-count check (tech/market/GTM), (5) the weakest 3 claims with follow-ups used to test whether a "secret" is earned or faked, and (6) a "dinner test". `build-your-nock/` is a playbook for investors to build their own version. Also ships a `raise-playbook.md` for raise-mechanics sanity checks (ask size, price/dilution, no lead under 10%, competitor-round comps).
- **What is useful:** This is the closest match to our **Adversarial Questioning Engine** (§4.4). The `lens/question-bank.md`, `lens/principles.md`, and `lens/raise-playbook.md` files are the seed material for our question-selection and follow-up logic. The red-flag patterns (boil-the-ocean with no wedge, "category of one", secret that is category boilerplate, vision with no concrete next step) are directly relevant to our challenge logic.
- **What can be reused:** MIT permits reuse with attribution. The question-bank and principles are the highest-value reusable content in the whole audit.
- **What should only be studied:** The single-investor voice (one specific investor's style). Our product needs **four** distinct personas, so the structure is reusable but the single voice must be decomposed and re-authored per persona.
- **License and attribution:** MIT. Attribution + license text if copied.
- **Known limitations:** Claude-Code-specific skill format; single-investor perspective; deck-first (requires PDF), not live-interview oriented; no evidence verification layer.
- **Integration decision:** **ADAPT** — use `question-bank.md` + `principles.md` as the seed question corpus, re-voiced into our 4 personas and wired into the adversarial engine. Attribution required.

## 3. riddhi2106/VentureValuator

- **URL:** https://github.com/riddhi2106/VentureValuator
- **What it does:** Streamlit + Python multi-agent pipeline. Upload a pitch deck PDF → PDF extraction → web-grounded market research (DuckDuckGo/Tavily + Yahoo-Finance comps via local MCP) → 24-month financial model (base/conservative/optimistic, gross margin, CAC, LTV, breakeven) → sceptical VC agent → investor memo with weighted 6-dimension rubric score and verdict (Invest/Pass/Neutral/Avoid) → auto-generated `.pptx`.
- **What is useful:** The **pipeline decomposition** (extract → research → model → challenge → memo), the **weighted rubric scoring** idea, and the **PDF extraction + slide analysis** workflow. These are excellent design references for our §7 Pitch Deck Intelligence and §6 Decision Engine.
- **What can be reused:** **Nothing as code — no license.** The architecture patterns may inform our design.
- **What should only be studied:** All of it. The rubric dimensions, agent roles, and scoring weights are ideas, not licenseable artifacts.
- **License and attribution:** **NO LICENSE.** Default copyright — copying code is not permitted. Ideas (architecture, rubric concept) are not copyrightable and may be independently re-implemented.
- **Known limitations:** Streamlit (not our stack); no auth/multi-tenancy; runs locally; Tavily is a paid API dependency.
- **Integration decision:** **STUDY ONLY** — no code copied. We design our own rubric and pipeline, informed by the concept.

## 4. jayvar03/Verdict

- **URL:** https://github.com/jayvar03/Verdict
- **What it does:** React/Vite/Tailwind client + Node/Express/Postgres server. Four parallel agents (Market, Competition, Monetization, Risk) grounded in live web search (Tavily) to reduce hallucination, then a synthesis agent returns GO / CONDITIONAL GO / NO-GO with a score. JWT auth, PDF export, public share links, idea-vs-idea battle.
- **What is useful:** The **parallel-agent + synthesis** orchestration and the **web-search grounding to prevent hallucination** pattern. Aligns with our §4.2 Market Intelligence Engine.
- **What can be reused:** **Nothing as code — no license.** Pattern only.
- **What should only be studied:** All of it.
- **License and attribution:** **NO LICENSE.** Study-only.
- **Known limitations:** Idea-validation focus (not full pitch/deck diligence); Tavily is a paid API; no multi-tenant RLS; verdicts are a single aggregate (our spec requires investor-by-investor disagreement).
- **Integration decision:** **STUDY ONLY** — no code copied. We build our own agent/synthesis orchestration.

## 5. samalyarov/startup-due-diligence

- **URL:** https://github.com/samalyarov/startup-due-diligence
- **What it does:** Python + LangGraph multi-agent system. 11 agents in 3 layers: Research (Company Profiler, Market Researcher, Competitor Scout, Team Investigator, News Monitor) → Analysis (Financial Analyst, Risk Assessor, Tech Evaluator, Legal Reviewer) → Synthesis (Report Generator, Decision Agent). Central `DueDiligenceState` flows through the graph; validates research completeness and retries.
- **What is useful:** The **3-layer role decomposition** (research → analysis → synthesis) and the **report section structure** map directly onto our §8 Final Report and §4 skill architecture.
- **What can be reused:** Unlicense = public domain. The role decomposition and report structure are free to reuse. (We will re-implement in TypeScript; not copy Python.)
- **What should only be studied:** The LangGraph-specific orchestration (we use Next.js server routes), and any workshop-derived opinions.
- **License and attribution:** **Unlicense** — public domain. No attribution required, but credit is good practice (we will attribute in THIRD_PARTY_NOTICES.md).
- **Known limitations:** Python/LangGraph; input is a startup *name* (no pitch deck, no live interview); no user accounts/multi-tenancy; no adversarial questioning loop.
- **Integration decision:** **REUSE CONCEPTS** — adopt the 3-layer agent decomposition and report structure; implement in our own TS stack. No Python copied.

## 6. affaan-m/everything-claude-code (ECC)

- **URL:** https://github.com/affaan-m/everything-claude-code (repo resolves to `affaan-m/ECC`)
- **What it does:** The agent-harness performance-optimization system — skills, instincts, memory, security, and research-first development for Claude Code / Codex / OpenCode / Cursor. ~303k stars. Large skill ecosystem.
- **What is useful:** The **skill authoring conventions**, **research-first development methodology**, **evidence-ledger patterns**, and **deep-research workflow**. This product's skill architecture (§4) should follow the same conventions so it is portable across agent harnesses.
- **What can be reused:** MIT. The methodology is reusable. **We already have this ecosystem installed locally** (gstack + ECC skills under `~/.hermes/skills`), so we reference the local skills rather than cloning the repo.
- **What should only be studied:** The Claude-Code-specific harness internals (not relevant to a Next.js SaaS).
- **License and attribution:** MIT. Attribution if methodology/docs are reproduced.
- **Known limitations:** An agent harness, not a SaaS or a codebase to merge; enormous scope.
- **Integration decision:** **REUSE METHODOLOGY** — author our skills in the same `SKILL.md` convention, using the local installed skills (e.g. `deep-research`, evidence handling) as reference. No repo clone needed.

## 7. anthropics/financial-services

- **URL:** https://github.com/anthropics/financial-services
- **What it does:** Reference agents, skills, and data connectors for financial-services workflows (investment banking, equity research, private equity, wealth management). Ships as Claude Cowork plugins **and** as Claude Managed Agent templates. Named agents include Pitch Agent, Meeting Prep Agent, Market Researcher, Earnings Reviewer, Model Builder, Valuation Reviewer, GL Reconciler, Month-End Closer, Statement Auditor. Explicit disclaimer: outputs are staged for human sign-off and are **not** investment advice.
- **What is useful:** The **Pitch Agent**, **Market Researcher**, and **Meeting Prep Agent** prompt/agent templates are directly adaptable to our investor-committee agents. The **disclaimer framing** ("staged for human sign-off, not investment advice") is the model for our §6 disclaimer.
- **What can be reused:** Apache-2.0. Prompt/agent template *ideas* and, where useful, agent definitions, with attribution and NOTICE. 
- **What should only be studied:** The Excel/GL workflow-specific connectors (irrelevant to us).
- **License and attribution:** **Apache-2.0**. Retain license + NOTICE; state modifications.
- **Known limitations:** Anthropic/Claude-oriented (we use OpenRouter/Gemini); finance-industry focus (not startup diligence); agents are prompt templates, not a running SaaS.
- **Integration decision:** **ADAPT** — reuse the agent-template authoring style and the human-sign-off disclaimer framing; no code copied verbatim.

## 8. lu90/industry-research-skill

- **URL:** https://github.com/lu90/industry-research-skill
- **What it does:** An evidence-aware industry/company research skill for AI agents. Claim-led planning (5–15 high-impact verifiable Claims, each with stable ID, boundary, type, evidence tier), claim-to-source routing (different source routes per claim type), a provider-neutral Deep Search Protocol (Search → Visit → Extract loop with dedup, budgets, stop reasons), and an **Evidence Ledger** that ties every document to `claim_id` + `source_id` with period, geography, unit, access outcome, and evidence tier. Inaccessible documents are recorded as failed attempts, not treated as evidence.
- **What is useful:** This is the **single most directly reusable** reference for our §4.3 Evidence Ledger and §4.2 Market Intelligence Engine. The claim-led planning, evidence-tier classification, and "failed attempt is not evidence" rule are exactly our requirements ("Do not fabricate sources"; "explicitly label unknown/unverified"; "Never convert an assumption into a fact").
- **What can be reused:** Apache-2.0. The Evidence Ledger data model and claim-routing logic are reusable with attribution.
- **What should only be studied:** Provider-specific search backends (we use our configured search provider); the industry-specific examples.
- **License and attribution:** **Apache-2.0**. Retain license + NOTICE; state modifications.
- **Known limitations:** Skill file (agent-harness oriented), not a running service; requires an external search provider; language-agnostic markdown.
- **Integration decision:** **REUSE** — implement the Evidence Ledger schema (claim_id/source_id/tier/access-outcome) in our DB (`research_sources`, `evidence_records`) and the claim-routing approach in the Market Intelligence Engine. Attribution required.

## 9. tronghieu/agent-skills

- **URL:** https://github.com/tronghieu/agent-skills
- **What it does:** Method-driven agent skills for knowledge work: strategy, research, critical thinking, data analysis, docs, slides. Works with Claude Code, Codex, Cursor, and agentskills.io-compatible agents.
- **What is useful:** The **critical-thinking** and **research** skill authoring patterns — useful for our evidence classification and contradiction-detection skills.
- **What can be reused:** MIT. Skill authoring conventions, with attribution.
- **What should only be studied:** The specific skill content (generic knowledge work, not investor-specific).
- **License and attribution:** MIT. Attribution + license text if copied.
- **Known limitations:** Generic knowledge-work skills; not venture-diligence specific.
- **Integration decision:** **ADAPT** — authoring conventions only; attribution.

## 10. j4flmao/agent-skills

- **URL:** https://github.com/j4flmao/agent-skills
- **What it does:** A large (≈60 MB) skill collection for agent harnesses (JavaScript repo). 
- **What is useful:** Skill authoring conventions and a broad reference of skill patterns.
- **What can be reused:** MIT. Conventions only, with attribution.
- **What should only be studied:** The bulk of the content (generic agent skills).
- **License and attribution:** MIT. Attribution + license text if copied.
- **Known limitations:** Very large; mostly generic skills; README not fetched (size) — assessed via repo metadata and license.
- **Integration decision:** **ADAPT** — conventions only; not a code dependency. Attribution.

## 11. binaryshrey/DemoDay-AI

- **URL:** https://github.com/binaryshrey/DemoDay-AI
- **What it does:** Voice-first AI pitch coach. Next.js + Tailwind frontend; FastAPI backend; Supabase Postgres + pgvector (projects, sessions, embeddings, reports); Google Cloud Storage (decks, transcripts, audio); Google Gemini on Vertex AI for reasoning; RAG over Y-Combinator startup knowledge + investor insights; ElevenLabs voice; Anam avatars; WorkOS auth; deployed on Cloud Run / Vercel.
- **What is useful:** The **stack composition** (Next.js + Tailwind + Supabase + Gemini) is a direct architectural reference for VCroom. The **RAG-grounded feedback** pattern (retrieve → ground → generate from a startup/investor knowledge base) is valuable for our evidence grounding. The **session persistence** and **post-session structured feedback report** are direct analogues.
- **What can be reused:** Apache-2.0. Architecture and patterns, with attribution. (We are NOT adopting ElevenLabs/Anam — paid services and video avatars are out of scope per spec §5 "avoid unnecessary video avatars", and voice is text-first.)
- **What should only be studied:** The voice/avatar stack (paid, and against our first-release constraint); the YC-specific knowledge base (copyrighted content — we do not reuse it).
- **License and attribution:** **Apache-2.0**. Retain license + NOTICE if code is adapted.
- **Known limitations:** Depends on paid services (ElevenLabs, GCS, WorkOS, Vertex); no adversarial evidence ledger; avatars/voice-first (against our text-first first release).
- **Integration decision:** **STUDY + ADAPT ARCHITECTURE** — adopt the Next.js + Supabase + Gemini composition and RAG-grounded feedback; do NOT adopt paid voice/avatar services or the YC knowledge base.

## 12. yugbagrodia/PitchWise-Startup-Pitch-Simulator

- **URL:** https://github.com/yugbagrodia/PitchWise-Startup-Pitch-Simulator
- **What it does:** Streamlit app with a Random Forest classifier trained on historical startup pitch data (Shark Tank India) to estimate funding potential, compute valuation, generate an investor panel, and give investor-style feedback. Ships `Shark Tank India.csv`, `pitchwise_model.pkl`, `age_encoder.pkl`, `industry_encoder.pkl`.
- **What is useful:** The general idea of a funding-potential model and an investor panel. **Nothing is reusable as material.**
- **What can be reused:** **Nothing.** No license, and the dataset + trained models are derived from a copyrighted television show's pitch data. Per our rules we do **not** copy the dataset, the pickles, or any code.
- **What should only be studied:** The concept (ML funding-prediction) as an idea. The dataset is proprietary/copyrighted and must not be reused.
- **License and attribution:** **NO LICENSE** — and the dataset is third-party copyrighted content. **DO NOT reuse the dataset or models.**
- **Known limitations:** ML on a single show's data (not generalizable); black-box valuation (against our "do not invent valuations" rule); no evidence or provenance.
- **Integration decision:** **EXCLUDE** — study-only; explicitly **not** using the dataset, models, or code. Our decision engine is rule-based + evidence-driven, not a black-box ML predictor.

## 13. danverbraganza/jujutsu-skill

- **URL:** https://github.com/danverbraganza/jujutsu-skill
- **What it does:** Agent skill for working with the Jujutsu version-control system.
- **What is useful:** Only if we adopted Jujutsu. We are not.
- **What can be reused:** MIT, but not needed.
- **What should only be studied:** Nothing needed.
- **License and attribution:** MIT.
- **Known limitations:** Optional tool; adds a VCS dependency.
- **Integration decision:** **NOT ADOPTED** — per spec §2 ("Do not adopt an unnecessary technology just because a repository exists"). We use `git` (already available and sufficient).

---

## Cross-cutting integration decisions

1. **Evidence Ledger** is modeled on lu90/industry-research-skill (Apache-2.0) — claim-led, source-tied, tier-classified, failed-attempt-is-not-evidence.
2. **Adversarial Questioning Engine** seed corpus is adapted from kothari-nikunj/nock (MIT) and decomposed into 4 persona voices.
3. **Skill architecture** follows the ECC/investorskills `SKILL.md` convention (MIT) — 12 portable skill files, each with purpose/inputs/outputs/decision-rules/limitations/evaluation-criteria.
4. **Decision Engine** uses a **rule-based, evidence-driven** rubric (no universal scoring threshold; per-stage criteria) informed by VentureValuator/Verdict **concepts only** (no license, no code).
5. **Final Report** structure follows samalyarov/startup-due-diligence (Unlicense) — 16 sections, research→analysis→synthesis.
6. **Stack** follows DemoDay-AI (Apache-2.0) composition: Next.js App Router + TypeScript strict + Tailwind + Supabase (Postgres/Auth/Storage) + Gemini/OpenRouter for AI. **No paid voice, no avatars, no black-box ML.**
7. **No dataset reuse** — PitchWise's Shark-Tank dataset and trained models are excluded. DemoDay-AI's YC knowledge base is excluded (copyrighted). Our test scenarios (§13) use **synthetic** startups we author.
8. **Attribution:** MIT/Apache/Unlicense obligations are met via `THIRD_PARTY_NOTICES.md` (copyright + license text + modifications stated). No code is copied from no-license repos.

## Known limitations of the audit itself

- README for j4flmao/agent-skills was not fetched (≈60 MB repo); assessment is based on repo metadata + license.
- "Actual functionality" for each repo was assessed from README + top-level structure + license; deep source inspection of every file was out of scope for this audit pass and is revisited per-repo at integration time.
- Star counts and update dates are as of the audit date (2026-11-15) and change over time.
