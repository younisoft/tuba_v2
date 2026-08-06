# Tuba Broker OS (TBOS) — Product Definition

**Status**: Recommended (proposal for review/approval — see `00_PRODUCT_CONSTITUTION.md` Article "Ratification"). Captured 2026-08-06.

**Start here**: [00_PRODUCT_CONSTITUTION.md](00_PRODUCT_CONSTITUTION.md) — the synthesized source of truth. Every other document in this folder is the detailed evidence and reasoning behind one of its fourteen Articles.

---

## What this is

The complete product definition for **Tuba Broker OS** — not a dashboard, not a CRM, not a listing manager, but the operating system a real-estate broker runs their business inside. This phase defines *what TBOS is*; it contains no UI, no components, no screens, and no frontend code (see `20_NON_GOALS.md`, Article XIII of the Constitution).

## What this is built on

Every claim in this folder that isn't a forward-looking recommendation is grounded in one of three completed, evidence-based prior projects:

- **`../tuba-current-state/`** — the live, authenticated re-verification of Tuba's own current broker platform (18 documents). Most-cited source in this definition, since TBOS exists specifically to fix what that assessment found.
- **`../product-audit/`** — the Bayut Profolio reverse-engineering audit (40 documents).
- **`../competitor-analysis/aqar/`** — the Aqar reverse-engineering audit (12 documents), synthesized with Bayut's in `../competitor-analysis/TUBA_BROKER_EXPERIENCE_FOUNDATION.md`.

No competitor was re-audited and no page of Tuba's current platform was re-designed to produce this folder — per the Master Prompt's explicit instruction, this phase reuses those findings rather than repeating the work.

## Document map

| # | Document | What it defines |
|---|---|---|
| 00 | [Product Constitution](00_PRODUCT_CONSTITUTION.md) | The synthesis — read this first |
| 01 | [Product Vision](01_PRODUCT_VISION.md) | Mission, vision, North Star, competitive positioning |
| 02 | [Product Philosophy](02_PRODUCT_PHILOSOPHY.md) | The ten governing principles |
| 03 | [Design Principles](03_DESIGN_PRINCIPLES.md) | Behavioral rules every screen must satisfy (not visual design) |
| 04 | [Personas](04_PERSONAS.md) | Seven broker/staff personas, full detail |
| 05 | [Jobs To Be Done](05_JOBS_TO_BE_DONE.md) | Seventeen ranked broker jobs |
| 06 | [Product Architecture](06_PRODUCT_ARCHITECTURE.md) | The nineteen-module, three-layer map |
| 07 | [Information Architecture](07_INFORMATION_ARCHITECTURE.md) | The full navigation hierarchy and RBAC visibility model |
| 08 | [Navigation System](08_NAVIGATION_SYSTEM.md) | Desktop/tablet/mobile/search-first/keyboard behavior |
| 09 | [Workflow Architecture](09_WORKFLOW_ARCHITECTURE.md) | Fourteen core workflows, trigger-to-outcome |
| 10 | [AI Strategy](10_AI_STRATEGY.md) | Every AI capability and where it's embedded |
| 11 | [Automation Strategy](11_AUTOMATION_STRATEGY.md) | What's automatic by default vs. configurable vs. never automated |
| 12 | [Search Strategy](12_SEARCH_STRATEGY.md) | Global/semantic/Arabic/geo/AI/voice search |
| 13 | [Notification Strategy](13_NOTIFICATION_STRATEGY.md) | What interrupts vs. what waits, and on which channel |
| 14 | [Explainability System](14_EXPLAINABILITY_SYSTEM.md) | The five-question contract every metric must satisfy |
| 15 | [Decision Support System](15_DECISION_SUPPORT_SYSTEM.md) | How raw data becomes ranked, explained recommendations |
| 16 | [Module Specifications](16_MODULE_SPECIFICATIONS.md) | Entities/capabilities/states/dependencies per module, plus Future Modules |
| 17 | [Feature Principles](17_FEATURE_PRINCIPLES.md) | The required template for every future feature, with worked examples |
| 18 | [Success Metrics](18_SUCCESS_METRICS.md) | The full measurement tree under the North Star |
| 19 | [Product Roadmap](19_PRODUCT_ROADMAP.md) | Five build phases: Trust → Delivery → Discovery → Intelligence → Transaction |
| 20 | [Non-Goals](20_NON_GOALS.md) | What TBOS must never become |
| 21 | [Glossary](21_GLOSSARY.md) | Term reference |
| 22 | [Master Diagrams](22_MASTER_DIAGRAMS.md) | Reading guide for `diagrams/*.mmd` |

`diagrams/` — `architecture.mmd`, `navigation.mmd`, `journeys.mmd`, `modules.mmd`.

## The single most important idea in this folder

Real, scoped **RBAC** is the one gap shared by Tuba's current platform, Bayut, and Aqar alike (`../tuba-current-state/13_GAP_ANALYSIS.md` §3) — it is therefore TBOS's highest-leverage move: closing it beats all three incumbents' current state simultaneously, not just Tuba's own. It is sequenced into Phase 1 of the roadmap and is the literal precondition for six of TBOS's seven personas to do their job at all (`04_PERSONAS.md`).

## The single most urgent fix this definition addresses

A live-confirmed defect in Tuba's current platform where a lead's displayed "sender" contact information is sometimes the logged-in agent's own — not a hypothetical risk, a directly observed, screenshot-documented bug (`../tuba-current-state/06_WORKFLOW_ANALYSIS.md` §2). The Unified Lead Pipeline (`09_WORKFLOW_ARCHITECTURE.md` — New Lead; `17_FEATURE_PRINCIPLES.md` worked example 1) is TBOS's P0 feature specifically because of this.

## What happens next

This folder is a **proposal**, not an implementation plan. Per `00_PRODUCT_CONSTITUTION.md`'s Ratification clause, it becomes binding for engineering/design/AI/QA work only after review and approval. No UI implementation should begin from this folder alone — a subsequent, separate design phase (explicitly out of scope here, per `20_NON_GOALS.md`) is required first.
</content>
