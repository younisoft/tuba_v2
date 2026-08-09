# 09 — Elevation System

## 1. Radius scale

`tokens.json` → `radius`:

| Token | px | Use |
|---|---|---|
| `none` | 0 | Table cells, full-bleed sections |
| `xs` | 4 | Tags, small controls, checkbox/toggle |
| `sm` | 6 | Buttons, form inputs |
| `md` | 8 | Small cards, popovers, menus |
| `lg` | 12 | Cards (Property/Lead/Recommendation), Metric Tiles |
| `xl` | 16 | Dialogs, Slide-over Panels, Command Palette |
| `full` | 9999 | Pills (Status Badge), avatars, count badges |

## 2. Philosophy: near-flat, border-first

TBOS's depth model is **hairline borders as the primary separation cue, shadows reserved for surfaces that genuinely float above content.** This is a deliberate choice, not a default: `00_DESIGN_SYSTEM_FOUNDATION.md` §3 requires "calm, not decorative" — a screen where every card casts a shadow reads as busier and, at high information density, actively fatiguing over a multi-hour session (`00` §5). A card resting in the normal document flow (Property card in a list, Metric Tile on Home) uses `border.default` (1px, `slate.200`/`slate.700` dark) and `bg.surface` against `bg.canvas`, never a shadow, at `elevation.0`.

Shadow is reserved for the four elevation steps that represent genuine z-axis separation — content that overlays other content and must read as temporarily on top of it:

| Token | Used by | Value (see `tokens.json` → `elevation`) |
|---|---|---|
| `elevation.0` | Cards, tiles, table rows — anything in normal flow | none (border only) |
| `elevation.1` | Hover-raised state of an interactive card; Top Bar's border-bottom | subtle, near-imperceptible |
| `elevation.2` | Dropdown menus, tooltips, the Explainability Popover | visible but soft |
| `elevation.3` | Slide-over Panel | pronounced, still restrained |
| `elevation.4` | Modal/Confirmation Dialog, Command Palette | the strongest shadow in the system, reserved for content that fully interrupts the current task |

## 3. Why not Bayut's near-flat shadow or Aqar's border-only-no-shadow

Both competitor systems were read as reference points ([00](00_DESIGN_SYSTEM_FOUNDATION.md) §6). Aqar's zero-shadow, border-only-everywhere approach was noted as a strength worth learning from for resting content — but TBOS's overlay components (Panel, Dialog, Command Palette, Popover) genuinely need a depth cue beyond a border, since they overlay a scrim or sit above other interactive content where a border alone doesn't communicate "this is temporarily on top." The 5-step scale here keeps Aqar's flat-resting-content instinct for `elevation.0` while giving true overlays (`elevation.2`–`4`) a real, if restrained, shadow.

## 4. Dark mode adjustment

Shadows read poorly on dark surfaces — a dark shadow against an already-dark background is nearly invisible, and RGBA-black shadows that worked on light surfaces don't provide separation. Dark mode's rule (`elevation.darkAdjustment` in `tokens.json`): shadow opacity increases ~1.6× *and* every surface at `elevation.2` or above gains a 1px `slate.700` border in addition to its shadow — the border becomes the primary separation cue in dark mode, with shadow as reinforcement rather than the sole signal. Full dark-mode surface mapping: [14_DARK_MODE.md](14_DARK_MODE.md).

## 5. Border weight

`border.width` — `hairline`/`default` (1px) for all resting dividers, card borders, table row separators, and input borders; `thick` (2px) reserved for the focus ring ([11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §2) and for a selected/active state's distinguishing border (e.g., a selected Kanban card) — never used decoratively.

## 6. Radius pairing with elevation

Higher-elevation surfaces use larger radii — this isn't arbitrary, it keeps the "this is a distinct floating object" read consistent: `elevation.4` surfaces (Dialog, Command Palette) always pair with `radius.xl`; `elevation.0` resting cards pair with `radius.lg`; table cells at `elevation.0` use `radius.none` since a table's rows read as one continuous surface, not discrete floating objects.
