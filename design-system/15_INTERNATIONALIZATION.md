# 15 — Internationalization

Arabic RTL and English LTR are both first-class from the first token, not a CSS-flip patch applied after an LTR design is done. This is a carried-forward discipline, not a carried-forward implementation — Tuba's legacy platform did real, deliberate bilingual asset pairing (`ar-style.css`/`style.css` per component) and it was the one genuine strength the current-state audit found (58/100 localization score, second-highest sub-score in the whole platform). The implementation was wrong (duplicated parallel files multiply maintenance cost and drift); the discipline was right. TBOS keeps the discipline, fixes the implementation, using logical CSS properties and direction-aware components instead.

## 1. The rule: logical properties only

Every spacing, alignment, and positioning value in implementation uses logical (flow-relative) properties — `margin-inline-start/end`, `padding-inline-start/end`, `text-align: start/end`, `inset-inline-start/end` — **never** physical `left`/`right`. A component styled with `margin-left` is a defect regardless of whether it happens to look correct in the developer's current locale; it will silently break the moment it renders RTL. This single rule is what makes RTL "free" everywhere else in this document — the grid ([06_GRID_SYSTEM.md](06_GRID_SYSTEM.md) §4), layout ([07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md)), and every component in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) inherit it rather than restating it per-component.

## 2. What mirrors and what doesn't

| Mirrors in RTL | Never mirrors |
|---|---|
| Nav rail (icons move to the inline-end edge) | Photography, property/user photos |
| Breadcrumb order and its separator direction | Non-directional icons (house, document, person — see [08_ICONOGRAPHY.md](08_ICONOGRAPHY.md) §6) |
| Directional icons (back/forward chevrons, arrows) | Numerals (Western Arabic 0–9, never reversed digit-order) |
| Kanban column order (stage progression reads start-to-end) | Latin-script brand names/proper nouns embedded in Arabic text |
| Form field alignment, checkbox/radio position relative to label | Logos |
| Slide-over Panel entry edge (opens from the inline-end edge) | Chart axis direction for time (time still reads chronologically left-to-right internally on an axis, per data-visualization convention, even in an RTL-language UI shell — the chart canvas itself is a controlled exception, called out explicitly in [13_DATA_VISUALIZATION.md](13_DATA_VISUALIZATION.md)) |

## 3. Mixed-script (bidi) content

Arabic body text containing embedded numbers, Latin proper nouns, or email addresses follows standard Unicode bidirectional algorithm behavior — implementation never manually reorders these tokens. A customer name field showing "Ahmed لـ Al-Rashid" or a phone number inside an Arabic sentence renders correctly under the browser's native bidi handling as long as no component applies `unicode-bidi: bidi-override` or manual string-splicing to "fix" perceived ordering — that's the actual cause of the leaked/garbled bidi bugs this rule exists to prevent.

## 4. Numbers, currency, dates

- **Numerals**: Western Arabic (0–9) in both languages — TBOS's deliberate choice (see [04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) §5), consistent with regional business/fintech convention, not Eastern Arabic-Indic (٠١٢٣).
- **Currency**: SAR as the default/primary currency, formatted per-locale — symbol/code position follows the locale's convention (e.g. "SAR 1,250" in English, "١٬٢٥٠ ر.س." rendering position in Arabic per standard locale formatting, numerals still Western Arabic per the rule above), never hardcoded symbol position.
- **Dates**: Gregorian calendar in both languages (not Hijri) unless a future, explicitly-scoped requirement changes this — stated here so it isn't silently assumed either way at implementation time. Date format follows locale convention (DD/MM/YYYY region-appropriate ordering), relative-time phrasing ("3 days ago" / "منذ 3 أيام") is native per-language, not templated with swapped words only.
- **Phone numbers**: displayed with country code, LTR-embedded regardless of surrounding Arabic text direction (numbers are a bidi-neutral run handled by §3's rule, not a special case).

## 5. Addresses and maps

Address fields follow Saudi addressing convention (National Address format) with fields ordered per-locale; the address block itself is a bidi-neutral structured field, not free text requiring reordering. Map UI (pins, controls, the search-within-map input) uses the same logical-property discipline — a map's zoom/pan controls sit at the inline-end corner, mirrored, while the map canvas content (actual geography) is never mirrored, matching §2's photography rule.

## 6. Typography differences

Arabic line-height runs at 1.15× the Latin equivalent step ([04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) §4); no italic in either language; weight-matching between Inter and Noto Sans Arabic is verified visually per component, not assumed from matching numeric weight values alone.

## 7. Verification requirement

Every screen is verified as a first-class RTL layout at implementation time, not spot-checked after LTR ships — [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §7 makes this a binding acceptance-bar item, not a follow-up task. Verification checks: rail/breadcrumb/Kanban mirroring (§2), zero leaked untranslated enum values in either language (a confirmed legacy defect this system exists to prevent), and 200% zoom behavior in both scripts ([04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) §7).

## 8. AI content and localization

AI-generated text (Explainability copy, AI-drafted replies, Recommendation Card text) is generated natively in the request's own language — never produced in one language and machine-translated to the other. This is a binding rule shared with [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §8 and [16_CONTENT_GUIDELINES.md](16_CONTENT_GUIDELINES.md) §11, restated here because it's as much an i18n architecture decision (which language the AI generation call requests) as a content one.
