# 03 — Color System

## 1a. Brand identity — the two Tuba colors everything else derives from

TBOS is Tuba's product, not a hue invented in isolation from it. `color.brand` in `tokens.json` holds the two canonical, exact Tuba brand values, verified against the real Tuba brand source (`--tuba-purple: #2A0C72`, `--tuba-coral: #F95A60`) and exposed as first-class tokens (`--tuba-purple` / `--tuba-coral` custom properties, `colors.brand['tuba-purple']` / `colors.brand['tuba-coral']` in Tailwind) — not documentation-only values.

**v1.1 correction**: v1.0 shipped a placeholder "blue-indigo Ink" primary that was never checked against Tuba's actual brand identity (see §1's old rationale, superseded below). The **Ink** primitive family's functional scale (`ink.50`–`ink.900`) is now built around the real Tuba purple as its exact `ink.600` anchor, and the family previously named **Ember** (an invented, unverified terracotta) is renamed **Coral** and rebuilt around the real Tuba coral as its exact `coral.500` anchor. This is a values-and-name correction, not an architecture change — the primitive → semantic → component pipeline ([02_DESIGN_TOKENS.md](02_DESIGN_TOKENS.md) §1) is untouched, so no component code changes: only the primitive hex values (and one primitive's name) changed. See `TBOS_DESIGN_SYSTEM_V1_1_BRAND_CORRECTION_REPORT.md` for the full before/after and contrast verification.

## 1. The eight primitive families

Every color in TBOS descends from one of eight scales in `tokens.json` → `color.primitive`. None is copied from Bayut's teal, Aqar's green, or Tuba's legacy Airbnb-template leftovers ([00](00_DESIGN_SYSTEM_FOUNDATION.md) §6) — each is originated and each has exactly one job.

| Family | Role | Base step |
|---|---|---|
| **Ink** (Tuba purple) | Brand, primary actions, links, primary chart series — `ink.600` is the exact Tuba brand purple, `#2A0C72` | `ink.600` |
| **Coral** (Tuba coral) | Commercial/monetary emphasis — Wallet, Finance highlights, upgrade prompts — `coral.500` is the exact Tuba brand coral, `#F95A60` | `coral.500` |
| **Copilot** (violet) | AI surfaces exclusively — Confidence Indicator, Explainability Popover, AI Suggestion blocks, AI Copilot module | `copilot.600` |
| **Slate** (cool neutral) | Text, backgrounds, borders, icons — the majority of every screen | `slate.50`–`slate.950` |
| **Success** (green) | Positive terminal states, confirmations | `success.500` |
| **Warning** (amber) | Attention-needed, approaching-limit states | `warning.500` |
| **Danger** (red) | Negative terminal states, destructive actions, errors | `danger.500` |
| **Info** (cyan-blue) | Neutral system messages, as-of timestamps, informational banners | `info.500` |

**Deliberately minimal.** A ninth "module color" was considered and rejected for Marketing, Finance, and Compliance individually — see §3. Reusing five semantic meanings across every module, rather than inventing a hue per module, is what keeps [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md)'s Status Badge a single component with per-module state *maps*, not per-module color systems (`tbos-blueprint/05_COMPONENT_MAPPING.md`'s explicit requirement).

**Why Ink is Tuba purple, not teal or green**: both Bayut and Aqar occupy the teal/green space (§6 of [00](00_DESIGN_SYSTEM_FOUNDATION.md)), and neither has "a visually distinct 'business tool' identity separate from its consumer marketplace shell" (the cross-competitor finding both audits independently reached). Tuba's real brand purple is already deliberately in the enterprise-software register (distinct from either competitor's consumer-marketplace-adjacent palette) while remaining calm and trustworthy rather than loud — the same competitive rationale v1.0 argued for an invented blue-indigo now correctly applies to Tuba's actual brand color instead.

**Why Coral, not gold/amber, for commercial contexts**: Warning already owns amber. Giving Wallet/Finance the same hue family as "something needs attention" would contradict Trust (a wallet balance is not inherently a warning). Coral reads as "money/value" without colliding with any status meaning, and — unlike v1.0's invented Ember terracotta — is Tuba's actual second brand color.

## 2. Semantic layer — what components actually consume

`color.semantic.light` and `color.semantic.dark` in `tokens.json` map role names (`bg.canvas`, `text.primary`, `action.primary.bg`, etc.) to primitives. Components reference semantic tokens exclusively — see [02_DESIGN_TOKENS.md](02_DESIGN_TOKENS.md) §1. Full dark-mode mapping and rationale: [14_DARK_MODE.md](14_DARK_MODE.md).

| Semantic group | Examples | Used by |
|---|---|---|
| `bg.*` | canvas, surface, surface-raised, sunken, overlay-scrim, brand-subtle, ai-subtle | Page backgrounds, cards, panels, scrims |
| `text.*` | primary, secondary, muted, on-brand, link, brand, ai, success/warning/danger/info | All typography |
| `border.*` | default, strong, brand, focus, danger | Dividers, input borders, focus rings |
| `icon.*` | default, muted, on-brand | Iconography ([08_ICONOGRAPHY.md](08_ICONOGRAPHY.md)) |
| `action.*` | primary/secondary/danger × bg/bg-hover/bg-active/border | Buttons, interactive controls |

**Exception — `action.danger.bg`/`action.danger.bg-hover` use Coral, not the Danger primitive.** Every other `danger`-named token (`text.danger`, `border.danger`, `bg.danger-subtle`) is the Danger primitive family (`#D33F3F` red) and stays that way — it carries *status meaning* (rejected/expired/lost) and must stay visually distinct from Coral's commercial meaning (§1). The two danger-*button* fill roles are a narrower, deliberate exception: a destructive button (Archive, Mark Lost, delete) is brand chrome, not a status signal, so it renders in Tuba's actual brand coral (`coral.700`/`coral.800` — dark steps chosen for ≥4.5:1 contrast against white button text; the `coral.500` brand anchor itself is too light for that) rather than an unrelated, non-brand red. See `tokens.json`'s `1.1.1` changelog entry for the full rationale.

## 3. Status-state color mapping — the one system every lifecycle reuses

`tbos-blueprint/06_STATE_ARCHITECTURE.md` defines exact lifecycle names per module. Rather than a bespoke color per state (which drifts and multiplies), every state in TBOS maps onto one of five semantic meanings. The Status Badge component ([12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md)) is one implementation; only its state→meaning map changes per module.

| Meaning | Token | When it applies |
|---|---|---|
| **Neutral** | `slate.500` fg / `slate.100` bg | Draft, not-yet-active, informational |
| **Info** | `info.700` fg / `info.50` bg | In-progress, awaiting external action |
| **Warning** | `warning.700` fg / `warning.50` bg | Needs attention soon, approaching a limit |
| **Success** | `success.700` fg / `success.50` bg | Positive terminal or healthy-active state |
| **Danger** | `danger.700` fg / `danger.50` bg | Negative terminal, rejected, failed, expired |

### Property / Project (8-state, `tbos-blueprint/06` canon)

| State | Meaning |
|---|---|
| Draft | Neutral |
| Pending Compliance | Info |
| Active | Success |
| Expiring | Warning |
| Expired | Danger |
| Rejected | Danger |
| Sold/Rented | Success *(distinguished from Active by icon, not color — see [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) Status Badge)* |
| Archived | Neutral |

### Lead pipeline (7-stage)

| Stage | Meaning |
|---|---|
| New | Info |
| Assigned | Info |
| Contacted | Info |
| Qualified | Warning *(time-sensitive per Decision Support ranking — "going cold")* |
| Negotiating | Warning |
| Won | Success |
| Lost | Danger |

### Contract (6-state)

Draft → Neutral · Pending Compliance → Info · Active → Success · Renewal Due → Warning · Closed → Neutral · Cancelled → Danger.

### Marketing Request (4-state)

Open → Info · In Progress → Warning · Won → Success · Lost → Danger.

### Wallet/Subscription (5-state)

Active healthy → Success · Approaching limit → Warning · Exhausted → Danger · Payment failed → Danger · Expired → Danger *(Exhausted/Payment failed/Expired share Danger's color but never share its icon — see [16_CONTENT_GUIDELINES.md](16_CONTENT_GUIDELINES.md) for the required distinct wording, since Restricted states "never ship a vague 'upgrade required'")*.

### AI action states

Generated/pending review → Copilot violet (not the 5-meaning system — AI states are visually distinct on purpose, see §5) · Accepted unedited → Success · Accepted edited → Info · Low confidence → Warning · Failed → Danger.

**Binding rule inherited from accessibility blueprint**: color is never the only signal. Every Status Badge pairs its color with an icon and a text label — never color alone. See [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §3.

## 4. Compliance — no dedicated hue, by design

Compliance states (`SET-04`, contract/property compliance checklists) are rendered through the same five-meaning system, never a bespoke "compliance blue" or "compliance purple." This is deliberate: Compliance is not a module with its own visual identity, it's a *property of records across every module* — a Pending Compliance property, a Compliance Document nearing expiry, and a compliance-gated contract renewal all read as "Info" or "Warning" using the exact same visual grammar a user already knows from every other module. A separate compliance palette would suggest compliance is a special, unfamiliar area — the opposite of `tbos-definition/20_NON_GOALS.md`'s "compliance is never a checkbox exercise" (i.e., never alien or intimidating).

## 5. AI surfaces — Copilot violet, used narrowly

Copilot violet is reserved exclusively for: the Confidence Indicator, Explainability Popover accent, AI Suggestion Inline Block border/background, AI Conversation Thread (AICP-01), and the AI Copilot nav icon. It never appears as a general accent, a chart color substitute, or decoration. This narrow reservation is what lets a user visually identify "this came from AI" at a glance — the entire point of Design Principle 3 (AI as copilot, never invisible, never a silent ghost-writer). See [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) §7 for full AI component specs.

## 6. Charts, maps, and heatmaps

Full specification: [13_DATA_VISUALIZATION.md](13_DATA_VISUALIZATION.md). Summary: categorical series use the validated 8-hue order in `tokens.json` → `color.chart.categorical` (fixed order, never cycled, capped at 3 series for scatter/bubble/choropleth forms per the validator's all-pairs constraint); magnitude (heatmaps, choropleths) use the single-hue `sequentialBlue` ramp; polarity (variance, forecast delta) uses the blue↔red diverging pair with a neutral gray midpoint; map pins reuse the five-meaning status system so a property pin's color always means the same thing a Status Badge's color means elsewhere.

## 7. Accessibility floor — every pairing in this document is checked against it

4.5:1 for normal text, 3:1 for large text/icons and UI component boundaries (WCAG 2.1 AA, the binding floor from [01_DESIGN_PRINCIPLES.md](01_DESIGN_PRINCIPLES.md)). Two pairings in §3 are sub-3:1 on light surfaces by design (`warning.500` and `success.300` as decorative fills) — where that occurs, text/icon color uses the darker `-700` step of the same family against the `-50` background, never the base step as foreground-on-background. Full contrast pairing table and verification method: [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §1.

## 8. Dark mode

Every semantic token has a dark-mode value — not an automatic filter/invert, a deliberately selected step per role (`color.semantic.dark` in `tokens.json`). Full rationale, including why status-subtle backgrounds move from flat `-50` tints to low-opacity overlays in dark mode: [14_DARK_MODE.md](14_DARK_MODE.md).
