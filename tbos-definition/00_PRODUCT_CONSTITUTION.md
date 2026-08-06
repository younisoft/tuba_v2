# 00 — Product Constitution: Tuba Broker OS (TBOS)

**Status**: Recommended. This is the single source of truth for what TBOS is, why it exists, and how every future decision about it should be made. It synthesizes documents 01–21 in this folder; where you need the full evidence or reasoning behind a claim here, follow the link. Engineering, design, QA, AI, and product teams should be able to build from this document with a shared vision and minimal ambiguity.

---

## Article I — Why TBOS Exists

Every platform examined in this competitive set — Bayut, Aqar, and Tuba's own current system — was built as a **listings marketplace with broker tools attached afterward**. TBOS inverts that: it is a broker's operating system that happens to feed a public marketplace, not a marketplace that happens to have a broker login. Full reasoning: `01_PRODUCT_VISION.md`.

**Mission**: give every broker — solo agent to multi-branch agency — a system that closes the gap between the work they actually do and the work the software lets them see.

**Product Promise**: *"You will never wonder what TBOS wants you to do next."*

**North Star Metric**: time from lead creation to first qualified broker response, trending down, platform-wide. Full metrics tree: `18_SUCCESS_METRICS.md`.

## Article II — The Ten Principles

Every feature, screen, and decision is checked against these (`02_PRODUCT_PHILOSOPHY.md` for full grounding):

1. Action over information — no fact without its implied action.
2. Explainability over raw numbers — every score/status explains why, how, what changed, what to do, and why it matters (`14_EXPLAINABILITY_SYSTEM.md`).
3. AI as copilot, not a page — embedded in workflows (`10_AI_STRATEGY.md`).
4. One-click workflows, front-loaded requirements — no flow discovers a blocker halfway through.
5. Automation-first — a human doing what a machine could do reliably is a defect (`11_AUTOMATION_STRATEGY.md`).
6. Trust by design — TBOS never does to its own users what it wouldn't want done to a broker's clients.
7. Broker-first thinking — every screen designed from the job, never from the data model.
8. Decision-first dashboards — compress "what should I look at" to the smallest surface (`15_DECISION_SUPPORT_SYSTEM.md`).
9. Outcome-driven UX — measured by business outcomes, not render-correctness.
10. One home per capability — never two navigation paths to the same feature (`07_INFORMATION_ARCHITECTURE.md`).

## Article III — Who TBOS Serves

Seven personas, full detail in `04_PERSONAS.md`: **Solo Broker, Agency Owner, Sales Manager, Marketing Manager, Operations Manager, Property Consultant, Administrator.** Every persona except Administrator lives in the Broker OS; Administrator lives in a fully separate Platform Console (Article V). Every persona but the Solo Broker is dependent on real RBAC to do their job at all — this is not a nice-to-have, it is the precondition for six of seven personas' daily workflow to function.

Seventeen ranked Jobs To Be Done underlie these personas, full list in `05_JOBS_TO_BE_DONE.md`; the top six — follow up on leads, publish/update listings, respond to owner-originated demand, negotiate and close, track compliance, manage the team — receive first-class modules; the rest are served by the same architecture without needing dedicated top-level surfaces.

## Article IV — The Module Architecture

Three layers, nineteen modules, full detail in `06_PRODUCT_ARCHITECTURE.md` and `16_MODULE_SPECIFICATIONS.md`:

- **Orientation** (what needs attention): Home, Today, Tasks.
- **Operating** (where the jobs get done): Properties, Projects, Leads, Customers, Owners, Contracts, Marketing.
- **Intelligence & Control** (understand and configure): Finance, Wallet, Analytics, Reports, Automation, AI Copilot, Notifications, Knowledge, Settings.

No capability lives in two places. Where a feature seems to need two entry points, the information architecture is wrong, not the feature.

## Article V — The Architectural Split

**Broker OS** and **Platform Console** are two structurally separate systems — different route space, different login surface, different session. This is the single most consequential architectural decision in this constitution: Tuba's current platform's worst-rated finding is that admin and broker share one route group, one controller set, one layout, and every downstream authorization defect traces back to that one decision (`tuba-current-state/11_TECHNICAL_ARCHITECTURE.md`). TBOS does not repeat it under any circumstance, including "just for v1." Full detail: `07_INFORMATION_ARCHITECTURE.md`.

## Article VI — Navigation and Access

One navigation tree; visibility within it is governed by RBAC, not by seven separate trees. Global search is the primary way to find anything beyond a handful of items — no screen in TBOS presents a several-hundred-option flat list the way Tuba's current location filter does. Quick Actions put the four highest-frequency jobs within two taps from anywhere. Full detail: `08_NAVIGATION_SYSTEM.md`.

## Article VII — How Work Gets Done

Fourteen core workflows — New Property, New Lead, New Owner, New Contract, Marketing Campaign, Price Change, Expired/Rejected Listing, Compliance, Renewal, Publishing, Archiving, Deletion, Automation — each with a stated trigger, steps, decision points, and outcome, none left ambiguous. The single non-negotiable workflow: **New Lead**, because it is the direct fix for a live-confirmed defect (an agent's own contact info displaying as a lead's "sender" in Tuba's current platform) that this constitution treats as the platform's most urgent unsolved problem. Full detail: `09_WORKFLOW_ARCHITECTURE.md`.

## Article VIII — Intelligence Systems

Four interlocking systems govern how TBOS behaves intelligently, none of them a single "AI page":

- **AI Strategy** (`10_AI_STRATEGY.md`): AI Writing, Search, Recommendations, Insights, Lead Scoring, Pricing, Property Quality, Duplicate Detection, Market/Customer/Document Intelligence — each embedded at its point of use, sequenced by real infrastructure dependency (never building a narrative AI layer before the data pipeline it narrates exists).
- **Automation Strategy** (`11_AUTOMATION_STRATEGY.md`): lead routing, follow-up escalation, status transitions, renewal reminders, and compliance nudges are automatic by default; destructive and regulated actions are never fully automated.
- **Search Strategy** (`12_SEARCH_STRATEGY.md`): one global search surface, semantic and Arabic-fluent, with saved searches as live subscriptions rather than the currently-inert feature they are today.
- **Decision Support System** (`15_DECISION_SUPPORT_SYSTEM.md`): the mechanism that turns all of the above into a short, ranked, explained worklist in Today — the concrete answer to "what should I do next," which is this constitution's central promise.

## Article IX — Trust Infrastructure

- **Notification Strategy** (`13_NOTIFICATION_STRATEGY.md`): every notification type has exactly one defined channel-set; the unread badge is always accurate; WhatsApp is used deliberately, not as a catch-all.
- **Explainability System** (`14_EXPLAINABILITY_SYSTEM.md`): the five-question contract every metric, score, and recommendation must satisfy before shipping.
- **Non-Goals** (`20_NON_GOALS.md`): TBOS is not an ERP, does not overload users with raw data, does not expose complexity as a feature, does not become a second marketplace, and — stated as bindingly as any goal — **does not track its own users like anonymous shoppers**, a direct, architectural response to Tuba's current authenticated dashboard firing four consumer ad-attribution pixels at a paying broker doing their job.

## Article X — How Features Get Approved

Every proposed feature runs through the nine-part template in `17_FEATURE_PRINCIPLES.md` (Purpose, Problem solved, Business value, User value, Priority, Dependencies, AI opportunities, Success metric, Principle check) before it is eligible for the roadmap. A feature with an unstated dependency or unresolved principle tension is not ready, regardless of how valuable it looks in isolation — this is how Fraud Detection is correctly deferred in this constitution despite being a real opportunity, because it depends on a security fix outside TBOS's own control.

## Article XI — The Build Sequence

Five phases, full detail `19_PRODUCT_ROADMAP.md`, following the strategy **Trust → Delivery → Discovery → Intelligence → Transaction**:

1. **Trust**: RBAC, the Unified Lead Pipeline, verified-accurate notifications, Explainability as infrastructure.
2. **Delivery**: Properties, Projects, Owners (with Marketing Requests properly surfaced), Customers, Today, Wallet.
3. **Discovery**: real search infrastructure, Marketing with mandatory eligibility checks, live saved-search subscriptions.
4. **Intelligence**: AI foundation and fast-follow capabilities, visible/editable Automation, Analytics/Reports built on Explainability from day one.
5. **Transaction**: Contracts, Finance, Document Intelligence, Market Intelligence/Pricing (only once the data pipeline built in Phase 2 has real history behind it).

A Phase 0 of external prerequisites — the Critical security findings and the checkout-consistency question documented in `tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md` — gates this sequence without being a TBOS feature itself.

## Article XII — Competitive Position

TBOS's right to win is not feature parity with Bayut or Aqar — it is refusing to inherit the structural mistakes both incumbents, and Tuba's own current platform, made independently. Full comparison: `01_PRODUCT_VISION.md` §Competitive Positioning, `tuba-current-state/13_GAP_ANALYSIS.md`.

| Shared weakness across all three current platforms | TBOS's answer |
|---|---|
| No real RBAC | Real role templates, scoped from Phase 1 |
| No real CRM (leads shallow or invisible) | Unified, scored, SLA-timed pipeline |
| Numbers shown without explanation | The Explainability contract, enforced platform-wide |
| Compliance discovered mid-flow | Front-loaded checklists, per workflow |
| No meaningful AI | AI embedded at every high-value workflow point |

## Article XIII — Design Discipline (What This Constitution Does Not Do)

This document and its supporting set (`00`–`21`) define **the product**, not its interface. No screens, no components, no visual system, no frontend code exist anywhere in this folder, and none should be inferred from it. `03_DESIGN_PRINCIPLES.md` defines *behavioral* rules (consistency, clarity, accessibility, speed, trust, minimalism, responsiveness, motion, empty/error/success states, loading, interaction) that any future visual design must satisfy — it does not specify what anything looks like. That work begins only after this constitution is reviewed and approved.

## Article XIV — Glossary and Reference

Full term definitions: `21_GLOSSARY.md`. Master diagrams (architecture, navigation, journeys, modules): `22_MASTER_DIAGRAMS.md` and `diagrams/`.

---

## Ratification

This constitution is a **Recommended** artifact — a proposal for approval, not a decision already made. It becomes binding for engineering, design, AI, and QA work only once explicitly approved by product leadership. Until then, it is the object of review, not the output of one.
</content>
