# 09 — Design System Audit

**Status**: Observed (direct CSS/Blade source read) for anything extractable from static files; **Inferred/pending** for rendered behavior (actual computed styles, real responsive breakpoints in the browser, hover/focus states as experienced) — to be supplemented with live DOM inspection once the authenticated session is available (see [18_SCREENSHOT_INDEX.md](18_SCREENSHOT_INDEX.md)).

**Headline finding**: there is no design system. There is one large (27,193-line) hand-authored CSS file (`public/login_asset/css/style.css`) built as a Bootstrap override sheet, plus ~30 sibling files (RTL pairs, plugin CSS), with **zero CSS custom properties** (`--variable` syntax) found anywhere. Every color, spacing, and radius value is a literal, repeated across the file rather than referenced from a token. A newer Tailwind CSS v4 pipeline was added to `package.json` since the July audit but its entry stylesheet (`resources/css/app.css`) is empty — 0 bytes, no `@import`, no rule — so it currently contributes nothing to the rendered product.

---

## 1. Color

No token file, no CSS variables. Colors were extracted by frequency-counting literal hex values across `style.css`:

| Hex | Occurrences | Apparent role |
|---|---|---|
| `#ffffff` | 450 | Base/background |
| `#484848` | 236 | Primary text (Airbnb-template-era gray) |
| `#ff5a5f` / `#FF5A5F` | 209 combined | **Primary/accent** — this is the literal Airbnb brand red, suggesting the front-end template this codebase was built from was an Airbnb-style real-estate/travel theme, never re-themed to a distinct Tuba brand color at the CSS level |
| `#2A0C72` | 112 | Secondary accent (deep purple) |
| `#ebebeb` | 60 | Light borders/dividers |
| `#ff1053` | 16 | Tertiary accent/alert |
| `#051925` | 16 | Dark surface |
| `#006c70` | 16 | Tertiary accent (teal) |

**Finding**: with no single source of truth for these values, any rebrand or dark-mode effort would require a find-and-replace across a 27k-line file with no guarantee every instance was caught — a `.custom-theme-color` class exists (line ~21352) suggesting one past attempt at a themeable primary color, but it coexists with hundreds of hardcoded literals rather than replacing them.

## 2. Typography

- Single font family throughout: `'Nunito', sans-serif` (confirmed via 10+ separate `font-family` declarations in `style.css`, plus `_variables.scss:5` — `$font-family-sans-serif: 'Nunito', sans-serif`).
- `_variables.scss` (the only Sass-side "token" file that exists) sets exactly 4 variables total: `$body-bg: #f8fafc`, `$font-family-sans-serif`, `$font-size-base: 0.9rem`, `$line-height-base: 1.6`. This is the entire extent of any centralized design configuration in the codebase.
- No type-scale (h1–h6, body, caption) system found as named tokens — heading sizes are set ad hoc per-selector throughout `style.css`.

## 3. Spacing & Radius

- No spacing scale (no `--space-1`/`--space-2` equivalent, no Tailwind-style utility scale in active use). Bootstrap's default spacing utilities (`.mt-3`, `.p-2`, etc.) are used directly in Blade templates, which gives *some* consistency by inheriting Bootstrap's own 0.25rem-multiple scale — but this is Bootstrap's system, not a Tuba-defined one.
- Border-radius values found: `50%` (circular avatars/icons), `5px`, `25px` (pill-shaped buttons/badges) — three recurring values, used as literals, not tokens.

## 4. Elevation / Shadow

Not systematically extracted in this pass — `box-shadow` usage exists throughout `style.css` but was not tokenized or centrally defined; a full extraction is recommended as a live-DOM follow-up (computed-style inspection across representative components) once the authenticated session is available.

## 5. Grid & Layout

- Bootstrap grid (mixed v4/v5 — see below) is the layout mechanism throughout; no CSS Grid or custom layout system found in the hand-authored stylesheet.
- **Confirmed dual-Bootstrap-version conflict**: the live map/search page (`resources/views/front-end/test.blade.php:777`) loads Bootstrap **5.3.3** JS from a CDN on top of the site-wide Bootstrap **4-era** CSS/JS bundle loaded globally (`header-scripts.blade.php`/`footer-scripts.blade.php`). Two different component behavior contracts (Bootstrap 4 vs 5 changed several JS APIs and some class names) are active simultaneously on the platform's highest-traffic page.

## 6. Icons

- Font Awesome (`font-awesome.min.css`) + a custom icon font (`flaticon.css`) both present — two icon systems, not unified into one icon component/set.

## 7. Motion

- `wow.js` and `parallax.js` are loaded unconditionally sitewide for scroll-triggered animations, with no `prefers-reduced-motion` handling found in a spot check — a real accessibility gap for users who've requested reduced motion at the OS level.

## 8. RTL / Bilingual design

- The one area where the codebase does show real, deliberate design investment: full parallel asset sets exist for Arabic (RTL) vs. English (LTR) — `ar-style.css`/`style.css`, `ar-responsive.css`/`responsive.css`, `ar-bootstrap-select.min.css`/`bootstrap-select.min.css`, `ar-script.js`/`script.js` — swapped conditionally based on the session locale flag. This is a genuine strength: most of the July audit's Localization score (58/100, the second-highest sub-score in the whole platform after Product) rests on this real RTL depth.

## 9. The parallel, unused Tailwind pipeline

- `package.json` declares `tailwindcss@^4.0.0`, `@tailwindcss/vite@^4.0.0`, `laravel-vite-plugin@^2.0.0`, `vite@^7.0.7` — a modern utility-first design-system-capable toolchain.
- `vite.config.js` points at `resources/css/app.css`, which is **completely empty** (confirmed 0 bytes). No Tailwind config file (`tailwind.config.js`) was found either — meaning even if the CSS entry were populated, no theme customization (colors, spacing scale, etc.) has been defined yet.
- `public/build/` (Vite's compiled output directory) does not exist — the pipeline has never been run to produce a shippable asset.
- **Interpretation**: this looks like the very beginning of an intended migration toward a real, token-based design system (Tailwind v4 ships with CSS-variable-based theming by design), abandoned or paused before any actual styling was written. A next-generation Broker OS should treat this as the correct direction to build on — Tailwind v4's CSS-variable theme layer would directly solve the "zero tokens, 209 literal color repetitions" problem documented above — rather than as evidence a design system already exists.

## 10. Recommendation for the next-generation system

Given the total absence of tokens in the current system, a next-gen Broker OS design system should be built fresh (there is nothing to "migrate" — the current CSS has no extractable token structure beyond the 4 Sass variables and the informally-consistent hex/radius values documented above). The **useful inputs** to carry forward are: the confirmed brand-adjacent palette (if `#ff5a5f`/`#2A0C72` are actually intended as Tuba's brand colors rather than leftover template colors — this needs a business-side confirmation, not a code-side one), the Nunito typeface (if still desired), and — most importantly — the genuine RTL/bilingual asset-pairing discipline, which is worth preserving as a pattern even in a token-based rebuild.
</content>
