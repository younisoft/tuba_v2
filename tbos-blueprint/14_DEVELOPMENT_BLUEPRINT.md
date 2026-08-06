# 14 — Development Blueprint

Implementation order, release grouping, dependency estimates, and parallel-work identification — per the master prompt's Phase 14. Sequencing inherits `tbos-definition/19_PRODUCT_ROADMAP.md`'s Trust → Delivery → Discovery → Intelligence → Transaction phases unchanged (binding, [00](00_IMPLEMENTATION_BLUEPRINT.md) §7 item 4); this document adds screen/feature-level granularity and the release-group naming the master prompt asks for (Foundation, Core Experience, Broker Productivity, AI Layer, Automation Layer, Analytics, Enterprise), mapped 1:1 onto that fixed phase order rather than replacing it.

## Naming reconciliation

| Master-prompt release group | = `tbos-definition/19_PRODUCT_ROADMAP.md` phase |
|---|---|
| Release 0: Prerequisites | Phase 0 (external, not a TBOS feature) |
| Foundation | Phase 1 — Trust |
| Core Experience | Phase 2 — Delivery |
| Broker Productivity | Phase 3 — Discovery |
| AI Layer + Automation Layer | Phase 4 — Intelligence |
| Analytics | Phase 4 — Intelligence (Analytics/Reports sub-track) |
| Transaction (unnamed in prompt, kept as-is — no master-prompt group fits it better) | Phase 5 — Transaction |
| Enterprise | Phase 6 — Expansion |

## Release 0 — Prerequisites (gates everything, not a TBOS feature)

| Item | Depends on | Parallelizable with |
|---|---|---|
| 7 Critical security findings (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4) | Nothing — first work | N/A, must close before any release below ships to production |
| Checkout/dependency-consistency resolution | Nothing | Can run alongside security fixes (different engineers, same urgency) |
| Migration-strategy decision (migrate existing data vs. fresh launch) | Nothing (a decision, not code) | Should resolve before Foundation starts — tracked in [18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md) |

**Exit criteria**: zero Critical findings open; checkout path verified consistent in production; migration strategy decided and documented.

## Release 1 — Foundation (Trust)

| Item | Screens | Depends on | Parallelizable with |
|---|---|---|---|
| Real RBAC (Policies, permission registry, role templates) | SET-02 | Release 0 closed | Can build alongside Unified Lead Pipeline — different subsystems, but Lead Pipeline's RBAC-scoped views (LEAD-01/02/03) can't fully verify until roles exist, so RBAC should land first or in tight lockstep |
| Unified Lead Pipeline (routing, SLA, scoring v1) | LEAD-01, LEAD-02, LEAD-03 | RBAC (for scoped visibility), Customers/Owners stub for merge target | Automation's routing-rule engine (below) shares infrastructure — build together, not sequentially |
| Notification delivery wiring (real email/push/WhatsApp, not database-only) | NOTIF-01, NOTIF-02 | Nothing new — extends existing `toMail()`/Pusher/Taqnyat integrations already present | Parallel with RBAC and Lead Pipeline — different codepaths |
| Audit-log infrastructure | AICP-02 (log-writing only; full UI can follow) | Nothing new | Parallel with RBAC — both are foundational, independent subsystems |
| Explainability infrastructure (contract enforcement, not content) | Cross-cutting | Nothing new — a review discipline + shared component (Explainability Popover, [05](05_COMPONENT_MAPPING.md)) | Build the shared component early so every subsequent release can consume it rather than retrofitting |

**Exit criteria** (from `tbos-definition/19_PRODUCT_ROADMAP.md`): no lead misrouted/misattributed; no metric ships without explanation; no role exists without scoped, auditable permissions.

## Release 2 — Core Experience (Delivery)

| Item | Screens | Depends on | Parallelizable with |
|---|---|---|---|
| Properties full lifecycle + numeric price schema/history | PROP-01, PROP-02, PROP-03 | Release 1 (RBAC for permission-gated actions) | Projects (below) — same team pattern, can run as two parallel workstreams once the shared Wizard/Stepper and Media Uploader components exist |
| Projects full lifecycle | PROJ-01, PROJ-02, PROJ-03 | Same as Properties | Parallel with Properties |
| Media/photo upload pipeline rebuild | Shared component ([05](05_COMPONENT_MAPPING.md) File/Media Uploader) | Nothing new | Should land *before* Properties/Projects wizards are considered done — both consume it |
| Owners + Marketing Requests surfacing fix | OWN-01, OWN-02, OWN-03 | Release 1 (RBAC), Wallet (tier gating) | Parallel with Customers — this is primarily an IA/discoverability fix per `tbos-definition/17_FEATURE_PRINCIPLES.md`'s worked example, lower engineering lift than it looks |
| Customers | CUST-01, CUST-02 | Leads (merge source) | Parallel with Owners |
| Wallet | WAL-01, WAL-02 | Release 0 (payment auth fix) | Can start early, in parallel with Release 1 even, since it has no RBAC/Lead dependency — flagged here for sequencing clarity but technically unblocked sooner |
| Today (first meaningful version) | TODAY-01 | Properties + Leads + Owners all having real data | Last item in this release — genuinely blocked on the others existing, not parallelizable |

**Exit criteria**: broker runs the full daily workflow (leads, listings, owner relationships) inside TBOS with no old-platform/external workaround.

## Release 3 — Broker Productivity (Discovery)

| Item | Screens | Depends on | Parallelizable with |
|---|---|---|---|
| Real search-engine infrastructure | GS-01, CMD-01 | Release 2's data model stable (search indexes what's been built) | Marketing module (below) — independent subsystems |
| AI Search (NL-to-filter thin layer) | GS-01 | Search-engine infrastructure landing first | N/A — direct dependency |
| Saved Search as live subscription | GS-01 | Search infrastructure + Notifications (Release 1) | Parallel with Marketing |
| Marketing campaigns + eligibility pre-check | MKT-01, MKT-02 | Wallet, Properties/Projects (Release 2) | Parallel with Search infrastructure |
| Content Quality Queue | MKT-03 | Property Quality AI capability (Release 4) — **note**: this item's screen can ship ahead of its AI-scoring backing, initially populated by simpler deterministic completeness rules, then upgraded once AI Layer lands | Parallel with Search |
| Knowledge module | KB-01, KB-02 | Nothing new — content-authoring dependency, not technical | Can start anytime; useful early since Explainability deep-links need somewhere to point |

**Exit criteria**: no list requires scrolling a several-hundred-item flat control to find something.

## Release 4 — AI Layer + Automation Layer (Intelligence)

| Item | Screens | Depends on | Parallelizable with |
|---|---|---|---|
| AI Writing extended to Projects | PROJ-02/03 | Existing `OpenAISeoService` hardening (config, queue, retry) | Parallel with Lead Scoring v2 |
| Lead Scoring v2 (LLM qualitative layer) | LEAD-03 | Lead Scoring v1 (Release 1) trusted in production | Parallel with AI Writing extension |
| Agent Copilot v1 (reply drafting, AICP-01) | AICP-01, AICP-02 (full UI) | Release 1's audit-log write path | Parallel with Property Quality |
| Property Quality (image tagging) | Feeds MKT-03, PROP-03 | Media pipeline (Release 2) | Parallel with Agent Copilot |
| Document Intelligence | SET-04, CONT-02 | Release 1 (RBAC — OM approval gating), legal sign-off ([13](13_FEATURE_READINESS_MATRIX.md) Needs Legal Review) | Blocked on legal review closing before production rollout, though engineering can build against a staging dataset in parallel |
| Automation made fully visible/editable | AUTO-01, AUTO-02 | Release 1's routing/reminder logic already exists as defaults — this release exposes it as broker-configurable, not building it from zero | Parallel with all AI Layer items — different subsystem |

**Exit criteria**: Today reliably surfaces the platform's highest-value 3–5 recommendations daily, and a majority of brokers act on at least one.

## Release 5 — Analytics (Intelligence, reporting sub-track)

| Item | Screens | Depends on | Parallelizable with |
|---|---|---|---|
| Analytics Explorer | ANL-01 | Real Explainability-backed data existing across Releases 1–4 (this is explicitly a REPLACE of the current decorative dashboard, not an extension of it) | Parallel with Reports |
| Reports | RPT-01, RPT-02 | Analytics' metric layer | Sequenced just after Analytics, but report-scheduling infrastructure can be built in parallel |
| Finance Overview | FIN-01 | Contracts existing (Release 6) for real commission data — **note**: FIN-01 can ship earlier with zero/placeholder-explained state if Contracts isn't ready yet, since the Empty state ("No closed deals yet") is itself a valid, honest state per [06](06_STATE_ARCHITECTURE.md) |

**Exit criteria**: every metric traces to real data with zero hardcoded/decorative figures.

## Release 6 — Transaction

| Item | Screens | Depends on | Parallelizable with |
|---|---|---|---|
| Contracts full lifecycle | CONT-01, CONT-02 | Release 1 (RBAC for OM approval gating), compliance-checklist-per-type ([13](13_FEATURE_READINESS_MATRIX.md) Needs Business Validation — must resolve before build starts) | N/A — this is the release's centerpiece, most other items in this release depend on it |
| E-signature integration | CONT-02 | External vendor selection ([18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md)) | Can be stubbed/mocked during Contracts build, integrated once vendor is selected |
| Market Intelligence + AI Pricing | ANL-01, PROP-02 (Price Change) | Price-history pipeline (Release 2) having accumulated real data over time — a genuine *time* dependency, not just a build-order one | N/A |
| Finance full reporting | FIN-01 | Contracts existing | Direct dependency |

**Exit criteria**: a deal's full lifecycle — lead to contract to close — tracked in TBOS with no external workaround.

## Release 7 — Enterprise (Expansion)

Not scoped in screen-level detail this phase (per `tbos-definition/16_MODULE_SPECIFICATIONS.md`'s Future Modules and `19_PRODUCT_ROADMAP.md` Phase 6). Confirmed to have room in the architecture without IA rework:

| Track | Confirmed non-blocking |
|---|---|
| Platform Console full detail (PC-01–05) | Architecturally isolated already (Constitution Article V) — building it out doesn't touch any Broker OS release above |
| Mortgage, Insurance | Extend Contracts as partner-integration points, no new top-level IA |
| Investment Analytics | Extends Analytics, no new top-level IA |
| Property Management, Developers persona, Auctions, Commercial, CRM/ERP-adjacent, Marketplace formalization, Partner APIs | Each named in `tbos-definition/16_MODULE_SPECIFICATIONS.md` Future Modules with its architectural relationship already stated — full spec deferred to its own future blueprint pass |

## Cross-release parallel-work summary

Teams that can run concurrently without cross-blocking, once their respective release's prerequisites are met:

- **RBAC team** and **Notification-delivery team** — Release 1, fully independent subsystems.
- **Properties team** and **Projects team** — Release 2, same component contracts, different data shapes.
- **Owners/Marketing-Requests team** and **Customers team** — Release 2, independent modules.
- **Search-infrastructure team** and **Marketing-campaign team** — Release 3, independent subsystems.
- **AI-Writing-extension team**, **Agent-Copilot team**, and **Automation-visibility team** — Release 4, three independent workstreams sharing only the AI-invocation logging contract from [08_AI_INTERACTION_BLUEPRINT.md](08_AI_INTERACTION_BLUEPRINT.md).
- **Platform Console** (Release 7) can start **any time** after its own architectural isolation is confirmed — it has zero dependency on any Broker OS release, so a separate team could work on it starting as early as Release 1 if resourcing allows, without affecting the sequencing above.

## What must never parallelize

- Media/photo upload pipeline rebuild must land **before** Properties/Projects wizards are called complete — both consume it, building it twice would violate reuse discipline.
- Real RBAC must land **before** any screen ships a role-scoped view as "done" — every screen's Permissions field in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) is unverifiable without it.
- Document Intelligence's production rollout must not ship ahead of its legal review closing, even if engineering finishes early — the AI Strategy guardrail against sending unredacted PII to a third-party model is binding, not a target.
