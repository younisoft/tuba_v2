# 01 — Experience Architecture

Scope per the master prompt: design the complete experience — never visuals. For every workflow in `tbos-definition/09_WORKFLOW_ARCHITECTURE.md` (canon `WF-*` codes, see [00](00_IMPLEMENTATION_BLUEPRINT.md) §5), this document adds the layer that source document doesn't cover: **intent, outcome, emotional state, cognitive load, decision points, interruptions, automation opportunities, AI assistance, and recovery paths.** Trigger/steps/decision-points-as-data already exist there and are referenced, not repeated.

Every workflow is scored on **cognitive load** using three bands:
- **Low** — broker can complete while distracted (on a call, walking a property).
- **Medium** — requires focused attention but no specialized judgment.
- **High** — requires judgment, comparison, or a decision with real consequence.

TBOS's job, per Design Principle "Speed" and Philosophy Principle #4 (front-loaded requirements), is to push every workflow toward Low without removing the judgment calls that must stay human.

---

## WF-LEAD-NEW — New Lead

**The single non-negotiable workflow** (`tbos-definition/00_PRODUCT_CONSTITUTION.md` Article VII) — direct fix for the live-confirmed lead-misrouting defect (`tuba-current-state/06_WORKFLOW_ANALYSIS.md`).

| Dimension | Definition |
|---|---|
| **User intent** | "A buyer/owner is trying to reach me — get them to the right person before they lose interest or call a competitor." |
| **Expected outcome** | A named broker owns the lead, an SLA clock is visibly running, and the assignee has been notified through a channel they'll actually see (per [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md)). |
| **Emotional state (entry → exit)** | Entry: neutral-to-anxious (broker doesn't yet know a lead exists). Exit for assignee: urgency, ownership. Exit for Sales Manager: reassurance the pipeline is working, not a black box. |
| **Cognitive load** | Low for the receiving broker (a routed, scored lead requires no triage decision to start responding) → Medium if manual reassignment is needed. |
| **Decision points** | System: does this match an existing Customer/Owner record (merge) or create new? Does routing criteria (capacity, specialty, district) resolve to one broker or require Sales Manager triage? |
| **Interruptions** | Deliberately interrupts via push notification (Critical/High per NOTIF strategy) — this is the one workflow where interrupting a broker's current task is correct, because delay is the defect being fixed. |
| **Automation opportunities** | Capacity-aware auto-routing (default, no config); SLA-breach auto-escalation to Sales Manager; duplicate-lead flag (rules-based first pass: phone/email match). |
| **AI assistance** | Lead Scoring v1 (heuristic: recency, budget-fit, response latency) attached at intake, visible on LEAD-03 immediately — never delays routing waiting on a score. |
| **Recovery path** | If auto-routing has no confident match, lead lands in Sales Manager's queue flagged "needs manual assignment" — never silently dropped, never broadcast-to-all as a fallback (broadcast-to-all is the current-platform failure mode this workflow replaces). |
| **Screens involved** | LEAD-01, LEAD-02, LEAD-03, TODAY-01 (SLA-approaching entries), NOTIF-01. |

---

## WF-PROPERTY-NEW — New Property

| Dimension | Definition |
|---|---|
| **User intent** | "Get this listing live, correctly, without discovering a missing requirement halfway through." |
| **Expected outcome** | Exactly two terminal states: a live, compliant listing, or an explicit Draft — never an ambiguous in-between (per source workflow doc). |
| **Emotional state** | Entry: task-focused, often time-pressured (broker photographing a property wants this done fast). Mid-flow risk: frustration if a requirement surfaces late — this is the exact failure Philosophy Principle #4 exists to prevent. Exit: relief/confidence the listing is correct. |
| **Cognitive load** | Medium — compliance/license lookup and media upload are mechanical; pricing and description carry judgment, softened by AI assistance. |
| **Decision points** | Does the property's license resolve to an existing REGA record (auto-fill) or need manual entry? Publish now vs. save Draft? |
| **Interruptions** | None mid-flow by design — media processing and AI description generation run async in the background (Design Principle "Loading philosophy") rather than blocking or interrupting. |
| **Automation opportunities** | Publishing pre-publish completeness check runs automatically (photos, description, compliance, pricing) before "Publish" is even offered — turns a post-hoc rejection into a pre-flight gate. |
| **AI assistance** | Inline description/SEO generation (extended to every listing type, not Property-only); AI-suggested amenity tags from uploaded photos; AI-suggested price band as context, never autonomous (gated on price-history pipeline existing — see [13](13_FEATURE_READINESS_MATRIX.md)). |
| **Recovery path** | Saved Draft at any point, resumable; a Draft missing requirements shows exactly which ones, inline, not as a generic "incomplete" flag. |
| **Screens involved** | PROP-03 (wizard, all steps), PROP-02 (post-publish), QA-01 (Add Property quick action). |

---

## WF-OWNER-NEW — New Owner

| Dimension | Definition |
|---|---|
| **User intent** | "Turn this owner's interest (a listing, a Marketing Request, a manual add) into one canonical record I can act on." |
| **Expected outcome** | One owner record, correctly merged if they already exist, with the triggering context attached (what they submitted, when). |
| **Emotional state** | Low-stakes, administrative — this workflow should feel invisible when it works. |
| **Cognitive load** | Low, except the merge decision (new vs. existing owner), which the system should resolve automatically via phone/email match in the common case. |
| **Decision points** | New owner vs. existing owner with a new request (duplicate-detection rules-based match). |
| **Interruptions** | None — this is a background/administrative workflow, not one that should ever push a notification on its own (only the Marketing Request it may carry does, per [09](09_NOTIFICATION_BLUEPRINT.md)). |
| **Automation opportunities** | Full auto-merge on high-confidence match (exact phone/email); flagged-for-confirmation on partial match, never silent auto-merge on ambiguous data. |
| **AI assistance** | None required at this stage — duplicate detection here is deliberately rules-based first pass per `tbos-definition/10_AI_STRATEGY.md` sequencing (ML layer only once volume justifies it). |
| **Recovery path** | Broker can manually un-merge/split an incorrectly merged owner record from OWN-02; action is logged. |
| **Screens involved** | OWN-01, OWN-02, OWN-03 (if Marketing Request), TODAY-01 (if time-sensitive). |

---

## WF-CONTRACT-NEW — New Contract

| Dimension | Definition |
|---|---|
| **User intent** | "Turn an accepted offer into a real, documented, compliant transaction — no more free-text 'deal closed' messages." |
| **Expected outcome** | A structured, queryable contract record entering Contracts at Pending Compliance or Active. |
| **Emotional state** | High stakes — this is money and legal exposure. Broker needs confidence, not speed; Operations Manager needs certainty the paperwork is right. |
| **Cognitive load** | High — compliance-checklist-per-contract-type and document generation require attention; TBOS's job is to make the *process* Low-load even though the *stakes* stay High. |
| **Decision points** | Does this contract require additional government verification before activation? |
| **Interruptions** | Compliance blockers interrupt appropriately — a contract cannot silently sit non-compliant; it shows in TODAY-01 for Operations Manager until resolved. |
| **Automation opportunities** | Compliance checklist auto-generated per contract type (not a generic checklist); status auto-transitions on verification result. |
| **AI assistance** | Document Intelligence (OCR/extraction pre-fill from uploaded documents, mismatch flagging) — assistive only; Operations Manager always confirms before activation (per AI Strategy guardrail: no AI feature is the sole gate on a regulated action). |
| **Recovery path** | A contract stuck Pending Compliance shows exactly which document/verification is missing, with a direct action to resolve it, not a static status badge. |
| **Screens involved** | CONT-01, CONT-02, LEAD-03 (offer accepted trigger), TODAY-01 (OM). |

---

## WF-MARKETING-CAMPAIGN — Marketing Campaign

| Dimension | Definition |
|---|---|
| **User intent** | "Boost the right inventory, spend efficiently, see if it worked." |
| **Expected outcome** | A running campaign with visible attribution back to Analytics — never a campaign started against ineligible inventory. |
| **Cognitive load** | Medium — eligibility and spend-tier selection require comparison, softened by front-loading eligibility before the flow even starts. |
| **Decision points** | Inventory eligible? Sufficient Wallet balance/quota? |
| **Interruptions** | None mid-flow — eligibility is checked at entry, not discovered as an error partway through (fixes current platform's `/developer-packages` dead-end pattern per `tuba-current-state/13_GAP_ANALYSIS.md`). |
| **Automation opportunities** | Auto-boost after N days with no view growth (configurable default in AUTO-02, per `tbos-definition/11_AUTOMATION_STRATEGY.md`). |
| **AI assistance** | Campaign copy generation; AI-surfaced under-promoted inventory as a recommendation on TODAY-01 before the broker even opens Marketing. |
| **Recovery path** | Zero-eligible-inventory state at entry explains why (per listing) and links directly to the fix (e.g., "3 listings missing photos — fix to become eligible"), never a dead end. |
| **Screens involved** | MKT-01, MKT-02, WAL-01 (spend check), ANL-01 (attribution). |

---

## WF-PRICE-CHANGE — Price Change

| Dimension | Definition |
|---|---|
| **User intent** | "Adjust the price to match reality (market feedback, owner instruction) without losing the history." |
| **Expected outcome** | A permanent, queryable price-history event — never a silent overwrite. |
| **Cognitive load** | Medium — the AI comparables context reduces what would otherwise be High (a broker guessing market fit alone). |
| **Decision points** | Accept AI-suggested price band context, or override with own judgment (always override-able — AI is context, never a gate). |
| **Automation opportunities** | None — this is deliberately a human decision every time; only the logging is automatic. |
| **AI assistance** | AI-suggested price band from comparables ("12 similar listings in this district"), gated on the price-history pipeline existing (sequencing dependency — see `tbos-definition/19_PRODUCT_ROADMAP.md` Phase 5). |
| **Recovery path** | Full price-history timeline visible on PROP-02, any entry can be referenced when explaining the change to an owner. |
| **Screens involved** | PROP-02 (History tab). |

---

## WF-LISTING-EXPIRED — Expired Listing

| Dimension | Definition |
|---|---|
| **User intent** | "Never be surprised that a listing went dark." |
| **Expected outcome** | Renewal happens before expiry in the common case; if not, the listing is visibly Expired with a one-click path back, not silently gone. |
| **Emotional state** | Should never reach anxiety — proactive warning is the point. If it does expire, the tone is "here's the fix," not blame. |
| **Cognitive load** | Low — this is a reminder-and-one-click workflow by design. |
| **Automation opportunities** | Proactive warning before expiry (escalating cadence, not single day-of notice); auto-archive if not renewed within a defined grace window. |
| **AI assistance** | None needed — this is deterministic date logic, not a judgment call. |
| **Recovery path** | One-click renewal from TODAY-01 or PROP-02 directly; archived-but-not-deleted state preserves relisting without re-entering all data. |
| **Screens involved** | TODAY-01, PROP-02, NOTIF-01. |

---

## WF-LISTING-REJECTED — Rejected Listing

| Dimension | Definition |
|---|---|
| **User intent** | "Understand exactly why this was rejected and fix it — fast." |
| **Expected outcome** | Never a dead end — a specific, actionable to-do, re-entering Draft with the failing fields highlighted. |
| **Emotional state** | Entry: frustration/confusion risk (rejection always feels like a setback). TBOS's job is to convert that into "clear what to do next," per Design Principle "Error states." |
| **Cognitive load** | Low if the rejection reason is genuinely specific; High and demoralizing if it's generic — this is the exact bar Explainability sets. |
| **Automation opportunities** | Rejection reason auto-populated from the specific rule/field that failed moderation, never a free-text human-typed reason alone. |
| **AI assistance** | None required for the rejection itself; AI Property Quality scoring at submission time should reduce how often this workflow triggers at all. |
| **Recovery path** | Resubmission re-enters the review queue automatically once flagged fields are fixed — no separate "resubmit" ceremony. |
| **Screens involved** | PROP-03 (returns here), PROP-02, TODAY-01, NOTIF-01. |

---

## WF-COMPLIANCE — Compliance (general pattern underlying Nafath/FAL/REGA)

| Dimension | Definition |
|---|---|
| **User intent** | "Know what's required, submit it correctly, don't get caught by surprise." |
| **Expected outcome** | Broker always knows compliance status platform-wide and what's needed next — the single biggest trust gap identified across `tuba-current-state/` and both competitor audits. |
| **Emotional state** | Regulatory anxiety is the default entry state for this domain; TBOS's job is to replace it with checklist-confidence. |
| **Cognitive load** | Should be Low (a checklist) even though the underlying domain is High-stakes — the gap between those two is what Document Intelligence and front-loading close. |
| **Decision points** | Does the submitted document/credential pass automated pre-check, or route to human review? |
| **Automation opportunities** | Requirement stated upfront, before submission is even attempted (Philosophy Principle #4). |
| **AI assistance** | Document Intelligence: OCR/extraction pre-fill, mismatch flagging — never autonomously approves; a human (Operations Manager) always confirms regulated compliance status. |
| **Recovery path** | A failed/mismatched submission explains the specific mismatch in plain language and allows re-submission without re-entering unaffected fields. |
| **Screens involved** | SET-04, TODAY-01 (OM), CONT-02, PROP-02, KB-02 (explanatory content). |

---

## WF-RENEWAL — Renewal (licenses, contracts, packages)

| Dimension | Definition |
|---|---|
| **User intent** | "Never have to remember this myself." |
| **Expected outcome** | Renewal initiated by the system's reminder, not the broker's memory. |
| **Cognitive load** | Low for the majority case (one-click, no new information needed); Medium when guided re-verification is required. |
| **Automation opportunities** | Automated advance reminder (escalating), the core mechanic of this workflow. |
| **AI assistance** | None required — deterministic date-driven logic. |
| **Recovery path** | Missed-renewal state (lapsed) still shows a clear path back, distinct from a listing that was intentionally archived. |
| **Screens involved** | TODAY-01, WAL-02 (package renewal), SET-04 (license renewal), CONT-02 (contract renewal), NOTIF-01. |

---

## WF-PUBLISHING — Publishing

| Dimension | Definition |
|---|---|
| **User intent** | "Confirm this is ready and put it in front of buyers." |
| **Expected outcome** | Nothing goes live incomplete — completeness verified before Publish is even offered as an enabled action. |
| **Cognitive load** | Low — this should be the easiest single step in the entire property/campaign lifecycle if everything upstream was done correctly. |
| **Decision points** | Publish now vs. hold as Draft. |
| **Automation opportunities** | Pre-publish completeness check (photos, description, compliance, pricing) fully automatic. |
| **AI assistance** | Property Quality score contributes to the completeness check. |
| **Recovery path** | If the check fails, Publish is disabled with an inline list of what's missing — never a click that silently fails or a confusing disabled button with no explanation. |
| **Screens involved** | PROP-03, PROJ-03, MKT-02. |

---

## WF-ARCHIVING — Archiving

| Dimension | Definition |
|---|---|
| **User intent** | "Get this out of my active view without losing it." |
| **Expected outcome** | History preserved; archived records stay searchable/reportable, excluded from default active views only. |
| **Cognitive load** | Low — single explicit action, never silent drift into an archived state. |
| **Automation opportunities** | None by default — archiving is always an explicit broker action, not automatic (contrast WF-LISTING-EXPIRED's auto-archive-after-grace-window, which is a distinct, narrower automated case). |
| **AI assistance** | None. |
| **Recovery path** | Un-archive is a single action from the same detail screen, no data loss. |
| **Screens involved** | PROP-02, PROJ-02, OWN-02, CUST-02, CONT-02 — archiving is a state available from any record's detail screen, not a separate module. |

---

## WF-DELETION — Deletion

| Dimension | Definition |
|---|---|
| **User intent** | "Permanently remove this — and I want to be sure before it's gone." |
| **Expected outcome** | Deliberate, scoped, reversible-for-a-grace-period deletion — direct fix for the current platform's worst finding (unscoped, unconfirmed mass-delete IDOR, `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`). |
| **Emotional state** | Should feel deliberately weighty — friction here is correct, not a UX failure. |
| **Cognitive load** | Medium by design — the plain-language consequence confirmation forces a real read, not a reflexive click-through. |
| **Decision points** | Confirm scope (exactly what is being deleted, nothing adjacent); confirm consequence understood. |
| **Automation opportunities** | None — deletion is explicitly excluded from automation per `tbos-definition/11_AUTOMATION_STRATEGY.md`. |
| **AI assistance** | None — and deliberately so; this is the one workflow category where the Constitution's "AI never the sole gate" guardrail is joined by "automation never touches this at all." |
| **Recovery path** | Soft-delete with a defined recovery window before permanent removal; recovery action surfaced in the relevant list's filter (e.g., "Recently deleted" on PROP-01), not hidden in Settings. |
| **Screens involved** | Any detail screen's delete action, confirmation modal (shared component, see [05](05_COMPONENT_MAPPING.md)). |

---

## WF-AUTOMATION — Automation (cross-cutting)

Not a standalone user-initiated flow — every workflow above has automatable sub-steps, and this entry defines the shared experience contract for automation itself, wherever it appears.

| Dimension | Definition |
|---|---|
| **User intent** (of the broker configuring, not the automation itself) | "Understand and control what the system does on my behalf." |
| **Expected outcome** | Every rule visible and editable in AUTO-01/02, never buried in code or a cron job a broker can't see. |
| **Emotional state** | Trust, not surveillance-anxiety — a broker should feel automation is working *for* them, which requires the explainability layer below. |
| **Cognitive load** | Low to review ("what ran, what happened"), Medium to configure a new rule. |
| **Decision points** | Enable/disable a rule; adjust its threshold (e.g., "reassign after N hours," N is a judgment call left to Sales Manager). |
| **Interruptions** | A failed automation must interrupt as a visible incident (never a silent gap) — routed through NOTIF at High urgency to the responsible persona. |
| **AI assistance** | AI's role here is strictly the explanatory layer ("why did this happen automatically") — routing/reminder logic itself stays deterministic and auditable, never LLM-driven, per `tbos-definition/10_AI_STRATEGY.md`. |
| **Recovery path** | Every rule shows last-run status and outcome on AUTO-01; a broker can always answer "why did this happen" from one screen (AUTO-02 detail), satisfying the Explainability contract applied to automation. |
| **Screens involved** | AUTO-01, AUTO-02, embedded status indicators wherever an automated action touched a record (e.g., LEAD-03 showing "auto-assigned because..."). |

---

## Cross-workflow pattern summary

| Pattern | Present in |
|---|---|
| Front-loaded requirements (no mid-flow surprise) | WF-PROPERTY-NEW, WF-MARKETING-CAMPAIGN, WF-CONTRACT-NEW |
| Never a dead end (rejection/failure always has a next step) | WF-LISTING-REJECTED, WF-COMPLIANCE, WF-MARKETING-CAMPAIGN (zero-eligible state) |
| Deliberately no automation | WF-DELETION, WF-PRICE-CHANGE (decision itself) |
| Deliberate interruption is correct | WF-LEAD-NEW, WF-AUTOMATION (failure case) |
| AI assistive, human-confirmed, never sole gate | WF-PROPERTY-NEW, WF-CONTRACT-NEW, WF-COMPLIANCE, WF-PRICE-CHANGE |
| Explicit action required, no silent state drift | WF-ARCHIVING, WF-DELETION |

This table is the acceptance bar for any new workflow proposed later: it must state which of these six patterns it follows and why, per the Feature Principles template (`tbos-definition/17_FEATURE_PRINCIPLES.md`).
