# 11 — Accessibility

`tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md` already fixed the floor: **WCAG 2.2 AA minimum**, with its own binding acceptance rule — "a screen or component is not implementation-complete until it passes every applicable section... partial compliance is treated as a defect to fix before ship, not a backlog item to defer indefinitely." This document is that floor made concrete in tokens and component rules.

## 1. Contrast

| Pairing | Minimum | Enforced by |
|---|---|---|
| Normal text on its background | 4.5:1 | `text.*` / `bg.*` semantic pairings in `tokens.json`, verified at implementation time with an automated contrast checker before merge |
| Large text (≥18px/24px or ≥14px bold) and icons | 3:1 | Same |
| UI component boundaries (input borders, focus rings) against adjacent color | 3:1 | `border.*` tokens |
| Focus indicator against both the component and its background | 3:1 | §2 |

Any semantic token pairing that can't clear its required ratio is a defect in `tokens.json`, not a per-screen exception — see [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §7 for the two sub-3:1 decorative fills and how their paired text/icon color compensates.

## 2. Focus

Every interactive element has a visible focus state: `border.focus` (`ink.500`/`ink.300` dark), `border.width.thick` (2px), offset 2px from the element's own edge so it never gets obscured by the element's own border-radius. Focus is never opacity-based or color-only against the resting state — it must be visible to a low-vision user distinguishing "focused" from "hovered" from "selected" as three genuinely different signals.

**Keyboard navigation**:
- Single global shortcut for search/Command Palette (`/` or `Cmd/Ctrl+K`).
- Number keys `1`–`4` map to the 4 Quick Actions **only while the Quick Actions panel is open** — never globally, to avoid an accidental destructive trigger from a stray keypress.
- `Escape` dismisses any open modal, panel, popover, or menu and returns focus to the element that triggered it — never leaves focus lost in the document body.
- Every modal/panel traps focus while open (`Tab`/`Shift+Tab` cycle within it, never escape to background content).
- Record List and Kanban Board support arrow-key row/card navigation + `Enter` to open — a direct requirement of the Sales Manager/Operations Manager high-volume-triage workflow, not optional power-user sugar ([00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §5).

## 3. Color is never the only signal

Every status, urgency, or state indicator pairs color with an icon and a text label:

- Status Badge: icon + text, always (`tbos-blueprint/05_COMPONENT_MAPPING.md`, verbatim).
- Recommendation Card urgency tier (Critical/High/Medium/Low): distinct icon + text label per tier, not color alone.
- AI Confidence Indicator (High/Medium/Low): text label always visible, never a color-only dot.
- Notification urgency tier: distinct icon per tier.
- Chart status/delta colors: paired with a directional icon (↑/↓) and, where the value itself doesn't make it self-evident, a text delta.

## 4. Typography and zoom

Relative units (`rem`) throughout — never fixed `px` that ignores browser zoom ([04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) §7). Every screen is verified at 200% browser zoom with no clipping, overlapping, or loss of function — this is a ship-blocking check, not a nice-to-have pass.

## 5. ARIA — real semantics, not styled divs

| Component | Required semantics |
|---|---|
| Toggle Switch | `role="switch"`, `aria-checked` |
| Tab Group | `role="tablist"` / `"tab"` / `"tabpanel"`, `aria-selected` |
| Data Table | `<th scope="col">` / `scope="row"` — never a styled `<div>` grid pretending to be a table |
| Confirmation Dialog (destructive variant) | `role="alertdialog"` |
| Streamed/async content (AI responses, live-updating Today list) | `aria-live="polite"` |
| Page/incident-level errors only | `role="alert"` (assertive) — reserved, never used for routine validation messages |
| AI-generated content | `aria-describedby` referencing a "Suggested by AI" description, so assistive tech announces provenance, not just content |
| Metric Tile | Landmark region with `aria-label` stating the metric's plain-language meaning, not just its number (`tbos-blueprint/04_SCREEN_INVENTORY.md`, HOME-01 accessibility note) |
| Toggle Switch save behavior | Saves immediately on change, no separate save button — state change is announced via `aria-live`, not left for the user to infer |

## 6. Touch targets

44×44px minimum on mobile/tablet for every interactive element, including icon-only buttons inside Compact-density table rows ([01_DESIGN_PRINCIPLES.md](01_DESIGN_PRINCIPLES.md) binding floor). Where visual icon size is smaller than 44px (see [08_ICONOGRAPHY.md](08_ICONOGRAPHY.md) §4), the hit area extends beyond the icon's visible bounds rather than shrinking the target.

## 7. RTL

Every screen mirrors correctly as a first-class layout mode, not a CSS flip patch applied after the fact: nav rail, breadcrumbs, form field alignment, directional icons ([08_ICONOGRAPHY.md](08_ICONOGRAPHY.md) §6), and Kanban column order all mirror. Mixed Arabic/Latin content follows standard bidirectional text rules — numbers and Latin tokens embedded in Arabic text don't visually reverse. Full specification: [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md).

## 8. Localization completeness

Zero leaked untranslated tokens — a direct fix for Tuba's confirmed defect where raw enum values (e.g. `"for_sale"`) leaked into the Arabic UI (`tuba-current-state` findings). AI-generated content is authored natively per-language at generation time, never machine-translated after the fact — a translation-quality gap in AI copy is treated the same as any other Explainability failure.

## 9. Reduced motion

`prefers-reduced-motion: reduce` is honored system-wide with zero information loss — full specification [10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md) §6.

## 10. Forms, tables, charts, errors — accessibility notes not covered above

- **Forms**: every field has a visibly associated `<label>` (never placeholder-as-label), error text is programmatically associated via `aria-describedby`, and validation errors are announced via `aria-live="polite"` at the point of blur/submit, not silently applied as a red border only.
- **Tables**: sortable columns expose their sort state via `aria-sort`; column headers use real `<th>` semantics (§5).
- **Charts**: every chart ships a table-view alternative and never relies on hover-only tooltips as the sole way to access a data point's exact value — see [13_DATA_VISUALIZATION.md](13_DATA_VISUALIZATION.md) §5.
- **Errors**: inline field errors and page/banner-level errors are visually and semantically distinct (§5 `alert` vs. `alertdialog` vs. plain `aria-live` region) so assistive tech users get the correct urgency, not a blanket announcement for everything.

## 11. Acceptance bar

Restated because it's binding, not aspirational: a screen or component is not implementation-complete until it passes every applicable section above. [19_IMPLEMENTATION_GUIDE.md](19_IMPLEMENTATION_GUIDE.md)'s Design QA Checklist operationalizes this as a literal per-PR gate.
