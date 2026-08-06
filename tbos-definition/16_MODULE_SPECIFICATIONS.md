# 16 — Module Specifications

**Status**: Recommended. This document operationalizes each module named in `06_PRODUCT_ARCHITECTURE.md` with core entities, key capabilities, state requirements, and cross-module dependencies. It does not specify screens, layouts, or components — that is explicitly out of scope for this phase (`20_NON_GOALS.md`). This is the layer between "why the module exists" (06) and "what feature gets built when" (`19_PRODUCT_ROADMAP.md`).

---

For every module: **Core Entities** (what data it owns), **Key Capabilities** (what a persona can do), **Required States** (per `03_DESIGN_PRINCIPLES.md` — empty/loading/error/success must be specified, not assumed), **Depends On** (which other modules it cannot function without).

## Home
- **Core Entities**: none owned — an aggregation view over Wallet, Analytics, and Properties/Projects/Leads counts.
- **Key Capabilities**: account status at a glance; entry point to Today.
- **Required States**: new-account state (a broker with zero listings/leads yet) must be a guided onboarding view, not a blank dashboard — a direct fix for Tuba's current platform, which has no first-run experience distinct from an active account's dashboard.
- **Depends On**: Wallet, Analytics.

## Today
- **Core Entities**: Recommendation (system-generated, references any other entity), Priority score.
- **Key Capabilities**: see `15_DECISION_SUPPORT_SYSTEM.md` in full — this module's entire spec lives there.
- **Required States**: a genuinely empty Today (nothing needs attention) is a positive, explicit state ("You're all caught up") — never rendered as a blank/broken-looking screen, distinct from a loading state.
- **Depends On**: every Operating-layer module (it's a derived view across all of them).

## Tasks
- **Core Entities**: Task (title, due date, assignee, linked record, status).
- **Key Capabilities**: create/assign/complete; recurring tasks (for periodic compliance checks); team delegation (Sales Manager → Property Consultant).
- **Required States**: overdue tasks visually distinct from upcoming ones; empty state per module ("No tasks — add one or wait for automation to create them").
- **Depends On**: Automation (many tasks are system-created), Notifications (task reminders).

## Properties
- **Core Entities**: Property (status, compliance data, media, pricing — numeric, not string, fixing `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`'s schema finding), Price History (new — does not exist in Tuba's current schema).
- **Key Capabilities**: full lifecycle per `09_WORKFLOW_ARCHITECTURE.md`'s New Property/Price Change/Expired/Rejected/Publishing/Archiving/Deletion workflows.
- **Required States**: Draft, Pending Compliance, Active, Expiring, Expired, Rejected, Sold/Rented, Archived — each a real, distinct state (not the ambiguous mix of legacy/current form states observed in Tuba's current platform, `tuba-current-state/04_PAGE_ANALYSIS.md`).
- **Depends On**: Wallet (publishing consumes quota), AI Strategy (description/quality assist), Leads (linked inquiries).

## Projects
- **Core Entities**: Project, Unit (child entity — floor plan, availability, price).
- **Key Capabilities**: same lifecycle as Properties, plus per-unit availability management.
- **Required States**: same set as Properties, applied per-unit as well as per-project (a Project can be "Active" while individual Units are "Sold").
- **Depends On**: same as Properties.

## Leads
- **Core Entities**: Lead (source: buyer-inbound or owner-originated; stage; score; SLA state; assignee).
- **Key Capabilities**: intake, auto-routing, scoring, reply (two-way, in-platform — the direct fix for `tuba-current-state/05_FEATURE_CATALOG.md`'s "does not exist" finding), stage progression to Contracts.
- **Required States**: New, Assigned, Contacted, Qualified, Negotiating, Won (→ Contract), Lost (with reason — closing the "no lost-lead reasons" gap named in the July self-audit's CRM recommendations).
- **Depends On**: Automation (routing), AI Strategy (scoring, reply drafting), Notifications, Customers/Owners (relationship linking).

## Customers
- **Core Entities**: Customer (contact info, relationship history, linked Leads/Contracts).
- **Key Capabilities**: unified relationship view; merge/duplicate resolution (`10_AI_STRATEGY.md`'s Duplicate Detection).
- **Required States**: new/prospective vs. active-relationship vs. past-client — distinct states inform whether Decision Support recommends re-engagement.
- **Depends On**: Leads (source), Contracts (relationship history).

## Owners
- **Core Entities**: Owner, Marketing Request (child entity — the currently-buried, real, monetized mechanic, `tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3).
- **Key Capabilities**: relationship management; Marketing Request intake and offer-submission tracking (preserving the working commission-percentage-offer mechanic confirmed live in Tuba's current platform).
- **Required States**: Marketing Requests need the same Won/Lost-with-reason discipline as Leads — currently absent even for the working parts of this feature.
- **Depends On**: Wallet (Marketing Request access can be package-tier-gated, matching the real, confirmed-live current-platform pattern), Today (surfacing).

## Contracts
- **Core Entities**: Contract (type, stage, linked Lead/Customer/Owner/Property, compliance documents, terms).
- **Key Capabilities**: the accept/negotiate flow Tuba's current schema designed for but never built (`PropertyRequestOffer`'s unpopulated fields, `tuba-current-state/15_CURRENT_STATE_VS_TARGET_STATE.md` §3); document generation; e-signature integration point (external, not built by TBOS itself — see `20_NON_GOALS.md`).
- **Required States**: Draft, Pending Compliance, Active, Renewal Due, Closed, Cancelled.
- **Depends On**: Leads/Customers/Owners (source relationship), Automation (renewal reminders), Knowledge (compliance requirement explanations).

## Marketing
- **Core Entities**: Campaign (linked inventory, spend, package/tier), Content Quality Score.
- **Key Capabilities**: campaign creation with mandatory eligibility pre-check (`09_WORKFLOW_ARCHITECTURE.md`'s Marketing Campaign workflow — the direct fix for Aqar's confirmed dead-end pattern), content-quality review queue.
- **Required States**: a campaign cannot be started with zero eligible inventory — this state is prevented at the entry point, not discovered as an error.
- **Depends On**: Wallet (spend), AI Strategy (content quality scoring), Properties/Projects (eligible inventory).

## Finance
- **Core Entities**: Revenue record, Commission record — derived from closed Contracts.
- **Key Capabilities**: agency-level and per-consultant financial reporting.
- **Required States**: N/A (primarily a reporting surface, not a stateful workflow entity).
- **Depends On**: Contracts (source of truth for all financial events).

## Wallet
- **Core Entities**: Package/Subscription (tier, term), Credit Balance, Quota Usage.
- **Key Capabilities**: package selection/upgrade (preserving the genuinely well-executed current-platform pattern confirmed live in `tuba-current-state/04_PAGE_ANALYSIS.md`), quota consumption tracking across Properties/Projects/Marketing.
- **Required States**: no dead "no data found" tiers — every advertised package/tier must have real content behind it before it's visible, the direct fix for the confirmed-live `/developer-packages` dead end (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §6).
- **Depends On**: none (Wallet is close to a foundational/leaf module other modules depend on).

## Analytics
- **Core Entities**: none owned — a query layer over every other module's data, plus the Explainability contract (`14_EXPLAINABILITY_SYSTEM.md`) attached to each metric.
- **Key Capabilities**: exploratory, real-time views; every metric traces to real data, never a decorative placeholder (the direct fix for `tuba-current-state/07_UX_AUDIT.md`'s finding).
- **Required States**: an Analytics view with insufficient data explicitly says so ("Not enough data yet — check back after your first 10 listings") rather than rendering an empty or fabricated chart.
- **Depends On**: every module (read-only).

## Reports
- **Core Entities**: Report (generated artifact, schedule, recipients).
- **Key Capabilities**: scheduled and on-demand generation; export (finishing the installed-but-unused export capability noted in `web-project-audit/05_ADMIN_PANEL.md`).
- **Required States**: generation-in-progress vs. ready vs. failed (with a retry path) — never a silent failure.
- **Depends On**: Analytics (data source).

## Automation
- **Core Entities**: Automation Rule (trigger, condition, action, editable by an authorized persona).
- **Key Capabilities**: see `11_AUTOMATION_STRATEGY.md` in full.
- **Required States**: every rule shows its last-run status and outcome — an automation a broker can't verify ran is not trustworthy automation.
- **Depends On**: Notifications (delivery), every workflow-bearing module (execution target).

## AI Copilot
- **Core Entities**: Conversation (open-ended requests), AI Action Log (audit trail of every embedded AI action platform-wide).
- **Key Capabilities**: see `10_AI_STRATEGY.md` — this module is intentionally thin; most AI capability lives embedded elsewhere.
- **Required States**: every logged AI action shows its Explainability contract (`14_EXPLAINABILITY_SYSTEM.md`) — this module doubles as the audit surface for all AI activity, not just a chat log.
- **Depends On**: every module (as the audit layer).

## Notifications
- **Core Entities**: Notification (type, channel, read state), Preference (per-type channel opt-in/out).
- **Key Capabilities**: see `13_NOTIFICATION_STRATEGY.md` in full.
- **Required States**: the unread count must always be real (a binding requirement given the live-observed "0" badge with contradicting account activity in Tuba's current platform, `tuba-current-state/07_UX_AUDIT.md`).
- **Depends On**: every module (as event sources).

## Knowledge
- **Core Entities**: Article (compliance guidance, help content), FAQ.
- **Key Capabilities**: search, AI-grounding source (`10_AI_STRATEGY.md`'s Knowledge Base capability), Explainability deep-link target.
- **Required States**: N/A — a content module.
- **Depends On**: none (a foundational/leaf module).

## Settings
- **Core Entities**: Account, Role (RBAC definition), Integration credential, Compliance credential (Nafath/FAL/REGA).
- **Key Capabilities**: the real RBAC surface — role creation, scoped permission assignment (the direct fix for `tuba-current-state/04_PAGE_ANALYSIS.md`'s finding that Team Management today has zero role/permission UI at all).
- **Required States**: a role cannot be deleted while still assigned to an active user without an explicit reassignment step — closing the "no protection against deleting core role IDs" gap named in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`.
- **Depends On**: none (a foundational module every other module's RBAC checks depend on).

---

## Future Modules (room for expansion, not built in v1)

Per the Master Prompt's explicit instruction to design room for future expansion without building prematurely (`20_NON_GOALS.md` governs what TBOS v1 does *not* attempt):

| Future module | Relationship to TBOS v1 architecture |
|---|---|
| **Mortgage** | Extends Contracts with a financing-partner integration point; does not require new top-level IA |
| **Insurance** | Same pattern as Mortgage — a Contract-adjacent partner integration |
| **Investment / Investment Analytics** | Extends Analytics with portfolio-level, cross-property intelligence once Market Intelligence (`10_AI_STRATEGY.md`) data infrastructure matures |
| **Property Management** (tenant/maintenance) | A genuinely new module, deliberately not designed in this phase — it has a different persona set (tenants) TBOS v1's persona list (`04_PERSONAS.md`) does not include |
| **Developers** (a distinct persona/account type, not just the Projects module) | Would require its own persona definition and likely its own IA branch — noted as a real gap Tuba's current platform's now-defunct "Developer Packages" tier gestured at without completing (`tuba-current-state/13_GAP_ANALYSIS.md`) |
| **Auctions** | Extends Marketing with a bid-based visibility mechanic — informed by, but not copied from, Aqar's District Broker auction (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §2), gated on a quality bar TBOS's RBAC/trust foundation would need to provide first |
| **Commercial (real estate)** | Extends Properties' taxonomy, not a new module — commercial listings have different attributes, not a different workflow |
| **CRM (standalone/external-facing)** | TBOS's Leads/Customers/Owners modules already are a CRM for broker-internal use; a future standalone/API-exposed CRM product is a packaging decision, not an architecture change |
| **ERP / Accounting** | Explicitly a non-goal for TBOS itself (`20_NON_GOALS.md`) — the Finance module's future path is *integration* with dedicated accounting software, not building one |
| **Marketplace** (consumer-facing) | Already exists adjacent to TBOS as Tuba's current public site — TBOS is the broker-side operating system that *feeds* the marketplace, not the marketplace itself; this relationship should be formalized, not merged |
| **Partner APIs** | A natural extension of the Contracts/Finance modules' external-integration points (mortgage, insurance, e-signature) — TBOS's module boundaries are designed so these integration points don't require re-architecture to expose |

Every future module above extends an existing module's boundary rather than requiring a new top-level IA branch, by design — this is the direct payoff of the module architecture in `06_PRODUCT_ARCHITECTURE.md` being organized around broker jobs rather than around whatever data happened to exist, the mistake `tuba-current-state/11_TECHNICAL_ARCHITECTURE.md` found in Tuba's current platform's ad hoc module growth.
</content>
