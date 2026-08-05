# Product Philosophy

> Method note: this document infers intent from observed structure (what was built, what was left out, what is gated behind money or behavior). Inferences are labeled `[Inferred]`; anything stated as fact was directly observed in the captured screens.

## What kind of product this is `[Observed]`

Profolio is a **supply-side operations console bolted onto a demand-side marketplace**. It is not a standalone CRM and not a standalone listing manager — every module (listings, leads, credits, performance, agent gamification) exists to keep agencies feeding inventory into Bayut's own consumer marketplace and paying for visibility on it. The product's center of gravity is the **listing**, not the lead, not the agent, and not the deal. Leads (TruLeads), agent quality (TruBroker), and reporting are all satellites orbiting the listing lifecycle.

## Who it is optimized for `[Observed + Inferred]`

- **Primary persona, observed directly in the data**: a small-to-mid agency owner who is also the license holder and the only "staff" seat (the audited account — Asbar Real Estate — had 1 user, one FAL license, one owner named on both the license and the staff table). The product's defaults (all Preferences toggles on, single license shared or not shared with a small team) read as designed for this exact shape of customer, not a 50-agent enterprise brokerage.
- **Secondary persona, inferred from structure**: a larger agency with multiple agents, implied by the existence of Agency Staff, per-staff credit limits, and a team-wide Agent Performance table — but several rough edges (binary license sharing, no visible role hierarchy beyond "Owner") suggest this persona was designed for adequately, not deeply.
- Bayut itself is the implicit third persona the whole system serves: every module that isn't listing management (credits, packages, TruBroker) exists to extract or justify revenue for the marketplace operator, not to make the agency's internal operations better in isolation.

## Business priorities, ranked by what got engineering investment `[Inferred]`

1. **Keep inventory flowing and current** — the listing lifecycle (Active/Draft/Pending/Removed/Ad License Requests) is the most elaborated part of the product: multiple sub-states, retained historical performance after removal, a dedicated preview panel, REGA/license validation built into publishing.
2. **Monetize visibility** — Credits, Packages, and the "Smart Credit Utilization" auto-spend preference all exist to convert a static listing into paid-boosted inventory. Seven package tiers (Starter → Titanium) with steep step-function pricing (Save 15% → Save 84%) is a classic anchor-and-upsell ladder, not a cost-plus pricing model.
3. **Build trust signals for the marketplace, not just the agency** — TruBroker's badges, Nafath verification, and FAL license verification all feed the public Bayut listing page, not just the agency's internal dashboard. This is marketplace trust infrastructure wearing an agency-tools costume.
4. **Lead capture, minimally** — TruLeads exists and is functional, but shallow next to the listing and monetization machinery: no visible scoring, SLA, or pipeline stages. It reads as "good enough to prove Bayut leads convert," not "best-in-class CRM."
5. **Team/role governance — least invested** — permissions are two blunt toggles (per-staff credit limit, license-sharing on/off). This is the part of the product that would matter most to a growing agency and matters least to Bayut's own metrics (GMV, listing volume, credit spend), which is consistent with it being underbuilt.

## Design philosophy `[Observed]`

- **Density over guidance.** Tables are the default output format almost everywhere (listings, leads, staff, credits history) rather than cards, timelines, or guided flows. This favors power users scanning many rows over new users learning the system.
- **Numbers first, explanation second.** KPIs are presented as raw counts and percentage deltas (e.g. "Views 1,675 759%") without stated baselines — the design assumes the user already knows what's normal.
- **Status via color+text pill, not iconography alone** — Live (green), Basic/Hot/Signature (neutral/colored tag), consistent across listings, leads, and reports.
- **Brand-consistent but marketplace-inherited** — the teal brand (`#006169` primary, `Figtree` / `Droid Arabic Kufi` typography — see [[25_DESIGN_SYSTEM_AUDIT]]) is the same visual language as the consumer-facing bayut.sa site, reinforcing that Profolio is a portal into the marketplace, not an independent product with its own identity.

## Navigation philosophy `[Observed]`

A single flat sidebar, ten items, no grouping, no collapsible sections. This is deliberately shallow — it optimizes for "everything is one click away" over "related things are organized together." The cost is that two unrelated-sounding-but-adjacent items ("Agent Performance" and "Reports") are easy to misread as one compound label, which is exactly what happened during this audit's own first capture pass.

## Workflow philosophy `[Observed]`

Nearly every workflow in the product is **reactive, not guided**: Post Listing gives a two-option fork and nothing else before handing off to a form; Draft listings say *that* they're blocked (Insufficient Credits) but not *by how much*; License expiry is shown on one screen and its consequence (Ad License Expired) shown on a completely different screen with no link between them. The system tells you what happened after the fact far more often than it tells you what to do next.

## Commercial strategy `[Inferred]`

Credits are the unit of account for nearly every valuable action (publishing beyond the free tier, Hot/Signature upgrades, Refresh, Photography/Videography/Drone services). This is a **usage-metered SaaS model wrapped around a real-estate marketplace**, functionally similar to ad-credit systems on other classifieds platforms. The "Smart Credit Utilization" toggle (on by default) that auto-spends *expiring* credits is a strategy to minimize credit expiry write-offs by nudging (or auto-triggering) spend before credits lapse — good for utilization metrics, worth scrutiny from a user-consent standpoint since it authorizes autonomous spending with no visible log.

## User retention strategy `[Inferred]`

Three independent hooks keep an agency owner opening the app: (1) the profile-completion progress ring (90% at capture time, framed as unfinished work), (2) TruBroker's Locked badges (status anxiety — visible achievement, no path shown), (3) the Notifications feed mixing genuine transactional alerts (new leads) with marketing nudges (upgrade prompts, TruBroker onboarding). All three are classic engagement-loop patterns; none require the user to have done anything wrong to be shown as "incomplete."

## Gamification strategy `[Observed]`

TruBroker is the most sophisticated part of the retention design: a Leaderboard, a point currency (TruPoints™), and three badges each computed from real behavioral inputs (photo/feature completeness, call/WhatsApp response rate, active listing count). It converts otherwise-invisible listing quality into a public, competitive status — genuinely good product thinking. The flaw is completion, not concept: every badge was shown Locked with a description and sub-metrics but no explicit target ("you need 80% Image Score, you're at 4.58%") — the game is visible, the win condition is not.

## Credit economy `[Observed]`

Single fungible currency ("Credits") spent across heterogeneous services (listing tiers, refresh, media production services). One account showed a 3,000-credit annual package plus 3,250 credits of top-ups, for 6,250 available and 0 used — i.e. a real business paying up front for capacity it hadn't yet consumed at capture time, which is a healthy sign for Bayut's cash-flow model (prepayment) independent of the agency's actual usage rate.

## Listing lifecycle philosophy `[Observed]`

Five states (Active, Draft, Pending, Removed, Ad License Requests) with sub-reasons inside Draft (Not Posted, Insufficient Credits) and Removed (Ad License Expired, Deleted). The philosophy is **retain everything, explain little**: removed listings keep their lifetime performance data (one example: 12,049 views / 231 clicks / 22 leads preserved after removal), which is valuable, but the four sub-reasons are visually identical status pills with no glossary connecting cause to fix.

## Agency management philosophy `[Observed + Inferred]`

Ownership-centric, not team-centric. The FAL license — the single compliance artifact every listing depends on — belongs to one named owner and is shared with staff as a binary yes/no, not delegated or scoped. Staff get a credit spending cap but no visible role (Admin/Agent/Finance) distinct from "Owner" vs. everyone else. `[Inferred]` This suggests the product was built for agencies where the owner is still the operational bottleneck, not for agencies that have already delegated publishing/lead/finance authority to distinct roles.

## What problems Bayut is actually trying to solve `[Inferred]`

Not "help agencies run their business" as a general goal — the evidence points to a narrower goal: **keep licensed inventory current, paid, and high-quality on the Bayut marketplace, with just enough CRM and gamification bolted on to make agencies feel Profolio is doing more for them than a pure ad-posting tool.** Every module that would purely benefit the agency's internal operations without also benefiting Bayut's marketplace (deep CRM automation, true multi-role governance, exportable BI) is the module that's thinnest.
