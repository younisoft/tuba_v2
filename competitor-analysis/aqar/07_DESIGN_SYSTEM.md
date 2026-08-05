# Design System

Values marked `[DOM-verified]` were read via read-only `getComputedStyle` inspection against the live authenticated session (`/offices-management`, plus spot checks elsewhere). Everything else is a visual observation from screenshots, marked `[Visual estimate]`.

## Typography

- **Font family** `[DOM-verified]`: `"IBM Plex Sans Arabic", aqar-arabic-fallback, aqar-arabic-fallback-noto, Arial` — a proper Arabic-optimized web font with explicit named fallbacks, not a generic system-font stack. The document root (`<html>`) itself falls back to `ui-sans-serif, system-ui, sans-serif, ...` — meaning the Arabic font is applied at the body level as a deliberate override, not inherited from a root default.
- **Body text** `[DOM-verified]`: `16px / 24px` line-height, `font-weight: 400`, color `rgb(68,68,68)` (`#444444`) on a `rgb(244,245,246)` (`#F4F5F6`) page background.
- **H1 (page eyebrow/title style)** `[DOM-verified]`: only `16px / 24px`, `font-weight: 500`, color `rgb(102,102,102)` (`#666666`) — notably small and muted for an `<h1>`; functions visually more like a section label than a page headline. Page titles throughout the product (e.g., "إعلاناتي", "المحفظة", "إدارة المكتب") are rendered at this understated weight/size rather than a conventional large bold headline.
- **H2** `[DOM-verified]`: `18px / 28px`, `font-weight: 600`, color `#444444` — used for sub-section headings (e.g., "الإحصائيات العامة", "تفاصيل الاشتراك").
- **Buttons** `[DOM-verified]`: `14px`, `font-weight: 500`, `20px` line-height.
- **Direction/locale** `[DOM-verified]`: `<html dir="rtl" lang="ar">` — confirmed RTL-native, Arabic-default document, consistent with no working English locale switch being found (see `11_WEAKNESSES.md`).

## Color

- **Primary brand green** `[DOM-verified]`: `rgb(0,130,54)` → `#008236`. Used for primary buttons, active tab-pills, positive/credit amounts in the wallet ledger, and the logo mark.
- **Body/neutral text**: `#444444` (primary reading text), `#666666` (muted/secondary text, headings).
- **Page background**: `#F4F5F6` (very light neutral grey, not pure white) — cards sit on top of this at pure white (`#FFFFFF`) to create a one-level elevation without a shadow.
- **Card border**: `rgba(204,204,204,0.8)` (~`#CCCCCC` at 80% opacity), `0.8px` width — an unusually thin, near-invisible hairline border rather than a bolder card outline.
- **Status/attention colors** `[Visual estimate]`: red for the "جديد" (New) badge and notification dots (approx. a standard saturated red, exact hex not sampled); the wallet ledger uses red text for negative/expired amounts and green text for positive/credited amounts — a conventional debit/credit color convention.
- **Sidebar active state** `[DOM-verified]`: light grey fill `rgb(234,234,234)` with muted text `rgb(102,102,102)` — notably, this is a *different* visual language for "currently selected" than the green-fill tab-pills used everywhere else in the product (see `05_COMPONENT_LIBRARY.md`), a minor internal inconsistency.

## Spacing & Shape

- **Card radius** `[DOM-verified]`: `8px`.
- **Button radius** `[DOM-verified]`: `6px`.
- **Button padding** `[DOM-verified]`: `6px 16px`.
- **Card shadow** `[DOM-verified]`: `none` — elevation is communicated purely by the white-card-on-grey-page contrast plus the hairline border, not by drop shadow.
- **Button shadow** `[DOM-verified]`: a genuinely subtle two-layer shadow (`0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)`) — present on buttons but not on cards, a deliberate differentiation of interactive vs. static surfaces.

## Iconography

- `[Visual estimate]` Line-style icons throughout (map pin, calendar, folder, magnifying glass, briefcase for the broker role card, wallet/cash icons) — consistent stroke weight across contexts, sourced from a shared icon set (one icon, `map-pin.svg`, was directly observed being served from `assets.aqar.fm/icons/v2/`, confirming a versioned shared icon CDN — see `08_TECHNICAL_OBSERVATIONS.md`).
- Illustration-style empty-state and explainer graphics (see `05_COMPONENT_LIBRARY.md`) use a distinct, more colorful two-tone style than the flat line icons — two visually separate icon "tiers" in the same product: functional line icons for UI chrome, and illustrative icons for empty states/education.

## Layout

- **Grid**: card-grid layouts (marketplace listings, off-plan projects) use a responsive multi-column grid that collapses toward the observed 1536×864 desktop viewport's ~3-column arrangement for project cards; broker back-office screens are predominantly single-column, form-like layouts rather than dashboards-with-widgets, aside from Office Management's KPI-tile row.
- **Global chrome height**: a compact single-row top navigation bar persists at a fixed height across every page, including deep into multi-step wizards — no distraction-free/focused mode was observed for any flow.

## Motion

- No deliberate motion/transition effects were observed or measured in this pass (e.g., no modal enter/exit animation timing was captured); this is a gap in this audit's coverage, not a claim that Aqar has no motion design — flagged as **not assessed** rather than "absent."

## Responsiveness

- This audit was conducted at a single desktop viewport (1536×864 effective / 1520px screenshot width); mobile/tablet breakpoints were **not tested** and should not be assumed from this document. The product also ships native iOS/Android/HarmonyOS apps (linked from the footer), which were not audited.

## Comparison note vs. Bayut

Per the existing Bayut audit (`product-audit/28_PRODUCT_PHILOSOPHY.md`, `25_DESIGN_SYSTEM_AUDIT.md`), Bayut Profolio uses a teal primary (`#006169`) with `Figtree` / `Droid Arabic Kufi` typography — a fully bespoke agency-tool visual identity shared with the bayut.sa consumer site. Aqar's green (`#008236`) and IBM Plex Sans Arabic pairing plays the same role (one brand identity spanning consumer marketplace and broker tooling), reinforcing the same underlying finding for both products: **neither has a visually distinct "business tool" identity separate from its consumer marketplace shell.** This is a real opportunity for Tuba to differentiate — a broker console that looks and feels like a dedicated professional tool, not a re-skinned classifieds site.
