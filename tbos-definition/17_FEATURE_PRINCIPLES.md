# 17 — Feature Principles

**Status**: Recommended. This document defines the **required template** every future TBOS feature must be run through before it is considered ready for specification/build, and demonstrates it with three worked examples drawn directly from this assessment's evidence. This is a governance document, not a feature backlog — `19_PRODUCT_ROADMAP.md` is where prioritized, sequenced features live.

---

## The required template

Every feature proposal states:

1. **Purpose** — one sentence, in plain language.
2. **Problem solved** — cite the evidence (a `tuba-current-state/` finding, a competitor-audit finding, or a named Job in `05_JOBS_TO_BE_DONE.md`). A feature with no evidenced problem is a solution looking for one — reject or defer it.
3. **Business value** — which business goal from `01_PRODUCT_VISION.md` it advances.
4. **User value** — which persona (`04_PERSONAS.md`) and which of their Pain Points it addresses.
5. **Priority** — P0/P1/P2/P3, using the same scale as `tuba-current-state/17_IMPLEMENTATION_PRIORITIES.md` for continuity across both assessments.
6. **Dependencies** — which other modules/features/data must exist first (a feature that silently assumes a prerequisite, like Market Insights assuming a price-history pipeline, must state that dependency explicitly — this is exactly the mistake `tuba-current-state/16_AI_READINESS.md` warns against as "AI theater").
7. **AI opportunities** — does this feature have an embedding point in `10_AI_STRATEGY.md`? If yes, which.
8. **Success metric** — how its success is measured, feeding `18_SUCCESS_METRICS.md`.
9. **Principle check** — which of the ten principles in `02_PRODUCT_PHILOSOPHY.md` does this feature advance? Which, if any, is it in tension with, and how is that tension resolved?

A feature proposal missing any of the nine sections is not ready — this is a hard gate, not a formatting preference.

---

## Worked example 1: Unified Lead Pipeline

1. **Purpose**: give every lead — buyer-inbound or owner-originated — one scored, staged, SLA-timed home.
2. **Problem solved**: Tuba's current platform has a live-confirmed lead-misrouting bug (the agent's own contact info displays as the lead's "sender") and no pipeline/stage model exists at all (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §2, `05_FEATURE_CATALOG.md`).
3. **Business value**: directly advances the North Star Metric (`01_PRODUCT_VISION.md`) — time from lead creation to first qualified response.
4. **User value**: Property Consultant (can trust their inbox), Sales Manager (can manage a real pipeline), Solo Broker (never loses a lead to a silent bug).
5. **Priority**: P0 — the single highest-priority feature in this entire definition, given the severity of the confirmed live defect it replaces.
6. **Dependencies**: RBAC (lead ownership needs scoped roles), Automation (routing).
7. **AI opportunities**: Lead Scoring, reply drafting (`10_AI_STRATEGY.md`).
8. **Success metric**: % of leads with zero data-integrity errors in sender/contact fields (target: 100%, a correctness bar, not an optimization target); median time-to-first-response.
9. **Principle check**: advances Principle #1 (action over information) and #9 (outcome-driven UX). No tension identified.

## Worked example 2: Marketing Request Surfacing

1. **Purpose**: make the real, monetized, owner-originated demand feature actually discoverable.
2. **Problem solved**: this feature already works end-to-end for offer submission in Tuba's current platform but is buried two clicks deep with no dedicated navigation entry, and leaks untranslated tokens into its own UI (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3) — a rare case where the fix is surfacing, not building.
3. **Business value**: protects and grows an existing, tier-gated revenue lever (confirmed live in `/agent-packages`, `tuba-current-state/04_PAGE_ANALYSIS.md`) that is currently under-monetized because brokers can't find it.
4. **User value**: Marketing Manager (primary owner of this job), Property Consultant (a real lead source they're currently missing).
5. **Priority**: P1 — high value, low effort (the underlying mechanic already works; this is an IA/localization fix, not new engineering).
6. **Dependencies**: Owners module (`16_MODULE_SPECIFICATIONS.md`), Today (proactive surfacing per `15_DECISION_SUPPORT_SYSTEM.md`).
7. **AI opportunities**: AI Recommendations (matching requests to broker specialty), per `10_AI_STRATEGY.md`.
8. **Success metric**: Marketing Request offer-submission rate (currently unmeasured, first establish baseline post-launch).
9. **Principle check**: advances Principle #10 (one home per capability, applied to *finding* the feature, not just avoiding duplication) and #2 (explainability, fixing the untranslated-token defect). No tension identified.

## Worked example 3: Fraud Detection (a feature this template correctly defers)

1. **Purpose**: detect fake listings, price anomalies, and spam leads.
2. **Problem solved**: named as a real opportunity in `tuba-current-state/16_AI_READINESS.md`.
3. **Business value**: protects platform trust and the regulatory-moat positioning in `01_PRODUCT_VISION.md`.
4. **User value**: Operations Manager, indirectly all personas via a more trustworthy platform.
5. **Priority**: **P4 — explicitly held**, not because it lacks value but because of dependency #6.
6. **Dependencies**: **the Nafath identity-verification signature must be fixed upstream of TBOS first** — any fraud model trained on an unverified identity signal inherits that gap (`tuba-current-state/16_AI_READINESS.md` §Risks, explicitly named as a sequencing-gated item). This is a hard, stated dependency outside TBOS's own control.
7. **AI opportunities**: anomaly detection, rules-based first, ML-based later — not an LLM-generation task.
8. **Success metric**: (deferred until the dependency clears — a success metric for a feature that shouldn't be built yet is itself a premature specification).
9. **Principle check**: would advance Principle #6 (trust by design) *if* built correctly — but building it before its dependency is fixed would violate the same principle by creating false confidence. This is the template's clearest demonstration of why section 6 (Dependencies) is not optional: it is what correctly keeps a valuable feature off the roadmap until its prerequisite is real.

---

## How this feeds the roadmap

Every feature that passes this template's nine sections becomes a candidate line item in `19_PRODUCT_ROADMAP.md`, sequenced by Priority and Dependencies. A feature that fails the template (missing evidence, unstated dependency, unresolved principle tension) is sent back for rework, not silently included at a lower priority — the discipline is binary at the "is this ready to be sequenced" gate, even though priority itself is a spectrum.
</content>
