# 14 — Dark Mode

Dark mode is mandatory, not a stretch goal — every component in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) ships with a light, dark, and high-contrast treatment before it's considered complete ([00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §8).

## 1. Selected, not inverted

Dark mode is **not** `filter: invert()` or an automatic per-channel color flip. `tokens.json` → `color.semantic.dark` is a deliberately chosen mapping of the same semantic role names to different primitive steps — every pairing re-verified against the 4.5:1/3:1 contrast floor on the dark surface independently of its light-mode value. This is the same discipline the dataviz method requires of chart palettes (§4 below) applied to the whole UI.

## 2. Surface model

| Role | Light | Dark | Why not a simple invert |
|---|---|---|---|
| `bg.canvas` | `slate.50` (near-white) | `slate.950` (near-black, not pure `#000`) | Pure black against white text causes halation/eye strain in long sessions — a near-black canvas is the standard mitigation |
| `bg.surface` | `slate.0` (white) | `slate.900` | Cards sit one step *lighter* than canvas in dark mode (inverted relationship from light mode's white-on-tint) so elevation still reads as "raised" |
| `bg.surface-raised` | `slate.0` | `slate.800` | An explicitly higher surface (e.g. a menu inside a panel) needs to be distinguishable from `bg.surface` itself — impossible with a single dark neutral, so this step exists only in dark mode's practical use (light mode's near-flat model rarely needs a third surface tier) |

## 3. Status-subtle backgrounds — overlay, not flat tint

Light mode's `bg.success-subtle` etc. are flat `-50` tints (`success.50`). In dark mode these become **low-opacity overlays** (`rgba(42,157,79,0.16)`) rather than a flat dark-green tint — a flat dark tint of a saturated hue reads muddy and fails contrast against `slate.900` more unpredictably than a translucent overlay does. This is a deliberate exception to "select a fixed step," made because the alternative (a solid dark-mode success/warning/danger/info scale) would require doubling the primitive palette for marginal benefit.

## 4. Charts and data visualization

Every chart palette slot has its own selected dark-mode value (`color.chart.categorical.*.dark` in `tokens.json`), not an automatic flip of the light value — re-validated against `color.chart.surfaceDark` (`#1a1a19`) independently, per the dataviz method's requirement that dark mode is "selected... not an automatic flip." Status colors (`good`/`warning`/`serious`/`critical`) keep the *same* hex in both modes since they were chosen to already clear 3:1 on both surfaces — the one deliberate exception to "every token has a distinct dark value," made because re-stepping them would break their fixed, reserved-meaning role.

## 5. Elevation and borders

Shadows read poorly on dark surfaces — see [09_ELEVATION_SYSTEM.md](09_ELEVATION_SYSTEM.md) §4: dark-mode shadows increase ~1.6× opacity, and every `elevation.2`+ surface gains a 1px `slate.700` border as the primary depth cue, with shadow as reinforcement rather than the sole signal.

## 6. Brand and AI colors in dark mode

`ink.500` (not `600`) is the dark-mode default interactive step — `ink.600` (the exact Tuba brand purple, `#2A0C72`) reads correctly on white but slightly muddy on a near-black surface; the one-step-lighter value restores the same perceived vibrancy. The same one-step-lighter adjustment applies to `copilot` (Copilot violet moves from `600` to `500`) and every other brand/semantic family used as a foreground-on-dark color, per the mapping already specified in `tokens.json`.

**v1.1 correction to hover/active direction**: because the real Tuba purple is a dark, saturated hue at every functional step (unlike v1.0's lighter placeholder blue), `text.on-brand`/`icon.on-brand` in dark mode are now light (`slate.0`), matching light mode, rather than flipping to dark text. Consequently `action.primary.bg-hover`/`bg-active` now step *darker* in dark mode too (`ink.600` → `ink.700`, mirroring light mode's `ink.700` → `ink.800` direction) instead of the v1.0 lighter-on-hover direction, which depended on the now-superseded dark-foreground-text assumption. All four states (light default/hover/active, dark default/hover/active) are re-verified at ≥4.5:1 text contrast in `TBOS_DESIGN_SYSTEM_V1_1_BRAND_CORRECTION_REPORT.md`.

## 7. High contrast

A third mode, layered on top of light or dark: increases every border to `border.width.thick` (2px), removes all `-subtle` background tints in favor of solid `-100`/`-800` fills with an explicit border, and disables decorative-only shadow (keeping only the border-based elevation cue from §5). Triggered by the OS-level `forced-colors`/high-contrast media query, never a manual TBOS-only toggle — this keeps it consistent with whatever the user's OS already does system-wide.

## 8. Theme switching mechanics

Respects the OS-level `prefers-color-scheme` by default; an explicit in-product toggle (Settings, `SET-01`) can override it per-user, persisted the same way rail-collapse state is (per-user, durable). Implementation detail for the CSS-variable scoping this requires (`prefers-color-scheme` media query + a `data-theme` attribute override that wins in both directions): see `design-tokens.css`'s structure, [19_IMPLEMENTATION_GUIDE.md](19_IMPLEMENTATION_GUIDE.md) §2.

## 9. What never changes between modes

Type scale, spacing scale, radius scale, motion durations/easing, and the five-meaning status-color *mapping* (which state means Success vs. Warning) are mode-invariant — only the color *values* backing them change. A component that behaves differently in dark mode beyond its color mapping is a defect.
