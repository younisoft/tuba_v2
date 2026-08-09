# 20 — Tuba Brand Pattern Language

## 1. What this is

`icons_set/` holds 20 official Tuba brand SVG assets, placed directly by Tuba and used as-is — never redrawn, recreated, or replaced. They are the **Tuba Brand Pattern Language**: an abstract, organic line-art motif system (sun, moon, waves, trees, mountains, flowers, desert, a compass/direction mark, a dot cluster, and stylized home silhouettes) plus one wordmark-adjacent mark (`tuba icon.svg`), all rendered in the exact canonical Tuba purple, `#2A0C72` (`color.brand.tuba-purple` — see [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §1a).

**They are not functional UI icons.** Do not register them in, substitute them into, or treat them as part of the functional icon set specified in [08_ICONOGRAPHY.md](08_ICONOGRAPHY.md) (the 24×24, 1.5px-stroke, Lucide/Phosphor-grammar set used for nav items, buttons, table actions, status glyphs, etc.). That set answers "what does this control do"; the Brand Pattern Language answers "what does Tuba feel like" — decorative brand texture for marketing surfaces, empty states, auth screens, and onboarding, never for an interactive control a user needs to parse at a glance.

## 2. Inventory

All 20 files verified by direct inspection (not regenerated): every file uses a single shared style class, `fill:none; stroke:#2a0c72; stroke-miterlimit:10; stroke-width:1.72px`, on a viewBox scaled to a common ~188-unit artboard (exact bounds vary per motif's natural aspect ratio).

| File | Motif | viewBox |
|---|---|---|
| `tuba icon.svg` | Brand mark (abstract bird/flow form) — distinct from the 19 patterns below | 0 0 188.05 187.87 |
| `sun.svg` | Sun | 0 0 187.85 187.85 |
| `moon.svg` | Moon | 0 0 187.71 187.71 |
| `sea-sun.svg` | Sun over water | 0 0 186.66 186.78 |
| `sun-desert.svg` | Sun + desert dune | 0 0 186.91 174.85 |
| `sun-desert2.svg` | Sun + desert dune (variant) | 0 0 186.91 181.33 |
| `flower.svg` | Flower | 0 0 182.71 177.36 |
| `flower tree.svg` | Flowering tree | 0 0 144.41 187.71 |
| `fat tree.svg` | Tree (full canopy) | 0 0 123.63 187.71 |
| `thin tree.svg` | Tree (slender) | 0 0 86.68 187.71 |
| `pulm.svg` | Palm tree | 0 0 187.71 176.01 |
| `garden.svg` | Garden / massed planting | 0 0 187.71 178.05 |
| `mountain.svg` | Mountain range | 0 0 188.96 123.8 |
| `smooth waves.svg` | Waves (smooth) | 0 0 185.24 130.88 |
| `sharp waves.svg` | Waves (sharp) | 0 0 187.71 107.77 |
| `direction.svg` | Compass / direction mark | 0 0 131.6 187.71 |
| `dots.svg` | Dot cluster | 0 0 188.42 60.26 |
| `home1.svg` | Home silhouette | 0 0 117.99 188.29 |
| `modren-home.svg` | Home silhouette (modern) | 0 0 168.57 188.34 |
| `doplix home.svg` | Home silhouette (duplex) | 0 0 155.48 187.71 |

**Color audit** (grep across all 20 files, `stroke:#…`/`fill:#…`): every file resolves to the single value `#2a0c72`. None reference the brand coral or any other hue — the pattern language is purple-only by design; coral is reserved for the functional Coral primitive family (Wallet/Finance emphasis, [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §1), not brand-pattern decoration.

## 3. Usage rules

1. **Decorative only, never a status signal.** A pattern SVG never substitutes for a Status Badge, an icon inside a button, or any control that carries meaning a screen reader must announce. It has no accessible name and should be marked `aria-hidden="true"` wherever it's placed, with the actual content conveyed by adjacent text.
2. **Backgrounds, empty states, auth screens, marketing surfaces only** — the same surfaces `tbos-blueprint/04_SCREEN_INVENTORY.md` already treats as low-density/onboarding-register (auth, first-run empty states), never inside dense operational screens (tables, pipelines, forms) where the Design Principles' density/trust floor applies.
3. **Fixed brand purple, not re-themed.** Unlike functional icons (which use `icon.default`/`icon.on-brand` semantic tokens and flip per light/dark mode), these assets stay `#2A0C72` in both light and dark mode — they are brand marks, not UI chrome. On dark surfaces, use them at reduced opacity (e.g. `opacity.hover-wash`–`opacity.active-wash` range, [02_DESIGN_TOKENS.md](02_DESIGN_TOKENS.md) §5) rather than recoloring the stroke, so the exact brand hex is never diluted.
4. **Never resized to a functional icon's footprint.** These are illustrative patterns meant to read at a large scale (hero art, section dividers, empty-state illustration) — never shrunk to `sizing.icon.sm/md/lg` ([02_DESIGN_TOKENS.md](02_DESIGN_TOKENS.md)) where they'd compete visually with the functional icon set's much simpler grammar.
5. **No redraws.** If a new motif is ever needed, it comes from Tuba as a new official SVG placed in `icons_set/` and registered here — never approximated or hand-drawn to match the style.

## 4. File location

`design-system/icons_set/*.svg` — canonical location, placed directly by Tuba. Referenced by path, not duplicated elsewhere in the repo; `tbos-frontend` consumes them by importing directly from this folder (see [19_IMPLEMENTATION_GUIDE.md](19_IMPLEMENTATION_GUIDE.md) §1 for the asset-consumption pattern) or by copying at build time if the bundler requires assets inside its own source tree — never by redrawing a duplicate.
