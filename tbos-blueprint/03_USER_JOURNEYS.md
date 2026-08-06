# 03 — User Journeys

Complete, end-to-end journeys covering every persona (`tbos-definition/04_PERSONAS.md`, codes in [00](00_IMPLEMENTATION_BLUEPRINT.md) §2). Each journey has one primary persona plus noted variations for others who run the same journey differently. Every persona appears as primary at least once; every journey type from the brief is covered.

## Coverage matrix

| Journey | Primary persona | Also varies for |
|---|---|---|
| 1. Morning Startup | SB | AO, SM, PC |
| 2. Receiving Leads | PC | SM, SB |
| 3. Publishing a Property | SB | PC |
| 4. Editing Listings & Content Quality | MM | SB |
| 5. Running a Marketing Campaign | MM | SB |
| 6. Managing a Contract | OM | PC |
| 7. Renewals | OM | SB |
| 8. Notifications in Practice | SM | All |
| 9. Generating & Sharing Reports | AO | OM |
| 10. AI Assistance in a Live Workflow | PC | All |
| 11. End-of-Day Review | AO | SM |
| 12. Platform Moderation (light detail — Platform Console out of deep scope this phase) | ADM | — |

Each journey template: **Goal · Entry point · Decision tree · Failure states · Recovery · Automation · AI intervention · Success criteria.**

---

## 1. Morning Startup — SB

- **Goal**: know, in under a minute, what needs attention today.
- **Entry point**: opens TBOS (mobile or desktop), lands on TODAY-01 by default for every persona (per [02](02_NAVIGATION_BLUEPRINT.md) §1).
- **Decision tree**:
  - TODAY-01 has entries? → scan ranked list (SLA-risk leads first, per ranking logic in [07_DECISION_SUPPORT_SYSTEM.md](07_DECISION_SUPPORT_SYSTEM.md)) → tap top entry → resolve inline or navigate to source record.
  - TODAY-01 is empty? → explicit "You're all caught up" state (never a blank screen) → broker checks HOME-01 for portfolio-level status instead.
  - A Critical notification arrived overnight (e.g., license expired)? → surfaces above the fold on TODAY-01 regardless of other ranking, per urgency override in [07](07_DECISION_SUPPORT_SYSTEM.md) §3.
- **Failure states**: TODAY-01 fails to load (offline/error) — falls back to last-cached state with a visible "showing data as of [time]" flag, never a blank error page (per [06_STATE_ARCHITECTURE.md](06_STATE_ARCHITECTURE.md)).
- **Recovery**: manual refresh action always available; if a recommendation turns out already resolved elsewhere (e.g., broker called the lead from their phone, not TBOS), dismissing it prompts "mark as done" vs. "not relevant," feeding ranking-quality signal back to Decision Support.
- **Automation**: TODAY-01's ranked list itself is fully automated — no broker curation step exists before it's generated.
- **AI intervention**: none required to *view* Today; AI Insights (`tbos-definition/10_AI_STRATEGY.md`) may annotate why an item ranks where it does, on demand (Explainability "How calculated").
- **Success criteria**: broker reaches their first meaningful action (open a lead, renew a license) in ≤2 taps from app open — matches Design Principle "Speed."
- **Persona variations**: **AO** sees agency-wide entries (team SLA breaches, revenue anomalies) ranked alongside personal items — RBAC-scoped superset, not a different screen. **SM** sees team-scoped lead-routing exceptions first. **PC** sees only their own assigned records — TODAY-01 for a Property Consultant never contains another consultant's lead even if it's objectively higher-priority agency-wide.

---

## 2. Receiving Leads — PC

- **Goal**: respond to a new lead before it goes cold.
- **Entry point**: push notification ("New lead assigned to you," Critical/High per [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md)) → deep-links directly to LEAD-03.
- **Decision tree**:
  - Lead has a phone number and WhatsApp is the broker's preferred channel? → AI-drafted reply offered, broker edits/sends via in-platform reply (formatted for WhatsApp send per `tbos-definition/13_NOTIFICATION_STRATEGY.md`).
  - Lead score is High (per Lead Scoring v1)? → surfaces urgency cue inline, no separate step.
  - Lead appears to match an existing Customer record? → LEAD-03 shows the merge suggestion inline; broker confirms or keeps separate.
  - Broker can't respond right now (mid-showing)? → "Snooze" moves it to TASK-01 with a due time, doesn't silently drop off Today.
- **Failure states**: SLA clock approaches breach with no response → auto-escalates to SM (WF-LEAD-NEW automation) — this is *not* a broker-facing failure state, it's the system catching a gap before it becomes one.
- **Recovery**: a lead responded to outside TBOS (phone call) can be manually logged from LEAD-03 in one action ("Log outside response") so the SLA clock and pipeline stage stay accurate — prevents the record from looking neglected when it wasn't.
- **Automation**: capacity-aware routing already placed this lead with the right PC before this journey begins (WF-LEAD-NEW); no manual triage step for the receiving broker.
- **AI intervention**: reply drafting (Broker Assistant v1) at the point of response; confidence shown; broker always edits/confirms before send — never auto-sent.
- **Success criteria**: North Star Metric — time from lead creation to first qualified broker response — trends down for this persona specifically.
- **Persona variations**: **SM** runs a parallel journey when auto-routing has no confident match — lands in SM's manual-assignment queue (LEAD-01 filtered view), not a broken/blocked lead. **SB** has no routing decision at all (single-user account) — the journey starts directly at "respond."

---

## 3. Publishing a Property — SB

- **Goal**: get a new listing live, correctly, fast.
- **Entry point**: QA-01 "Add Property" from anywhere, or PROP-01 "New Property" button.
- **Decision tree**: full step sequence already defined in `tbos-definition/09_WORKFLOW_ARCHITECTURE.md` (WF-PROPERTY-NEW); journey-level decisions layered on top:
  - License auto-resolves from REGA lookup? → fields pre-fill, broker confirms → skip manual entry.
  - License doesn't resolve? → manual entry path, flagged for Operations review if the broker's account requires it.
  - Media uploads processing (async)? → broker can continue filling description/pricing while processing completes in background (never blocks the flow, per Design Principle "Loading philosophy").
  - Completeness check passes? → Publish enabled. Fails? → Publish stays disabled with inline list of what's missing.
- **Failure states**: media upload fails mid-flow (current platform's confirmed weak point, `tuba-current-state/07_UX_AUDIT.md`) → specific file flagged with retry action, rest of the flow unaffected.
- **Recovery**: flow auto-saves as Draft at every step — closing the tab and returning resumes exactly where left off, per PROP-03's Draft state.
- **Automation**: pre-publish completeness check; AI description/SEO generation offered inline (broker can accept, edit, or write from scratch).
- **AI intervention**: description/SEO generation, amenity-tag suggestion from photos, price-band context (if price-history pipeline is live — see [13](13_FEATURE_READINESS_MATRIX.md) for the dependency gate). All assistive, broker confirms before publish.
- **Success criteria**: time from "Add Property" tap to live listing, trending down; zero listings published missing a required field.
- **Persona variations**: **PC** runs the identical flow but the listing is attributed to them within their agency's Properties view; a PC without publish-approval permission (agency-configured) instead completes the flow up to Draft and it routes to a manager for the final publish step — this is an RBAC configuration, not a different screen.

---

## 4. Editing Listings & Content Quality — MM

- **Goal**: keep the agency's live inventory content-complete and high quality without manually reviewing every listing.
- **Entry point**: MKT-03 (Content Quality Queue), or a recommendation on TODAY-01 ("3 listings are missing photos").
- **Decision tree**:
  - Queue shows listings below a content-quality threshold, worst-first.
  - Fixable by MM directly (better description, reordered photos)? → edits inline, re-scores immediately.
  - Requires the listing owner's (PC/SB) input (missing floor plan, owner-provided detail)? → creates a TASK-01 item assigned to that broker rather than MM editing data they don't own.
- **Failure states**: a listing scores low because of a genuinely missing asset only the owner has (e.g., no professional photos exist yet) — the queue doesn't loop this back to MM repeatedly; it stays assigned to the owning broker until resolved.
- **Recovery**: any AI-suggested content edit is shown as a diff/preview before applying, never silently overwriting the broker's original text.
- **Automation**: content-quality scoring runs automatically on every publish and on a recurring schedule for live listings (drift detection — a listing that scored well at publish can degrade if photos are removed later).
- **AI intervention**: AI content-quality scoring with fix suggestions (per `tbos-definition/07_DECISION_SUPPORT_SYSTEM.md`-equivalent recommendation category "Content quality").
- **Success criteria**: listing content-completeness score trending up agency-wide (per `18_SUCCESS_METRICS.md`).
- **Persona variations**: **SB** (no dedicated Marketing Manager) sees the same content-quality recommendations surfaced directly on TODAY-01 and PROP-02, without a separate queue screen to check — MKT-03 still exists but a Solo Broker account routes its content straight to Today given the smaller inventory.

---

## 5. Running a Marketing Campaign — MM

- **Goal**: boost the right inventory efficiently and see if it worked.
- **Entry point**: MKT-01 "New Campaign," or acting on a TODAY-01 recommendation ("3 listings under-promoted this week").
- **Decision tree**: matches WF-MARKETING-CAMPAIGN in [01_EXPERIENCE_ARCHITECTURE.md](01_EXPERIENCE_ARCHITECTURE.md) — eligibility checked at entry (before inventory selection UI even renders ineligible items as selectable), spend tier checked against WAL-01 balance before launch is enabled.
- **Failure states**: insufficient Wallet balance at launch — MKT-02 shows the shortfall amount and a direct link to WAL-02 upgrade/top-up, not a generic "insufficient funds" error.
- **Recovery**: a campaign can be paused (not only stopped) — resumable without reconfiguration.
- **Automation**: auto-boost rule (configurable in AUTO-02) can trigger this journey without MM initiating it manually.
- **AI intervention**: campaign copy generation; under-promoted-inventory recommendation on TODAY-01 is itself AI-surfaced.
- **Success criteria**: campaign attribution visible in ANL-01 within the same session it launches (no next-day-only reporting lag).
- **Persona variations**: **SB** runs a lighter version — no separate approval step, campaign launches directly since there's no team hierarchy.

---

## 6. Managing a Contract — OM

- **Goal**: turn an accepted offer into a compliant, documented transaction with zero paperwork ambiguity.
- **Entry point**: CONT-01 new entry created automatically when a Lead moves to "Won" (WF-CONTRACT-NEW trigger), OM notified via TODAY-01 + in-app/email.
- **Decision tree**:
  - Contract type determines required compliance checklist (auto-generated, not generic).
  - All checklist items pass automated pre-check (Document Intelligence)? → routes to OM for final confirmation only (not full manual review).
  - Mismatch flagged (e.g., ID number on document doesn't match system record)? → routes to OM for full manual review with the specific mismatch highlighted.
  - Requires external government verification? → contract sits at "Pending Compliance," visible countdown/status, never a silent wait.
- **Failure states**: verification takes longer than expected — CONT-02 shows elapsed time and expected range (per Explainability "What changed"/expectation-setting), not just a spinner.
- **Recovery**: a rejected/failed verification returns a specific reason and re-submission path without re-entering unaffected fields.
- **Automation**: checklist generation, status auto-transition on verification result, reminder if a contract sits Pending Compliance past the expected window.
- **AI intervention**: Document Intelligence (OCR/extraction, mismatch flagging) — assistive only; OM's confirmation is the actual approval, never automatic (`tbos-definition/10_AI_STRATEGY.md` guardrail).
- **Success criteria**: zero contracts activated with an unresolved compliance mismatch; audit-trail completeness (per `18_SUCCESS_METRICS.md` OM metric).
- **Persona variations**: **PC** experiences this journey from the origination side — sees their deal's contract status on CONT-02 (read access to their own deal) and gets notified at each stage change, but never performs the compliance-approval action itself.

---

## 7. Renewals — OM

- **Goal**: zero lapsed licenses, zero last-minute scrambles.
- **Entry point**: escalating automated reminder (email first, per [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md)) landing in TODAY-01 as the deadline nears.
- **Decision tree**:
  - Renewal needs no new information (straightforward license renewal)? → one-click renew from TODAY-01 or SET-04.
  - Renewal requires re-verification (e.g., updated document)? → guided flow, front-loaded with exactly what's needed (Philosophy Principle #4).
- **Failure states**: renewal window missed entirely (license lapses) — the dependent listings' cascading impact (per `product-audit/32_FEATURE_DEPENDENCY_GRAPH.md`'s license-as-single-point-of-failure finding) is shown explicitly on SET-04 and TODAY-01: "This affects 4 active listings" — never a silent cascade the broker discovers later.
- **Recovery**: lapsed-but-recoverable state stays visually distinct from permanently closed; renewing from a lapsed state restores dependent listings automatically once verification completes.
- **Automation**: the entire reminder cadence; one-click renewal path itself.
- **AI intervention**: none required — deterministic date logic, consistent with WF-RENEWAL in [01](01_EXPERIENCE_ARCHITECTURE.md).
- **Success criteria**: % of licenses renewed before expiry (not after), per `18_SUCCESS_METRICS.md` Compliance & Risk metric.
- **Persona variations**: **SB** has no Operations Manager to route to — the same reminder and one-click flow lands directly in their own TODAY-01, no handoff step.

---

## 8. Notifications in Practice — SM

- **Goal**: stay accountable for team SLA without being buried in noise.
- **Entry point**: NOTIF-01, or a push/in-app alert for a specific SLA-risk lead.
- **Decision tree**:
  - Notification is a per-lead SLA-breach warning (High urgency) → tap opens LEAD-03 directly, reassign or nudge the assignee inline.
  - Notification is a digest (e.g., weekly team performance summary, email) → reviewed at SM's own cadence, not interruptive.
  - SM wants to mute a specific notification type (e.g., "listing published" — informational, not their concern) → NOTIF-02, per-type toggle, never an all-or-nothing kill switch.
- **Failure states**: a delivery fails (push/SMS/WhatsApp send error) — surfaces visibly in-app per anti-fatigue rule #5 in `tbos-definition/13_NOTIFICATION_STRATEGY.md`, not silently dropped (direct fix for the current platform's confirmed-inaccurate unread badge, `tuba-current-state/`).
- **Recovery**: NOTIF-01's unread count is always real; if a broker suspects it's wrong, a manual "sync" affordance exists but should rarely be needed given the binding accuracy requirement.
- **Automation**: channel routing per notification type is fully automatic (broker doesn't configure channel-per-type from scratch, only adjusts defaults per anti-fatigue rule #1).
- **AI intervention**: none in the notification mechanism itself; AI-generated content (e.g., a drafted reply) may be *delivered via* a notification channel (WhatsApp), per `13_NOTIFICATION_STRATEGY.md`.
- **Success criteria**: team-wide SLA compliance rate improving; zero "0 unread" states with real unread activity underneath.
- **Persona variations**: applies to all personas structurally identically — channel/urgency classification is fixed per notification *type*, not per persona (`13_NOTIFICATION_STRATEGY.md`'s classification table), only the *content* of what's routed to each persona's NOTIF-01 differs by RBAC scope.

---

## 9. Generating & Sharing Reports — AO

- **Goal**: understand agency performance and share it with stakeholders (investors, team) without manually assembling a spreadsheet.
- **Entry point**: RPT-01, or a scheduled report already delivered to email (weekly auto-generation per `tbos-definition/11_AUTOMATION_STRATEGY.md`).
- **Decision tree**:
  - Existing report template fits the need? → generate on-demand from RPT-01, choose recipients/format.
  - Needs a custom view? → RPT-02 builder, composed from the same Explainability-backed metrics as ANL-01 (never a separate, less-trustworthy data source).
- **Failure states**: generation fails (large dataset timeout) — RPT-01 shows "failed, retrying" with a real retry mechanism, never a silent gap (per Design Principle "Loading philosophy" — no silent failure).
- **Recovery**: failed report auto-retries once; persistent failure surfaces as a visible incident with a support path, not an infinite silent retry loop.
- **Automation**: weekly performance summary auto-generated every Sunday night by default (configurable in AUTO-02).
- **AI intervention**: plain-language narrative summary accompanying charts (AI Insights, per `10_AI_STRATEGY.md`), always traceable back to the real underlying metric it describes.
- **Success criteria**: reports reflect real-time-accurate data with zero hardcoded/decorative figures (direct fix for the current platform's confirmed decorative dashboard charts, `tuba-current-state/07_UX_AUDIT.md`).
- **Persona variations**: **OM** runs a narrower, compliance-focused version — reports scoped to audit-trail completeness and licensing status rather than revenue.

---

## 10. AI Assistance in a Live Workflow — PC

- **Goal**: get help without leaving the task at hand — AI as copilot, never a destination (Philosophy Principle #3).
- **Entry point**: inline AI affordance embedded in the screen already being used (e.g., "Draft a reply" button inside LEAD-03) — never navigating to AICP-01 first for a routine assist.
- **Decision tree**:
  - Task is well-scoped (draft this reply, generate this description)? → inline embedded AI handles it, output shown with confidence + edit affordance.
  - Task is open-ended ("what should I focus on this week")? → AICP-01, the one legitimate reason to visit the AI Copilot as a destination.
  - Broker wants to review what AI has done on their behalf historically? → AICP-02 (AI Action Audit Log).
- **Failure states**: AI output is low-confidence or the model call fails — visible fallback to manual entry, never a blocked workflow waiting on an AI response (per `10_AI_STRATEGY.md` guardrail: AI is never the sole gate).
- **Recovery**: any AI output can be regenerated, edited, or discarded with no penalty to the surrounding workflow's state (e.g., discarding a drafted reply doesn't reset the lead's other fields).
- **Automation**: N/A — this journey is inherently about assistive, not autonomous, action.
- **AI intervention**: this journey *is* the AI intervention — full spec in [08_AI_INTERACTION_BLUEPRINT.md](08_AI_INTERACTION_BLUEPRINT.md).
- **Success criteria**: AI feature engagement rate (per `18_SUCCESS_METRICS.md`), specifically measured as *accepted-and-edited* or *accepted-as-is* rate, not raw invocation count (raw invocations reward friction, not usefulness).
- **Persona variations**: identical mechanism across all personas — what differs is which embedded AI capability is relevant to their workflows (OM sees Document Intelligence, MM sees campaign copy, SM sees team-performance summaries).

---

## 11. End-of-Day Review — AO

- **Goal**: close the day knowing the business moved forward, not just that tasks were completed.
- **Entry point**: HOME-01, reviewed at end of day as a habit (distinct from TODAY-01's start-of-day worklist purpose).
- **Decision tree**:
  - HOME-01 shows portfolio-level summary (revenue trend, team SLA compliance, active listing health) — each tile satisfies the Explainability contract, so "why" is always one tap away, never requiring a trip to ANL-01 for basic context.
  - Anomaly spotted (e.g., a metric moved unexpectedly)? → tap-through to ANL-01 for the full explanation.
- **Failure states**: no data for a tile yet (new account, or a metric genuinely has nothing to show) — explicit "not enough data yet" state, never a fabricated chart (`tbos-definition/16_MODULE_SPECIFICATIONS.md` Analytics required state).
- **Recovery**: N/A — this is a review journey, not a transactional one; any issue spotted routes into TODAY-01 or the relevant module as its own follow-up action, not resolved on HOME-01 itself.
- **Automation**: none — this is a human review moment by design (Decision-first dashboards principle: compress, don't automate away, the "how are we doing" check).
- **AI intervention**: AI Insights narrative context on portfolio tiles.
- **Success criteria**: weekly active use of HOME-01/TODAY-01 (proxy for whether Decision Support is actually trusted and used, per `18_SUCCESS_METRICS.md`).
- **Persona variations**: **SM** runs a team-scoped version (their agents' day, not the whole agency's).

---

## 12. Platform Moderation — ADM (light detail — Platform Console specified in outline only this phase, per `tbos-definition/06_PRODUCT_ARCHITECTURE.md`)

- **Goal**: keep marketplace reference data clean and respond to flagged content without ever touching Broker OS data directly.
- **Entry point**: PC-01 (Moderation Queue), reached only through the Platform Console's own, entirely separate login/session (Constitution Article V).
- **Decision tree**: flagged listing/user reviewed → approve, reject with reason (feeds WF-LISTING-REJECTED on the broker side), or escalate to PC-04 Support Tools.
- **Failure states**: N/A at this level of detail — full state spec deferred; flagged in [18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md) as needing its own detailed pass once Platform Console scope is prioritized (per `tbos-definition/19_PRODUCT_ROADMAP.md` Phase 6).
- **Recovery**: N/A, same reason.
- **Automation**: automated content-flagging (anomaly detection) feeds the queue; final moderation decision stays human.
- **AI intervention**: automated flagging/anomaly detection on reference-data changes (per persona's AI Needs in `tbos-definition/04_PERSONAS.md`).
- **Success criteria**: moderation turnaround time; zero unauthorized cross-system access incidents (Administrator's defining success metric, `18_SUCCESS_METRICS.md`).

---

See `diagrams/journeys.mmd` for the two highest-stakes journeys (Receiving Leads / WF-LEAD-NEW, and Publishing a Property / WF-PROPERTY-NEW) rendered as full decision-tree flowcharts — indexed in [19_MASTER_MERMAID_DIAGRAMS.md](19_MASTER_MERMAID_DIAGRAMS.md).
