# 12 — Component Guidelines

This document does not build components — it defines the rules every implementation of them must follow: naming, anatomy, variants, states, spacing, accessibility, interaction, and composition. Every component below is named exactly as `tbos-blueprint/05_COMPONENT_MAPPING.md` already named it — this system never renames or forks a component that document defined. **Reuse discipline**: a new component is added only with the same justification that document requires — which screen needs it, and why an existing component's variant can't serve.

Universal rule: every component is specified against all five platform axes simultaneously ([00_DESIGN_SYSTEM_FOUNDATION.md](00_DESIGN_SYSTEM_FOUNDATION.md) §7) — viewport, RTL/LTR, light/dark, density, motion preference. A component that only works in one combination isn't done.

---

## 1. Navigation & chrome

### Rail Nav Group
- **Anatomy**: group label (visible only when expanded) → icon+label item rows → active-item indicator.
- **Variants**: expanded (240px) / collapsed (64px, icon-only + tooltip).
- **States**: default, hover (`hover-wash`), active/current (`bg.brand-subtle` + `text.brand` + `bodyEmphasis`), disabled (RBAC-hidden, not disabled — an item the user can't access is absent, never grayed out, per Trust: a visible-but-locked nav item implies capability that doesn't exist).
- Full placement rules: [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) §2.

### Tab Bar (mobile)
- **Anatomy**: 5 fixed icon+label items, center item visually elevated.
- **States**: active (filled icon variant + `text.brand`), default (outline icon + `text.secondary`).
- No badge on tab items except Notifications (unread count) — see Notification List Item below.

### Breadcrumb
- **Anatomy**: `[Module link] / [Record identifier, non-link]`, max 2 segments.
- **Accessibility**: `<nav aria-label="Breadcrumb">`, current segment marked `aria-current="page"`.

### Tab Group
- **Anatomy**: row of tabs, active-tab underline (`border.brand`, 2px) + `text.brand`.
- **States**: default, hover, active, disabled (RBAC-scoped tab — shown but disabled with a tooltip explaining why, distinct from Rail Nav's hide rule since a tab is contextual to a record the user can already see).
- **Accessibility**: `role="tablist"`/`"tab"`/`"tabpanel"`, arrow-key navigation between tabs, `aria-selected`.

### Slide-over Panel
- **Anatomy**: header (title + close) → scrollable body → optional sticky footer action row.
- **Variants**: `sm`/`md`/`lg` widths ([07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) §6).
- **Behavior**: focus-trapped, `Escape` closes and returns focus to trigger, always includes an "open full record" escape hatch.
- **Motion**: [10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md) §5.

### Command/Search Bar
- Persistent in Top Bar (never a button that reveals a hidden search field — see [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) §3). Placeholder text states scope ("Search properties, leads, customers…"). Opens Command Palette / Global Search overlay on focus or shortcut.

---

## 2. Data display

### Record List
- **Anatomy**: Filter/Sort Bar → column headers (table) or none (card) → rows/cards → pagination.
- **Variants**: table (desktop/tablet default), card list (mobile default, optional desktop toggle for Property/Lead visual-heavy contexts).
- **Density**: comfortable/compact, [05_SPACING_SYSTEM.md](05_SPACING_SYSTEM.md) §3.
- **States**: Empty, Loading (skeleton rows matching real column layout), Error, Success — full state copy contract in [06_STATE_ARCHITECTURE.md](../tbos-blueprint/06_STATE_ARCHITECTURE.md), visual treatment in [16_CONTENT_GUIDELINES.md](16_CONTENT_GUIDELINES.md).
- **Accessibility**: real `<table>`/`<th scope>` semantics on the table variant; arrow-key row navigation + `Enter` to open.
- **Search-first**: any Record List whose underlying data can exceed ~15 items renders search-first by default (Filter/Sort Bar promoted above the fold, list itself may start filtered/empty-prompt).

### Kanban Board
- **Anatomy**: columns = lifecycle stages (Status Badge as column header) → stacked cards.
- **States**: column-level empty ("No leads in Negotiating"), card drag-in-progress (elevation.2 lift + placeholder gap in origin column).
- **Accessibility**: keyboard-operable stage change as an alternative to drag (a select/menu action on the card, never drag-only) — drag-and-drop alone fails keyboard/motor-accessibility requirements.

### Detail Header
- **Anatomy**: record title (`h1`) + Status Badge + primary/secondary actions row + breadcrumb above.
- **Responsive**: actions collapse into an overflow menu below tablet width, primary action never collapses.

### Status Badge
- **One component, per-module state map** — never a per-module badge implementation. Anatomy: icon + text label, pill shape (`radius.full`), `micro` type.
- **Color**: five-meaning semantic system, [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §3 — never an ad hoc hue.
- **Accessibility**: icon + text always paired, never color alone (binding, verbatim from `05_COMPONENT_MAPPING.md`).

### Metric Tile
- **Anatomy**: label (`label`) → value (`h1`/`display`) → optional delta indicator (↑/↓ icon + `caption`) → as-of timestamp if not real-time → tap/click target for Explainability Popover.
- **States**: Loading (skeleton matching final layout, never a spinner-only placeholder), Error (per-tile graceful degradation — one failed tile never blanks the page, per `HOME-01`'s state spec), Success.
- **Accessibility**: landmark region, `aria-label` states the metric's plain-language meaning, not just its number.

### Price/Status History Timeline
- **Anatomy**: vertical line + dated nodes, each node = icon (event type) + `caption` timestamp + `body` description.
- **Use**: Property price changes, Contract status changes, Lead stage changes.

### Compliance Checklist
- **Anatomy**: ordered list of requirement rows, each: checkbox/state icon + plain-language requirement text + status.
- **Rule**: every requirement is stated in plain language, front-loaded before the gate is hit — never a bare checkbox with no explanation (Non-Goal 9, "compliance is never a checkbox exercise").

### Data Table (Finance/Reports)
- Denser variant of Record List optimized for numeric scanning — tabular-nums throughout, right-aligned (start-aligned in RTL logical terms: numeric columns align to the *end* edge) numeric columns, sticky header on scroll, sortable columns with `aria-sort`.

---

## 3. Data entry

### Form Field
- **Anatomy**: label (`label`, always visible, never placeholder-as-label) → input → helper/error text (`caption`).
- **Variants**: text, number, select, date, currency (locale-aware symbol/formatting, [15_INTERNATIONALIZATION.md](15_INTERNATIONALIZATION.md) §4).
- **States**: default, focus (`border.focus`), error (`border.danger` + error `caption` + `aria-describedby`), disabled (`opacity.disabled`), read-only (distinct from disabled — shown as plain text with a subtle background, since "disabled" implies a temporarily-unavailable action while "read-only" implies permanent RBAC/lifecycle restriction).

### Wizard/Stepper
- **Anatomy**: step-progress indicator (replaces breadcrumb, [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) §8) → step body → back/next/submit action row.
- **Rule**: front-loaded requirements — a step never lets a user proceed only to reveal a hard-blocking requirement several steps later (Design Principle 4).

### File/Media Uploader
- **States**: empty (drop zone + browse action), uploading (per-file progress), error (per-file, retry action), success (thumbnail + replace/remove).
- **Accessibility**: keyboard-operable file selection, not drag-only.

### Toggle Switch
- **Behavior**: saves immediately on change, no separate save button — state confirmed via brief `micro`-duration motion + `aria-live` announcement, never left ambiguous.
- **Accessibility**: `role="switch"`, `aria-checked`.

### Filter/Sort Bar
- **Anatomy**: search input + filter chips (each removable) + sort control.
- Standard component — chart filters ([13_DATA_VISUALIZATION.md](13_DATA_VISUALIZATION.md) §6) reuse this exactly, never a bespoke chart-filter UI.

### Bulk Action Bar
- **Behavior**: appears only when ≥1 row is selected (Record List/Kanban), sticky at top or bottom of the list, states selection count + available bulk actions. Dismisses on selection clear.

---

## 4. Feedback & state

### Empty State Block
- **Anatomy**: icon (`xl`, `text.muted`) → headline stating what would be here → one-sentence why-it's-empty → working primary action.
- **Rule**: never a bare "no data" (binding, [06_STATE_ARCHITECTURE.md](../tbos-blueprint/06_STATE_ARCHITECTURE.md)). Full copy patterns: [16_CONTENT_GUIDELINES.md](16_CONTENT_GUIDELINES.md).

### Skeleton Loader
- **Rule**: shape matches the real, populated layout exactly (same row heights, same column widths) — never a generic shimmer block unrelated to what's loading. Appears only for the ~300ms–~3s band; below that, nothing renders (avoids flash-of-loading-state); above ~3s the operation hands off to a background job + notification instead of holding the skeleton indefinitely ([01_DESIGN_PRINCIPLES.md](01_DESIGN_PRINCIPLES.md) binding floor).

### Confirmation Dialog
- **Variants**: standard (any confirm-before-proceeding action) and destructive/scoped-consequence (`role="alertdialog"`, states the specific, scoped consequence — "This will remove 3 leads from this campaign," never a generic "Are you sure?").
- **Anatomy**: title → consequence statement → cancel (secondary) + confirm (primary or danger-styled, matching the action's actual severity) action row.

### Inline Success Confirmation
- **Rule**: states what happens next, not just "saved" — per Design Principle 9 (Outcome-driven UX). Auto-dismisses after a readable interval unless it contains an action.

### Error Inline/Banner
- **Inline**: field-level, `caption` + `text.danger`, `aria-describedby`.
- **Banner**: page/section-level, `bg.danger-subtle` surface, icon + message + retry action where recoverable.

---

## 5. AI & decision support

These get a first-class, visually distinct treatment (Copilot violet, [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §5) — deliberately not folded into generic badge/tooltip patterns, because the specificity of the Explainability contract and the confidence requirement make this its own system, not an incidental one.

### Explainability Popover
- **Anatomy**: answers all five contract questions in order — Why (plain-language meaning) → How calculated (inputs, one sentence) → What changed (vs. baseline) → Recommended action → Business impact.
- **Rule**: a popover that only repeats the metric's name or links to a generic help article fails this contract and doesn't ship (verbatim standard from `tbos-definition/14_EXPLAINABILITY_SYSTEM.md`).
- **Trigger**: click/tap or keyboard focus on the metric/score/status it explains; `elevation.2`, `zIndex.popover`.

### Recommendation Card
- **Anatomy**: urgency chip (Critical/High/Medium/Low — icon + text + color) → recommendation text (plain language, not a formula) → primary action (one-click where possible) → Explainability trigger.
- **Color**: urgency chip uses the status-color system, distinct from generic Status Badge context (a recommendation's urgency is time-sensitivity-driven, not lifecycle-driven — see [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md) §3's AI action states for the boundary).

### AI Suggestion Inline Block
- **Anatomy**: `bg.ai-subtle` background, `border.brand`→ no, uses a Copilot-violet left border accent (4px) + small "AI suggested" `micro` label + editable content.
- **Rule**: AI content renders as an editable suggestion, never silently pre-filled as if human-authored (Design Principle 3) — `aria-describedby` marks it explicitly.

### AI Conversation Thread
- **Anatomy**: message list (`bodyLg`), AI messages carry the Copilot accent + avatar, user messages plain; input field pinned at bottom.
- **Streaming**: text-append reveal, `aria-live="polite"` on completion, not per-character ([10_MOTION_SYSTEM.md](10_MOTION_SYSTEM.md) §7).

### Confidence Indicator
- **Anatomy**: text label (High/Medium/Low) + icon, always visible, never hidden behind a hover-only tooltip and never color-only.
- **Placement**: always adjacent to the AI output it qualifies, never a separate/detached summary.

---

## 6. Domain-specific

### Marketing Request Card
- Anatomy mirrors Recommendation Card (urgency-relevant) but lives in Owners (canonical) and Today (derived) — the one deliberate dual-placement exception, [07_LAYOUT_SYSTEM.md](07_LAYOUT_SYSTEM.md) §6.

### SLA Timer
- **Anatomy**: countdown/elapsed indicator, color shifts through the five-meaning system as deadline approaches (Info → Warning → Danger), icon-paired, never color-only.

### Quota/Balance Meter
- **Anatomy**: horizontal bar/ring, current/limit stated as text (not implied by fill alone), color shifts Success → Warning → Danger as consumption approaches the limit (Wallet §3 mapping, [03_COLOR_SYSTEM.md](03_COLOR_SYSTEM.md)).

### Permission Scope Selector
- **Anatomy**: grouped, plain-language toggles (never a raw 40-toggle grid — Non-Goal 3) organized by module, each with a one-line description of what the scope grants.

### Notification List Item
- **Anatomy**: urgency-tier icon → message → timestamp → source-module tag; unread state = `bg.brand-subtle` + bold dot indicator.
- **Rule**: unread count badge (Top Bar bell, mobile Notifications tab) must always equal real unread state — binding, direct fix for a confirmed legacy defect (a hardcoded/stale badge count).

---

## 7. Cross-cutting states every component must support

Per [`tbos-blueprint/06_STATE_ARCHITECTURE.md`](../tbos-blueprint/06_STATE_ARCHITECTURE.md): Empty · Loading · Offline · No Permission · Error · Restricted · Archived · Deleted. A component that ships without an explicit visual treatment for every state applicable to it is incomplete — states are never invented ad hoc per-screen; if a genuinely new state is discovered at implementation time, it's added to the state architecture first, not styled locally.

Full inventory cross-referenced to the 49 screens that use each component: [17_COMPONENT_CATALOG.md](17_COMPONENT_CATALOG.md).
