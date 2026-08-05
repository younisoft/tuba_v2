# 04 — Personas

**Status**: Recommended, informed by Observed evidence from `tuba-current-state/` (real account structure: agents, agent-users/sub-agents, admin roles all exist in the current platform's data model) and by the TBX synthesis's finding that no audited platform (Bayut, Aqar, or Tuba's current system) supports real role differentiation. These personas are the reason TBOS needs RBAC as a first-class primitive, not a justification written after the fact.

Each persona: Goals, Pain Points, Daily Workflow, Success Metrics, Permissions, AI Needs.

---

## 1. Solo Broker

**Who**: An independent agent, no team, handles every function themselves. Tuba's current platform's most common account shape based on the observed data model (an `Agent` with no `AgentUser` sub-accounts).

**Goals**: Close deals fast without administrative drag; look credible to owners and buyers despite being a "team of one"; never miss a lead because they were busy showing a property.

**Pain Points** (grounded): Today, a lead can silently misroute to the wrong contact entirely (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §2) — for a solo broker with no team to catch the error, a misrouted lead is simply gone. No time for a flat, unscored, undifferentiated inbox (`tuba-current-state/07_UX_AUDIT.md`).

**Daily Workflow**: Check leads first thing → respond to hottest ones → update listing statuses → follow up on pending offers → post one or two new listings a week → chase their own license renewals with no assistant to delegate to.

**Success Metrics**: Leads responded to within the hour; listings that stay "fresh" (recently updated) without manual busywork; license/compliance status always green with zero self-tracking.

**Permissions**: Full owner-level access to their own account — this persona *is* the account, so permission scoping is less about restricting them and more about TBOS never asking them to manage a role system they don't need.

**AI Needs**: Highest of any persona, because there's no team to compensate. Reply-drafting (Broker Assistant v1, `tuba-current-state/16_AI_READINESS.md`), lead scoring so they know who to call first, automated compliance reminders, AI-generated listing descriptions/SEO (already live for Property in Tuba's current platform — extend and lean on this).

## 2. Agency Owner

**Who**: Runs a multi-agent brokerage; thinks in revenue, headcount, and portfolio, not individual listings.

**Goals**: Grow the agency's deal volume without growing overhead linearly; know which agents are performing and why; protect the agency's reputation (reviews, compliance) at a portfolio level.

**Pain Points** (grounded): Tuba's current team-management screen is a flat name/phone-number table with zero role or scope column (`tuba-current-state/04_PAGE_ANALYSIS.md`, `/agent-users`) — an Agency Owner today cannot see, let alone control, what any team member can do. No agency-level analytics beyond one real report (Rent Now Click) exists (`tuba-current-state/05_FEATURE_CATALOG.md`).

**Daily Workflow**: Morning portfolio review (which listings/agents need attention) → resolve escalations a Sales Manager couldn't → review financial/package status → occasionally onboard/offboard a team member.

**Success Metrics**: Agency-wide lead response time; revenue per agent; package/subscription ROI made visible, not assumed.

**Permissions**: Full account owner — can create/edit roles, assign scoped permissions to every other persona below, see all financial and performance data across the agency.

**AI Needs**: Portfolio-level insights ("these 3 agents are below team average response time"), automated agency-wide compliance monitoring, AI-assisted team performance summaries.

## 3. Sales Manager

**Who**: Reports to the Agency Owner; owns lead distribution and agent performance day-to-day.

**Goals**: Route every lead to the right agent fast; keep the team accountable without micromanaging; hit team-level close targets.

**Pain Points** (grounded): There is currently no lead pipeline, no stage model, no ownership/claim mechanism at all (`tuba-current-state/05_FEATURE_CATALOG.md` — "Does not exist"), meaning this entire persona's job is undoable in Tuba's current platform without working entirely outside it (spreadsheets, WhatsApp).

**Daily Workflow**: Review incoming leads → assign/reassign → monitor response-time compliance across the team → escalate stuck leads → report up to the Agency Owner.

**Success Metrics**: Lead assignment latency; percentage of leads responded to within SLA; lead-to-close conversion by agent.

**Permissions**: Full visibility into team leads and performance; can reassign leads and set SLAs; no financial/billing access unless separately granted.

**AI Needs**: Automated lead routing (capacity-aware, not broadcast-to-all — a specific gap named in the July self-audit's CRM recommendations), SLA-breach alerts, lead-scoring to prioritize the queue.

## 4. Marketing Manager

**Who**: Owns listing quality, promotion spend, and campaign performance across the agency's inventory.

**Goals**: Maximize listing visibility ROI; keep content (photos, descriptions, SEO) consistently high quality without manually reviewing every listing.

**Pain Points** (grounded): Tuba's current AI description generator is Property-only, not extended to Projects (`tuba-current-state/16_AI_READINESS.md`); the "Marketing Requests" mechanic (owner-originated demand) exists but is buried two clicks deep with no dedicated surface and leaks untranslated tokens into its own UI (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3) — exactly the kind of real-but-invisible feature this persona should be the primary user of and currently can't reasonably find.

**Daily Workflow**: Review new listings for content quality → run/monitor promotion campaigns → triage owner-originated Marketing Requests → analyze which listing types/districts are underperforming.

**Success Metrics**: Listing content completeness score; promotion spend efficiency; Marketing Request response/close rate.

**Permissions**: Read/write on listing content and promotions across the agency; read-only on lead/deal data unless it's promotion-attributed; no team-management access.

**AI Needs**: AI content generation extended to every listing type, automated content-quality scoring with specific fix suggestions, AI-surfaced Marketing Requests worth prioritizing (matched against agency capacity/specialty).

## 5. Operations Manager

**Who**: Owns compliance, contracts, and the administrative backbone — the persona closest to what "Administrator" (below) does for platform accounts, but focused on the business's regulatory obligations.

**Goals**: Zero compliance lapses (expired licenses, unverified identities); contracts filed and renewed on time; smooth, auditable paper trail.

**Pain Points** (grounded): Tuba's current platform has REGA/Nafath/FAL integrations that function but present no unified "what's next / which listings are affected" compliance view (`tuba-current-state/13_GAP_ANALYSIS.md` — the "license/compliance lifecycle" row); FAL license review today is entirely manual, no OCR/extraction assist (`tuba-current-state/16_AI_READINESS.md`); there is no audit log anywhere in the platform (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`) — this persona's core job (proving what happened and when) is currently unsupported by the product at all.

**Daily Workflow**: Monitor upcoming license/verification expirations → review and submit compliance documents → audit team actions when something goes wrong → liaise with government-integration failures.

**Success Metrics**: Zero lapsed licenses; document turnaround time; a complete, queryable audit trail (currently nonexistent).

**Permissions**: Full read/write on compliance and contract data agency-wide; read-only elsewhere; the one persona who should always have audit-log access.

**AI Needs**: Document Processing (OCR/extraction assist on FAL license uploads, per `tuba-current-state/16_AI_READINESS.md`), proactive renewal reminders, plain-language compliance-requirement explanations (Explainability principle applied to regulatory jargon).

## 6. Property Consultant

**Who**: A team member (not the account owner) whose job is showings, buyer relationships, and closing — the "boots on the ground" persona a Sales Manager routes leads to.

**Goals**: Get good leads fast, close them, get credit for it.

**Pain Points** (grounded): This persona is exactly who suffers from the live-confirmed lead-inbox bug — their own account's inbox can show *their own* contact details as the "sender" on a real lead (`tuba-current-state/04_PAGE_ANALYSIS.md`, `/agent-inbox`), meaning they may literally be unable to identify who actually contacted them.

**Daily Workflow**: Receive assigned leads → respond/schedule showings → update deal status → request marketing/photography support → hand off successful deals to Operations for contract processing.

**Success Metrics**: Personal close rate; response time; number of active deals in progress.

**Permissions**: Full access to their own assigned leads/listings; no visibility into other consultants' pipelines unless the Sales Manager grants it; no team/billing access.

**AI Needs**: Reply-drafting, next-best-action suggestions per lead, automated showing-scheduling assistance.

## 7. Administrator

**Who**: Internal Tuba staff, not a broker-side persona at all — manages the platform itself (reference data, platform-wide compliance, content moderation). In the current platform this role is *architecturally the same login and same screens* as an agency owner (`tuba-current-state/11_TECHNICAL_ARCHITECTURE.md`), which is itself a defect TBOS must not repeat.

**Goals**: Keep the marketplace's reference data (cities, categories, property types) clean; moderate flagged content; support brokers when something breaks.

**Pain Points** (grounded): Today, 5+ reference-data controllers have no permission check beyond being logged in at all (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` §4) — meaning this persona's own tools are currently indistinguishable, security-wise, from a broker's.

**Daily Workflow**: Review flagged listings/users → maintain reference data → respond to escalated support/compliance issues → monitor platform health.

**Success Metrics**: Reference-data accuracy; moderation turnaround time; zero unauthorized access incidents.

**Permissions**: This is the one persona that must **never** share a login surface or route space with any broker-side persona — full architectural separation is a TBOS requirement, not a configuration choice (see `06_PRODUCT_ARCHITECTURE.md`, `07_INFORMATION_ARCHITECTURE.md`).

**AI Needs**: Automated content-moderation flagging, anomaly detection on reference-data changes, support-ticket summarization.

---

## Cross-persona pattern

Every persona above except the Solo Broker depends on **real, scoped RBAC to do their job at all** — not as a nice-to-have, but as the literal precondition for their daily workflow to function (a Sales Manager cannot manage a team's leads if the platform has no concept of "this lead belongs to this person," an Operations Manager cannot audit anything without a log). This is why `13_GAP_ANALYSIS.md`'s single highest-leverage recommendation (real RBAC) is not one feature among many for TBOS — it is the persona system's load-bearing wall.
</content>
