# 01 — Product Vision

**Status**: Recommended. Grounded in evidence from `tuba-current-state/` (Tuba's own platform), `product-audit/` (Bayut), and `competitor-analysis/aqar/` (Aqar) — see citations throughout.

---

## Why TBOS exists

Every incumbent in this market — including Tuba's own current platform — was built as a **listings marketplace with broker tools attached afterward**. Bayut is "a single, coherent, purpose-built agency back-office bolted onto a consumer marketplace." Aqar is "a consumer marketplace with broker tooling grafted on *twice*." Tuba's own current platform shares the same root cause: one shared codebase, one undifferentiated navigation, broker capability retrofitted onto what is architecturally a public search site (`tuba-current-state/11_TECHNICAL_ARCHITECTURE.md`).

**TBOS exists to be the opposite: a broker's operating system that happens to feed a public marketplace, not a marketplace that happens to have a broker login.** Every other decision in this document follows from that inversion.

## Mission

Give every real-estate broker in Saudi Arabia — from a solo agent to a multi-branch agency — a single system that closes the gap between the work they actually do (chase leads, chase paperwork, chase approvals, chase renewals) and the work the software lets them see (a listing count and a decorative chart). TBOS's job is to **do the chasing** so the broker can do the closing.

## Vision

In three years, a broker's day starts and ends inside TBOS — not because they're forced to, but because it is faster than doing the job any other way. TBOS knows every license about to expire, every lead going cold, every listing losing traction, and tells the broker what to do about each one before they'd have thought to check. Saudi Arabia's REGA/Nafath/FAL regulatory layer, which Tuba already has and neither Bayut nor Aqar has replicated in full (`tuba-current-state/13_GAP_ANALYSIS.md` §1), stops being a compliance burden brokers tolerate and becomes a trust asset TBOS actively markets on their behalf.

## Core Philosophy

**Action over information. Explanation over numbers. Automation over dashboards.** A platform that shows a broker "12 new leads" has told them nothing they can act on. A platform that shows "3 of your 12 new leads haven't been contacted in 24 hours — reply to these first" has done its job. This is elaborated fully in `02_PRODUCT_PHILOSOPHY.md`.

## Product Principles (summary — full detail in `02_PRODUCT_PHILOSOPHY.md`)

1. One home per capability — never two navigation paths to the same feature (Aqar's most-cited structural failure, `competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §3).
2. Every status has a next action — no bare KPI, ever (the one finding both Bayut and Aqar audits converge on independently).
3. Compliance is a checklist, not a gate.
4. Access is delegated, not shared — real RBAC from day one, the single largest opportunity this whole competitive set has in common (`tuba-current-state/13_GAP_ANALYSIS.md` §3).
5. AI is a copilot embedded in workflows, not a separate page.
6. Trust is engineered, not claimed — a platform's own back office must not violate the trust it's asking brokers to extend to it (see the ad-tracking-pixel and hardcoded-credential findings in `tuba-current-state/`, which TBOS must not repeat).

## Long-Term Strategy

Sequence: **Trust → Delivery → Discovery → Intelligence → Transaction**, adapted from `web-project-audit/phase4/36_MASTER_STRATEGY.md`'s own transformation strategy but scoped to what TBOS as a *product definition* controls:
1. **Trust**: a system a broker can rely on to not lose their leads or misstate their own account status.
2. **Delivery**: every lead reaches the right person, every time, with a closed loop back to outcome.
3. **Discovery**: brokers find what they need — listings, leads, comparable pricing — without leaving TBOS.
4. **Intelligence**: TBOS starts telling brokers what to do next, not just what happened.
5. **Transaction**: TBOS becomes the system of record for the deal itself — contracts, renewals, compliance — not just the marketing front-end for it.

## Competitive Positioning

| Axis | Bayut | Aqar | TBOS (target) |
|---|---|---|---|
| Navigation | One system, internally consistent, shallow depth | Two duplicate systems for the same operations | One system, differentiated by role, deep enough to be an OS |
| RBAC | Binary license-sharing toggle | Zero-permission phone-number add | Real role templates, scoped from day one |
| CRM | Functional but shallow (no scoring/SLA) | Real owner-demand channel, no dedicated surface | One pipeline, both demand sources, scored and SLA-timed |
| AI | None found | None found | Embedded copilot across every workflow |
| Regulatory trust | Not audited to this depth | Granular but unexplained | Deep (REGA/Nafath/FAL) *and* explained |
| Instrumentation | Not flagged | Consumer ad-pixels on the authenticated console | Zero consumer tracking on operational screens — an architectural rule, not a promise |

TBOS's right to win is not feature parity — it is refusing to inherit the structural mistakes that both incumbents (and Tuba's own current platform) made independently.

## Business Goals

- Increase broker retention and package upgrade rate by making the paid tiers visibly, provably worth it (closing the "decorative dashboard" trust gap documented in `tuba-current-state/07_UX_AUDIT.md`).
- Reduce the operational cost of running the platform's own support/compliance load by automating what TBOS's automation strategy (`11_AUTOMATION_STRATEGY.md`) identifies as repetitive staff work today.
- Convert Tuba's regulatory integration from a cost center into a marketed trust differentiator once its integrity is fixed (`tuba-current-state/13_GAP_ANALYSIS.md` — Nafath signature verification is a prerequisite, not a TBOS feature, but TBOS's design must not build on top of it before it's fixed).

## User Goals

Every broker persona (`04_PERSONAS.md`) wants the same three things at different scales: **spend less time on things that aren't selling, trust the numbers they're shown, and never be surprised by a compliance or lead-handling failure.**

## Success Metrics & North Star

**North Star Metric**: *Time from lead creation to first qualified broker response*, trending down, platform-wide. This single number is chosen because it is the one metric that is simultaneously: (a) something TBOS directly controls through workflow design, (b) something every persona in `04_PERSONAS.md` benefits from improving, and (c) the exact failure mode `tuba-current-state/` found broken in Tuba's current platform (a live, visible lead-misrouting bug) and that both competitor audits flagged as a shared weak point. Full supporting metrics tree in `18_SUCCESS_METRICS.md`.

## Product Promise

**"You will never wonder what TBOS wants you to do next."** Every screen, every notification, every AI suggestion is built to satisfy this promise or it doesn't ship — the operational definition behind Design Principle #2.
</content>
