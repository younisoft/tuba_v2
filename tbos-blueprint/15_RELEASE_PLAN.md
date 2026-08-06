# 15 — Release Plan

What ships in each release and its exit criteria, in product/stakeholder-facing terms. Build order and technical dependencies are [14_DEVELOPMENT_BLUEPRINT.md](14_DEVELOPMENT_BLUEPRINT.md); this document restates each release as a shippable increment — what a broker actually gets, which persona it serves first, and which `18_SUCCESS_METRICS.md` metric it's meant to move.

**No calendar dates are given.** Team size and velocity aren't inputs this blueprint has — assigning fake dates would violate Design Principle "Trust" applied to planning itself. Release numbers (R0–R7) denote sequence, not duration; converting sequence to a calendar is a [18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md) item for whoever staffs the build.

## R0 — Prerequisites

- **Ships**: nothing broker-visible — this is the security/infrastructure gate.
- **Serves**: no persona directly; protects all of them.
- **Metric moved**: `18_SUCCESS_METRICS.md` gating metric — zero unresolved Critical findings carried into engineering.
- **Exit criteria**: identical to [14](14_DEVELOPMENT_BLUEPRINT.md) Release 0 — restated here as the go/no-go gate for R1: **no release below may ship to production until this closes**, independent of how ready any feature is.

## R1 — Foundation

- **Ships**: real roles and permissions (SET-02); every lead routed to a named owner with a visible SLA clock (LEAD-01/02/03); notifications that actually arrive on the right channel; an audit trail that actually exists.
- **Serves**: every persona except Administrator gets a functioning account structure for the first time; Property Consultant and Sales Manager get the single highest-impact fix (Journey 2, [03_USER_JOURNEYS.md](03_USER_JOURNEYS.md)).
- **Metric moved**: North Star Metric (time from lead creation to first qualified broker response) becomes measurable and starts trending down; data-integrity error rate on lead contact fields → 0%; notification badge accuracy → 100%.
- **Exit criteria**: no lead misrouted/misattributed; no metric ships without explanation; no role exists without scoped, auditable permissions (unchanged from [14](14_DEVELOPMENT_BLUEPRINT.md)).
- **Go/no-go for R2**: RBAC and Lead Pipeline both in production and stable — R2's Properties/Owners screens assume both exist.

## R2 — Core Experience

- **Ships**: full property/project publishing lifecycle with real price history; owner relationships and Marketing Requests properly surfaced (fixing a real, currently-buried revenue stream); customer relationship records; Wallet; the first working version of Today.
- **Serves**: Solo Broker and Property Consultant get their full daily workflow (Journeys 1 and 3); Marketing Manager gets Marketing Requests as a real, discoverable job (Journey 4's foundation).
- **Metric moved**: median time to publish a compliant listing; Marketing Request discovery/response rate (previously unmeasured baseline); weekly active use of Today.
- **Exit criteria**: broker runs the full daily workflow (leads, listings, owner relationships) inside TBOS with no old-platform/external workaround.
- **Go/no-go for R3**: Properties/Projects/Owners/Customers data model stable — Search infrastructure in R3 indexes what exists here.

## R3 — Broker Productivity

- **Ships**: real search across every entity (replacing the current unindexed scope-chain search); saved searches that actually notify on new matches; marketing campaigns with front-loaded eligibility; a working Knowledge base.
- **Serves**: Marketing Manager gets full campaign tooling (Journey 5); every persona gets search-first navigation for lists that have grown past casual browsing.
- **Metric moved**: clicks/steps to complete top-4 Quick Actions (≤2 target); campaign attribution visibility.
- **Exit criteria**: no list requires scrolling a several-hundred-item flat control to find something.
- **Go/no-go for R4**: search infrastructure stable — AI Search in R4 is a thin layer on top of it, not a separate build.

## R4 — AI Layer + Automation Layer

- **Ships**: AI description generation extended to Projects; Lead Scoring maturing to its qualitative (v2) layer; Agent Copilot for reply drafting and open-ended questions; Property Quality scoring; Document Intelligence for compliance uploads; every automation rule made visible and editable (not just running as an invisible default).
- **Serves**: Property Consultant gets in-workflow AI assistance (Journey 10); Operations Manager gets Document Intelligence for compliance (Journey 6); every manager persona gets automation transparency (Journey 8's trust requirement).
- **Metric moved**: % of repetitive work automated; AI feature engagement rate (accepted/edited, not raw invocation).
- **Exit criteria**: Today reliably surfaces the platform's highest-value 3–5 recommendations daily, and a majority of brokers act on at least one.
- **Go/no-go for R5**: Explainability-backed data pipeline proven at scale across Releases 1–4 — Analytics in R5 depends on trusting this data, not re-deriving it.
- **Note**: Document Intelligence's production rollout is additionally gated on legal review closing ([13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md)) — this can lag the rest of R4 without blocking it.

## R5 — Analytics

- **Ships**: a real Analytics Explorer (replacing the current decorative/hardcoded dashboard entirely, not extending it); scheduled and on-demand Reports; the first real Finance view (even if commission data is still thin pending Contracts in R6).
- **Serves**: Agency Owner gets End-of-Day Review and weekly reporting for real (Journeys 9 and 11); Operations Manager gets audit-trail-completeness reporting.
- **Metric moved**: % of dashboard/analytics metrics with a real (non-hardcoded) data source → 100%.
- **Exit criteria**: every metric traces to real data with zero hardcoded/decorative figures.
- **Go/no-go for R6**: none required — R6 (Transaction) is independently gated on its own prerequisites, not on R5 completing.

## R6 — Transaction

- **Ships**: full contract lifecycle from accepted offer to closed deal, with a real compliance checklist per contract type; e-signature integration; Market Intelligence and AI-assisted pricing (now that Price History from R2 has accumulated real data); full Finance reporting.
- **Serves**: Operations Manager gets the module their role is named for (Journey 6); Agency Owner gets true revenue reporting.
- **Metric moved**: % of licenses renewed proactively; zero contracts activated with an unresolved compliance mismatch (new, contract-specific trust metric).
- **Exit criteria**: a deal's full lifecycle — lead to contract to close — tracked in TBOS with no external workaround.
- **Go/no-go for R7**: none required — Platform Console (R7) has zero dependency on Transaction.

## R7 — Enterprise (Expansion)

- **Ships**: full Platform Console (Administrator's moderation/reference-data/compliance-oversight/support surfaces), scoped in outline only by this blueprint — see [18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md) for what a future dedicated pass must resolve. Future Modules (Mortgage, Insurance, Investment Analytics, Property Management, etc.) begin only as separately-scoped work after this.
- **Serves**: Administrator, and — for Future Modules — personas/account types not yet defined in `tbos-definition/04_PERSONAS.md`.
- **Metric moved**: moderation turnaround time; zero unauthorized cross-system access incidents.
- **Exit criteria**: to be defined in the dedicated Platform Console blueprint pass this release requires — not claimed as complete by this document.

## Release-to-persona coverage check

Every persona in `tbos-definition/04_PERSONAS.md` has a release where their primary job becomes fully usable — confirms no persona is left without a functioning workflow indefinitely:

| Persona | Fully served by |
|---|---|
| Solo Broker | R2 (full daily workflow) |
| Property Consultant | R1 (lead handling) → R2 (full workflow) |
| Sales Manager | R1 (lead routing/SLA) |
| Marketing Manager | R2 (Marketing Requests) → R3 (campaigns) |
| Operations Manager | R6 (Contracts — their named module) |
| Agency Owner | R2 (delivery) → R5 (analytics) → R6 (finance) |
| Administrator | R7 |

Operations Manager waiting until R6 is a real, named trade-off, not an oversight: their compliance/renewal reminder needs are partially served earlier (WF-RENEWAL and WF-COMPLIANCE ship inside R1/R2's Properties/Wallet work), but their *named* module (Contracts) is legitimately gated on the Business Validation item in [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md) — flagged, not hidden.
