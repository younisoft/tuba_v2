# 11 — Accessibility Blueprint

`tbos-definition/03_DESIGN_PRINCIPLES.md`'s "Accessibility" principle is the source rule: every interactive element keyboard-operable and screen-reader-legible by construction. This document is the testable standard every screen in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) and component in [05_COMPONENT_MAPPING.md](05_COMPONENT_MAPPING.md) must clear — consolidating the screen/component-specific notes already scattered through those documents into one bar, and adding the topics not yet covered there (contrast, typography, touch targets, RTL, localization).

## 1. Keyboard navigation

Already specified operationally in [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md) §4 — restated here as the acceptance bar:
- Every interactive element reachable via Tab in a logical order matching visual layout.
- Every primary list supports arrow-key row navigation + Enter-to-open (Record List, Kanban Board).
- No keyboard trap outside an intentional focus-trap (modal, panel, wizard step) — and every intentional trap has an Escape exit.
- No functionality exists that is mouse/touch-only (e.g., Kanban drag-to-move-stage always has a keyboard-operable equivalent, per [05](05_COMPONENT_MAPPING.md)'s Kanban Board contract).

## 2. Focus management

- Every modal, slide-over panel, and Quick Actions panel traps focus while open and returns focus to the triggering element on close (binding rule, first stated in [02](02_NAVIGATION_BLUEPRINT.md) §4).
- Route/screen changes (mobile full-screen push, desktop navigation) move focus to the new screen's primary heading, never leaving focus stranded on a now-invisible element.
- Async content that appears after load (AI suggestion, search results) does not steal focus from wherever the user currently is — it's announced via a live region instead (see §3).

## 3. Screen readers & ARIA

- Every screen has a single real `<h1>` (Detail Header component, per [05](05_COMPONENT_MAPPING.md)) and a logical heading hierarchy beneath it — no heading level skipped for visual-sizing convenience.
- Status/urgency is never conveyed by icon or color alone without accompanying text — applies uniformly to Status Badge, Recommendation Card, SLA Timer (all defined in [05](05_COMPONENT_MAPPING.md)).
- Live regions (`aria-live="polite"`) used for: Today/Notification arrivals while the panel is open, AI Conversation Thread streaming responses, inline success confirmations, search result-count changes. `role="alert"` (assertive) reserved for page/incident-level errors only — never overused for routine feedback.
- Toggle/switch controls use real `role="switch"` + `aria-checked`/`aria-pressed`, never a styled `<div>` with a click handler.
- Tables (Finance, Reports, Automation log) use real `<th scope>` header association — never a div-grid styled to look like a table.
- Every image (property photos, uploaded documents) has real, non-filename `alt` text; AI-generated alt-text suggestions are offered but always broker-editable, same review posture as any other AI Writing output ([08](08_AI_INTERACTION_BLUEPRINT.md)).

## 4. Contrast

- Every text/background and icon/background pairing meets WCAG 2.1 AA minimum contrast ratios (4.5:1 normal text, 3:1 large text/icons) — a binding numeric floor, not a design preference, since this blueprint stops short of picking actual colors (§ deferred to the design-system phase).
- Status differentiation (e.g., Property lifecycle states) must remain distinguishable in grayscale/high-contrast mode — verifies the "never color alone" rule isn't secretly relying on color after all.
- Focus indicators (keyboard focus ring) meet the same 3:1 contrast minimum against adjacent colors, on every interactive element without exception.

## 5. Typography

- Body text scales with the browser/OS text-size setting (relative units, never fixed pixel sizes that ignore user zoom) — at 200% zoom, no content is clipped or overlapping (ties to Design Principle "Responsiveness").
- Line length for body/paragraph content (Knowledge articles, AI-generated descriptions) stays within a readable measure at every breakpoint — not a hard character-count rule, but never full-viewport-width unbroken text on desktop.
- Arabic and Latin typography both meet the same legibility bar — no assumption that Latin-script sizing rules simply carry over unchanged (font metrics differ; verified per §8 RTL).

## 6. Touch targets

- Every tappable element on mobile/tablet meets a minimum 44×44px target size (iOS/Android platform-standard floor), including icon-only buttons in dense list rows.
- Adjacent interactive elements (e.g., bulk-select checkbox next to a row's open action) maintain enough spacing that a touch can't ambiguously trigger the wrong one.
- The mobile bottom tab bar and Quick Actions elevated center button ([02](02_NAVIGATION_BLUEPRINT.md) §3) are held to this same floor, with the center action sized generously given its higher-frequency use.

## 7. RTL (right-to-left)

- Every screen in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) mirrors correctly in Arabic RTL mode: navigation rail, breadcrumbs, form field alignment, icons with inherent directionality (back arrows, chevrons), and the Kanban Board's column order.
- Mixed-content rows (e.g., an Arabic label next to a numeric price or English property reference code) follow standard bidi-text rules — numbers and Latin-script tokens don't visually reverse.
- RTL is verified as a first-class layout mode at implementation time, not a CSS-flip patch applied after LTR ships — carried forward from `tuba-current-state/09_DESIGN_SYSTEM.md`'s finding that current bilingual asset-pairing is a KEEP, meaning this discipline already exists and must not regress.

## 8. Localization

- Every user-facing string ships in both Arabic and English with no leaked untranslated tokens (direct fix for the current platform's confirmed defect: raw enum values like `"for_sale"` leaking into Arabic UI, `tuba-current-state/13_GAP_ANALYSIS.md`).
- AI-generated content (descriptions, replies) generates natively in the target language rather than generating in one language and machine-translating — per `tbos-definition/10_AI_STRATEGY.md`'s bilingual AI Writing capability.
- Dates, currency, and number formatting follow locale convention per the active language, independent of which language the underlying data was entered in.

## 9. Error messaging

- Restates Design Principle "Error states" as an accessibility requirement, not just a UX one: every error is programmatically associated with its field (`aria-describedby`) so a screen-reader user isn't left guessing which field failed.
- Plain-language error text (never raw stack traces/system detail) benefits every user, but is treated here as an accessibility floor because technical jargon disproportionately fails users relying on screen readers/translation tools.
- Form-level validation summarizes all errors at the top on submit *and* keeps per-field inline errors — a screen-reader user landing at the top of the form hears the full list before navigating field by field.

## 10. Motion reduction

- Every animation respects `prefers-reduced-motion` — when set, transitions collapse to instant state changes with no loss of information (full detail: [12_MOTION_PHILOSOPHY.md](12_MOTION_PHILOSOPHY.md)).
- No unconditioned auto-playing or scroll-triggered decorative motion exists anywhere in authenticated product surfaces (also a Non-Goal, `tbos-definition/20_NON_GOALS.md` #8 — TBOS is not a landing page with a login).

## 11. Acceptance bar

A screen or component is not implementation-complete until it passes every applicable section above — this is the same hard-gate posture as the Feature Principles template (`tbos-definition/17_FEATURE_PRINCIPLES.md`) and the Explainability contract: partial compliance is treated as a defect to fix before ship, not a backlog item to defer indefinitely.
