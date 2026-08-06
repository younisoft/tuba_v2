# 15 — Decision Support System

**Status**: Recommended. This is the concrete mechanism behind Philosophy Principle #8 (decision-first, not statistics-first) and the Today module (`06_PRODUCT_ARCHITECTURE.md`). It defines how TBOS turns raw platform data into a short, prioritized list of recommendations — the opposite of a dashboard that reports statistics and leaves the interpretation to the broker.

---

## The transformation this document defines

**Not**: "You have 12 active leads, 3 pending offers, 2 expiring licenses."
**Instead**: "Contact these 5 leads today — they're going cold. Reduce this property's price by 4% — it's been active 40% longer than similar listings. Renew these 2 licenses this week — they expire before your next scheduled check-in."

Every recommendation states its reasoning inline per `14_EXPLAINABILITY_SYSTEM.md` — Decision Support and Explainability are two faces of the same system; this document defines *what* gets recommended, `14_EXPLAINABILITY_SYSTEM.md` defines *how it's justified*.

## Recommendation categories

| Category | Example | Data it draws on |
|---|---|---|
| **Lead triage** | "Contact these 5 owners today — their leads are approaching SLA breach" | Lead Scoring + SLA state (`10_AI_STRATEGY.md`, `11_AUTOMATION_STRATEGY.md`) |
| **Pricing** | "Reduce this property's price by 4% — comparable listings in this district sold faster at this range" | AI Strategy's Pricing capability, gated on the price-history pipeline existing (`10_AI_STRATEGY.md`) |
| **Compliance** | "Renew these 2 licenses this week — they expire in 9 and 11 days" | Compliance workflow state (`09_WORKFLOW_ARCHITECTURE.md`) |
| **Response priority** | "Reply to these leads first — they've been waiting longest and match your specialty" | Lead Scoring + team capacity (`04_PERSONAS.md` Sales Manager needs) |
| **Content quality** | "These 3 listings are missing photos — they're 60% less likely to convert a view into a lead" | Property Quality AI capability (`10_AI_STRATEGY.md`) |
| **Team performance** | "2 of your agents are below team average response time this week" | Analytics, surfaced to Agency Owner/Sales Manager personas only (RBAC-scoped per `07_INFORMATION_ARCHITECTURE.md`) |
| **Opportunity** | "3 new Marketing Requests match your listing specialty in Jeddah" | The real, currently-buried Marketing Requests mechanic (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3), surfaced proactively instead of requiring a broker to remember to check a tab |

## Where recommendations live

**Today** (`06_PRODUCT_ARCHITECTURE.md`) is the canonical recommendation feed — ranked, cross-module, refreshed continuously. Individual recommendations also surface contextually on the record they concern (a pricing recommendation appears on that Property's detail page too) per the Contextual Navigation principle (`08_NAVIGATION_SYSTEM.md`) — Today is a *view* of recommendations, not their only home, matching the same non-duplicative-navigation discipline applied to Marketing Requests (`07_INFORMATION_ARCHITECTURE.md`).

## Ranking logic (how Today decides what's #1)

1. **Time-sensitivity** — something that becomes worse or impossible if ignored (an expiring license, an SLA about to breach) outranks something merely valuable (a pricing suggestion).
2. **Business value** — weighted by the Job's ranking in `05_JOBS_TO_BE_DONE.md` (a lead-response recommendation generally outranks a content-quality suggestion, matching Job 1 vs. Job 8's relative ranking).
3. **Actionability** — a recommendation with a one-click resolution outranks one requiring a multi-step workflow, all else equal, per Design Principle "Speed."
4. **Persona relevance** — RBAC-scoped (`07_INFORMATION_ARCHITECTURE.md`); a Property Consultant's Today never shows agency-wide financial recommendations reserved for the Agency Owner.

## What Decision Support explicitly does not do

- It does not make the decision autonomously for regulated or destructive actions (publishing, deleting, approving compliance documents) — every recommendation above ends in a human-confirmed action, per `10_AI_STRATEGY.md`'s cross-cutting rule that no AI/automation output is the sole gate on such actions.
- It does not overwhelm — Today shows a bounded, prioritized list (not an infinite feed), consistent with Design Principle "Minimalism": a screen earns every element on it, and a decision-support feed that recommends everything recommends nothing.

## Why this is the model's actual product differentiator, not a feature

Tuba's current dashboard, Bayut's dashboard, and Aqar's dashboard all show numbers and leave interpretation to the broker — this is the exact shared weakness the TBX synthesis names as converging across both competitor audits (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §3). A working Decision Support System, more than any single module, is what makes TBOS an *operating system* rather than a *dashboard with more data* — directly answering the Master Prompt's own framing that TBOS must not be "a dashboard" but a system that runs the broker's day for them.
</content>
