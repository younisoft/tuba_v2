# 19 — Product Roadmap

**Status**: Recommended. Sequences TBOS's modules and features per the strategy in `01_PRODUCT_VISION.md`: **Trust → Delivery → Discovery → Intelligence → Transaction**. This is a *product* roadmap (what gets defined and built, in what order, and why) — it is distinct from `tuba-current-state/17_IMPLEMENTATION_PRIORITIES.md`, which sequences fixes to the *existing* Tuba platform. Where TBOS is intended to replace rather than extend the current platform, that dependency is stated explicitly per phase.

---

## Phase 0 — Prerequisites (owned outside this definition, gating everything below)

TBOS's design assumes these are resolved before or in parallel with TBOS engineering begins — they are not TBOS features, they are conditions this roadmap depends on:
- The 7 Critical security findings confirmed still live in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4 (universal hardcoded password, OTP bypass, unverified Nafath signature, disabled TLS, unauthenticated payment fulfilment, mass-delete IDOR, unguarded admin controllers).
- The checkout/dependency-consistency question (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §0), live-confirmed to affect production (`tuba-current-state/13_GAP_ANALYSIS.md` §5).
- A decision on migration strategy: does TBOS replace the current platform's data (properties, leads, packages, agents) via migration, or launch fresh? This definition phase does not resolve that decision — it is a required input to Phase 1 planning, not a TBOS feature.

## Phase 1 — Trust (Foundation modules)

**Theme**: the platform must be structurally trustworthy before anything else matters.

- **Settings module** with real RBAC (Policies, role templates, scoped permissions) — sequenced first because every other module's access model depends on it (`16_MODULE_SPECIFICATIONS.md`).
- **Leads module** (Unified Lead Pipeline, `17_FEATURE_PRINCIPLES.md` worked example 1) — the P0 feature, given the severity of the defect it replaces.
- **Notifications module** with real, verified-accurate delivery (closing the "0 badge, contradicting activity" defect, `13_NOTIFICATION_STRATEGY.md`).
- **Explainability system** (`14_EXPLAINABILITY_SYSTEM.md`) built as infrastructure from day one, not retrofitted per-metric later — every metric shipped in every later phase depends on this existing first.

**Exit criteria**: no lead can be misrouted or misattributed; no metric ships without an explanation; no role exists without a scoped, auditable permission set.

## Phase 2 — Delivery (Operating layer core)

**Theme**: the day-to-day jobs work end-to-end.

- **Properties & Projects modules** — full lifecycle per `09_WORKFLOW_ARCHITECTURE.md`, including the numeric price schema and price-history table (a prerequisite `16_MODULE_SPECIFICATIONS.md` names explicitly) built from the start rather than retrofitted, unlike Tuba's current string-price-column debt.
- **Owners module** with Marketing Requests properly surfaced (`17_FEATURE_PRINCIPLES.md` worked example 2) — a low-effort, high-value fix given the underlying mechanic already works today.
- **Customers module**.
- **Today** (`15_DECISION_SUPPORT_SYSTEM.md`) — introduced once there's enough cross-module data (Leads + Properties + Owners) for its recommendations to be meaningful.
- **Wallet module**, preserving the genuinely well-executed current-platform package/tier pattern (`tuba-current-state/14_KEEP_IMPROVE_REMOVE.md` — explicitly a KEEP, not a rebuild-from-zero).

**Exit criteria**: a broker can run their full daily workflow (leads, listings, owner relationships) inside TBOS without needing the old platform or an external workaround (spreadsheet, WhatsApp-only tracking).

## Phase 3 — Discovery

**Theme**: brokers find what they need without leaving TBOS.

- **Search infrastructure** (`12_SEARCH_STRATEGY.md`) — the real relevance-engine replacement, sequenced here because it requires Phase 2's data model to be stable first.
- **Marketing module** with the mandatory eligibility pre-check (`09_WORKFLOW_ARCHITECTURE.md`), fixing the specific dead-end pattern found in Aqar.
- **Saved search as a live subscription** (`12_SEARCH_STRATEGY.md`) — finishing what Tuba's current platform started but never completed.
- **Knowledge module** — needed as the Explainability system's and Search's grounding content source before AI (Phase 4) can safely cite it.

**Exit criteria**: no list in the product requires scrolling a several-hundred-item flat control to find something (closing the live-confirmed `/property-requests` location-dropdown defect).

## Phase 4 — Intelligence

**Theme**: TBOS starts telling brokers what to do, not just what happened.

- **AI Strategy Foundation + Fast-Follow phases** (`10_AI_STRATEGY.md`): config-driven model management, queued execution, then AI Writing extended to every listing type, AI Search, Agent Copilot v1, Lead Scoring v1.
- **Automation module** made fully visible/editable (`11_AUTOMATION_STRATEGY.md`) — the rules existed as defaults since Phase 1–2, but this phase makes them a first-class, broker-configurable surface.
- **Analytics & Reports modules**, built on real Explainability contracts from day one.
- **Decision Support System matures**: pricing suggestions, content-quality scoring — gated on their stated data prerequisites (price-history, taxonomy) already being in place from Phase 2–3.

**Exit criteria**: Today reliably surfaces the platform's highest-value 3–5 recommendations daily, and a majority of brokers act on at least one.

## Phase 5 — Transaction

**Theme**: TBOS becomes the system of record for the deal, not just the marketing front-end.

- **Contracts module** — the accept/negotiate/document lifecycle Tuba's current schema designed for but never finished.
- **Finance module**.
- **Document Intelligence** (`10_AI_STRATEGY.md`) applied to compliance/contract documents.
- **Market Intelligence and AI Pricing** (`10_AI_STRATEGY.md`) — only now, once the price-history pipeline built in Phase 2 has accumulated enough real data to be useful, avoiding the "AI theater" risk explicitly named in `tuba-current-state/16_AI_READINESS.md`.

**Exit criteria**: a deal's full lifecycle — lead to contract to close — is tracked in TBOS with no external workaround required.

## Phase 6 — Expansion (Future Modules, per `16_MODULE_SPECIFICATIONS.md`)

Not scoped in detail here — this phase exists to confirm the architecture has room, which `16_MODULE_SPECIFICATIONS.md`'s Future Modules section already demonstrates for Mortgage, Insurance, Investment Analytics, Property Management, Developers, Auctions, Commercial, CRM/ERP-adjacent integrations, Marketplace formalization, and Partner APIs.

## Sequencing logic, restated

This is the same logic as `01_PRODUCT_VISION.md`'s Long-Term Strategy, applied concretely: **you cannot responsibly build Intelligence (Phase 4) on top of a platform where leads still misroute (fixed in Phase 1), and you cannot responsibly build Transaction (Phase 5) pricing intelligence on top of data that doesn't exist yet (built in Phase 2)** — every phase boundary above is a real dependency, not an arbitrary checkpoint, consistent with the Dependencies discipline `17_FEATURE_PRINCIPLES.md` requires of every individual feature.
</content>
