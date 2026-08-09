# 13 — Data Visualization

Standards for charts, tables, maps, and metrics across Analytics (`ANL-01`), Reports (`RPT-01/02`), Finance (`FIN-01`), Wallet (`WAL-01`), and every Metric Tile on Home/Today. One rule underlies all of it, restated from Design Principle 2: **never decorate, always explain** — a chart that isn't answering a specific question a broker has doesn't ship.

## 1. Method

TBOS's chart color and construction rules follow a design-system-agnostic, six-check method (form → color-by-job → validate → marks → interaction → accessibility pass), the same approach documented for this system's authoring process. The parameters that method needs are filled in below from `tokens.json` → `color.chart`; the rules themselves (fixed categorical order, one-hue sequential, two-hue-plus-neutral diverging, reserved status colors) are non-negotiable regardless of which chart appears where.

## 2. Choosing a form — before choosing a color

| The data's job | Form | TBOS example |
|---|---|---|
| A single headline number | Stat tile / hero figure, not a chart | Metric Tile ("Active Listings: 42") |
| Magnitude across categories | Bar chart | Leads by source, Properties by district |
| Change over time | Line/area chart | Wallet balance over time, lead volume trend |
| Composition (parts of a whole) | Stacked bar, never a pie past 3–4 segments | Lead pipeline stage distribution |
| Polarity (above/below a baseline) | Diverging bar | Actual vs. target revenue variance |
| Geographic magnitude | Choropleth map (Property/Project location density) | District-level inventory heatmap |
| Continuous magnitude over two dimensions | Heatmap | Response-time-by-hour-and-day |

A screen that "has the data" for a chart but no specific question it answers renders a table or a Metric Tile instead — per Non-Goal 2 ([01_DESIGN_PRINCIPLES.md](01_DESIGN_PRINCIPLES.md)), no screen exists because "we have the data."

## 3. Color by job

| Job | Palette | Token |
|---|---|---|
| **Categorical** (identity — lead source, property type) | Fixed 8-hue order, never cycled, never reassigned when a filter changes the series count | `color.chart.categorical` |
| **Sequential** (magnitude — heatmap, choropleth) | Single hue, light→dark | `color.chart.sequentialBlue` |
| **Diverging** (polarity — variance from a baseline) | Two poles + neutral gray midpoint | `color.chart.diverging` |
| **Status** (state — matches Status Badge, never reused for a generic series) | Reserved 4-step good/warning/serious/critical | `color.chart.status` |

**Categorical cap**: the 8-hue order validates every *adjacent* pair (stacked bars, grouped bars, lines) in both light and dark mode. For chart forms where every series can appear beside every other (scatter, bubble, choropleth, small multiples), only the **first 3 slots** (blue/orange/violet) validate at all-pairs — past 3 series in those forms, fold additional categories into "Other" or switch to faceted small multiples rather than extending the color count.

**Color follows the entity, never its rank.** A filter that removes a series never repaints the survivors into new slot positions — Lead Source "Referral" keeps its assigned hue whether it's the 2nd or 5th series currently visible.

## 4. Validation

Any new or modified chart palette is run through the CVD/contrast validator before shipping — never eyeballed. This applies to the categorical order above (already validated against `color.chart.surfaceLight`/`surfaceDark`) and to any future addition to it. A palette that fails CVD ΔE ≥ 8 (adjacent) or the normal-vision floor of 15 does not ship as-is; it's re-ordered or capped, never shipped with a known collision.

## 5. Marks, labels, and the required table view

- Thin marks: 2px lines, ≥8px markers, 4px rounded data-ends anchored to baseline.
- A 2px surface gap between adjacent bars and stacked segments — segments never touch directly.
- Selective direct labels only — never a number printed on every single point; labels appear on the current/final value and on hover.
- **Every chart ships a table-view toggle.** This is not optional and not just an accessibility nicety — it's the mechanism that satisfies [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §10's requirement that a chart never be the *only* way to access an exact value, and it's how AI-generated chart annotations stay auditable (a broker can always check the underlying numbers a narrative insight was computed from).
- Legend present for ≥2 series (none needed for a single series — the chart title names it); ≤4 series also get direct labels.
- Grid lines and axes render in `text.muted`/`border.default` — recessive, never competing with the data itself.

## 6. Interaction

Line/area charts get a crosshair + tooltip on hover; bar/dot/cell charts get a per-mark hover tooltip. Hit targets are larger than the visible mark. Filters (date range, dimension) render in one row above the chart, using standard Filter/Sort Bar components ([12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md)) — a chart's filter controls are not bespoke UI.

**One axis, always.** No dual-axis chart anywhere in TBOS — two measures of different scale become two charts, small multiples, or an indexed-to-a-common-base single chart. This is the single most common chart mistake and it is explicitly disallowed, not left to designer judgment per-screen.

## 7. Explainability on every chart

Per Design Principle 2, every chart's title or an adjacent info affordance can answer the Explainability contract on demand: what it measures, how it's calculated, what changed since the prior period, and (where applicable) a recommended action — the same five-question contract Metric Tiles and Recommendation Cards satisfy ([12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md)). A chart with an axis label and nothing else is incomplete.

## 8. Maps

Property/Project location maps ([`PROP-01`/`02`] map view) use the five-meaning status system (§3 of [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md)) for pin color — a pin's color means exactly what a Status Badge's color means elsewhere, never a separate map-specific palette. District-level density/heatmap overlays use the sequential blue ramp. Map chrome (basemap, roads, labels) stays muted/desaturated so pin colors remain the highest-contrast element on screen.

## 9. Forecasts and AI-derived series

Any chart series that is AI-generated (a forecast line, a predicted trend) renders in the Copilot violet accent (§5 of [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md)) rather than a categorical slot, with a dashed stroke and a "Forecast" legend entry distinct from actuals — consistent with Design Principle 3's requirement that AI-originated content is always visually distinguishable from human/system-of-record data, never blended in as if it were equally certain.

## 10. Dark mode and texture

Every chart's palette has a selected (not auto-inverted) dark-mode step set, validated against `color.chart.surfaceDark` — see [14_DARK_MODE.md](14_DARK_MODE.md) §4. A single hand-drawn line texture (45°/135°) is available as the CVD/print/`forced-colors` fallback for categorical series, triggered by the accessibility setting or media query only — never on by default, never decorative.
