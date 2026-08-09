# 04 — Typography

## 1. Typefaces

| Script | Family | Why |
|---|---|---|
| Latin (English) | **Inter** | Purpose-built for UI at small sizes, true tabular figures, wide weight range, excellent screen rendering at the 12–14px sizes that dominate a data-dense product |
| Arabic | **Noto Sans Arabic** | Full, robust Unicode/Arabic-script coverage under active maintenance, wide weight range that matches Inter step-for-step (400/600/700), metrically calm x-height that pairs cleanly with Inter rather than visually dominating mixed-script UI |
| Numeric/code (IDs, API keys, reference numbers) | **JetBrains Mono** | Unambiguous glyphs (0/O, 1/l/I) — used only for identifiers a user might transcribe, never for body text |

Deliberately not Bayut's `Figtree`/`Droid Arabic Kufi` pairing or Aqar's `IBM Plex Sans Arabic` (`00_DESIGN_SYSTEM_FOUNDATION.md` §6) — TBOS's pairing is chosen independently against enterprise data-density and bilingual-parity needs.

**Loading strategy**: both families self-host (never a render-blocking third-party CDN call on an authenticated, high-frequency-use surface); `font-display: swap`; only the weights actually used (400, 600, 700) are shipped per family.

## 2. Type scale

Ten steps, defined once in `tokens.json` → `typography.scale`. Every text element in TBOS maps to exactly one step — no ad hoc sizes.

| Token | Size / Line-height | Weight | Use |
|---|---|---|---|
| `display` | 32 / 40 | 700 | Rare — onboarding (ONB-01), module empty-state headlines only. Never a page title. |
| `h1` | 24 / 32 | 700 | Page/screen title (Detail Header, module list header) |
| `h2` | 20 / 28 | 600 | Section title within a screen (e.g. a Detail panel's "Compliance" section) |
| `h3` | 16 / 24 | 600 | Card/panel title, dialog title |
| `bodyLg` | 15 / 24 | 400 | Long-form reading — Knowledge articles (KB-02), AI Conversation Thread messages |
| `body` | 14 / 20 | 400 | Default UI text — the majority of the interface |
| `bodyEmphasis` | 14 / 20 | 600 | Emphasized inline text within body content — never a substitute for a heading |
| `label` | 13 / 16 | 600, +0.01em | Form field labels, table column headers |
| `caption` | 12 / 16 | 400 | Metadata, timestamps, helper/error text under a field |
| `micro` | 11 / 14 | 600, +0.02em | Badge/tag text, count pills |

**Why so restrained at the top**: TBOS is not a marketing site — `display` exists only for the rare screen that must orient a completely new user ([00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §2, "dense but never cluttered"). A product a broker uses for hours daily should never spend vertical space on decorative type.

## 3. Responsive scale adjustment

The scale does not change step-for-step across breakpoints — but `h1` and `display` drop one step on mobile (`h1` renders at `h2`'s values, `display` at `h1`'s) since mobile viewport width can't support a 24px title without excessive wrapping in a 4-column grid ([06_GRID_SYSTEM.md](06_GRID_SYSTEM.md)). All other steps are viewport-invariant — 14px body text does not shrink further on mobile; it is already at its accessible floor.

## 4. RTL and Arabic-specific rules

- **Line-height**: every step's line-height is multiplied by `typography.arabicLineHeightMultiplier` (1.15) when rendering Arabic — Arabic script's diacritics and connecting forms need more vertical room than the Latin metric the base scale was tuned against. `body` in Arabic renders at 14px/23px, not 14px/20px.
- **Weight**: Noto Sans Arabic's 600 reads visually heavier than Inter's 600 at matched pixel size — component specs that call for `bodyEmphasis` in mixed-script contexts (e.g., a customer name in Arabic beside a price in Western numerals) should be checked in both scripts before shipping, not assumed to match by weight number alone.
- **No italic.** Arabic script has no italic tradition; TBOS never uses italic in either language — emphasis uses weight (`bodyEmphasis`) or color (`text.secondary`/`text.muted`), never slant.
- **Alignment**: `text-align: start` / `end` (logical), never `left`/`right` — see [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md) §2 for the full logical-properties rule set this typography system depends on.

## 5. Numeric typography

- **Western Arabic numerals (0–9) in both languages.** TBOS follows the regional business/fintech convention (confirmed in both competitor audits) rather than Eastern Arabic-Indic numerals (٠١٢٣) — prices, dates, and IDs must scan identically regardless of UI language, since brokers frequently work bilingually within one session.
- **Tabular figures** (`font-variant-numeric: tabular-nums`, `typography.numericFeatures.table`) in: any table column, Metric Tile values, currency amounts, phone numbers, dates — anywhere numbers must align vertically or be scanned in a column.
- **Proportional figures** in running prose (Knowledge articles, AI Conversation Thread) where numbers appear inline with text.
- **Currency**: symbol/code follows [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md) §4 locale rules; the numeral itself is never mirrored or reordered in RTL — only its position relative to surrounding text follows bidi rules.

## 6. Forms, tables, charts, navigation — step assignment

| Context | Step |
|---|---|
| Nav rail item label | `body` (14/20), `bodyEmphasis` when active |
| Breadcrumb | `caption` |
| Table column header | `label`, uppercase optional per locale (Arabic never uppercases — no case distinction) |
| Table cell (text) | `body` |
| Table cell (numeric) | `body`, tabular figures |
| Form field label | `label` |
| Form field input text | `body` |
| Form helper/error text | `caption` |
| Chart axis label | `caption`, `text.muted` |
| Chart data label (direct label) | `caption`, `bodyEmphasis` weight |
| Metric Tile value | `h1` or `display` depending on tile prominence — see [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) |
| Metric Tile label | `label` |
| Status Badge text | `micro` |

## 7. Accessibility

Every step is defined in relative units (`rem`) in implementation, never fixed `px` that ignores browser zoom — verified at 200% browser zoom with no clipping or overlap (binding rule, [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §4). Line-length for `bodyLg` reading contexts (Knowledge articles) is capped at ~75 characters via container max-width, not font-size manipulation.
