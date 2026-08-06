# 11 — Automation Strategy

**Status**: Recommended. Per Philosophy Principle #5 (automation-first, not automation-eventually): if a human is doing something a machine could reliably do, that is a defect. This document identifies the repetitive work in a broker's day (`05_JOBS_TO_BE_DONE.md`) and defines what TBOS automates by default versus what stays a manual, assisted action.

---

## Why this needs to be a first-class strategy, not an afterthought

Tuba's current platform has the *infrastructure* for automation (a queue connection, notification classes, a scheduler) but almost nothing is actually automated: all 10 notification classes exist but deliver database-only, with no email/SMS/push actually wired despite the underlying services (Pusher, Taqnyat) already being integrated elsewhere in the codebase (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`). The gap between "has the plumbing" and "actually automates the work" is exactly what this strategy exists to close, deliberately, for every repetitive job — not by accident, module by module.

## What TBOS automates by default (no configuration required)

| Job | Automation | Grounding |
|---|---|---|
| **Lead assignment** | Capacity-aware routing to the right broker on intake — never broadcast-to-all-and-hope, the pattern the July self-audit specifically named as a gap (`web-project-audit/phase4/23_CRM_AND_LEAD_MANAGEMENT.md`) | `09_WORKFLOW_ARCHITECTURE.md` — New Lead |
| **Follow-up reminders** | A lead with no response inside its SLA window auto-escalates (visible in Today, notifies the Sales Manager) | Closes the "no SLA/response-time indicator" gap in `tuba-current-state/05_FEATURE_CATALOG.md` |
| **Status updates** | Listing/lead/contract status transitions (Draft→Active, Active→Expiring, Pending→Active) happen automatically when their triggering condition is met — never require a human to notice and manually flip a flag | Directly answers the "decorative/manual status" pattern found throughout Tuba's current admin panel |
| **Renewal reminders** | Escalating reminders ahead of any license/contract/package expiry (not a single notice the day it lapses) | `09_WORKFLOW_ARCHITECTURE.md` — Renewal |
| **Compliance nudges** | A missing or soon-to-expire compliance document generates a Task automatically, assigned to the Operations Manager persona (`04_PERSONAS.md`) | Closes the "no unified compliance-status view" gap in `tuba-current-state/13_GAP_ANALYSIS.md` |
| **Publishing gate checks** | Pre-publish completeness (photos/description/pricing/compliance) is checked automatically before "Publish" is even offered as an action, not after a broker clicks it and gets an error | `09_WORKFLOW_ARCHITECTURE.md` — Publishing |
| **Notification delivery routing** | The system decides in/app vs. email vs. SMS vs. WhatsApp vs. push per `13_NOTIFICATION_STRATEGY.md`'s rules — a broker does not have to configure delivery channel per notification type from a blank slate | Fixes the "database-only, nothing else wired" finding in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` |

## What TBOS automates with a visible, editable rule (configurable in the Automation module)

| Job | Default rule | Why configurable, not fixed |
|---|---|---|
| **Marketing campaign scheduling** | Boost a listing automatically after N days with no view growth | Agencies differ in promotion cadence and budget discipline |
| **Report generation** | Weekly performance summary auto-generated and ready in Reports every Sunday night | Frequency/recipients vary by agency size (Solo Broker vs. multi-branch) |
| **Lead reassignment on inactivity** | Auto-reassign if unclaimed for N hours | N is a Sales Manager judgment call, not a platform constant |
| **Duplicate-lead merging** | Auto-flag, but require human confirmation before merging | Merging is a destructive-adjacent action per Design Principle "Interaction philosophy" — automation surfaces it, a human still confirms it |

## What TBOS deliberately does NOT fully automate

- **Publishing the final "go live" action** — the completeness *check* is automatic; the decision to publish stays a deliberate human action, consistent with the AI Strategy's rule that no regulated action is autonomously gated.
- **Contract/compliance approval** — Document Intelligence pre-fills and flags; a human (Operations Manager) still approves, given the regulatory exposure named in `10_AI_STRATEGY.md`.
- **Deletion** — never automatic; always an explicit, confirmed, scoped action per `09_WORKFLOW_ARCHITECTURE.md`'s Deletion workflow, directly because Tuba's current platform's worst security finding is an unscoped, un-confirmed automated-feeling delete path (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4).

## Automation and the Automation module (`06_PRODUCT_ARCHITECTURE.md`)

Every rule above that is "configurable" lives in the Automation module as a visible, editable setting — not buried in code the way Tuba's current platform's one real scheduled-automation example (`PropertySeoUpdation`) exists only as a cron entry no broker can see or adjust. A broker or manager should be able to answer "why did this happen automatically" by looking at one screen, which is also the direct implementation of Explainability applied to automation specifically (`14_EXPLAINABILITY_SYSTEM.md`).

## Reliability requirements (non-negotiable, inherited from source evidence)

- All automation runs on a real, monitored queue — not the synchronous, `sleep()`-throttled pattern found in Tuba's current AI/SEO scheduled command (`tuba-current-state/16_AI_READINESS.md`).
- Every automated action is logged to an audit trail a broker/Operations Manager can review — closing the "no audit log anywhere in the system" gap that compounds every other finding in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`.
- A failed automation (a reminder that didn't send, a routing rule that didn't fire) surfaces as a visible incident, not a silent gap — the automation equivalent of the Error State design principle in `03_DESIGN_PRINCIPLES.md`.
</content>
