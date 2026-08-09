# 02 — Design Tokens

[`tokens.json`](tokens.json) is the source of truth. This document explains its structure, naming, and the rule every token must follow. [`design-tokens.css`](design-tokens.css), [`tailwind-theme.ts`](tailwind-theme.ts), and [`figma-tokens.json`](figma-tokens.json) are generated from it and are never hand-edited independently — a value changes in `tokens.json` first, always.

## 1. The rule: primitive → semantic → component

Three layers, never skipped or collapsed:

1. **Primitive** — raw values with no meaning attached. `color.primitive.ink.600`, `spacing.scale.5`. Never referenced directly by a screen or component.
2. **Semantic** — a primitive given a role. `color.semantic.light["action.primary.bg"]` → `{ink.600}`. This is the layer components and screens actually consume.
3. **Component** (defined per-component in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md), not duplicated in `tokens.json`) — a semantic token applied to a specific component part, e.g. "Button primary background = `action.primary.bg`."

**Why this matters**: rebranding, retheming for dark mode, or adjusting contrast never touches component code — only the semantic layer's mapping to primitives changes. This is also how [14_DARK_MODE.md](14_DARK_MODE.md) works: `color.semantic.dark` is a full parallel mapping of the same semantic names to different primitives, not a separate set of components.

**No hardcoded values, ever.** Any hex, px, or ms literal in implementation code that isn't a token reference is a defect, full stop — see [18_DESIGN_RULES.md](18_DESIGN_RULES.md) Rule 1.

## 2. Token categories in `tokens.json`

| Category | Purpose | Detail doc |
|---|---|---|
| `color.brand` | Canonical, exact Tuba brand reference swatches (`tuba-purple`, `tuba-coral`) — not a scale | [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §1a |
| `color.primitive` | 8 raw hue scales (Ink, Coral, Copilot, Slate, Success, Warning, Danger, Info) | [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) |
| `color.chart` | Categorical/sequential/diverging/status palette for data visualization, validated per the dataviz color-formula method | [13_DATA_VISUALIZATION.md](13_DATA_VISUALIZATION.md) |
| `color.semantic.{light,dark}` | Role-based aliases every component consumes | [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md), [14_DARK_MODE.md](14_DARK_MODE.md) |
| `typography.fontFamily` | Latin/Arabic/mono stacks | [04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) |
| `typography.scale` | 10-step type scale, size/lineHeight/weight/letterSpacing | [04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) |
| `spacing.scale` | 4px-based scale, 0–128px | [05_SPACING_SYSTEM.md](05_SPACING_SYSTEM.md) |
| `spacing.density` | Comfortable/Compact row-level overrides | [05_SPACING_SYSTEM.md](05_SPACING_SYSTEM.md) §3 |
| `radius` | 6-step corner-radius scale | [09_ELEVATION_SYSTEM.md](09_ELEVATION_SYSTEM.md) §1 |
| `border.width` | Hairline/default/thick | [09_ELEVATION_SYSTEM.md](09_ELEVATION_SYSTEM.md) §1 |
| `elevation` | 5-step shadow scale + dark-mode adjustment rule | [09_ELEVATION_SYSTEM.md](09_ELEVATION_SYSTEM.md) |
| `motion.duration`, `motion.easing` | 6 durations, 3 easing curves | [10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md) |
| `breakpoint`, `grid` | 4 breakpoints, per-breakpoint column/gutter/margin | [06_GRID_SYSTEM.md](06_GRID_SYSTEM.md) |
| `zIndex` | 10-layer stacking scale | §4 below |
| `sizing` | Touch targets, icon sizes, avatar sizes, rail/panel widths | [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md), [08_ICONOGRAPHY.md](08_ICONOGRAPHY.md) |
| `opacity` | Disabled/hover/active/scrim states | §5 below |

## 3. Naming convention

`{category}.{group}.{step}` for primitives (`color.primitive.ink.600`), `{category}.{role}.{modifier}` for semantic tokens (`color.semantic.light["action.primary.bg-hover"]`). Dot-path keys map 1:1 to CSS custom property names by replacing `.` with `-`: `color.primitive.ink.600` → `--color-ink-600`. Tailwind theme keys mirror the same path, camelCased where Tailwind requires it. This identical-name discipline across `tokens.json` → CSS → Tailwind → Figma is what keeps design and code from drifting (Success Criterion in [00](00_DESIGN_SYSTEM_FOUNDATION.md) §8).

## 4. Z-index — a single stacking scale, never ad hoc

Ten fixed layers, lowest to highest: `base(0) → sticky(10) → dropdown(100) → overlayScrim(200) → panel(300) → modal(400) → popover(500) → toast(600) → commandPalette(700) → tooltip(800)`.

Rationale for the ordering that isn't self-evident: **popover sits above modal**, because a popover (e.g., a date picker) can be triggered from inside a Confirmation Dialog and must render above it. **Toast sits above popover**, because a background operation's completion toast must interrupt any open menu. **Tooltip is always topmost** — nothing else earns priority over a tooltip currently being read. No component ever hardcodes a z-index outside this scale.

## 5. States as tokens, not per-component values

`opacity.disabled` (0.45), `opacity.hover-wash` (0.06), `opacity.active-wash` (0.10) are applied as a wash over the component's resting background, not as separate per-component disabled/hover colors — this guarantees hover/active/disabled read consistently across every interactive surface in the system. See [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §2 for how focus state is handled separately (a 2px `border.focus`-colored outline at `border.width.thick`, never opacity-based, since focus must stay legible for low-vision users).

## 6. What is deliberately *not* a token

Business logic values (SLA hours, stage names, permission scopes) live in `tbos-blueprint/`, not here — a design token controls appearance, never behavior. If a value determines what happens rather than how it looks, it doesn't belong in `tokens.json`.
