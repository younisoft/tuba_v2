# Tuba Next-Generation Platform Specification

This is the synthesis document: every prior file in this phase (Philosophy, Journeys, Data Model, Components, Design System, UX Patterns, Permissions, API Inference, Dependency Graph, Performance, AI Architecture) feeds into the nine feature specs below. Each spec follows the same structure: **Current Bayut Implementation** (evidence-based) → **Tuba Next-Generation Design** (recommendation). Priorities use P0 (build first) → P3 (later/optional). Complexity is relative to Tuba's own scope, not absolute.

---

## 1. Listing Lifecycle & Inventory Management

### Current Bayut Implementation
Five lifecycle states (Active, Draft, Pending, Removed, Ad License Requests) with four distinct sub-reasons (Not Posted, Insufficient Credits, Ad License Expired, Deleted) spread across two tabs. Removed listings retain lifetime performance. A read-only preview panel exists. **Strengths**: historical data retention, functional filtering by ID/REGA/purpose/type. **Weaknesses**: no unified status glossary, no bulk actions, no saved views, "Publish Now" appears identically whether the fix is a credit top-up or a license renewal — two completely different remediation paths behind one button label. **Pain point**: an agency owner managing dozens of listings has no way to see "everything blocked and why" in one view; they'd have to open Draft and Removed separately and infer the cause from a status pill.

### Tuba Next-Generation Design
- **UX**: One unified "Needs Attention" view merging Draft + Removed + expiring-soon Active listings, each row showing plain-language cause and a single, correct fix action (not a generic "Publish Now" for every cause).
- **Business logic**: Listing status becomes a computed state (not a manually-set field) derived from license validity + credit balance + explicit user action, so the four causes can never drift out of sync with their pills.
- **Automation**: license-expiry and credit-shortfall warnings fire 14/7/1 days before a listing would be forced into Removed/Draft — moving the product from reactive to preventive (see [[29_USER_JOURNEYS]] journey 2).
- **AI enhancements**: draft-recovery assistant computing the minimum top-up needed (see [[34_AI_ARCHITECTURE]] P1); listing-quality score at publish time, not just post-hoc via gamification.
- **Scalability**: bulk actions (multi-select republish, multi-select tier change) — confirmed absent in Bayut (see [[26_UX_PATTERN_LIBRARY]]) and a direct opportunity.
- **Performance**: server-side filtering/pagination as Bayut already does correctly (see [[33_PERFORMANCE_ARCHITECTURE]]) — replicate, don't regress.
- **Technical architecture**: Listing status as a derived/materialized field recomputed on every relevant write (credit spend, license update), not stored as an independent source of truth — prevents the two-screens-disagree class of bug.
- **Expected KPI improvement**: reduction in "involuntary" listing removal (license/credit related), faster time-to-republish.
- **Complexity**: Medium. **Priority**: P0. **Phases**: MVP (unified status glossary + correct fix-actions) → V2 (predictive warnings) → V3 (bulk actions).
- **Risk**: computed-status logic must handle race conditions (credit spent by another staff member mid-view) — needs careful cache invalidation.
- **Competitive advantage**: this single change directly fixes the top weakness identified across the entire audit (see [[15_WEAKNESSES]], [[19_TUBA_RECOMMENDATIONS]] P0 row).

---

## 2. Credits & Package Economy

### Current Bayut Implementation
Single fungible credit currency spent across listing tiers and media services; 7-tier package ladder (Starter→Titanium) with steep discount anchoring (Save 15%→84%); "Smart Credit Utilization" auto-spend toggle, on by default, with no visible spend log. **Strengths**: transparent balance/usage history with per-listing attribution. **Weaknesses**: no burn-rate forecast, no ROI framing (credits spent vs. leads generated), autonomous spending with no audit trail.

### Tuba Next-Generation Design
- **UX**: a Credit ROI panel next to the balance — "X credits spent this month generated Y leads (Z SAR/lead equivalent)" — reframing the ledger from accounting to business insight.
- **Business logic**: auto-spend (equivalent to Smart Credit Utilization) opt-in by default *off*, with a visible, filterable log entry every time it fires, distinct from manual spend.
- **Automation**: recommend which specific listing should receive a Hot/Signature upgrade based on underperformance-relative-to-comparable-listings, not a flat auto-spend rule.
- **AI enhancements**: package-tier recommendation based on actual usage pattern (an agency consistently maxing Basic listings before month-end is a Silver/Gold candidate — Bayut's own tier ladder implies this logic exists internally but isn't surfaced to the customer).
- **Scalability**: per-staff and per-listing-type budget allocation (extends Bayut's existing per-staff Credits Limit primitive — see [[27_PERMISSION_MATRIX]]).
- **Technical architecture**: Credit Transaction as an immutable append-only ledger (event-sourced), balance as a derived sum — makes the "auto-spend audit trail" requirement free by construction.
- **Expected KPI improvement**: higher credit utilization efficiency (leads per credit spent), reduced support tickets about "where did my credits go."
- **Complexity**: Medium. **Priority**: P1. **Phases**: MVP (opt-in auto-spend + full log) → V2 (ROI panel) → V3 (tier recommendation engine).
- **Risk**: ROI attribution (crediting a lead to a specific upgrade spend) requires reliable event correlation — get the ledger event-sourced from day one or this becomes very hard to retrofit.
- **Competitive advantage**: turns the credit system from "trust us" to "here's what you got for it" — a direct answer to the ROI gap identified in [[10_REPORTING_REVIEW]].

---

## 3. Lead Management (TruLeads equivalent)

### Current Bayut Implementation
Functional lead table with channel attribution (Call/WhatsApp/SMS/Email), Call/WhatsApp Insight widgets, Add Task. **Strengths**: multi-property lead linking, direct message-text visibility for WhatsApp leads. **Weaknesses**: no scoring, no SLA, no pipeline stages, "Unnamed Lead" requires manual name entry, no duplicate/merge handling.

### Tuba Next-Generation Design
- **UX**: pipeline board (New → Contacted → Qualified → Viewing → Offer → Closed) as an alternative view to the table, matching modern CRM mental models (HubSpot/Salesforce-adjacent per [[17_COMPETITIVE_ANALYSIS]]) without losing the table's density for power users.
- **Business logic**: SLA timer visible per lead (time since last interaction vs. a configurable response target), escalating visually as it ages.
- **Automation**: auto-assignment rules (round robin or listing-owner default) for agencies with multiple agents — a gap Bayut can't fill given its single-observed-seat account, but implied as needed by the very existence of a staff table.
- **AI enhancements**: lead scoring (channel + response history + listing price/type), auto-enrichment for Unnamed Leads (see [[34_AI_ARCHITECTURE]] P1), duplicate-lead detection across channels (a phone call and a WhatsApp message from the same number, currently likely two separate rows).
- **Scalability**: bulk task assignment, saved lead filters (both confirmed absent in Bayut, see [[26_UX_PATTERN_LIBRARY]]).
- **Technical architecture**: Lead↔Listing as an explicit many-to-many join table from day one (Bayut's own "+1 more properties" lead implies this is needed; see [[23_DATA_MODEL]]).
- **Expected KPI improvement**: reduced lead response time, higher lead-to-viewing conversion, fewer leads falling through with no follow-up.
- **Complexity**: High. **Priority**: P0. **Phases**: MVP (SLA timers + auto-enrichment) → V2 (pipeline board + scoring) → V3 (auto-assignment + duplicate merge).
- **Risk**: lead scoring model needs real conversion outcome data to train against — cold-start problem; ship a rules-based score first, upgrade to learned model once Tuba has its own conversion data.
- **Competitive advantage**: this is the single largest gap versus modern CRM competitors identified in [[17_COMPETITIVE_ANALYSIS]] — TruLeads is Bayut's weakest major module relative to its own ambition.

---

## 4. Agent Performance & Gamification (TruBroker equivalent)

### Current Bayut Implementation
Leaderboard, TruPoints™, three badges (Quality Lister, Responsive Broker, Super Lister) each scored on real behavioral metrics — genuinely differentiated. **Weakness, singular and specific**: every badge shown Locked with no stated threshold — visible game, invisible win condition.

### Tuba Next-Generation Design
- **UX**: every locked badge shows its exact threshold and the agent's current distance from it ("Image Score 4.58% → need 80%: add photos to 3 more listings"), turning the badge from a status symbol into a checklist.
- **Business logic**: keep the same underlying score model (image completeness, feature completeness, responsiveness, volume) — it's sound; the fix is disclosure, not redesign.
- **Automation**: proactive nudges tied to the nearest-to-unlock badge, not a generic "complete your profile" notification.
- **AI enhancements**: badge-coaching copy generation (see [[34_AI_ARCHITECTURE]] P0) — the cheapest, highest-confidence AI feature in this entire spec because the underlying facts are already exact numbers.
- **Scalability**: team leaderboards scoped by branch/office for larger agencies (Bayut's flat, single-agency leaderboard doesn't anticipate multi-branch orgs).
- **Technical architecture**: keep Agent Performance as a derived/computed layer over Listings + Leads (per [[32_FEATURE_DEPENDENCY_GRAPH]]) — no new primary data entry required.
- **Expected KPI improvement**: higher badge-unlock rate, higher listing-quality scores agency-wide (the metric the badge already measures).
- **Complexity**: Low. **Priority**: P0 (highest ROI-to-effort ratio in this entire document). **Phases**: MVP (disclose thresholds) → V2 (coaching copy) → V3 (branch-level leaderboards).
- **Risk**: minimal — this is a presentation-layer fix on data Bayut/Tuba already computes.
- **Competitive advantage**: TruBroker is already Bayut's most distinctive feature; shipping the "obvious" fix Bayut hasn't made yet is a fast, visible way for Tuba to look more polished on a feature category Bayut effectively invented for this market.

---

## 5. Reporting & Analytics

### Current Bayut Implementation
Dashboard KPIs + Reports Summary (composition, location breakdown, tiered performance time series) + Agent Performance scores. **Weakness**: Reports largely duplicates the Dashboard's Performance widget; no export; no period-over-period or market-benchmark comparison; percentage deltas shown with no stated baseline.

### Tuba Next-Generation Design
- **UX**: every KPI card states its comparison baseline explicitly ("+759% vs. previous 30 days" not just "759%"); Reports becomes a genuinely distinct destination (executive rollup, agent report, listing-quality report, credit ROI report — see [[10_REPORTING_REVIEW]] recommendations) rather than a mirror of the dashboard.
- **Business logic**: report definitions as reusable, save-able configurations (date range + segment + metric set), not one fixed view.
- **Automation**: scheduled report delivery (email/Slack digest) — confirmed absent in Bayut.
- **AI enhancements**: natural-language query over reports ("which listings underperformed this month") — P2/P3 per [[34_AI_ARCHITECTURE]], sequenced after the deterministic reporting is solid.
- **Scalability**: server-side aggregation with `group_by`, mirroring the pattern Bayut's own `legion.bayut.sa` API already proves works (see [[31_API_ARCHITECTURE_INFERENCE]]) — build Tuba's reporting API the same way from day one.
- **Technical architecture**: a dedicated reporting/analytics service reading from an event log (listing views/clicks, credit spend, lead events), decoupled from the transactional Listings/Leads services — avoids reporting queries competing with production write traffic.
- **Expected KPI improvement**: reduced "why did this number change" support burden; increased report usage (currently likely low given the duplication problem).
- **Complexity**: Medium–High. **Priority**: P1. **Phases**: MVP (baseline-aware KPI cards + CSV export) → V2 (report builder + scheduling) → V3 (NL query).
- **Risk**: a separate analytics store adds operational complexity (sync/consistency) — acceptable trade for reporting performance at scale.
- **Competitive advantage**: closes the gap against HubSpot/Zoho-class reporting depth called out in [[17_COMPETITIVE_ANALYSIS]] without needing Bayut's marketplace-scale data — Tuba's advantage is presenting *its own* agency's data better, not needing more of it.

---

## 6. Licensing & Compliance

### Current Bayut Implementation
Single FAL license record (number, CR, owner, validity, binary staff-sharing toggle) underlying every listing's REGA ID. **Strength**: clear, trustworthy presentation of a compliance-critical record. **Weakness**: no forward link from expiry date to affected listings; sharing is all-or-nothing.

### Tuba Next-Generation Design
- **UX**: License detail page shows a live-linked list of every listing depending on it, with a visible countdown to expiry.
- **Business logic**: support multiple licenses per agency (branch offices, multiple license holders) from the data model — Bayut's single-license-per-agency shape is a limitation worth not inheriting.
- **Automation**: expiry-forecast notifications (see [[34_AI_ARCHITECTURE]] P0) fanning out to every affected listing's assigned agent, not just the owner.
- **Scalability & permissions**: license visibility scoped per-role (Admin/Listing Manager see it; Agent doesn't need to) instead of Bayut's single agency-wide toggle — see [[27_PERMISSION_MATRIX]].
- **Technical architecture**: License as a first-class entity with a proper foreign key from Listing (inferred as missing an explicit join in Bayut's model — see [[23_DATA_MODEL]]), enabling the dependent-listings view above without a brittle cross-reference.
- **Expected KPI improvement**: near-zero involuntary listing removal due to license lapse (directly measurable, directly tied to revenue).
- **Complexity**: Low–Medium. **Priority**: P0 (small build, high revenue-protection value, and unlocks the Listing Lifecycle P0 item above).
- **Risk**: multi-license-per-agency adds a small amount of modeling complexity up front; worth it to avoid a costly later migration.
- **Competitive advantage**: converts a purely defensive compliance feature into a visible trust/reliability differentiator ("your listings never lapse without warning").

---

## 7. Staff, Roles & Permissions

### Current Bayut Implementation
One role label ("Owner"), one staff table, two coarse controls (per-staff credit limit, license-sharing toggle), no audit log. Never tested past a single seat in this audit (see [[27_PERMISSION_MATRIX]] caveat).

### Tuba Next-Generation Design
- **UX**: explicit role picker at invite time (Admin, Listing Manager, Agent, Finance, Read-only Analyst — the six-role model proposed in [[27_PERMISSION_MATRIX]]).
- **Business logic**: every sensitive action (license edit, staff invite, package purchase) checked against role, not just "is this the Owner."
- **Automation**: none needed here — this is a governance feature, not a workflow-automation one.
- **Scalability**: role model designed for multi-branch agencies (a branch-scoped Admin role) from day one, since Bayut's flat model is a known gap, not a design choice to copy.
- **Technical architecture**: RBAC table (role → permission → resource) plus an append-only audit log (both confirmed absent in Bayut).
- **Expected KPI improvement**: reduced risk incidents (unauthorized credit spend, unauthorized listing deletion), auditable compliance trail for regulated real-estate operations.
- **Complexity**: Medium. **Priority**: P1 (important, but not blocking for a single-seat MVP customer — sequence after the P0 items that benefit every customer regardless of team size).
- **Risk**: over-engineering roles before Tuba has real multi-seat customer feedback — ship the six-role model as a default but keep it configurable, not hard-coded.
- **Competitive advantage**: this is the most-cited weakness in the entire audit ([[12_PERMISSIONS]], [[27_PERMISSION_MATRIX]]) and the one most likely to matter to a growing agency evaluating Tuba vs. Bayut.

---

## 8. Notifications

### Current Bayut Implementation
Single reverse-chronological feed mixing transactional (new lead) and marketing/lifecycle (upgrade nudges, TruBroker onboarding) content, backed by MoEngage (see [[31_API_ARCHITECTURE_INFERENCE]]).

### Tuba Next-Generation Design
- **UX**: two visually distinct streams (Activity / Recommendations) or a filter toggle, so a user scanning for a missed lead isn't wading through marketing copy.
- **Business logic**: notification priority/urgency as an explicit field, driving both ordering and (for high-urgency items like license expiry) a more insistent surface than a dropdown badge.
- **Automation**: this module *is* the automation layer for several other specs above (license expiry, badge-coaching, draft-recovery) — architect it as a generic event→notification pipeline other features publish into, not a bespoke feed.
- **Technical architecture**: publish/subscribe pattern — domain events (lead.created, license.expiring, badge.near_unlock) published to a notification service that renders per-channel (in-app, push, email) copy, rather than each feature hard-coding its own notification text.
- **Expected KPI improvement**: faster time-to-action on transactional alerts (not buried under marketing).
- **Complexity**: Medium. **Priority**: P1 (unlocks/simplifies several P0 features above, so pull it forward if resourcing allows).
- **Risk**: low.
- **Competitive advantage**: minor on its own, but a force-multiplier for the AI/automation features specified elsewhere in this document.

---

## 9. Settings & Profile Management

### Current Bayut Implementation
Five sub-pages (User, Agency, Licenses, Preferences, Change Password) with solid bilingual field pairing and an existing AI-generation button on the agent-bio field. **Weakness**: marketing-consent toggle (Preferences) on by default; no character-count/SEO guidance on public-facing description fields.

### Tuba Next-Generation Design
- **UX**: extend the proven bilingual AI-generation pattern to the Agency Description field, not just the individual agent bio.
- **Business logic**: consent toggles default to off for anything not strictly operational (mirrors basic consent-by-design practice); explicit distinction between fields that affect the public listing profile vs. internal-only fields.
- **Complexity**: Low. **Priority**: P2 (polish-tier, not a structural gap).
- **Competitive advantage**: minor but easy; signals attention to consent/privacy detail that a compliance-conscious agency customer would notice.

---

## Cross-cutting summary

The two features worth building **regardless of company size or team maturity** (P0, low-to-medium complexity, high leverage) are **Listing Lifecycle unification** and **TruBroker-style badge disclosure** — both are presentation/logic fixes on data that already exists once Listings and Credits are built, costing little and fixing the single most-repeated weakness across every document in this audit. Lead Management is the highest-value, highest-complexity investment, and should be resourced accordingly rather than shipped as a Bayut clone. See [[35_PRODUCT_ROADMAP]] for sequencing across MVP/V2/V3.
