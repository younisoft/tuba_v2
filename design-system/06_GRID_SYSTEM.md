# 06 — Grid System

## 1. Breakpoints

Exactly the three breakpoints `tbos-blueprint/02_NAVIGATION_BLUEPRINT.md` already fixed, plus one addition for very wide monitors that the blueprint left open:

| Token | Range | Source |
|---|---|---|
| `mobile` | 0–767px | Navigation Blueprint |
| `tablet` | 768–1279px | Navigation Blueprint |
| `desktop` | 1280–1599px | Navigation Blueprint |
| `wide` | ≥1600px | Design-system addition — gives Slide-over Panels and contextual side content more room without changing desktop's core layout contract |

No fifth breakpoint is added without the same justification test as a new component: which screen in the 49-screen inventory actually needs it.

## 2. Columns, gutters, margins

`tokens.json` → `grid`:

| Breakpoint | Columns | Gutter | Margin | Content max-width |
|---|---|---|---|---|
| Mobile | 4 | 16px | 16px | none (fluid) |
| Tablet | 8 | 24px | 24px | none (fluid) |
| Desktop | 12 | 24px | 32px | none (fluid, rail-adjusted) |
| Wide | 12 | 24px | 48px | 1440px content area, centered, rail-adjusted |

**Why desktop stays fluid but wide caps width**: `tbos-blueprint/02` requires the rail to remain persistent and content to use "freed width" responsively up to desktop — but past ~1600px, an uncapped Record List or Detail Header stretches table rows and reading lines past a usable scan width. Capping at wide, not desktop, respects the blueprint's freed-width intent while keeping data-dense tables and long-form Knowledge content ([04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) §7 line-length rule) legible on ultra-wide monitors.

## 3. Column span conventions

| Screen pattern | Mobile | Tablet | Desktop/Wide |
|---|---|---|---|
| Record List (table) | full 4 cols, horizontal scroll for overflow columns | full 8 cols | full 12 cols |
| Record List (card view) | full 4 cols, 1 card per row | 2 cards per row (4 cols each) | 3–4 cards per row (3 cols each) |
| Detail screen (PROP-02, LEAD-03, etc.) | single column, full width | single column, full width | 8 cols primary content + 4 cols contextual side panel |
| Metric Tile grid (HOME-01) | 2 tiles per row (2 cols each) | 4 tiles per row (2 cols each) | 4–6 tiles per row |
| Form (Wizard step body) | full width | 6 of 8 cols, centered | 8 of 12 cols, centered |
| Dialog | full-width sheet from bottom | centered, 6 of 8 cols equivalent width | centered, fixed 480–640px |

## 4. RTL behavior

The grid mirrors as a unit — column order reverses (column 1 sits at the inline-end in RTL, not the physical left), gutters and margins are logical (`margin-inline-start/end`, never `margin-left/right`). See [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md) §2 for the full logical-property rule this grid is built on. A grid defined with physical `left`/`right` properties is a defect, not a style preference.

## 5. What the grid does not control

Component-internal layout (a card's own internal spacing) is [05_SPACING_SYSTEM.md](05_SPACING_SYSTEM.md)'s job, not the grid's. The grid controls page-level composition only — where the rail, content area, and contextual panels sit relative to each other. Full per-breakpoint composition: [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md).
