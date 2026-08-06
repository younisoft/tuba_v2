# 00 — Implementation Blueprint

Purpose of this document: establish the **canon** — the shared IDs, codes, and scales every other document in this folder uses without re-explaining. Read this once. Everything downstream assumes it.

## 1. Why this phase exists

`tbos-definition/` answers "what is TBOS and why." It deliberately stops before screens (`tbos-definition/20_NON_GOALS.md` §10: "TBOS is not designed in this phase"). That stop point is now the start point here. This blueprint answers, for every workflow a persona touches: what screen are they on, what does it do in every state, what components does it need, what does AI do here, what gets notified, and in what release does it ship.

**Test for completeness**: an engineer who has read `tbos-definition/` plus this folder, and nothing else, should be able to build any screen in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) without a follow-up product question. Where that's not yet true, the gap is named explicitly in [18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md) rather than papered over.

## 2. Persona codes

Used in every document that names "who" a screen, journey, or decision is for. Full definitions: `tbos-definition/04_PERSONAS.md`.

| Code | Persona | Shorthand meaning when you see it in a table |
|---|---|---|
| **SB** | Solo Broker | Single-user account, full owner-level access to everything below |
| **AO** | Agency Owner | Full agency-wide access including Finance, Team & Roles |
| **SM** | Sales Manager | Team leads/performance; no Finance/Wallet by default |
| **MM** | Marketing Manager | Properties/Projects/Owners/Marketing/Analytics; no Contracts/Finance |
| **OM** | Operations Manager | Contracts/Compliance/Analytics; read-only on Properties/Projects/Marketing |
| **PC** | Property Consultant | Own Leads/Customers/Contracts only; no team or agency-wide views |
| **ADM** | Administrator | Platform Console only — architecturally never sees a Broker OS screen |

`All` in a "Primary User" column means every persona above ADM, scoped by RBAC to their own records where applicable — not that every persona sees identical data.

## 3. Module codes and the three-layer map

Full architecture: `tbos-definition/06_PRODUCT_ARCHITECTURE.md`, `07_INFORMATION_ARCHITECTURE.md`. Restated here only as a lookup table, because every screen ID in this folder is `[MODULE]-[NN]`.

| Layer | Module codes |
|---|---|
| **Orientation** | `HOME`, `TODAY`, `TASK` |
| **Operating** | `PROP` (Properties), `PROJ` (Projects), `LEAD`, `CUST` (Customers), `OWN` (Owners), `CONT` (Contracts), `MKT` (Marketing) |
| **Intelligence & Control** | `FIN` (Finance), `WAL` (Wallet), `ANL` (Analytics), `RPT` (Reports), `AUTO` (Automation), `AICP` (AI Copilot), `NOTIF` (Notifications), `KB` (Knowledge), `SET` (Settings) |
| **Cross-cutting (no fixed nav slot)** | `GS` (Global Search), `QA` (Quick Actions), `CMD` (Command Palette), `ONB` (Onboarding) |
| **Platform Console (ADM only, separate system)** | `PC` |

## 4. Screen ID canon (full list — detail in 04)

49 screens total: 40 Broker OS + 4 cross-cutting overlays + 5 Platform Console. Every screen referenced anywhere in this folder uses this ID. [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) is the authoritative detail for each; this table is the index.

| ID | Screen | Module |
|---|---|---|
| HOME-01 | Home | Orientation |
| TODAY-01 | Today | Orientation |
| TASK-01 | Tasks List | Orientation |
| TASK-02 | Task Detail (panel) | Orientation |
| PROP-01 | Properties List | Operating |
| PROP-02 | Property Detail | Operating |
| PROP-03 | Create/Edit Property (wizard) | Operating |
| PROJ-01 | Projects List | Operating |
| PROJ-02 | Project Detail | Operating |
| PROJ-03 | Create/Edit Project (wizard) | Operating |
| LEAD-01 | Leads Pipeline (stage view) | Operating |
| LEAD-02 | Leads Inbox (chronological view) | Operating |
| LEAD-03 | Lead Detail | Operating |
| CUST-01 | Customers List | Operating |
| CUST-02 | Customer Detail | Operating |
| OWN-01 | Owners List | Operating |
| OWN-02 | Owner Detail | Operating |
| OWN-03 | Marketing Requests Queue | Operating |
| CONT-01 | Contracts List | Operating |
| CONT-02 | Contract Detail | Operating |
| MKT-01 | Campaigns List | Operating |
| MKT-02 | Campaign Create/Detail | Operating |
| MKT-03 | Content Quality Queue | Operating |
| FIN-01 | Finance Overview | Intelligence |
| WAL-01 | Wallet Overview | Intelligence |
| WAL-02 | Package/Subscription Detail & Upgrade | Intelligence |
| ANL-01 | Analytics Explorer | Intelligence |
| RPT-01 | Reports List | Intelligence |
| RPT-02 | Report Detail/Builder | Intelligence |
| AUTO-01 | Automation Rules List | Intelligence |
| AUTO-02 | Automation Rule Editor | Intelligence |
| AICP-01 | AI Copilot Conversation | Intelligence |
| AICP-02 | AI Action Audit Log | Intelligence |
| NOTIF-01 | Notification Center | Intelligence |
| NOTIF-02 | Notification Preferences | Intelligence |
| KB-01 | Knowledge Home/Search | Intelligence |
| KB-02 | Knowledge Article Detail | Intelligence |
| SET-01 | Account & Profile | Intelligence |
| SET-02 | Team & Roles (RBAC config) | Intelligence |
| SET-03 | Integrations | Intelligence |
| SET-04 | Compliance Documents | Intelligence |
| GS-01 | Global Search Results | Cross-cutting |
| QA-01 | Quick Actions panel | Cross-cutting |
| CMD-01 | Command Palette | Cross-cutting |
| ONB-01 | Guided Onboarding | Cross-cutting |
| PC-01 | Moderation Queue | Platform Console |
| PC-02 | Reference Data Manager | Platform Console |
| PC-03 | Compliance Oversight | Platform Console |
| PC-04 | Support Tools | Platform Console |
| PC-05 | Platform Settings | Platform Console |

## 5. Workflow codes

Matches `tbos-definition/09_WORKFLOW_ARCHITECTURE.md` exactly — no renaming. Used in [01](01_EXPERIENCE_ARCHITECTURE.md) and [03](03_USER_JOURNEYS.md).

`WF-PROPERTY-NEW`, `WF-LEAD-NEW`, `WF-OWNER-NEW`, `WF-CONTRACT-NEW`, `WF-MARKETING-CAMPAIGN`, `WF-PRICE-CHANGE`, `WF-LISTING-EXPIRED`, `WF-LISTING-REJECTED`, `WF-COMPLIANCE`, `WF-RENEWAL`, `WF-PUBLISHING`, `WF-ARCHIVING`, `WF-DELETION`, `WF-AUTOMATION` (cross-cutting, not a standalone user flow).

## 6. Shared scales used across this folder

**Priority** (matches `tbos-definition/17_FEATURE_PRINCIPLES.md` / `tuba-current-state/17_IMPLEMENTATION_PRIORITIES.md`): P0 blocking, P1 next, P2 valuable, P3 later.

**Readiness** (defined fully in [13](13_FEATURE_READINESS_MATRIX.md)): Ready · Needs UX Validation · Needs Business Validation · Needs Legal Review · Needs Backend · Needs AI · Blocked.

**Notification urgency** (matches `tbos-definition/13_NOTIFICATION_STRATEGY.md`): Critical · High · Medium · Low.

**AI confidence disclosure** (defined in [08](08_AI_INTERACTION_BLUEPRINT.md)): every AI output ships with one of High / Medium / Low confidence, visible to the user, never hidden.

**State taxonomy** (full definition in [06](06_STATE_ARCHITECTURE.md)): every screen is specified against the same nine cross-cutting states — Empty, Loading, Offline, No Permission, Error, Draft/Pending, Active/Ready, Restricted (payment/subscription/license), Archived/Deleted — plus record-specific lifecycle states owned by each module (e.g. Property's 8-state lifecycle, Lead's pipeline stages).

## 7. Non-negotiables this blueprint will not re-litigate

Carried forward as fixed constraints on every document that follows:

1. **One home per capability** — a screen ID appears exactly once in the canon table above. If a capability seems to need a second entry point, [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md)'s contextual-navigation pattern (inline panel, not a new route) is the answer, never a duplicate screen.
2. **Broker OS / Platform Console separation is absolute** — PC-01 through PC-05 never appear in a Broker OS nav tree, never share a route prefix, session, or login surface with any other screen in the table. Per `tbos-definition/00_PRODUCT_CONSTITUTION.md` Article V, this is treated as settled architecture, specified here only where Broker OS behavior must acknowledge it exists (e.g., a moderation rejection reaching a broker's `PROP-02`).
3. **Explainability contract is binding, not aspirational** — any screen in [04](04_SCREEN_INVENTORY.md) that surfaces a score, metric, or AI output must satisfy the five-question contract from `tbos-definition/14_EXPLAINABILITY_SYSTEM.md`; [07_DECISION_SUPPORT_SYSTEM.md](07_DECISION_SUPPORT_SYSTEM.md) operationalizes this per-widget.
4. **Sequencing is Trust → Delivery → Discovery → Intelligence → Transaction** — [14](14_DEVELOPMENT_BLUEPRINT.md) and [15](15_RELEASE_PLAN.md) inherit this order from `tbos-definition/19_PRODUCT_ROADMAP.md`; they add screen-level and dependency-level granularity, they do not re-sequence it.
5. **Phase 0 security prerequisites gate everything** — the 7 Critical findings in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4 (hardcoded password, OTP bypass, unverified Nafath signature, disabled TLS, unauthenticated payment fulfilment, mass-delete IDOR, unguarded admin controllers) must close before any release in [15_RELEASE_PLAN.md](15_RELEASE_PLAN.md) ships, independent of feature readiness.

## 8. Document dependency map

```
tbos-definition/ (fixed input, never edited by this folder)
        │
        ▼
00 Implementation Blueprint  ── canon: IDs, codes, scales
        │
        ├──► 01 Experience Architecture ──► 03 User Journeys ──► 04 Screen Inventory
        │                                                              │
        │                                                              ├──► 05 Component Mapping
        │                                                              ├──► 06 State Architecture
        │                                                              └──► 11 Accessibility Blueprint
        │
        ├──► 02 Navigation Blueprint  (consumes 04's screen list)
        ├──► 07 Decision Support System   (consumes 04 + Today's role)
        ├──► 08 AI Interaction Blueprint  (consumes 01's AI-intervention points)
        ├──► 09 Notification Blueprint    (consumes 01 + 08's triggers)
        ├──► 10 Search Experience         (consumes 02's search-first rule)
        └──► 12 Motion Philosophy         (consumes 06's state transitions)

04 + 05 + 06 + 07 + 08 + 09 + 10  ──►  13 Feature Readiness Matrix
                                              │
                                              ▼
                                    14 Development Blueprint
                                              │
                                              ▼
                                    15 Release Plan
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                  16 Implementation   17 Acceptance    18 Open Questions
                       Checklist          Criteria
                              │               │               │
                              └───────────────┴───────────────┘
                                              ▼
                                19 Master Mermaid Diagrams (index of all diagrams/*.mmd)
```

## 9. Terminology guardrails

Two terms are easy to conflate; every document in this folder uses them per `tbos-definition/21_GLOSSARY.md`, never interchangeably:

- **Today (TODAY-01)** is a *view* — a derived, ranked worklist. It is never the only place an action can be taken; every recommendation it shows also lives on the record it concerns (e.g., a pricing nudge on TODAY-01 also appears on PROP-02).
- **Tasks (TASK-01/02)** are *durable, assignable, checkable* records — the opposite of a derived view. A Task can exist with nothing algorithmic behind it (a manager assigns one manually).

Confusing these two in a spec is treated as a defect per Constitution Article IV.
