# TBOS Design System v1.1

The complete, implementation-ready visual and interaction system for Tuba Broker OS (TBOS). Every future screen, component, and micro-interaction is built from what's in this folder — nothing is designed outside it.

## What this is, and isn't

This folder is the **visual layer**. It sits on top of two folders that already exist and that this system never contradicts or duplicates:

- [`tbos-definition/`](../tbos-definition/) — the Product Constitution: *why* TBOS exists, its ten Design Principles, its personas, its non-goals. Behavioral, not visual, by its own explicit rule (`00_PRODUCT_CONSTITUTION.md` Article XIII).
- [`tbos-blueprint/`](../tbos-blueprint/) — the Implementation Blueprint: the 49-screen inventory, the component behavior contracts, the state architecture, navigation and accessibility rules. *What* exists and *how it behaves*, not what it looks like.

This system answers the one question those two leave open: **what does it actually look like?** It does not redesign product behavior, invent new screens, or specify business logic — every token and rule here traces back to a real screen ID from [`tbos-blueprint/04_SCREEN_INVENTORY.md`](../tbos-blueprint/04_SCREEN_INVENTORY.md) or a component contract from [`05_COMPONENT_MAPPING.md`](../tbos-blueprint/05_COMPONENT_MAPPING.md).

**Provenance note**: nothing in the prior evidence base (`product-audit/`, `competitor-analysis/`, `tuba-current-state/`) is a ratified Tuba/TBOS visual decision — those hex codes and type scales belong to Bayut and Aqar's products (reverse-engineered competitor audits) or to Tuba's legacy, unthemed template CSS. This is the first real visual system TBOS has. See [00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §6 for the full provenance statement.

**v1.1 — Tuba Brand Identity Correction**: v1.0's "Ink" primary and "Ember" secondary were originated hues, never checked against Tuba's actual brand identity. v1.1 corrects this: the real, verified Tuba brand colors (`--tuba-purple: #2A0C72`, `--tuba-coral: #F95A60`) are now first-class tokens (`color.brand` in `tokens.json`), and the Ink/Ember primitive scales are rebuilt around them as exact anchors (Ember renamed Coral in the process — zero downstream consumers referenced it by name, verified before renaming). See [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §1a and `TBOS_DESIGN_SYSTEM_V1_1_BRAND_CORRECTION_REPORT.md` for the full correction record. 20 official Tuba brand SVG pattern assets are also now registered as the Tuba Brand Pattern Language — see doc 20 below.

## How to read this folder

Read in order the first time; reference by number after that.

| # | Document | Answers |
|---|---|---|
| 00 | [Design System Foundation](00_DESIGN_SYSTEM_FOUNDATION.md) | Vision, personality, trust model, density philosophy |
| 01 | [Design Principles](01_DESIGN_PRINCIPLES.md) | The rules every visual decision is checked against |
| 02 | [Design Tokens](02_DESIGN_TOKENS.md) | The complete token taxonomy — the source of truth |
| 03 | [Color System](03_COLOR_SYSTEM.md) | Every color, its role, and its meaning |
| 04 | [Typography](04_TYPOGRAPHY.md) | Type scale, Arabic/Latin pairing, numeric typography |
| 05 | [Spacing System](05_SPACING_SYSTEM.md) | The 4px scale and density modes |
| 06 | [Grid System](06_GRID_SYSTEM.md) | Breakpoints, columns, gutters |
| 07 | [Layout System](07_LAYOUT_SYSTEM.md) | Rail, top bar, panels, per-breakpoint composition |
| 08 | [Iconography](08_ICONOGRAPHY.md) | Icon grammar, sizing, RTL mirroring rules |
| 09 | [Elevation System](09_ELEVATION_SYSTEM.md) | Shadow/border depth model |
| 10 | [Motion System](10_MOTION_SYSTEM.md) | Durations, easing, the four jobs motion is allowed to do |
| 11 | [Accessibility](11_ACCESSIBILITY.md) | The WCAG 2.2 AA implementation floor |
| 12 | [Component Guidelines](12_COMPONENT_GUIDELINES.md) | Anatomy/states/behavior rules per component family |
| 13 | [Data Visualization](13_DATA_VISUALIZATION.md) | Chart, table, map, and KPI standards |
| 14 | [Dark Mode](14_DARK_MODE.md) | The parallel dark palette and component adjustments |
| 15 | [Internationalization](15_INTERNATIONALIZATION.md) | RTL/LTR, numerals, dates, currency |
| 16 | [Content Guidelines](16_CONTENT_GUIDELINES.md) | Voice, microcopy, error/empty/success copy patterns |
| 17 | [Component Catalog](17_COMPONENT_CATALOG.md) | The full component inventory, cross-referenced to screens |
| 18 | [Design Rules](18_DESIGN_RULES.md) | The non-negotiables, stated as testable rules |
| 19 | [Implementation Guide](19_IMPLEMENTATION_GUIDE.md) | Folder structure, naming, versioning, contribution, QA checklist |
| 20 | [Brand Pattern Language](20_BRAND_PATTERN_LANGUAGE.md) | The 20 official Tuba brand SVG assets in `icons_set/`, their usage rules, and why they're distinct from functional icons |

**Machine-readable exports** (generated from the same source of truth as `02_DESIGN_TOKENS.md` — never edited independently):

| File | Consumer |
|---|---|
| [`tokens.json`](tokens.json) | Canonical token source — design-tool and build-tool agnostic |
| [`design-tokens.css`](design-tokens.css) | CSS custom properties, light + dark, logical-property-ready |
| [`tailwind-theme.ts`](tailwind-theme.ts) | Tailwind v4 theme extension |
| [`figma-tokens.json`](figma-tokens.json) | Figma Tokens Studio-compatible import |

## The rule this folder enforces

> Before creating any token, rule, or guideline, it must be traceable to a real screen or component already defined in `tbos-blueprint/`. Nothing here is copied from a generic UI library or a competitor's product. Every decision is product-driven, not library-driven.

If a future contributor wants to add a token, component pattern, or rule not covered here, the obligation is the same one `tbos-blueprint/05_COMPONENT_MAPPING.md` places on new components: write down which screen needs it and why the existing system can't serve it, before adding anything.

## Ownership and change process

See [19_IMPLEMENTATION_GUIDE.md](19_IMPLEMENTATION_GUIDE.md) for versioning, deprecation, and the design-QA checklist. In short: this is v1.0, semantic-versioned, and no document in this folder is edited without updating `tokens.json` and regenerating the three export files in the same change.
