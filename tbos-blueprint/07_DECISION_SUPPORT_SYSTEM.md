# 07 — Decision Support System

`tbos-definition/15_DECISION_SUPPORT_SYSTEM.md` defines the framework: recommendation categories, where they live (TODAY-01 as canonical feed, contextually mirrored on the record they concern), and ranking logic (time-sensitivity → business value → actionability → persona relevance). That framework is fixed input. This document does the Phase 7 work: takes every dashboard widget/metric that will actually appear across [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) and specifies its action-engine form — Why, Impact, Recommended Action, Priority, Deadline, AI Recommendation, Expected Business Outcome — so no widget ships as a bare number.

## The rule

A widget proposal that can only fill the "What" column below is not ready to ship — this is the same bar as the Explainability contract (`tbos-definition/14_EXPLAINABILITY_SYSTEM.md`), applied specifically to dashboard/metric surfaces (HOME-01, TODAY-01, ANL-01, and any tile embedded elsewhere).

Instead of: **"12 Leads."**
Every widget in this catalog: **What / Why / Impact / Recommended Action / Priority / Deadline / AI Recommendation / Expected Business Outcome.**

## Widget catalog

### HOME-01 tiles

| Widget | Why | Impact | Recommended action | Priority | Deadline | AI recommendation | Expected business outcome |
|---|---|---|---|---|---|---|---|
| **Active Listings Health** | Shows how many active listings are performing below their district's norm, not just a count | Underperforming listings quietly cost views/leads | "3 listings under-viewed — review pricing or content" | Medium | This week | Property Quality + pricing comparables | More listings converting views → leads |
| **Lead Response Trend** | North Star Metric surfaced at account level | Slow response directly loses deals to competitors | "Median response time up 20% this week — check team capacity" | High | Today | Lead Scoring + capacity analysis | North Star Metric trending down |
| **Compliance Status** | Rolls up every license/contract nearing expiry | A lapsed license cascades to every dependent listing (`product-audit/32_FEATURE_DEPENDENCY_GRAPH.md`) | "2 licenses expire this week — renew now" | Critical (if <7 days) | Per-license expiry date | None (deterministic) | Zero lapsed licenses |
| **Wallet/Quota Status** | Running out mid-campaign stalls marketing | Blocked publishing/promotion at the worst time | "60% of quota used with 2 weeks left in cycle — consider upgrading" | Medium | Before quota exhausts | Usage-trend projection | No mid-cycle publishing stall |
| **Revenue Snapshot (AO)** | Portfolio-level "is the business healthy" signal | Directs where AO attention goes next | "Revenue per agent down for 2 of 5 agents — review in Analytics" | Medium | This week | AI Insights narrative on anomaly | Faster manager intervention on underperformance |

### TODAY-01 recommendation categories (from `tbos-definition/15_DECISION_SUPPORT_SYSTEM.md`, made concrete per instance)

| Category | Example instance | Why | Impact | Recommended action | Priority | Deadline | AI recommendation | Expected business outcome |
|---|---|---|---|---|---|---|---|---|
| Lead triage | "Contact these 5 leads today" | Each is approaching SLA breach | Cold leads rarely re-engage | "Call/message now, in ranked order" | Critical | Within SLA window (hours) | Lead Scoring ranks the 5 | Higher lead-to-contact conversion |
| Pricing | "Reduce this property's price by 4%" | Listed 40% longer than comparable active listings in this district | Extended time-on-market signals overpricing to buyers | "Review comparables, adjust or confirm current price" | Medium | This week | AI comparables (gated on price-history pipeline) | Faster time-to-sale |
| Compliance | "Renew these 2 licenses this week" | Expire in 9 and 11 days | Cascading listing impact if missed | "One-click renew" | High (Critical inside 7 days) | Per-license date | None (deterministic) | Zero lapsed licenses |
| Response priority | "Reply to these leads first" | Waiting longest + matches broker specialty | Longest-waiting leads have the highest defection risk | "Respond in shown order" | High | Today | Lead Scoring + team capacity | Improved SLA compliance rate |
| Content quality | "3 listings missing photos" | Missing photos measurably reduce view-to-lead conversion | Lost conversion on otherwise-good inventory | "Add photos" (direct link to the specific field) | Medium | This week | Property Quality scoring | Listing content-completeness score up |
| Team performance (SM/AO only) | "2 agents below team average response time" | Aggregate SLA risk concentrated in specific agents | Team-wide SLA compliance at risk | "Review with agent, consider reassigning capacity" | Medium | This week | Analytics anomaly detection | Team-wide SLA compliance rate up |
| Opportunity | "3 new Marketing Requests match your specialty" | Real, monetized, currently under-discovered (per `tuba-current-state/13_GAP_ANALYSIS.md` — Marketing Requests buried today) | Missed monetizable opportunity | "Claim and respond" | High | Requests have their own SLA-like freshness window | AI matching by specialty/district | Marketing Request response/close rate up |

### ANL-01 metrics (exploratory, not pre-ranked like Today — but still Explainability-bound)

| Metric | Why | Impact | Recommended action (on drill-in) | Priority | Deadline | AI recommendation | Expected business outcome |
|---|---|---|---|---|---|---|---|
| Lead assignment latency (SM) | Measures the routing automation's actual speed | Slow routing directly delays North Star Metric | "Review Automation rule thresholds if trending up" | Medium | Ongoing | None (this metric *feeds* automation review, doesn't need its own AI layer) | Faster time-to-first-response |
| Marketing Request discovery/response rate (MM) | Baseline currently unmeasured platform-wide | Direct revenue signal, previously invisible | "Compare against agency's Owners inventory size" | Medium | Monthly review | AI Insights narrative | Marketing Request revenue captured |
| Package/tier upgrade rate (AO) | Proxy for trust-to-pay | Business-model health signal | "Review Wallet nudge effectiveness" | Low | Monthly | None | Healthier upgrade funnel |
| AI feature engagement rate (all) | Measures whether AI assistance is trusted, not just invoked | Low engagement signals a broken or low-trust AI feature | "Review AICP-02 for flagged-incorrect patterns" | Low | Monthly | Self-referential — AI Copilot audit feeds this metric | AI assistance genuinely adopted, not ignored |

### WAL-01 quota meter

| Widget | Why | Impact | Recommended action | Priority | Deadline | AI recommendation | Expected business outcome |
|---|---|---|---|---|---|---|---|
| Quota usage bar | Shows consumption rate against cycle remaining, not just current/total | Exhausting quota mid-cycle blocks publishing at an unpredictable time | "At current pace, you'll exhaust quota in [N] days — [upgrade / adjust pace]" | Medium → Critical as exhaustion nears | Projected exhaustion date | Usage-trend projection | No unplanned publishing stall |

### MKT-03 content quality score

| Widget | Why | Impact | Recommended action | Priority | Deadline | AI recommendation | Expected business outcome |
|---|---|---|---|---|---|---|---|
| Per-listing quality score | Explains the score's components (photos, description completeness, pricing presence), not just a number/100 | Directly correlates to view-to-lead conversion (per Property Quality AI capability rationale) | "Fix [specific missing element] to improve score" | Medium | Before next promotion cycle | Property Quality AI | Higher view-to-lead conversion |

### AUTO-01 rule status

| Widget | Why | Impact | Recommended action | Priority | Deadline | AI recommendation | Expected business outcome |
|---|---|---|---|---|---|---|---|
| Last-run outcome | Answers "is this automation actually working," not just "is it enabled" | A silently failing automation (e.g., routing rule) reintroduces the exact defect TBOS exists to fix | "Review failed run — [specific reason]" | Critical if failed | Immediate | AI-drafted plain-language "why" for the run | Zero silent automation failures |

## Deadline conventions

Every deadline value above resolves to one of: an absolute date/time (license expiry, renewal due), a relative SLA window (lead response), a projection (quota exhaustion), or "ongoing/ambient" for review-cadence metrics with no hard deadline — never a vague "soon."

## What this system explicitly does not do

Restated from `tbos-definition/15_DECISION_SUPPORT_SYSTEM.md` because it governs every row above: no widget in this catalog autonomously executes a regulated or destructive action; every "Recommended action" ends in a human-confirmed step. Today's list stays bounded and prioritized — this catalog is the full possible inventory of widget types, not a claim that all of them show simultaneously (ranking logic in the source document determines which surface on a given day for a given persona).
