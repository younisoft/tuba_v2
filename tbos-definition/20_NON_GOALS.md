# 20 — Non-Goals

**Status**: Recommended. What TBOS must never become, stated as explicitly and bindingly as what it should. A non-goal here carries the same weight as a goal elsewhere in this definition — violating one is a design failure, not a scope-creep footnote.

---

## TBOS does not become an ERP or accounting system

Finance (`16_MODULE_SPECIFICATIONS.md`) reports on revenue and commission derived from Contracts — it does not do general ledger accounting, tax filing, or payroll. Where a broker needs that, TBOS's future path is **integration** with dedicated accounting software (a Partner API surface, per `16_MODULE_SPECIFICATIONS.md`'s Future Modules), not building a competing accounting product. This boundary exists because accounting software is a mature, regulated category with its own compliance surface (ZATCA e-invoicing, per findings referenced in `web-project-audit/phase4/31_SAUDI_COMPLIANCE.md`) that TBOS has no reason to re-solve.

## TBOS does not overload users with raw data

Every screen in `06_PRODUCT_ARCHITECTURE.md` and every metric in `18_SUCCESS_METRICS.md` is filtered through Decision Support (`15_DECISION_SUPPORT_SYSTEM.md`) and Explainability (`14_EXPLAINABILITY_SYSTEM.md`) before it reaches a broker. TBOS does not add a screen because "we have the data" — data without an attached decision is explicitly against Philosophy Principle #1 and is not a justification for shipping anything.

## TBOS does not expose raw complexity as a feature

Compliance requirements, RBAC configuration, and AI reasoning are all genuinely complex domains — TBOS's job (per Philosophy Principle #3 and #4) is to absorb that complexity, not display it. A settings screen with 40 raw toggles is a failure of this non-goal even if every toggle is individually justified; see `03_DESIGN_PRINCIPLES.md`'s Minimalism rule.

## TBOS does not become a second marketplace

Tuba's existing public marketplace (the consumer-facing search site) is not rebuilt or replaced by this definition — TBOS is the broker-side operating system that *feeds* that marketplace with better data and faster workflows. Where the two must connect (a published Property becoming a live marketplace listing), that is an integration boundary, not a merger of the two products into one. Conflating them was not a mistake any of the three audited platforms (Bayut, Aqar, Tuba's current system) made structurally the same way, but each blurs the line between consumer-facing and broker-facing surfaces to some degree (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §7's "demand and supply sides stay legible" principle) — TBOS keeps the line explicit.

## TBOS does not track its own users like anonymous marketplace shoppers

Directly codifying Philosophy Principle #6 and the confirmed finding in `tuba-current-state/06_WORKFLOW_ANALYSIS.md` §5 (four consumer ad-attribution pixels firing on Tuba's current authenticated dashboard): TBOS's operational screens carry **zero** consumer ad-attribution/retargeting instrumentation, as an architectural rule enforced at build time, not a policy stated in a privacy document and violated in practice. Product analytics for TBOS's own improvement is allowed and disclosed (Settings); ad-network pixels on a paid B2B tool are not, under any circumstance.

## TBOS does not gate genuine broker capability behind unexplained AI

Per `10_AI_STRATEGY.md`'s cross-cutting rules: no AI feature is the sole, unreviewable gate on a regulated or destructive action. TBOS does not become a product where a broker has to trust an opaque AI decision they can't inspect or override — every AI output remains reviewable in the AI Copilot's audit log (`16_MODULE_SPECIFICATIONS.md`).

## TBOS does not duplicate navigation paths to save a design decision

Philosophy Principle #10, restated as a hard non-goal: if a future feature seems to need a second entry point to an existing capability, the answer is to fix the information architecture (`07_INFORMATION_ARCHITECTURE.md`), not to add a second path. This is the specific, named mistake that made Aqar's own audit conclude its navigation was the single most damaging structural problem found across either competitor audit (`competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` §3) — TBOS treats it as a standing prohibition, not a lesson learned once and forgotten.

## TBOS does not become a landing page with a login

Motion, marketing copy, and promotional content have no place inside the authenticated product surfaces — `03_DESIGN_PRINCIPLES.md`'s Motion rule (no decorative animation, no unconditioned scroll-triggered libraries) exists specifically to keep TBOS feeling like professional operating software, not a consumer site that happens to require a password.

## TBOS does not treat compliance as a checkbox exercise

Per Philosophy Principle #4: government-paperwork requirements are a checklist a broker is guided through, not a gate they hit unprepared. TBOS also does not treat *its own* platform compliance (audit logging, permission scoping, secure credential handling) as optional either — the same rigor applied to what TBOS asks of a broker, per Philosophy Principle #6, applies to what TBOS asks of itself.

## TBOS is not designed in this phase — and this document does not pretend otherwise

Per the Master Prompt's explicit instruction: no UI, no components, no frontend code, no screens. Every principle in `03_DESIGN_PRINCIPLES.md` is a testable behavioral rule, not a visual specification, and nothing in this `tbos-definition/` folder should be read as, or mistaken for, a design system, wireframe set, or implementation plan. That work begins only after this Product Constitution (`00_PRODUCT_CONSTITUTION.md`) is reviewed and approved.
</content>
