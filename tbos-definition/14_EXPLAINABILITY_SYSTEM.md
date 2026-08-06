# 14 — Explainability System

**Status**: Recommended. Explainability is Philosophy Principle #2 — the single finding both the Bayut and Aqar audits converge on independently (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §3: "Don't show numbers without explanation... both audits independently converge on the same finding"), and a confirmed live weakness in Tuba's own current platform (decorative charts, a hardcoded review tile, a notification badge disconnected from real state — `tuba-current-state/07_UX_AUDIT.md`). This document makes it a system, not a slogan.

---

## The rule

**No metric, score, status, or recommendation ships without answering five questions, inline, on demand:**

1. **Why** — what does this number/status mean in plain language?
2. **How calculated** — what inputs produced it, stated simply (not a formula dump, a sentence)?
3. **What changed** — how does this compare to last time / to a baseline / to "normal"?
4. **Recommended action** — what should the broker do about it, if anything?
5. **Business impact** — why does this matter to their deal flow/revenue?

A metric that cannot answer all five is not ready to ship — it goes back to `17_FEATURE_PRINCIPLES.md`'s review, not into the product with three of five answered "later."

## Where this applies (every instance is a binding requirement, not a suggestion)

| Surface | Example | Grounding for why this is required here specifically |
|---|---|---|
| Any dashboard tile (Home, Today) | "Ratings and Reviews: 4.2 (↑0.3 this month, based on 12 reviews — reply to your 2 unanswered ones to keep this trending up)" | Direct replacement for Tuba's current hardcoded `0` tile, which explains nothing because it isn't real (`tuba-current-state/07_UX_AUDIT.md`) |
| Lead score | "Scored 78/100 — high stated budget, responded to your last message within an hour. Call within the next 2 hours to keep momentum." | Implements `10_AI_STRATEGY.md`'s Lead Scoring capability with its explanation contract attached, not as an afterthought |
| Compliance status badge | "License expires in 14 days — REGA renewal takes ~5 business days on average; start now to avoid a listing gap." | Closes the "no unified compliance lifecycle view, no explanation of what happens next" gap named in `tuba-current-state/13_GAP_ANALYSIS.md` |
| AI-suggested price | "Suggested range 1.8M–2.1M SAR, based on 9 comparable active/sold listings in this district in the last 90 days." | Implements the AI Strategy's Pricing capability's non-negotiable explanation requirement |
| Automation trigger | "This lead was auto-assigned to you because you have the most availability on your team and specialize in this district." | Implements `11_AUTOMATION_STRATEGY.md`'s Automation-module transparency requirement |
| Notification | "You're seeing this because [rule], adjust in Notification Preferences" | Implements `13_NOTIFICATION_STRATEGY.md`'s anti-fatigue rule #3 |
| Gamification/trust badges (if TBOS builds one — see `19_PRODUCT_ROADMAP.md`) | Explicit progress toward the next unlock, never a bare "Locked" state | Directly answers Bayut's TruBroker weakness — badges observed permanently "Locked" with no visible progress target (`product-audit/15_WEAKNESSES.md`) |

## Explainability and trust (Philosophy Principle #6)

Explainability is not only about AI or metrics — it extends to the platform's own behavior toward the broker. If TBOS tracks anything about a broker's usage for product-improvement purposes, that is disclosed plainly in Settings, in contrast to Tuba's current authenticated dashboard, which fires four consumer ad-attribution pixels (Google, Facebook, TikTok, Snapchat) with no disclosure to the logged-in broker at all (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §5). A system that can't explain what it's doing with a user's own data has failed this principle regardless of how well it explains its metrics.

## Explainability and the Knowledge module

Every "why" answer above links to deeper content in the Knowledge module (`06_PRODUCT_ARCHITECTURE.md`) for a broker who wants more than the inline sentence — the AI's grounding source and the human-readable help content are the same underlying material, so an AI-generated explanation and a support article never contradict each other.

## What "good enough" is not

A tooltip that repeats the metric's name is not an explanation. A link to a generic help-center search is not an explanation. The five-question test above is specific: if a broker, reading the inline explanation, still cannot say what to do next, the explanation has failed regardless of how much text it contains.
</content>
