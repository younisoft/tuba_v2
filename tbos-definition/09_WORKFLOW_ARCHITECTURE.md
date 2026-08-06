# 09 — Workflow Architecture

**Status**: Recommended. Defines the ideal shape of TBOS's core workflows — trigger, steps, decision points, outcome — without specifying screens. Every workflow is checked against Philosophy Principle #4 (front-loaded requirements) and Design Principle "Empty/Error/Success states." Diagram: `diagrams/journeys.mmd` (selected flows rendered visually).

---

## New Property

**Trigger**: broker initiates "Add Property" (Quick Action or Properties module).
**Steps**: (1) Upfront requirements checklist shown before any field is entered — license/compliance info needed, media needed, pricing needed, estimated time to complete; (2) compliance/license lookup (Tuba's current platform already does this step well — preserved, per `tuba-current-state/06_WORKFLOW_ANALYSIS.md` §1); (3) property details, with AI-assisted description/SEO generation offered inline, extended to every listing type unlike today's Property-only scope (`tuba-current-state/16_AI_READINESS.md`); (4) media upload with real-time processing status (never a silent, potentially-fatal synchronous step — a direct response to the live-confirmed dependency risk in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §0); (5) review and publish.
**Decision points**: does the license number resolve to an existing REGA record (auto-fill) or need manual entry; is the listing ready to publish now or save as Draft.
**Outcome**: a live listing, or an explicitly-saved Draft — never an ambiguous in-between state (Tuba's current platform mixes "test/legacy form," "current form," and silent partial saves — this workflow has exactly two terminal states).

## New Lead

**Trigger**: inbound contact (buyer inquiry, owner-originated demand) or manual entry by a broker.
**Steps**: (1) automatic capture into the unified Leads pipeline with source tagging (buyer-inbound vs. owner-originated, per `06_PRODUCT_ARCHITECTURE.md`'s Leads module definition); (2) automated routing per `11_AUTOMATION_STRATEGY.md` (capacity-aware assignment, not broadcast-to-all); (3) SLA clock starts visibly; (4) assigned broker notified per `13_NOTIFICATION_STRATEGY.md`.
**Decision points**: does this lead match an existing Customer/Owner record (merge) or create a new one; does it meet auto-routing criteria or need manual triage.
**Outcome**: a lead with a named owner, a visible SLA state, and a guaranteed-correct notification — the direct fix for the live-confirmed misrouting bug where an agent's own contact info appeared as the lead's "sender" (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §2). This is the single workflow this entire document treats as non-negotiable to get right before anything else ships.

## New Owner

**Trigger**: a property owner engages the platform (lists a property, submits a Marketing Request, or is added manually).
**Steps**: (1) Owner record created/matched; (2) relationship context captured (which property, what they want — sell, rent, market); (3) if a Marketing Request, it enters the Owners module *and* surfaces in Today if time-sensitive (per `07_INFORMATION_ARCHITECTURE.md`'s dual-surface note).
**Decision points**: new owner or existing owner with a new request.
**Outcome**: every owner interaction has one canonical record — replacing Tuba's current platform, where Marketing Requests exist as a disconnected tab with no owner-relationship model behind them (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3).

## New Contract

**Trigger**: a Lead/Customer relationship reaches an accepted offer.
**Steps**: (1) offer terms captured (this is the flow Tuba's current platform designed fields for but never built the logic behind — `PropertyRequestOffer`'s unpopulated accept-fields, per `tuba-current-state/15_CURRENT_STATE_VS_TARGET_STATE.md` §3); (2) compliance checklist for contract type (brokerage agreement, sale, lease); (3) document generation/e-signature; (4) contract enters Contracts module at "Pending Compliance" or "Active."
**Decision points**: does the contract require additional government verification before activation.
**Outcome**: a structured, queryable contract record — no more free-text "your offer has accepted please contact me" messages standing in for a real acceptance flow, a pattern directly observed live in Tuba's current inbox (`tuba-current-state/04_PAGE_ANALYSIS.md`, `/agent-inbox`).

## Marketing Campaign

**Trigger**: broker or Marketing Manager wants to boost a listing or run a themed campaign.
**Steps**: (1) select inventory (with an explicit **eligibility check performed before the flow starts**, not after — the direct fix for Aqar's confirmed dead-end pattern of letting a promotion flow begin without eligible inventory, `competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §4); (2) select package/spend tier from Wallet; (3) launch; (4) performance tracked in Analytics.
**Decision points**: sufficient Wallet balance/quota; inventory eligibility.
**Outcome**: a running campaign with visible attribution — never the "decorative chart" pattern found in Tuba's current dashboard analytics.

## Price Change

**Trigger**: broker updates a listing's price.
**Steps**: (1) new price entered as a real numeric value (fixing the free-text string-column defect documented in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`); (2) system logs the change to a price-history record (which does not exist at all in Tuba's current schema — a prerequisite this workflow assumes is now built, per `tuba-current-state/16_AI_READINESS.md`'s Market Insights sequencing); (3) optional AI-suggested price-band context shown before confirming (Decision Support, `15_DECISION_SUPPORT_SYSTEM.md`).
**Outcome**: every price change is a permanent, queryable event, not an overwrite.

## Expired Listing

**Trigger**: a listing's license/ad period lapses.
**Steps**: (1) proactive warning generated well before expiry (Automation + Notifications, not a silent status flip); (2) on expiry, listing moves to an "Expired" state, visible in Today with a one-click renewal action; (3) if not renewed within a defined grace window, listing archives.
**Outcome**: no listing silently expires without the broker having been told in advance — a direct answer to the "compliance is a checklist, not a gate" principle applied to renewals specifically.

## Rejected Listing

**Trigger**: a listing fails moderation/compliance review (Platform Console side).
**Steps**: (1) rejection reason captured in plain language (Explainability, `14_EXPLAINABILITY_SYSTEM.md`) and delivered to the broker with the specific fix needed; (2) listing re-enters Draft state with the flagged fields highlighted; (3) resubmission re-enters the review queue.
**Outcome**: a rejection is never a dead end — it's a specific, actionable to-do, directly enforcing the Empty/Error-state design principles from `03_DESIGN_PRINCIPLES.md`.

## Compliance (general workflow, underlies Nafath/FAL/REGA specifically)

**Trigger**: any action gated by a government-verification requirement.
**Steps**: (1) requirement stated upfront, before the gated action is attempted (never discovered mid-flow); (2) document/credential submission with AI-assisted pre-fill and mismatch flagging where applicable (Document Processing, `10_AI_STRATEGY.md`); (3) verification result recorded with a real, integrity-checked confirmation — this workflow explicitly assumes the Nafath signature-verification gap identified in `tuba-current-state/13_GAP_ANALYSIS.md` has been fixed upstream of TBOS; TBOS's design does not build a trust workflow on top of an unverified identity signal.
**Outcome**: a broker always knows their current compliance status and what's needed next, platform-wide — the unified view `13_GAP_ANALYSIS.md` found missing entirely in Tuba's current platform.

## Renewal (licenses, contracts, packages)

**Trigger**: any time-bound entity approaches its expiry.
**Steps**: (1) automated advance reminder (see `11_AUTOMATION_STRATEGY.md`); (2) one-click renewal where no new information is needed; (3) guided re-verification flow where it is.
**Outcome**: renewal is never something a broker has to remember to initiate — it's something TBOS surfaces before it becomes urgent.

## Publishing

**Trigger**: a Draft (Property, Project, or Marketing content) is marked ready.
**Steps**: (1) pre-publish completeness check (photos, description, compliance, pricing all present — closing the gap the July self-audit named "Rule Set A: pre-publish completeness gate," `web-project-audit/phase4/24_DATA_QUALITY_AUDIT.md`); (2) publish; (3) confirmation states where it's now visible and to whom.
**Outcome**: nothing goes live incomplete.

## Archiving

**Trigger**: broker or system marks a record (listing, lead, contract) as no longer active but worth retaining.
**Steps**: (1) explicit archive action (never a silent status drift); (2) archived records remain searchable and reportable but excluded from default active views.
**Outcome**: history is preserved — directly informed by the TBX synthesis's positive note on Bayut's retained-performance-data instinct for removed listings (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §2), generalized to every entity type rather than just listings.

## Deletion

**Trigger**: explicit broker request to permanently remove a record.
**Steps**: (1) scoped, ownership-verified target selection — never a generic "delete this ID" action against an unvalidated model class, the exact shape of Tuba's current Critical IDOR (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4); (2) plain-language consequence confirmation (Design Principle "Interaction philosophy"); (3) soft-delete with a defined recovery window before permanent removal.
**Outcome**: deletion is deliberate, scoped, and reversible for a grace period — the polar opposite of the current platform's one-click, any-model, any-user mass-delete path.

## Automation (as a workflow category)

Every workflow above has automatable sub-steps (routing, reminders, status transitions) — these are not separately diagrammed here but are the direct subject of `11_AUTOMATION_STRATEGY.md`, which should be read as this document's companion, not a separate concern.
</content>
