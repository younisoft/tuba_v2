# 13 — Feature Readiness Matrix

Classifies every module/workflow/capability in this blueprint against the readiness scale in [00](00_IMPLEMENTATION_BLUEPRINT.md) §6: **Ready · Needs UX Validation · Needs Business Validation · Needs Legal Review · Needs Backend · Needs AI · Blocked.** A row can carry more than one tag (e.g., "Needs Backend + Needs UX Validation"). This is the direct input to [14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md)'s sequencing.

## Legend

- **Ready** — behavior fully specified in this folder, no external unresolved dependency; engineering can start.
- **Needs UX Validation** — behavior specified, but a genuinely untested assumption exists (e.g., an interaction pattern with no precedent to validate against) and should be prototyped/tested before full build.
- **Needs Business Validation** — a product/pricing/policy decision this blueprint can't make unilaterally (e.g., exact SLA thresholds, exact tier pricing).
- **Needs Legal Review** — touches PDPL/regulatory obligations, contract enforceability, or data handling requiring counsel sign-off.
- **Needs Backend** — depends on infrastructure not yet built (real search engine, price-history pipeline, RBAC/Policies, audit-log package, queue-backed automation).
- **Needs AI** — depends on an AI capability or its prerequisite data pipeline reaching sufficient maturity.
- **Blocked** — cannot start until a named external prerequisite (Phase 0 security fix, a still-open question in [18](18_OPEN_QUESTIONS.md)) resolves.

## Foundation / Trust layer

| Item | Readiness | Detail |
|---|---|---|
| SET-02 Team & Roles (real RBAC) | Needs Backend | Depends on Policies + canonical permission-string registry existing (`tuba-current-state/17_IMPLEMENTATION_PRIORITIES.md` Phase 3) — screen behavior itself is fully specified in [04](04_SCREEN_INVENTORY.md) |
| WF-LEAD-NEW / LEAD-01/02/03 (Unified Lead Pipeline) | Needs Backend | Depends on real pipeline/stage data model + capacity-aware routing service; the single P0 workflow, sequenced first regardless |
| NOTIF-01/02 accurate delivery | Needs Backend | Depends on wiring `toMail()`/push/WhatsApp delivery for real (currently database-only per `tuba-current-state/05_FEATURE_CATALOG.md`) |
| Explainability contract (cross-cutting) | Ready | Fully specified in `tbos-definition/14_EXPLAINABILITY_SYSTEM.md` + operationalized per-widget in [07](07_DECISION_SUPPORT_SYSTEM.md) — an engineering/content discipline, not a blocked feature |
| Audit trail (AICP-02 + automation logging) | Needs Backend | Depends on an audit-log package existing (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` confirms none exists today) |
| Phase 0 security fixes (hardcoded password, OTP bypass, Nafath signature, TLS, payment auth, mass-delete IDOR, unguarded admin controllers) | **Blocked** | Not a TBOS feature — external prerequisite gating every release per [00](00_IMPLEMENTATION_BLUEPRINT.md) §7 item 5; tracked, not re-specified here |

## Delivery layer

| Item | Readiness | Detail |
|---|---|---|
| PROP-01/02/03 core lifecycle | Ready | 8-state lifecycle is a KEEP (`tuba-current-state/14_KEEP_IMPROVE_REMOVE.md`); screen behavior fully specified |
| PROP-02 numeric price schema + Price History | Needs Backend | Current platform stores price as string-like/CSV-packed in places (`tuba-current-state/13_GAP_ANALYSIS.md`) — migration required before WF-PRICE-CHANGE can log real history |
| PROJ-01/02/03 | Ready | Same pattern as Properties, applied per-unit |
| Media/photo upload pipeline | Needs Backend | Current pipeline confirmed likely broken (`05_FEATURE_CATALOG.md`: "Needs Redesign") — PROP-03's File/Media Uploader contract assumes a working async pipeline |
| OWN-01/02/03 (Owners + Marketing Requests) | Ready | Behavior already works end-to-end per `tbos-definition/17_FEATURE_PRINCIPLES.md`'s worked example (P1, IA/localization fix not new engineering) — mainly a surfacing/discoverability fix, not a build-from-zero |
| CUST-01/02 | Ready | Straightforward relationship-record module, no named blocking dependency |
| TODAY-01 (Decision Support rendering) | Needs Backend | Requires cross-module data (Leads + Properties + Owners) to exist first — sequenced per `tbos-definition/19_PRODUCT_ROADMAP.md` Phase 2, not buildable in isolation |
| WAL-01/02 | Ready | Package/quota ledger pattern is a KEEP; WAL-02 payment flow already integrates HyperPay/Tabby, needs the Phase 0 TLS/auth fixes but not new design |

## Discovery layer

| Item | Readiness | Detail |
|---|---|---|
| GS-01/CMD-01 real search infrastructure | Needs Backend | Depends on a real search engine (Elasticsearch/Meilisearch/Algolia-class) replacing the current unindexed Eloquent scope chain (`tbos-definition/12_SEARCH_STRATEGY.md`) |
| AI Search (NL-to-filter layer) | Needs AI + Needs Backend | Thin NL-parsing layer ships fast once the underlying engine exists; cannot ship ahead of it |
| Arabic/Semantic/Voice/Geo search quality bar | Needs Backend | Same underlying engine dependency; Geo search's interaction design itself is a KEEP, only the engine changes |
| Saved Search as live subscription | Needs Backend | Requires a re-run/match-detection job, not just storage (current platform stores criteria but never re-runs, per `12_SEARCH_STRATEGY.md`) |
| MKT-01/02 campaign flow + eligibility pre-check | Ready | Behavior fully specified; depends on Wallet (ready) and Properties (ready) |
| MKT-03 Content Quality Queue | Needs AI | Depends on Property Quality AI scoring capability existing |
| KB-01/02 Knowledge module | Ready | Content-authoring dependency (internal team), not a technical blocker |

## Intelligence layer

| Item | Readiness | Detail |
|---|---|---|
| AI Writing (descriptions/SEO, extended to Projects) | Needs AI | Extends existing production integration (`OpenAISeoService`) — lower-effort than most AI items since a working pattern already exists, needs config/queue hardening per `tuba-current-state/17_IMPLEMENTATION_PRIORITIES.md` Phase 7 |
| Lead Scoring v1 (heuristic) | Ready | Deterministic formula, no model dependency — buildable as soon as Leads data model exists |
| Lead Scoring v2 (LLM qualitative layer) | Needs AI | Explicitly sequenced after v1 baseline is trusted (`tbos-definition/10_AI_STRATEGY.md`) |
| Agent Copilot v1 / reply drafting (AICP-01) | Needs AI | Fast-follow phase per AI Strategy sequencing |
| Document Intelligence | Needs AI + Needs Legal Review | OCR/extraction on FAL/contract documents touches PDPL-relevant personal data handling — data-minimization/redaction step is a binding guardrail requiring legal sign-off on the specific implementation |
| Property Quality (image tagging) | Needs AI | Moderate new infrastructure tier per AI Strategy sequencing |
| AUTO-01/02 (visible/editable automation) | Ready + Needs Backend | Screen behavior fully specified; depends on a real, monitored queue (not `sleep()`-throttled per `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`) |
| ANL-01 / RPT-01/02 | Needs Backend | Must be built on real Explainability-backed data from day one — current dashboard's decorative/hardcoded charts are explicitly not a starting point to extend, they're a REPLACE (`14_KEEP_IMPROVE_REMOVE.md`) |
| Market Intelligence + AI Pricing | Needs AI + **Blocked** on Price History | Cannot start until the numeric price schema + Price History table (Delivery layer, above) exists — a real sequencing dependency, not a priority call |
| Fraud Detection | **Blocked** | Explicitly held pending Nafath identity-verification signature fix — outside TBOS's own control (`tbos-definition/17_FEATURE_PRINCIPLES.md` worked example, P4) |

## Transaction layer

| Item | Readiness | Detail |
|---|---|---|
| CONT-01/02 core lifecycle | Needs Business Validation | Compliance-checklist-per-contract-type needs Operations input on the exact checklist items per contract type — a domain-expertise decision this blueprint can't make unilaterally |
| E-signature integration | Needs Backend | Named as an external integration point in `tbos-definition/09_WORKFLOW_ARCHITECTURE.md`, not yet selected/scoped — tracked in [18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md) |
| FIN-01 Finance Overview | Ready | Read-only aggregation over Contracts; no new data-entry surface, low technical risk |
| Contract compliance document handling | Needs Legal Review | Same PDPL/data-handling review as Document Intelligence above, plus contract-enforceability review specific to Saudi brokerage law — outside this blueprint's authority |

## Cross-cutting UX validation candidates

Flagged separately because they're genuinely novel interaction patterns with no direct precedent in `tuba-current-state/`, Bayut, or Aqar audits — worth a lightweight prototype/test pass before full build investment, even though their behavior is fully specified:

| Item | Why it needs validation |
|---|---|
| TODAY-01's ranking algorithm surfacing (§ [07](07_DECISION_SUPPORT_SYSTEM.md)) | No competitor has an equivalent — Bayut/Aqar dashboards both show numbers without recommendations (shared weakness both audits converge on); the ranking *logic* is specified, but whether brokers trust/act on it in practice is untested |
| Command Palette (CMD-01) `>` command mode | Power-user pattern with no precedent in the current platform or either competitor; adoption/discoverability among a broker audience (not developers) is unverified |
| Kanban Board keyboard-equivalent for stage moves | The accessibility requirement is clear ([11](11_ACCESSIBILITY_BLUEPRINT.md)); whether the specific "move to stage" menu pattern is fast enough to not regress the drag-and-drop workflow's speed is worth testing |
| Marketing Request surfacing on TODAY-01 (the one deliberate cross-placement exception) | The IA rationale is sound (`tbos-definition/07_INFORMATION_ARCHITECTURE.md`), but whether brokers understand it's the *same* record as the one in Owners (not a duplicate) should be validated before wide rollout |

## Reading this matrix alongside the roadmap

Every "Needs Backend" or "Blocked" tag above names a real prerequisite already identified in `tbos-definition/19_PRODUCT_ROADMAP.md`'s phase sequencing (Trust → Delivery → Discovery → Intelligence → Transaction) — this matrix doesn't introduce new blockers, it makes each phase's exit criteria checkable per concrete screen/feature rather than per abstract phase name.
