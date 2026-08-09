# 05 — Spacing System

## 1. The scale

Base unit **4px**. Every spacing value in TBOS is a step in `tokens.json` → `spacing.scale` — never an arbitrary pixel value in implementation.

| Token | px | Typical use |
|---|---|---|
| `space.0` | 0 | Reset |
| `space.1` | 2 | Icon-to-text micro gap (badge internals) |
| `space.2` | 4 | Tight internal component padding (tag/badge padding) |
| `space.3` | 8 | Compact-density row padding; icon-to-label gap |
| `space.4` | 12 | Compact-density cell padding; form field internal padding |
| `space.5` | 16 | Comfortable-density cell padding; default component gap; card internal padding |
| `space.6` | 20 | Section internal spacing |
| `space.7` | 24 | Card-to-card gap; comfortable-density cell horizontal padding |
| `space.8` | 32 | Section-to-section gap within a screen |
| `space.9` | 40 | Panel internal top padding |
| `space.10` | 48 | Comfortable-density row height |
| `space.11` | 64 | Major layout gap (rail to content on wide viewports) |
| `space.12` | 80 | Empty-state vertical padding |
| `space.13` | 96 | Rare — full-bleed section separation |
| `space.14` | 128 | Reserved, unused at v1.0 |

**Why 4px, not 8px**: TBOS's density requirement ([00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §5) needs finer control than an 8px-only scale allows — Compact density's 6px cell padding and 36px row height aren't reachable on a pure 8-multiple scale without breaking the grid. A 4px base with an 8px-aligned *default* keeps both density modes on-grid.

## 2. Component spacing conventions

| Relationship | Token |
|---|---|
| Icon to adjacent label text | `space.3` (8px) |
| Form label to its input | `space.2` (4px) |
| Form field to next form field | `space.5` (16px) |
| Button internal padding (horizontal) | `space.5` (16px) at `body` text size |
| Button internal padding (vertical) | `space.3` (8px) |
| Card internal padding | `space.5` (16px) comfortable / `space.4` (12px) compact |
| Card-to-card gap in a grid (Property/Lead cards) | `space.5` (16px) mobile, `space.7` (24px) tablet+ |
| Dialog internal padding | `space.7` (24px) |
| Slide-over panel internal padding | `space.7` (24px), `space.9` (40px) top |
| Table cell padding | see §3 density table |

## 3. Density modes

`tokens.json` → `spacing.density` defines the two modes every Record List, Kanban card, and Data Table must support ([00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §5):

| | Row height | Cell padding (vertical) | Cell padding (horizontal) |
|---|---|---|---|
| **Comfortable** (default) | 48px | 12px (`space.4`) | 16px (`space.5`) |
| **Compact** | 36px | 6px | 12px (`space.4`) |

Density is a per-user, per-list toggle persisted with the same mechanism as rail collapse-state ([07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) §2) — never forced by role, though Sales Manager and Operations Manager lists (`LEAD-01`, `TASK-01` in management view) default to Compact on first use given their high-volume daily triage need (`tbos-blueprint/00` persona notes), with an explicit, one-click way to switch back.

## 4. Content vs. layout spacing — the distinction that keeps rhythm consistent

- **Content spacing** (within a component: label-to-input, icon-to-text) uses the small end of the scale (`space.1`–`space.5`) and is fixed regardless of viewport.
- **Layout spacing** (between components/sections/panels) uses the large end (`space.7`–`space.12`) and *does* scale with breakpoint — see [06_GRID_SYSTEM.md](06_GRID_SYSTEM.md) for per-breakpoint margins/gutters, which are layout spacing, not a separate system.

## 5. Forms, dialogs, cards, lists — worked defaults

| Component | Rule |
|---|---|
| Form (Wizard/Stepper step body) | `space.5` between fields, `space.8` between logical field groups |
| Dialog | `space.7` padding, `space.5` between title and body, `space.7` between body and action row |
| Card (Property/Lead/Recommendation) | `space.5` internal padding, `space.3` between internal elements (title/meta/actions) |
| Record List (table) | see density table §3 |
| Kanban Board | `space.5` gutter between columns, `space.3` between stacked cards within a column |
