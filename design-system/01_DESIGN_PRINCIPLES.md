# 01 — Design Principles

`tbos-definition/02_PRODUCT_PHILOSOPHY.md` and `03_DESIGN_PRINCIPLES.md` set ten behavioral principles. They don't specify what anything looks like — that's this document's job. Each principle below states the *visual/interaction* consequence, plus the testable rule a design gets checked against.

## 1. Action over information → the primary action is never buried

Every screen has one unmistakable next action. A metric, list row, or card without an implied action attached is incomplete.

**Testable**: for any tile, card, or list row, ask "what does the user do next, and can they do it without leaving this view?" If the answer is "nothing," the component is missing its primary action slot (see Metric Tile, Recommendation Card in [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md)).

## 2. Explainability over raw numbers → nothing bare

Every metric, score, or status must be able to answer the five-question Explainability contract (why / how calculated / what changed / recommended action / business impact) on demand — the Explainability Popover is the standard mechanism.

**Testable**: does a click/tap/focus on this number produce more than a repetition of its own label? If not, it's not ready to ship (`tbos-definition/14_EXPLAINABILITY_SYSTEM.md`, verbatim: "a tooltip that repeats the metric's name is not an explanation").

## 3. AI as copilot → no visual AI ghetto, and no invisible AI either

AI-assisted content is never rendered as if a human typed it silently. It's also never confined to a single page — `03_DESIGN_PRINCIPLES.md`: "a dedicated 'AI' tab is a sign the integration failed, not a feature." AI surfaces get one consistent, recognizable visual language (the violet "Copilot" accent, [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §5) wherever they appear, precisely so users can identify AI involvement at a glance without a label-heavy interface.

**Testable**: can a user tell, at a glance, which parts of this screen are AI-suggested vs. human-entered? Is AI content editable, not just displayed?

## 4. One-click workflows → interaction cost is a design constraint, not an afterthought

`03_DESIGN_PRINCIPLES.md`: "no interaction a broker performs more than once a day should take more than two steps." This bounds component design directly — inline edit beats navigate-then-edit; a Quick Action beats a multi-screen flow.

**Testable**: count the taps/clicks from trigger to completion for anything performed daily. More than two fails.

## 5. Automation-first → the "why is this automated" answer is always visible

Automated actions (Automation Rules, AI-routed leads) show their trigger and logic on demand — automation is never a silent black box a user has to reverse-engineer.

**Testable**: can a user find out, in-context, why an automated action happened without leaving the record?

## 6. Trust by design → see [00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §4 for the full model

**Testable**: does any number, badge, or state on this screen imply more certainty or freshness than the underlying data actually has?

## 7. Broker-first thinking → density and speed beat visual flourish

The visual system optimizes for a working broker's repeated daily use, not for a five-minute demo. This is why elevation is near-flat ([09_ELEVATION_SYSTEM.md](09_ELEVATION_SYSTEM.md)) and motion is minimal ([10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md)) — both cost attention on the hundredth view of the day even if they look good on the first.

## 8. Decision-first dashboards → Today's visual hierarchy is prioritized, not chronological

Home and Today never render as an undifferentiated feed. Critical items are visually pinned above the algorithm's normal order, with urgency conveyed by icon + text label, never color alone (binding accessibility rule, see [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §3).

## 9. Outcome-driven UX → empty and success states always state the outcome, not just the mechanism

Per `tbos-blueprint/06_STATE_ARCHITECTURE.md`, an Empty State is never a bare "no data" — it states what would be here and why, with a working action. A Success confirmation states what happens next, not just "saved." See [16_CONTENT_GUIDELINES.md](16_CONTENT_GUIDELINES.md).

## 10. One home per capability → the design system does not enable duplicate navigation paths

`tbos-definition/20_NON_GOALS.md`: "if a future feature seems to need a second entry point... fix the IA, don't add a second path." This is the strongest constraint on inventing new nav or layout patterns — before adding a new placement for something, check whether it already has a home in [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md)/[17_COMPONENT_CATALOG.md](17_COMPONENT_CATALOG.md).

---

## The binding numeric floors

These are not principles to weigh — they're fixed thresholds already set in `tbos-definition/03_DESIGN_PRINCIPLES.md` and `tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md` / `12_MOTION_PHILOSOPHY.md`. Every token and component in this folder is built to satisfy these, never to trade them off:

| Rule | Floor | Source |
|---|---|---|
| Text contrast | 4.5:1 normal text, 3:1 large text/icons | WCAG 2.1 AA, accessibility blueprint |
| Focus indicator contrast | 3:1 against adjacent colors | Accessibility blueprint |
| Touch target | 44×44px minimum, incl. icon-only buttons in dense rows | Accessibility blueprint (iOS/Android floor) |
| Button feedback | <100ms visible acknowledgment of a press | Design Principles |
| Loading indicator | none <~300ms; skeleton ~300ms–~3s; background hand-off >~3s | Design Principles / State Architecture |
| Daily-task interaction cost | ≤2 steps | Design Principles |
| Screen clarity | purpose stated within 5 seconds for a first-time viewer | Design Principles |
| Breadcrumb depth | max 2 segments, detail/nested-creation screens only | Navigation Blueprint |
| Search-first threshold | any list that can exceed ~15 items | Navigation Blueprint |
| Mobile nav | exactly 5 bottom-tab destinations | Navigation Blueprint |
| Quick Actions | exactly 4, ≤2 taps/clicks to reach | Navigation/Design Principles |

[18_DESIGN_RULES.md](18_DESIGN_RULES.md) restates these as the final testable checklist alongside the rules this folder adds on top (color contrast pairs, motion durations, spacing scale, etc.).
