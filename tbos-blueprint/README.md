# TBOS Experience Architecture & Implementation Blueprint

**Version 1.0 — Status: Draft for review, built on the ratified-pending `tbos-definition/` Product Constitution.**

This folder is the final planning layer before implementation. It does not redefine the product — it turns the product definition (`tbos-definition/`) into behavior a frontend engineer, backend engineer, AI engineer, QA engineer, or product manager can build against without asking "but what should this actually do?"

## What this is not

- Not a redesign of `tbos-definition/` — every principle, persona, module, workflow, and strategy already ratified there is treated as fixed input and **referenced, not restated**.
- Not a repeat of `tuba-current-state/`, `product-audit/`, or `competitor-analysis/` — findings from those audits are cited by file+section where they justify a decision.
- Not visual design. No colors, type scale, spacing, or component visuals. This is behavior, structure, and sequencing only — the layer between product definition and a design system.

## How to read this folder

Read in order the first time. After that, use it as a reference — each document is self-contained enough to open directly once you know the canon below.

| # | Document | Answers |
|---|---|---|
| [00](00_IMPLEMENTATION_BLUEPRINT.md) | Implementation Blueprint | What's the canon (screen IDs, personas, modules) every other doc uses? How do these 19 docs fit together? |
| [01](01_EXPERIENCE_ARCHITECTURE.md) | Experience Architecture | For every major workflow: intent, outcome, emotional state, cognitive load, decision points, automation, AI, recovery. |
| [02](02_NAVIGATION_BLUEPRINT.md) | Navigation Blueprint | How does a broker move through TBOS on desktop, tablet, mobile, and keyboard? |
| [03](03_USER_JOURNEYS.md) | User Journeys | End-to-end journeys per persona, with decision trees, failure states, and recovery. |
| [04](04_SCREEN_INVENTORY.md) | Screen Inventory | The definitive list of every screen and what each must do. |
| [05](05_COMPONENT_MAPPING.md) | Component Mapping | Which reusable components each screen needs, and their interaction rules. |
| [06](06_STATE_ARCHITECTURE.md) | State Architecture | Every state a screen or record can be in, and what happens in each. |
| [07](07_DECISION_SUPPORT_SYSTEM.md) | Decision Support System | How every metric/widget becomes an explained, prioritized action. |
| [08](08_AI_INTERACTION_BLUEPRINT.md) | AI Interaction Blueprint | Where AI triggers inside workflows, what it does, how humans review it. |
| [09](09_NOTIFICATION_BLUEPRINT.md) | Notification Blueprint | What gets notified, on which channel, at what priority. |
| [10](10_SEARCH_EXPERIENCE.md) | Search Experience | How every search surface behaves, including zero-result handling. |
| [11](11_ACCESSIBILITY_BLUEPRINT.md) | Accessibility Blueprint | The accessibility bar every screen must clear. |
| [12](12_MOTION_PHILOSOPHY.md) | Motion Philosophy | When motion helps, when it must be avoided. |
| [13](13_FEATURE_READINESS_MATRIX.md) | Feature Readiness Matrix | What's ready to build vs. blocked, and on what. |
| [14](14_DEVELOPMENT_BLUEPRINT.md) | Development Blueprint | Build order, release grouping, parallel work, dependencies. |
| [15](15_RELEASE_PLAN.md) | Release Plan | What ships in each release, and its exit criteria. |
| [16](16_IMPLEMENTATION_CHECKLIST.md) | Implementation Checklist | The per-screen, per-workflow checklist engineering/QA works against. |
| [17](17_ACCEPTANCE_CRITERIA.md) | Acceptance Criteria | Given/when/then criteria for the highest-risk workflows. |
| [18](18_OPEN_QUESTIONS.md) | Open Questions | What genuinely cannot be resolved by this phase, and who resolves it. |
| [19](19_MASTER_MERMAID_DIAGRAMS.md) | Master Mermaid Diagrams | Index and reading guide for `diagrams/*.mmd`. |

## Source documents this blueprint builds on

- `tbos-definition/` — the product constitution: mission, principles, personas, JTBD, architecture, IA, navigation model, workflows, AI/automation/search/notification/decision-support strategy, module specs, non-goals, roadmap.
- `tuba-current-state/` — re-verified audit of the current Tuba platform (what exists, what's broken, what to keep).
- `product-audit/` — Bayut reverse-engineering audit and the Tuba next-generation synthesis derived from it.
- `competitor-analysis/aqar/` — Aqar reverse-engineering audit.
- `competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md` — cross-competitor synthesis (TBX).

## Diagrams

`diagrams/navigation.mmd`, `diagrams/journeys.mmd`, `diagrams/states.mmd`, `diagrams/dependencies.mmd` — indexed and explained in [19_MASTER_MERMAID_DIAGRAMS.md](19_MASTER_MERMAID_DIAGRAMS.md).

## When this phase is done

No unresolved product ambiguity should remain. Every future screen should be derivable from these documents; every backend service inferable from the workflows; every AI feature purposed and reviewable. The next phase after this one is implementation — not further product or UX definition.
