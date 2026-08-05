# 06 — Product Architecture

**Status**: Recommended. This is TBOS's module map — deliberately not a copy of Bayut's or Aqar's structure, and deliberately not a copy of Tuba's current admin-CMS-shaped module list (`tuba-current-state/02_PRODUCT_INVENTORY.md`). Each module is justified by the Jobs To Be Done it serves (`05_JOBS_TO_BE_DONE.md`) and the persona(s) that live in it (`04_PERSONAS.md`).

---

## Architectural premise

Tuba's current platform has no architectural boundary between "admin panel" and "broker dashboard" — same controllers, same views, same route group, differentiated only by a runtime role check (`tuba-current-state/11_TECHNICAL_ARCHITECTURE.md`). **TBOS inverts this.** There are two structurally separate surfaces from the ground up:

1. **The Broker OS** — everything below, used by every persona in `04_PERSONAS.md` except Administrator.
2. **The Platform Console** — a fully separate route space, login surface, and module set for the Administrator persona (see `07_INFORMATION_ARCHITECTURE.md`). It is out of scope for detailed specification in this phase beyond stating that it must exist as a separate system, not a role flag on the same one.

The Broker OS itself is organized around **three layers**, not a flat list:

- **Orientation layer** (Home, Today, Tasks): answers "what needs my attention right now." Every persona's first screen.
- **Operating layer** (Properties, Projects, Leads, Customers, Owners, Contracts, Marketing): where the actual jobs from `05_JOBS_TO_BE_DONE.md` get done.
- **Intelligence & control layer** (Finance, Wallet, Analytics, Reports, Automation, AI Copilot, Notifications, Knowledge, Settings): where a broker understands and configures how the operating layer behaves.

## Orientation Layer

### Home
**Why it exists**: the account-level front door — identity, entitlement status, and a portfolio-level summary. Distinct from Today (below) because Home answers "how is my business doing," not "what do I do next." Replaces Tuba's current dashboard, which conflates both jobs into one screen with several fake/decorative metrics (`tuba-current-state/07_UX_AUDIT.md`).

### Today
**Why it exists**: the single most important new module relative to Tuba's current platform, which has no equivalent. A prioritized, cross-module worklist — leads to follow up, licenses expiring, offers awaiting response, team members needing attention — generated, not manually curated. This is the literal implementation of Design Principle #8 (Decision-first, not statistics-first) and Philosophy Principle #1 (Action over information). Every persona lands here or on Home first.

### Tasks
**Why it exists**: the durable, checkable counterpart to Today's ephemeral priority feed — reminders, assigned follow-ups, compliance to-dos, team-delegated items. Today shows what matters *now*; Tasks is the full list, including things due later, assignable to a team member (serves Job 6: manage and coach the team).

## Operating Layer

### Properties
**Why it exists**: the core listing-management module (Job 2). Structurally separate from Projects (below), matching Tuba's own existing, real distinction between individual-unit listings and developer projects — but rebuilt without the dual-form/dead-code debt documented in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`.

### Projects
**Why it exists**: developer/multi-unit inventory has a genuinely different data shape (units, floor plans, phased availability) from a single property — keeping it a distinct module (rather than folding it into Properties, as some of Tuba's current UI inconsistently does) avoids re-introducing the model-duplication debt (`Property`/`Project` sharing no trait) found in the current codebase.

### Leads
**Why it exists**: Job 1, the platform's highest-frequency, worst-currently-executed job. This is the unified pipeline the TBX synthesis and the current-state gap analysis both call for — ingesting buyer-inbound contact (`PropertyRequest`-equivalent) and owner-originated demand (Marketing-Requests-equivalent) into one scored, staged, SLA-timed system (`tuba-current-state/13_GAP_ANALYSIS.md` §3, §4). Structurally distinct from the Customers module (below) because a Lead is not yet a relationship — it's a signal to be triaged.

### Customers
**Why it exists**: once a lead becomes an ongoing relationship (a buyer actively touring properties, a repeat client), it needs a persistent record independent of any single listing — something no module in Tuba's current platform provides (leads are transactional records tied to a `PropertyRequest`/`AgentInboxRequest`, not a person). Serves Job 4 (negotiate and close) and Job 9 (build trust) by giving every persona a single view of "everything about this person," not a scattered history across inbox entries.

### Owners
**Why it exists**: the property-supply-side counterpart to Customers — the person or entity a listing is being marketed *for*. This is where Marketing Requests (Job 3) live structurally: an Owner record is the natural home for "this owner wants their property marketed," not a generic request-list buried in a tab the way it is on Tuba's current platform today (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3). Separating Owners from Customers is a deliberate TBOS decision — conflating supply-side and demand-side relationships into one generic "contacts" module was not done by any audited platform and is not repeated here.

### Contracts
**Why it exists**: Job 4 (negotiate and close) and Job 5 (compliance) currently have no structured home at all — an accepted offer is tracked nowhere (`PropertyRequestOffer`'s accept-fields exist in Tuba's current schema but are never populated, per `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`). Contracts is where a deal becomes a documented, auditable transaction — REGA ad-license, Wasata-equivalent brokerage agreement, and the eventual sale/lease contract all live here as one lifecycle, not scattered across Payment, Property, and manual messaging the way they effectively are today.

### Marketing
**Why it exists**: Job 7 and Job 13 — campaign/promotion management, distinct from the Marketing Requests *inbound* flow (which lives in Owners/Leads). This module is where a broker manages *outbound* effort: boosted listings, content quality, campaign performance. Kept separate from Leads/Owners because "managing my own promotional spend" and "triaging what came in" are different jobs with different cadences.

## Intelligence & Control Layer

### Finance
**Why it exists**: revenue, commission tracking, and the financial view of Contracts — kept distinct from Wallet (below) because Finance is the *reporting/record* layer (what was earned, what's owed) while Wallet is the *spendable-balance* layer (see next). Serves the Agency Owner and Operations Manager personas directly.

### Wallet
**Why it exists**: package/quota entitlements and any spendable credit balance — the module home for the genuinely well-executed package system already live in Tuba's current platform (`tuba-current-state/04_PAGE_ANALYSIS.md`, `/agent-packages`). Kept as its own module (not folded into Finance or Settings) because it's a daily-relevant balance a broker checks before taking an action (can I boost this listing, do I have license capacity), not a monthly report.

### Analytics
**Why it exists**: the "how am I doing" layer, replacing Tuba's current decorative charts and hardcoded tiles with real, explained metrics (per `14_EXPLAINABILITY_SYSTEM.md`). Distinct from Reports (below) because Analytics is exploratory/live, Reports is a generated, shareable artifact.

### Reports
**Why it exists**: Job 12 — generated, exportable, shareable documents (for owners, for internal review, for compliance). Tuba's current platform has an installed-but-unused export capability (`web-project-audit/05_ADMIN_PANEL.md`) — TBOS makes this a first-class module rather than a buried "export" button.

### Automation
**Why it exists**: the configuration surface for everything `11_AUTOMATION_STRATEGY.md` defines — lead-routing rules, renewal reminders, auto-follow-ups. Made visible and editable as its own module (not hidden in Settings) because automation rules are something brokers and managers actively tune, not a one-time setup step.

### AI Copilot
**Why it exists**: per Philosophy Principle #3, AI is embedded everywhere, not confined to a page — but a **thin, dedicated surface still exists** for two purposes only: (a) a conversational entry point for ambiguous/open-ended requests that don't map to a specific workflow ("draft a market update for my top 5 clients"), and (b) a single place to review/audit what AI has done on the broker's behalf (every AI-drafted reply, every auto-generated description) — an explainability requirement, not a chat-app feature. See `10_AI_STRATEGY.md`.

### Notifications
**Why it exists**: the delivery and preference-management layer for everything `13_NOTIFICATION_STRATEGY.md` defines. A first-class module (not an icon with a dropdown) because — unlike Tuba's current platform, where notifications are database-only with no real delivery (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`) — TBOS notifications span in-app, email, SMS, WhatsApp, and push, and a broker needs a real place to control that.

### Knowledge
**Why it exists**: compliance guidance, platform help, and (per Philosophy Principle #2) the explanatory content every metric/status links out to. Named "Knowledge" rather than "Help" because it also houses the AI's grounding content (FAQ-bot source material, per `tuba-current-state/16_AI_READINESS.md`'s Conversational Assistant recommendation) — one module serves both a human reading it and an AI citing it.

### Settings
**Why it exists**: account, team/role management (the real RBAC surface — see `04_PERSONAS.md`'s closing note), integrations, and preferences. Deliberately the *last* module in this list — Settings is where a broker goes to configure the system, not where they do their job, and TBOS's information architecture (`07_INFORMATION_ARCHITECTURE.md`) reflects that ordering.

---

## What is deliberately not a top-level module

Per Philosophy Principle #10 (one home per capability), several things Tuba's current platform treats as top-level navigation items are deliberately *not* top-level modules in TBOS:

- **License/Package administration** — lives inside Wallet, not as a separate nav item (avoiding the exact duplication — "الباقات" appearing twice in Tuba's current sidebar — confirmed live in `tuba-current-state/03_INFORMATION_ARCHITECTURE.md`).
- **Team/sub-user management** — lives inside Settings, not a separate module, because it's a configuration act, not a daily job.
- **Favorites** — folded into Customers/Owners as a saved-relationship state, not a standalone module; Tuba's current platform treats it as a separate CRUD resource with no clear job attached.
</content>
