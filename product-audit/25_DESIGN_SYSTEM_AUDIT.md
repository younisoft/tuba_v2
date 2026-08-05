# Design System Audit

Values below marked `[DOM-verified]` were read directly via read-only `getComputedStyle`/CSS-rule inspection against the live, already-authenticated session (no state was changed; this was equivalent to opening browser DevTools). Everything else is `[Observed]` (visual, from screenshots) or `[Inferred]`.

## Foundation: framework

Ant Design (`ant-btn`, `ant-table`, `ant-progress`, `ant-row`, `ant-btn-circle` classes present) with a custom theme wrapper class (`styleProfolio`) and CSS-in-JS styled-components (`sc-*` hashed class names observed in click selectors). `[DOM-verified]` This is a themed component-library build, not a bespoke design system — which is the right call for a small-to-mid product team and something Tuba should default to as well rather than hand-rolling primitives.

## Typography `[DOM-verified]`

- **Font stack**: `Figtree, "Droid Arabic Kufi", sans-serif` — a Latin geometric sans paired with a matching Arabic face for RTL parity. This is a deliberate bilingual pairing choice, not a fallback-of-convenience (Droid Arabic Kufi is specifically chosen, not the OS default Arabic font).
- Body base: 16px / line-height ~18.4px `[DOM-verified on `<body>`]`; component text runs smaller (14px buttons, cards, tags) `[DOM-verified]`.
- Button/label weight: 600 (semi-bold) `[DOM-verified]`; body/tag weight: 400 `[DOM-verified]`.
- Heading hierarchy: `[Observed, weak]` — several captured pages exposed thin or absent `h1`/`h2` structure (e.g. Overview, Post Listing had no heading roles in the accessibility snapshot at all), consistent with the accessibility gap already noted in the UX Review.

## Color `[DOM-verified samples]`

| Token (proposed name) | Hex | Observed usage |
| --- | --- | --- |
| `brand-primary` | `#006169` | Solid CTA buttons (Post Listing), primary text-on-transparent buttons |
| `brand-primary-tint` | `#F7FCFC` | Card backgrounds (`--primary-light` CSS var, confirmed) |
| `surface-sidebar` | `#F6F7FB` | Sidebar background |
| `status-success-fg` | `#28B16D` | "Live" status pill text |
| `status-success-bg` | `#E5F7EB` | "Live" status pill background |
| `text-neutral` | `#707070` | Secondary tags (e.g. "Basic"), muted links |
| `text-primary-on-light` | `rgba(0,0,0,0.88)` | Card body text (Ant Design's default text-opacity convention, not a flat black) |

Two CSS custom properties were also found unresolved in production (`--primary-color: ${tenantTheme["primary-light-4"]}...`) `[DOM-verified]` — a template string leaking into a shipped stylesheet, i.e. a real (minor) build/theming bug on Bayut's side worth noting as a technical observation, not a design decision.

Status colors for Warning/Danger were not directly sampled (no warning or error state was actively displayed during the read-only pass), so a full semantic palette (success/warning/danger/info) is `[Inferred]` from icon coloring seen in screenshots: upgrade icons render in purple/orange/blue tones (Hot = flame in red/orange, Refresh = blue, Signature = purple) suggesting a broader accent palette beyond the primary teal exists for feature differentiation, not just status.

## Shape & Elevation `[DOM-verified]`

| Token | Value | Usage |
| --- | --- | --- |
| `radius-sm` (buttons) | 6px | Buttons |
| `radius-md` (cards) | 10px | Cards |
| `radius-pill` (status tags) | 24px | Status pills (e.g. "Live") |
| `shadow-card` | `0 5px 20px rgba(146,153,184,0.01)` | Card elevation — very low-opacity, a near-flat design with only the faintest lift |
| Button border | `0.8px solid transparent` | Buttons carry a hairline border even when visually borderless |

## Spacing `[DOM-verified, partial]`

Button padding: `6px 14px` (vertical/horizontal) for the standard button size `[DOM-verified]`. A full spacing scale (4/8/12/16/24/32 or similar) could not be conclusively derived from the sampled elements alone — `[Inferred]` the 6px/14px pairing and 24px pill radius suggest a base unit of roughly 2px with irregular multiples rather than a clean 8pt grid, which is worth deliberately avoiding in Tuba's own token set.

## Iconography `[Observed]`

Outline-style icon set (listing action icons: check-shield, share-arrow, eye, pencil, percent, trash; upgrade icons: bolt, flame, refresh, camera, video-camera, drone). Consistent stroke weight and circular hit-target sizing across the row-action cluster. As noted in the Component Library, **none of the row-action icon buttons carry a `title` or `aria-label`** `[DOM-verified]` — a real, fixable accessibility defect in an otherwise visually consistent icon system.

## Responsive behavior `[Observed]`

Viewport captured at 1536×691 (a laptop-class viewport) `[DOM-verified]`; no mobile breakpoint was exercised in this audit (desktop-only pass). Bayut's own marketing pages promote a companion mobile app ("Download App" persistent header CTA), suggesting Profolio's web console is deliberately desktop-first and mobile usage is pushed to a native app rather than a responsive web experience — `[Inferred]` from the CTA's prominence and placement in literally every captured header.

## Dark mode

Not observed; no toggle or `prefers-color-scheme` handling found in any captured page.

## Design tokens

A first-pass token file derived from the values above is published at [`report-assets/json/design-tokens... see 39_DESIGN_TOKENS.json`](report-assets) in this same directory tree — see `39_DESIGN_TOKENS.json`.

## Assessment for Tuba

The verified brand values (teal `#006169`, `Figtree` + Arabic pairing, 6/10/24px radius scale, near-flat card shadows) are competent and coherent — genuinely reusable as a *reference point*, not necessarily as a palette to copy. Tuba's actual differentiation opportunity is not visual polish (Bayut's is already solid) but **information density and accessible labeling**: the same teal-and-cards language could support a materially less dense, more accessible table/card system without abandoning brand coherence.
