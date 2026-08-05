# 07 — Information Architecture

**Status**: Recommended. Defines the structural hierarchy of TBOS — what contains what, and which persona sees which branch. Device-specific navigation *behavior* (how this hierarchy is presented on desktop/tablet/mobile, search-first patterns, quick actions) is specified separately in `08_NAVIGATION_SYSTEM.md`. Diagram: `diagrams/architecture.mmd`.

---

## The two-system split (restated from `06_PRODUCT_ARCHITECTURE.md`)

```
TBOS
├── Broker OS          (all persona logins except Administrator)
└── Platform Console    (Administrator only — fully separate route space, subdomain, and session)
```

This split is the single most load-bearing IA decision in this document. Tuba's current platform's worst-rated architectural finding is that admin and broker share one route group, one controller set, one Blade layout (`tuba-current-state/11_TECHNICAL_ARCHITECTURE.md`) — every downstream authorization bug in the current platform traces back to this. TBOS does not carry this decision forward under any circumstance, including "just for v1."

## Broker OS hierarchy

```
Broker OS
├── Home                                    [Orientation]
├── Today                                   [Orientation]
├── Tasks                                   [Orientation]
├── Properties                              [Operating]
│   ├── All Properties (filterable list)
│   ├── Property Detail
│   │   ├── Overview / Media / Compliance / Performance / History (tabs, not sub-pages)
│   └── Create Property (single guided wizard — see 09_WORKFLOW_ARCHITECTURE.md)
├── Projects                                [Operating]
│   ├── All Projects
│   ├── Project Detail (Overview / Units / Media / Compliance / Performance)
│   └── Create Project
├── Leads                                   [Operating]
│   ├── Pipeline (stage view — default)
│   ├── Inbox (chronological view — alternate, same data)
│   └── Lead Detail (unified: buyer-inbound + owner-originated demand)
├── Customers                               [Operating]
│   ├── All Customers
│   └── Customer Detail (relationship history, linked leads/deals)
├── Owners                                  [Operating]
│   ├── All Owners
│   ├── Owner Detail
│   └── Marketing Requests (surfaced here AND in Today when relevant — see note below)
├── Contracts                               [Operating]
│   ├── All Contracts (by stage: Draft / Pending Compliance / Active / Renewal Due / Closed)
│   └── Contract Detail
├── Marketing                               [Operating]
│   ├── Campaigns
│   └── Content Quality (AI-assisted review queue)
├── Finance                                 [Intelligence]
├── Wallet                                  [Intelligence]
│   ├── Packages & Subscriptions
│   └── Credit Balance
├── Analytics                               [Intelligence]
├── Reports                                 [Intelligence]
├── Automation                              [Intelligence]
├── AI Copilot                              [Intelligence — thin surface, see 06 §AI Copilot]
├── Notifications (center + preferences)    [Intelligence]
├── Knowledge                               [Intelligence]
└── Settings                                [Intelligence]
    ├── Account & Profile
    ├── Team & Roles (RBAC configuration)
    ├── Integrations
    └── Compliance Documents (Nafath/FAL/REGA credentials)
```

**Note on Marketing Requests placement**: this is the one deliberate exception to strict single-placement, and it's principled, not accidental — a Marketing Request is simultaneously "a thing this Owner wants" (belongs in Owners) and "an opportunity requiring action right now" (belongs in Today when it's new/hot). This is not the same failure as Aqar's duplicate navigation systems (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §3) — Today is explicitly designed as a *derived, temporary surface* pointing back to one canonical record in Owners, not a second independent place to manage the data. The distinction is: Today never lets you *do* something Owners can't; it only surfaces *when* to look.

## Platform Console hierarchy (Administrator — scoped, not detailed in this phase)

```
Platform Console
├── Moderation Queue
├── Reference Data (Cities, Categories, Property Types, Districts)
├── Compliance Oversight (platform-wide, not per-broker)
├── Support Tools
└── Platform Settings
```

Full specification of the Platform Console is out of scope for this phase (see `20_NON_GOALS.md`) — it is included here only to make explicit that it is architecturally separate, per the split above.

## Role-based visibility within the Broker OS

The hierarchy above is **one tree**, not seven persona-specific trees — per Philosophy Principle #10, there is exactly one navigation system. What changes per persona (`04_PERSONAS.md`) is which branches are visible/actionable, governed by the RBAC model configured in Settings → Team & Roles:

| Persona | Sees full tree? | Notable restrictions |
|---|---|---|
| Solo Broker | Yes (they own everything) | N/A — single-user account |
| Agency Owner | Yes | N/A |
| Sales Manager | Yes, except Finance/Wallet by default | Can be granted Finance read access |
| Marketing Manager | Properties, Projects, Owners, Marketing, Analytics, Knowledge | No access to Leads pipeline internals beyond Marketing-Request-linked leads; no Contracts/Finance |
| Operations Manager | Contracts, Settings→Compliance Documents, Knowledge, full Analytics | Read-only on Properties/Projects/Marketing |
| Property Consultant | Their own Leads/Customers/Contracts only | No Team & Roles, no Finance, no agency-wide Analytics |
| Administrator | Platform Console only | Zero access to any Broker OS branch, by architecture, not by permission flag |

This table is the concrete, testable rendering of the RBAC opportunity named across `04_PERSONAS.md` and `13_GAP_ANALYSIS.md` — a role is a defined subset of one tree, not a separate product.

## Cross-cutting access patterns (apply to every branch)

- **Global search** (see `12_SEARCH_STRATEGY.md`) reaches every entity in this tree from any screen — a broker should never need to navigate to "Customers" to find a customer if they can just search.
- **Quick actions** (see `08_NAVIGATION_SYSTEM.md`) provide a shortcut layer on top of this tree for the highest-frequency jobs (`05_JOBS_TO_BE_DONE.md` ranks 1–4) so a broker is never more than one action away from "create lead," "add property," "log a call."
- **Contextual navigation**: every detail page (Property, Lead, Contract, Owner) surfaces its directly-related records inline (a Property Detail page shows its linked Leads and its Contract without navigating away) — this is what prevents the tree above from feeling like 19 disconnected silos.
</content>
