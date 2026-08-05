# 05 — Jobs To Be Done

**Status**: Recommended. Jobs are ranked by **Frequency** (how often a broker does this) and **Business Value** (how directly it drives closed deals/revenue), each on a High/Medium/Low scale. Every job cites which persona(s) from `04_PERSONAS.md` own it and, where relevant, which current-platform evidence shows the job is being done badly today.

---

| Rank | Job | Frequency | Business Value | Primary Persona(s) | Grounding |
|---|---|---|---|---|---|
| 1 | Follow up on leads | Daily, continuous | High | Solo Broker, Property Consultant, Sales Manager | The job with the worst current execution: a live-confirmed misrouting bug means this job is sometimes literally impossible to do correctly today (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §2) |
| 2 | Publish and update listings | Daily/weekly | High | Solo Broker, Property Consultant | Currently a dual-form UI with ~30% dead code in the controller and (in this checkout) a likely-broken media pipeline (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`) |
| 3 | Respond to owner-originated demand (Marketing Requests) | Weekly | High | Marketing Manager, Property Consultant | Real, monetized, and functioning end-to-end for offer submission — but buried with no dedicated surface (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3) |
| 4 | Negotiate and close deals | Per-deal | High | Property Consultant, Solo Broker | No structured offer-accept/reject flow exists — buyers and agents currently work around this via free-text messages (`tuba-current-state/15_CURRENT_STATE_VS_TARGET_STATE.md` §3) |
| 5 | Track and renew compliance (REGA/Nafath/FAL) | Weekly/per-expiry | High | Operations Manager, Solo Broker | Real government integrations exist but no unified lifecycle view, and (as of this assessment) the Nafath verification signature is unverified — a trust-integrity risk, not just a UX gap (`tuba-current-state/13_GAP_ANALYSIS.md`) |
| 6 | Manage and coach the team | Daily (managers) | High | Sales Manager, Agency Owner | No pipeline/stage/ownership model exists to manage against at all (`tuba-current-state/05_FEATURE_CATALOG.md`) |
| 7 | Acquire new listings (owner outreach) | Weekly | High | Solo Broker, Marketing Manager | Overlaps with Job 3 but includes outbound, not just inbound, owner relationship-building — not directly supported by any current-platform feature found |
| 8 | Monitor performance (personal or team) | Daily/weekly | Medium-High | All manager personas | The one genuinely real report (Rent Now Click) proves the team can build this well when they invest — everything else is decorative (`tuba-current-state/05_FEATURE_CATALOG.md`) |
| 9 | Build and maintain owner/buyer trust | Continuous | High | All broker personas | Reviews are installed but not wired to any UI; regulatory trust is real but undermined by the Nafath integrity gap (`tuba-current-state/13_GAP_ANALYSIS.md`) |
| 10 | Manage packages/subscriptions and billing | Monthly/per-renewal | Medium | Agency Owner, Solo Broker | A genuine platform strength today — the package/quota engine works and is well-executed (`tuba-current-state/04_PAGE_ANALYSIS.md`, `/agent-packages`) |
| 11 | Coordinate with the team on a specific deal | Per-deal | Medium | Property Consultant, Sales Manager | No collaboration surface exists on a deal/listing beyond the flat creator-attribution field observed live (`tuba-current-state/04_PAGE_ANALYSIS.md`) |
| 12 | Generate and share reports | Weekly/monthly | Medium | Agency Owner, Operations Manager | Effectively unsupported beyond one report; CSV/Excel export exists as an installed-but-unused package (`web-project-audit/05_ADMIN_PANEL.md`) |
| 13 | Run and evaluate marketing campaigns | Weekly | Medium | Marketing Manager | Promotion tiers exist (basic/featured/pro ad) and are visibly tracked, but no campaign-level ROI reporting was found |
| 14 | Manage sub-users/team accounts | Occasional | Medium | Agency Owner | Exists today but flat — no role/permission assignment possible (`tuba-current-state/04_PAGE_ANALYSIS.md`, `/agent-users`) |
| 15 | Stay informed of market pricing/trends | Weekly | Medium | Marketing Manager, Solo Broker | Does not exist at all today — no price-history table, no market-trend view (`tuba-current-state/16_AI_READINESS.md`) |
| 16 | Moderate/administer platform reference data | Occasional | Low-Medium (High for platform integrity) | Administrator | Currently under-permissioned to the point of being a security risk, not just a UX one (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`) |
| 17 | Onboard as a new broker/agent | Once (per account) | Medium | Solo Broker, Agency Owner | Registration flow works but shares the platform-wide authentication defects (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4) — a first impression currently undermined by unrelated security debt |

## How TBOS's module architecture maps to this ranking

`06_PRODUCT_ARCHITECTURE.md` and `09_WORKFLOW_ARCHITECTURE.md` are sequenced to serve Jobs 1–6 (the High-frequency, High-value cluster) with first-class, purpose-built modules — not general-purpose CRUD screens the way Tuba's current platform treats every job identically (one shared controller/view pattern regardless of job importance, per `tuba-current-state/11_TECHNICAL_ARCHITECTURE.md`). Jobs 7–17 are served by the same architecture but do not each require a dedicated top-level module — see `07_INFORMATION_ARCHITECTURE.md` for how they're organized without violating the "one home per capability" principle.

## Jobs explicitly out of scope for TBOS v1

Per `20_NON_GOALS.md`, TBOS does not take on full accounting/ERP-scale bookkeeping, insurance/mortgage origination, or property-management (tenant/maintenance) workflows as *jobs the core product does* — these are named as **Future Modules** (`16_MODULE_SPECIFICATIONS.md` §Future Modules) precisely because they are adjacent, real broker jobs that TBOS's architecture should leave room for without building prematurely.
</content>
