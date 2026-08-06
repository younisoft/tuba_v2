# 18 — Open Questions

What this blueprint genuinely cannot resolve, consolidated from every "flagged," "deferred," or "Needs Business/Legal Validation" item scattered through documents 00–17, plus who resolves it. Per the master prompt's Final Success Criteria, the goal of this document is to make sure nothing is silently unresolved — every open item below is named, owned, and linked to what it blocks, rather than papered over.

## How to use this document

An item here is not a failure of this blueprint — it's a decision genuinely outside its authority (business/pricing/legal calls) or a dependency on work sequenced later (a future dedicated pass). Every item names: **the question, why it can't resolve here, who resolves it, and what it blocks.** When an item resolves, it should move into the relevant document (e.g., a resolved SLA threshold moves into [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md)) and be struck from this list, not left duplicated in both places.

## Business decisions

| Question | Why unresolved here | Owner | Blocks |
|---|---|---|---|
| Exact SLA thresholds (hours before "approaching breach," hours before auto-reassignment) | A judgment call about acceptable response time, not a UX/architecture decision | Product + Sales leadership | [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md) reminder cadences, [17_ACCEPTANCE_CRITERIA.md](17_ACCEPTANCE_CRITERIA.md) SLA scenarios (currently written against "the defined threshold" placeholder) |
| Automation default thresholds (e.g., "N days with no view growth" before auto-boost, "N hours unclaimed" before lead reassignment) | Same — a business-tuning decision, likely to need adjustment post-launch based on real usage data | Product + Marketing/Sales leadership | [01_EXPERIENCE_ARCHITECTURE.md](01_EXPERIENCE_ARCHITECTURE.md) WF-AUTOMATION defaults, AUTO-02 initial rule configuration |
| Deletion recovery-window length | A data-retention policy decision with legal overlap | Product + Legal | WF-DELETION's grace-window implementation, [06_STATE_ARCHITECTURE.md](06_STATE_ARCHITECTURE.md) Deleted state |
| Marketing Request tier-gating exact rules (which package tiers see which requests) | A monetization/packaging decision | Product + Business/Revenue leadership | OWN-03 eligibility logic, WAL-01 tier definitions |
| Wallet package/tier pricing and quota amounts | Explicitly a pricing decision outside this blueprint's scope | Business/Finance leadership | WAL-01/02 content, MKT-02's spend-tier options |
| Compliance checklist content per contract type | Requires real estate brokerage domain expertise on exactly what each contract type legally requires | Operations Manager domain expert (internal) + Legal | CONT-01/02 build, flagged in [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md) as Needs Business Validation |
| Migration strategy: migrate existing Tuba data (properties, leads, packages, agents) vs. launch fresh | A cross-functional call involving data quality, legal retention, and business continuity tradeoffs `tbos-definition/19_PRODUCT_ROADMAP.md` explicitly leaves open | Product + Engineering leadership | Release 0/1 sequencing in [14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md) |
| Team size and velocity → converting release sequence (R0–R7) into actual calendar dates | Not an input available to this blueprint | Engineering/Delivery leadership | [15_RELEASE_PLAN.md](15_RELEASE_PLAN.md) — deliberately left sequence-only, not dated |
| SMS channel's role, if any, beyond the current default-zero-assignment in the notification catalog | Requires market-testing data on whether push/email/WhatsApp already cover urgency needs before investing further in a fourth channel | Product, informed by early usage data post-R1 | [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md) §Channel behavior details |

## Legal / compliance decisions

| Question | Why unresolved here | Owner | Blocks |
|---|---|---|---|
| Document Intelligence's exact PDPL data-minimization/redaction implementation | Requires counsel review of what specifically must be redacted/minimized before any PII reaches a third-party model | Legal counsel | [08_AI_INTERACTION_BLUEPRINT.md](08_AI_INTERACTION_BLUEPRINT.md) Document Intelligence production rollout, per [13](13_FEATURE_READINESS_MATRIX.md)'s Needs Legal Review tag |
| Contract enforceability review under Saudi brokerage law | Outside this blueprint's authority entirely | Legal counsel | CONT-02's document-generation content, e-signature integration's legal sufficiency |
| Audit-log retention period | A compliance/data-retention policy decision | Legal + Operations Manager | AICP-02 and Automation run-history retention implementation |
| Whether AI Copilot conversation history retention needs its own explicit consent/disclosure flow beyond the general Explainability disclosure | PDPL-adjacent question not fully addressed by the existing Explainability system's disclosure rule | Legal counsel | AICP-01 conversation-history retention behavior |

## Engineering / infrastructure decisions

| Question | Why unresolved here | Owner | Blocks |
|---|---|---|---|
| E-signature vendor selection | A procurement/integration decision, not a UX one | Engineering + Product, with Legal input on enforceability | CONT-02's document-signing step ([14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md) Release 6 notes it can be stubbed meanwhile) |
| Voice Search's language-model support for Arabic dialects (Gulf/Saudi-specific vs. Modern Standard Arabic) | A technical feasibility/vendor-capability question | Engineering + AI team | [10_SEARCH_EXPERIENCE.md](10_SEARCH_EXPERIENCE.md) §11 Voice Search quality bar |
| Continued suitability of existing Taqnyat (SMS)/Pusher integrations at TBOS's target scale, vs. replacing them | An infrastructure capacity/reliability question outside product-definition scope | Engineering | [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md) channel delivery reliability |
| Whether the Nafath identity-verification signature fix (Phase 0 security item) has a committed timeline, which directly gates Fraud Detection's earliest possible start | Depends on external government-integration coordination outside this blueprint's control | Engineering leadership, tracking the Phase 0 dependency | [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md) Fraud Detection Blocked status |
| Historical price data: none exists in the current platform's string/CSV-packed price fields — does Price History launch genuinely empty, or is there a one-time backfill effort worth investing in | A cost/benefit engineering call | Engineering + Product | WF-PRICE-CHANGE, Market Intelligence's real-data timeline in [14](14_DEVELOPMENT_BLUEPRINT.md) Release 6 |

## UX validation needed (flagged, not blocking, in [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md))

| Question | Why unresolved here | Owner | Blocks |
|---|---|---|---|
| Does TODAY-01's ranking algorithm produce recommendations brokers actually trust and act on? | No competitor precedent exists to validate against (Bayut/Aqar both lack an equivalent) | UX research, via a prototype/pilot before full R2 rollout | Nothing hard-blocks — R2 can ship with a monitoring plan to validate post-launch, but should not be declared "successful" without this check |
| Is the Command Palette's `>` command mode discoverable/adopted by a broker audience (not a developer audience)? | No precedent among this product's actual users | UX research | Nothing hard-blocks — CMD-01 can ship in R3 with usage-analytics instrumentation to answer this post-launch |
| Is the Kanban Board's keyboard "move to stage" menu fast enough to not regress the drag-and-drop workflow's perceived speed? | A performance-perception question needing real user testing | UX research | Nothing hard-blocks — accessibility requirement itself is non-negotiable regardless of the answer |
| Do brokers correctly understand that a Marketing Request shown on TODAY-01 is the same record as the one in Owners, not a duplicate? | The IA rationale is sound but untested with real users | UX research | Nothing hard-blocks — worth validating before scaling Marketing Request volume in R2/R3 |

## Deferred to a future dedicated pass (explicitly out of this blueprint's depth, not silently skipped)

| Item | Why deferred | Owner | Tracked in |
|---|---|---|---|
| Platform Console full behavioral spec (PC-01–05: states, components, AI actions at the same depth as Broker OS screens) | `tbos-definition/06_PRODUCT_ARCHITECTURE.md` itself scopes Platform Console lightly this phase; sequenced Release 7/Phase 6 | Product, for a dedicated Platform Console blueprint pass | [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) §Platform Console, [15_RELEASE_PLAN.md](15_RELEASE_PLAN.md) R7 |
| Future Modules full definition (Mortgage, Insurance, Investment Analytics, Property Management, Developers persona, Auctions, Commercial, CRM/ERP-adjacent, Marketplace formalization, Partner APIs) | `tbos-definition/16_MODULE_SPECIFICATIONS.md` confirms architectural room but explicitly defers full definition | Product, per-module as each is prioritized | [14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md) Release 7 |

## What this list is not

This is not a list of unresolved *product ambiguity* within this blueprint's actual scope — everything in [01](01_EXPERIENCE_ARCHITECTURE.md) through [17](17_ACCEPTANCE_CRITERIA.md) that this document doesn't reference here is considered resolved and implementation-ready. This list is specifically the set of items that require an authority (Legal, Business/Finance leadership, external vendors, future dedicated scope) this blueprint doesn't have.
