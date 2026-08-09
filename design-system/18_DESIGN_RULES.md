# 18 — Design Rules

The non-negotiables, restated as one testable checklist. Where a document elsewhere in this folder explains *why*, this document exists so a reviewer can check a screen or PR against a flat list without re-reading everything. Grouped by the rule's source.

## From the Product Constitution and Design Principles

1. No hardcoded hex/px/ms value in implementation — every value is a token reference ([02_DESIGN_TOKENS.md](02_DESIGN_TOKENS.md) §1).
2. No metric, score, or status ships without either a live value or an explicit as-of-time label.
3. No count-up/ticking animation on any number, price, or score, ever ([10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md) §2).
4. Every metric/score/status can answer the five-question Explainability contract on demand, or it doesn't ship.
5. AI-generated content is always visually distinct (Copilot violet) and always editable — never silently pre-filled as human-authored.
6. No interaction performed more than once daily takes more than two steps.
7. A first-time viewer can state a screen's purpose within 5 seconds.
8. No screen has a second entry point for a capability that already has a home — check [17_COMPONENT_CATALOG.md](17_COMPONENT_CATALOG.md)/[07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) before adding a new placement.
9. No screen exists because "we have the data" — every metric passes through Decision Support + Explainability first.
10. No settings screen is a raw toggle grid — grouped, plain-language controls only (Permission Scope Selector pattern).
11. Zero consumer ad-attribution/retargeting instrumentation on any authenticated screen.
12. No unexplained AI gating on a regulated or destructive action — publishing, contract approval, and compliance-document approval are always human-confirmed.

## From Accessibility

13. Contrast: 4.5:1 normal text, 3:1 large text/icons/focus rings, checked against the actual token pairing, not assumed.
14. Every interactive element has a visible, non-opacity-based focus indicator.
15. 44×44px minimum touch target, including icon-only buttons in Compact-density rows.
16. Color is never the only signal — every status/urgency indicator pairs color with an icon and a text label.
17. Real ARIA semantics (`role="switch"`, `<th scope>`, `role="tablist"`, `role="alertdialog"`) — never a styled `<div>` standing in for a native or ARIA-equivalent control.
18. Verified at 200% browser zoom with no clipping, in both languages.
19. `prefers-reduced-motion` collapses every animation to instant with zero information loss.
20. Every chart ships a table-view alternative — a chart is never the only way to read an exact value.

## From Internationalization

21. Logical CSS properties only (`margin-inline-*`, `text-align: start/end`) — physical `left`/`right` in a component is a defect regardless of how it renders in the developer's own locale.
22. Every screen is verified RTL at implementation time, not spot-checked after LTR ships.
23. Zero leaked untranslated enum/token values in either language.
24. AI-generated text is authored natively per-language — never machine-translated after generation.

## From State Architecture

25. Every component supports all 8 universal states applicable to it (Empty/Loading/Offline/No Permission/Error/Restricted/Archived/Deleted) — states are never invented ad hoc per-screen.
26. Empty states always state what would be here, why, and give a working action — never a bare "no data."
27. Restricted states always state the specific number/date/limit — never a vague "upgrade required."
28. Loading: none <~300ms, skeleton ~300ms–~3s, background hand-off >~3s.

## From the Component and Catalog discipline

29. A new component is proposed only with a written reason no existing component (with a new variant) can serve — checked against [17_COMPONENT_CATALOG.md](17_COMPONENT_CATALOG.md) first.
30. Status Badge is one component with per-module state maps — never a per-module badge implementation.
31. Every chart's categorical palette is validated (CVD ΔE ≥ 8 adjacent, normal-vision floor ≥ 15) before shipping, never eyeballed.
32. One axis per chart — no dual-axis charts anywhere.
33. Chart series color follows the entity, never its rank — a filter that changes series count never repaints survivors.

## Enforcement

[19_IMPLEMENTATION_GUIDE.md](19_IMPLEMENTATION_GUIDE.md) §5's Design QA Checklist is this list operationalized as a per-PR gate — a PR that fails any applicable rule above doesn't merge, the same acceptance bar [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §11 already sets for accessibility specifically, extended here to the whole system.
