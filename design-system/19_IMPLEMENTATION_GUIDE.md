# 19 — Implementation Guide

## 1. Token generation pipeline

`tokens.json` is authored by hand; the three exports are generated from it and never hand-edited independently — a divergence between `tokens.json` and any export file is a build defect, not a valid state.

```
tokens.json  (source of truth)
   │
   ├── design-tokens.css     (CSS custom properties, light+dark scopes)
   ├── tailwind-theme.ts     (Tailwind v4 theme extension)
   └── figma-tokens.json     (Figma Tokens Studio import format)
```

At implementation time this becomes a real build script (e.g. Style Dictionary or an equivalent transform); at design-system-authoring time (this v1.0), the three files were hand-generated from `tokens.json` in the same change and must be regenerated together on every future token edit.

## 2. CSS variable scoping (dark mode + theme toggle)

`design-tokens.css` declares light values at `:root`, dark values under both `@media (prefers-color-scheme: dark)` (OS-level default) and `:root[data-theme="dark"]` (explicit in-product toggle, [14_DARK_MODE.md](14_DARK_MODE.md) §8) — the explicit toggle must win over the OS setting in both directions, which requires the media-query block to use a `:not([data-theme="light"])` guard so a light-mode stamp beats OS-dark. This mirrors the pattern documented for artifact theming and is the standard this system commits to for every future TBOS surface.

## 3. Folder structure convention

```
design-system/
├── README.md
├── 00-19_*.md          # the 20 guideline documents
├── tokens.json          # canonical source
├── design-tokens.css    # generated
├── tailwind-theme.ts    # generated
├── figma-tokens.json    # generated
```

Future component-library code (actual React/Vue components, Figma component files) lives in a separate repo/folder from this one, consuming these tokens as a dependency — per the Foundation document's Article-XIII-derived rule, this folder never contains application screens, business logic, or page layouts, only the system they're built from.

## 4. Naming convention (restated from [02_DESIGN_TOKENS.md](02_DESIGN_TOKENS.md) §3)

`tokens.json` dot-path → CSS custom property (`.` → `-`) → Tailwind theme key (camelCase where required) → Figma variable path. One name, four representations, checked to stay identical by the generation pipeline in §1 rather than by manual review.

## 5. Versioning strategy

Semantic versioning starting at **1.0.0**. A **patch** release fixes a token value without changing its role or name (e.g., nudging a contrast-failing hex). A **minor** release adds tokens/components/documents without breaking existing references (e.g., a new chart form added to [13_DATA_VISUALIZATION.md](13_DATA_VISUALIZATION.md)). A **major** release renames or removes a token/semantic role, requiring every consumer to update — major releases are rare by design, since a rename cascades through every screen using this system.

**1.1.0 exception, documented**: this release renamed `color.primitive.ember` to `color.primitive.coral` — by the letter of the rule above that's a major-release rename. It shipped as 1.1.0 instead because the rename's actual consumer blast radius was verified as zero before making it (`ember` had no `color.semantic` role wired to it in either app, confirmed by grep across `tbos-frontend/src` — see `TBOS_DESIGN_SYSTEM_V1_1_BRAND_CORRECTION_REPORT.md`). The general rule still holds for any future rename with real consumers.

## 6. Deprecation policy

A token or component is never silently removed. Deprecation is a three-step process: (1) mark it deprecated in its source document with the replacement named, (2) keep it functional for at least one minor version so implementation has a migration window, (3) remove it only in a major version, with the removal listed in that version's changelog. `tbos-blueprint/05_COMPONENT_MAPPING.md`'s reuse-discipline principle applies in reverse here — a component isn't removed just because it looks redundant; it's removed once nothing in the 49-screen inventory references it anymore.

## 7. Contribution guide

1. Identify the screen(s) in `tbos-blueprint/04_SCREEN_INVENTORY.md` or component contract in `05_COMPONENT_MAPPING.md` that needs the new token/rule/component — no addition ships without this ([18_DESIGN_RULES.md](18_DESIGN_RULES.md) Rule 29).
2. Check [17_COMPONENT_CATALOG.md](17_COMPONENT_CATALOG.md) and the relevant numbered document first — most needs are a new variant of something that already exists, not a new thing.
3. If genuinely new, add it to `tokens.json` (primitive → semantic layer, [02_DESIGN_TOKENS.md](02_DESIGN_TOKENS.md) §1) and regenerate the three export files in the same change.
4. Document it in the relevant numbered guideline doc and in [17_COMPONENT_CATALOG.md](17_COMPONENT_CATALOG.md) if it's a component.
5. Run it through §8's Design QA Checklist before merge.

## 8. Design QA Checklist

Operationalizes [18_DESIGN_RULES.md](18_DESIGN_RULES.md) as a literal per-PR gate. A change to any screen or component is not mergeable until every applicable box is checked:

- [ ] No hardcoded hex/px/ms — every value traces to `tokens.json`.
- [ ] Contrast verified (4.5:1 / 3:1) for every new text/background pairing, with an automated checker, not eyeballed.
- [ ] Focus state present and visible on every new interactive element.
- [ ] Touch targets ≥44×44px on mobile/tablet.
- [ ] Color is not the only signal anywhere in the change — icon/label pairing present.
- [ ] ARIA roles/attributes correct for the component type used (not a styled `<div>` standing in for a semantic control).
- [ ] Verified in both light and dark mode.
- [ ] Verified in both LTR and RTL, including at 200% browser zoom.
- [ ] Every applicable universal state implemented: Empty/Loading/Offline/No Permission/Error/Restricted/Archived/Deleted.
- [ ] `prefers-reduced-motion` respected if the change includes any animation.
- [ ] Copy reviewed against [16_CONTENT_GUIDELINES.md](16_CONTENT_GUIDELINES.md) — terminology matches the glossary, empty/error/success copy follows the required shape.
- [ ] If a chart: table-view alternative present, palette validated, single-axis.
- [ ] Traced to a real screen ID or component contract — not invented speculatively.

## 9. What "done" means for this v1.0 folder itself

Restated from [00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §8: any of the 49 screens in the blueprint's inventory can be built from tokens and components defined here, with no new style invented per-screen. This folder is the answer key; a future screen build that needs to invent something new is either legitimately extending the system (§7 above) or a sign the screen's requirements weren't actually understood yet.
