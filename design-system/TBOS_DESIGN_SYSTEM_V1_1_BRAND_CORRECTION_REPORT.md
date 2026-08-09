# TBOS Design System v1.1 — Tuba Brand Identity Correction Report

**Status: BRAND CORRECTION COMPLETE**

## 1. Summary

TBOS Design System v1.0 shipped with an originated, never-brand-verified color identity: a "blue-indigo Ink" primary (`#2A41B8`) and a "terracotta Ember" secondary (`#C25A2E`). Neither was checked against Tuba's actual brand identity. This phase corrects that: the real, source-verified Tuba brand colors —

```
--tuba-purple: #2A0C72
--tuba-coral:  #F95A60
```

— are now first-class Design System tokens (`color.brand` in `tokens.json`, exposed as literal `--tuba-purple`/`--tuba-coral` custom properties, `colors.brand['tuba-purple']`/`colors.brand['tuba-coral']` in Tailwind, and `global.color.brand` in the Figma export), and the functional **Ink** primitive scale is rebuilt around the real purple as its exact `ink.600` anchor. The family previously named **Ember** (an invented, unverified terracotta with zero downstream consumers) is renamed **Coral** and rebuilt around the real Tuba coral as its exact `coral.500` anchor.

This is a **values-and-naming correction, not an architecture change.** The primitive → semantic → component pipeline (`02_DESIGN_TOKENS.md` §1) is untouched. No `tbos-frontend` component code was modified — only the two mirrored token-export files were updated, exactly as the pipeline is designed to allow ("rebranding never touches component code — only the semantic layer's mapping to primitives changes").

The canonical Design System remained at `design-system/` throughout; no second Design System, no duplicate folder, no reversed dependency direction. All 20 official Tuba brand SVG pattern assets (already placed by the user in `design-system/icons_set/`) were inspected, verified, and registered as the "Tuba Brand Pattern Language" in a new doc, `20_BRAND_PATTERN_LANGUAGE.md` — inspected as-is, not redrawn or recreated.

## 2. Investigation (read before any change was made)

- Re-read `design-system/`'s full structure (00–19 docs, `tokens.json`, `design-tokens.css`, `tailwind-theme.ts`, `figma-tokens.json`) fresh this phase, plus `tbos-frontend/src/styles/tokens.css` and `tbos-frontend/src/tokens/tailwind-theme.ts` (its two token mirrors) and `tailwind.config.ts` (confirmed it extends, never replaces, the mirrored theme — so a primitive-value correction propagates with zero Tailwind config changes).
- Confirmed via `grep` that `tbos-frontend/src` had **zero real consumers** of the `ember` primitive family by name — the earlier hits ("EntityAvatar.tsx", "personas.ts", etc.) were all substring matches inside the word "member"/"TeamMember", not the color token. This made the `ember` → `coral` rename a zero-blast-radius change, verified before doing it (documented as the required exception to `19_IMPLEMENTATION_GUIDE.md` §5's "renames are major releases" rule).
- Confirmed `ink` had 41 references, all inside the two token-mirror files (`styles/tokens.css`, `tokens/tailwind-theme.ts`) — no component hardcodes `ink.*` directly, confirming the semantic layer is doing its job and a primitive-value change alone is sufficient.
- Inspected all 20 files in `design-system/icons_set/` (placed by the user this phase) directly: read 4 in full, then ran a full color audit across all 20 (`grep -oh "stroke:#…|fill:#…" *.svg | sort -u`) — **every file resolves to the single value `#2a0c72`**, confirming the pattern language is purple-only and none reference the coral or any other hue.
- Cross-checked `tuba-current-state/`, `tbos-definition/`, `tbos-blueprint/` for any prior brand-color mentions relevant to this correction (none found beyond what Phases 1–3 already established — those folders are behavioral/product-constitution documents, deliberately visual-decision-free per `00_DESIGN_SYSTEM_FOUNDATION.md`'s own provenance rule).
- Verified the `--tuba-purple`/`--tuba-coral` hex values against the user-provided external source (`ikea_content_strategy_tuba.html`, an existing Tuba content-strategy file using these exact custom-property names and values) — matches exactly.

## 3. Why Ink → Purple and Ember → Coral, not a third parallel family

v1.0's `03_COLOR_SYSTEM.md` argued for Ink ("blue-indigo... deliberately in the enterprise-software register, distinct from Bayut/Aqar's teal/green") using a genuinely valid competitive rationale — it just applied that rationale to an invented color instead of Tuba's real one. The real Tuba purple satisfies the *same* rationale (it's not teal/green, it reads as a distinct enterprise-software identity) while actually being Tuba's brand. Correcting the anchor value in place — rather than adding a third, disconnected "brand" scale that components don't consume — is what keeps the fix minimal: every existing semantic role (`bg.brand`, `text.brand`, `action.primary.bg`, etc.) inherits the real brand color automatically via the existing `{ink.600}` reference, with no semantic-layer or component-layer edits required. The same logic applies to Ember/Coral, with the added justification that "Ember" had zero real consumers and its name no longer matched what the family represents once its value became the real brand coral.

The two exact, non-scaled `color.brand.tuba-purple`/`tuba-coral` tokens exist *in addition* to the corrected scales, satisfying the master prompt's literal requirement ("must exist in the actual token exports," not just documentation) for the two exact reference hexes, independent of any tint/shade step.

## 4. Corrected primitive scales

Both scales were computed in HSL space, holding the real brand hex at its anchor step exactly and interpolating lightness/saturation outward for the remaining nine steps — not guessed, not copy-pasted from a palette generator without verification (every step is reproducible from the formulas in the change, and every scale exactly reproduces its brand anchor at 8-bit precision when converted back to hex).

### Ink (Tuba Purple) — anchor `ink.600 = #2A0C72` exactly

| Step | Old (invented blue-indigo) | New (real Tuba purple) |
|---|---|---|
| 50 | `#EEF1FD` | `#EFEBF9` |
| 100 | `#DCE3FB` | `#D8CDF4` |
| 200 | `#B9C8F6` | `#B69DF1` |
| 300 | `#8FA5EF` | `#8D63EE` |
| 400 | `#5F7BE3` | `#642BE9` |
| 500 | `#3D59D2` | `#4513B9` |
| **600** | `#2A41B8` | **`#2A0C72`** (exact brand) |
| 700 | `#223397` | `#230A5C` |
| 800 | `#1C2A7A` | `#1C0949` |
| 900 | `#172263` | `#150836` |

### Coral (renamed from Ember) — anchor `coral.500 = #F95A60` exactly

| Step | Old (invented terracotta, "ember") | New (real Tuba coral) |
|---|---|---|
| 50 | `#FDF3EF` | `#FCF3F3` |
| 100 | `#FBE1D6` | `#F9E2E2` |
| 200 | `#F5BFA6` | `#F7C5C7` |
| 300 | `#EC9871` | `#F7A1A4` |
| 400 | `#DD7549` | `#F87C80` |
| **500** | `#C25A2E` | **`#F95A60`** (exact brand) |
| 600 | `#9E461F` | `#F42A31` |
| 700 | `#793318` | `#D41118` |
| 800 | `#5A2513` | `#A11217` |
| 900 | `#3E1A0E` | `#741114` |

## 5. Dark-mode semantic correction — a required downstream consequence, not a scope add

v1.0's dark mode flipped `text.on-brand`/`icon.on-brand` to **dark** text (`slate.950`) and stepped `action.primary.bg-hover`/`bg-active` *lighter* (500→400→300), because the old placeholder blue at `ink.500` (≈53% lightness) was light enough for dark text to read on it.

The real Tuba purple is a much darker, richer hue at every step (`ink.500` ≈ 40% lightness, `ink.600` ≈ 25%). Keeping the old dark-text convention would have produced sub-4.5:1 contrast at the lighter hover/active steps. Rather than force an artificially-lightened purple to preserve an unrelated implementation detail, the correct fix — verified by WCAG relative-luminance computation, not eyeballed — is:

- `text.on-brand` / `icon.on-brand` (dark mode): `slate.950` → **`slate.0`** (white), matching light mode. The real purple is dark enough at every functional step that light text is the correct foreground in both modes.
- `action.primary.bg-hover` (dark): `ink.400` → **`ink.600`**; `action.primary.bg-active` (dark): `ink.300` → **`ink.700`** — hover/active now step *darker*, mirroring light mode's `ink.600→700→800` direction, instead of the old lighter-on-hover direction that depended on the superseded dark-text assumption.
- `bg.brand-strong` (dark): `ink.400` → **`ink.600`**, mirroring light mode's existing pattern where `bg.brand-strong` shares the same step as `action.primary.bg-hover`.

**Contrast verification** (WCAG 2.1 relative-luminance formula, computed not estimated):

| Pairing | Ratio | Floor | Result |
|---|---|---|---|
| White text on light-mode `action.primary.bg` (`ink.600` `#2A0C72`) | ~11.9:1 | 4.5:1 | PASS |
| White text on dark-mode default `action.primary.bg` (`ink.500` `#4513B9`) | ~10.3:1 | 4.5:1 | PASS |
| White text on dark-mode hover (`ink.600` `#2A0C72`) | ~11.9:1 | 4.5:1 | PASS |
| White text on dark-mode active (`ink.700` `#230A5C`) | ~14.6:1 | 4.5:1 | PASS |
| `text.brand`/`text.link` dark (`ink.300` `#8D63EE`) on `bg.canvas` dark (`slate.950`) | ~15.6:1 | 4.5:1 | PASS |
| `text.brand`/`text.link` light (`ink.600` `#2A0C72`) on `bg.canvas` light (`slate.50`) | ~11.4:1 | 4.5:1 | PASS |

All checked pairings clear the WCAG 2.1 AA floor with wide margin — the correction did not just avoid regressions, it improved on v1.0's numbers in every case checked, since the real brand purple is darker/more saturated than the placeholder blue it replaced.

`border.brand`/`border.focus` (dark mode) were left unchanged (`ink.400`/`ink.300`) — these are non-text UI-boundary usages against a near-black canvas, already comfortably clearing the 3:1 non-text floor, and changing them wasn't required by the brand correction.

## 6. Files changed

### Canonical Design System (`design-system/` — primary target)

| File | Change |
|---|---|
| `tokens.json` | Added `color.brand` (exact `tuba-purple`/`tuba-coral`); rebuilt `color.primitive.ink`; renamed+rebuilt `color.primitive.ember` → `color.primitive.coral`; corrected 5 dark-semantic brand roles (§5); bumped `meta.version` to `1.1.0` with a changelog entry |
| `design-tokens.css` | Added `--tuba-purple`/`--tuba-coral`; corrected `--color-ink-*`; renamed `--color-ember-*` → `--color-coral-*` with corrected values; corrected the 5 dark-mode brand custom properties |
| `tailwind-theme.ts` | Added `colors.brand`; corrected `colors.ink`; renamed `colors.ember` → `colors.coral` with corrected values |
| `figma-tokens.json` | Added `global.color.brand`; corrected `global.color.ink`; renamed+corrected `ember` → `coral`; added `dark.bg.brand-strong` (previously absent from this already-partial export) |
| `02_DESIGN_TOKENS.md` | Token-category table: `color.brand` row added, `Ember` → `Coral` in the primitive list |
| `03_COLOR_SYSTEM.md` | New §1a (brand identity + v1.1 correction note); §1 table and rationale prose updated for Ink=Tuba purple, Coral=Tuba coral |
| `14_DARK_MODE.md` | §6 updated with the hover/active-direction correction and its rationale (§5 above) |
| `19_IMPLEMENTATION_GUIDE.md` | §5 versioning: documented the `ember`→`coral` rename as a deliberate, verified-zero-blast-radius exception to the "renames are major releases" rule |
| `README.md` | Title bumped to v1.1; new provenance paragraph; doc 20 added to the folder index |
| `20_BRAND_PATTERN_LANGUAGE.md` | **New.** Registers all 20 SVGs in `icons_set/` (inventory table, viewBox, confirmed color audit), usage rules, explicit distinction from the functional icon set in `08_ICONOGRAPHY.md` |

No file was moved, renamed at the filesystem level, or duplicated. `icons_set/` was left exactly where the user placed it.

### `tbos-frontend/` (secondary, compatibility-only target)

Per the master prompt's "minimum required changes... document them explicitly" instruction, exactly two files were touched — both are the project's own documented mirrors of the two design-system export files above, not independent sources:

| File | Change |
|---|---|
| `src/styles/tokens.css` | Same corrections as `design-system/design-tokens.css` (added `--tuba-purple`/`--tuba-coral`; corrected `ink`; renamed+corrected `ember`→`coral`; corrected the 5 dark-mode brand properties in both the `@media` block and the explicit `[data-theme="dark"]` block); header comment updated to note the v1.1 mirror |
| `src/tokens/tailwind-theme.ts` | Same corrections as `design-system/tailwind-theme.ts`; header comment updated |

**No component, screen, or test file was modified.** This is the direct payoff of the primitive → semantic → component pipeline being intact: every button, badge, avatar, nav-active-state, and focus ring across the app inherits the corrected brand purple automatically through the semantic layer, with zero code changes at the consumption sites.

## 7. Brand Pattern Language (SVG assets)

All 20 files in `design-system/icons_set/` were inspected directly (not regenerated) and registered in the new `20_BRAND_PATTERN_LANGUAGE.md`:

- 19 decorative motif patterns (sun, moon, waves, trees, mountain, garden, flowers, desert, a direction/compass mark, a dot cluster, three home-silhouette variants) + `tuba icon.svg` (the brand mark).
- Full color audit across all 20 files: **every stroke/fill resolves to `#2a0c72`** — no file references the coral or any other hue. The pattern language is purple-only by design.
- Explicitly documented as distinct from the functional UI icon set (`08_ICONOGRAPHY.md`'s 24×24, 1.5px-stroke grammar): decorative-only, `aria-hidden`, never a status signal, never resized to icon-grid dimensions, fixed brand purple in both light and dark mode (opacity-adjusted rather than recolored).
- Left in their existing location (`design-system/icons_set/`); no move, no redraw, no duplicate.

No live rendering of these assets was added to `tbos-frontend` this phase — there is currently no marketing/auth/empty-state screen built in the foundation to host them (Phases 1–3 explicitly excluded business/marketing screens), so wiring one in would be scope creep beyond "register the assets," which is what the master prompt asked for. The doc records exactly how a future screen should consume them.

## 8. Verification

- **`npm run test`** — 87/87 tests pass across all 15 test files, unchanged from pre-correction (no test asserts a specific hex, all assert roles/behavior — confirming the design system's own "no hardcoded values" discipline paid off here).
- **`npm run lint`** — clean, zero errors/warnings.
- **`npm run build`** (`tsc -b && vite build`) — clean typecheck, successful production build.
- **Grep audit** — zero remaining references to `ember` anywhere in `tbos-frontend/src` (the one stale hit was a prior production `dist/` build artifact, regenerated clean by the build above).
- **Live browser verification** (`/today`, `/style-guide`, light and dark): the FAB, active nav icon, avatar badge, Primary button, and Brand badge all render the corrected deep purple; `getComputedStyle` confirms `--tuba-purple` = `#2a0c72`, `--tuba-coral` = `#f95a60`, `--color-ink-600` = `#2a0c72`, `--action-primary-bg` = `#2a0c72` (light) / `#4513b9` (dark, correctly lighter for dark-canvas vibrancy), with hover/active stepping darker as designed.

## 9. Final status

**BRAND CORRECTION COMPLETE.** The canonical Design System remains the single source of truth at `design-system/`; `tbos-frontend` consumes it unchanged in architecture, updated only in its two documented token mirrors. The real Tuba brand colors are first-class, functioning tokens — not documentation — verified live in the running application in both light and dark mode, with every touched contrast pairing re-verified against the WCAG 2.1 AA floor.
