# 05 — Component Mapping

Maps components to screens — does not build them. No visual specification (color, spacing, typography); that's a design-system phase that begins after this blueprint. This document defines each reusable component's **behavior contract** once, then maps every screen in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) to the components it needs, so no two screens invent competing versions of the same interaction (Design Principle "Consistency").

## 1. Component library — behavior contracts

### Navigation & chrome

| Component | Purpose | Variants | Interaction rules | Accessibility |
|---|---|---|---|---|
| **Rail Nav Group** | Collapsible section of the left rail (Orientation/Operating/Intelligence) | expanded, collapsed, icon-only (tablet) | Collapse state persists per user; never auto-collapses based on content | `role="navigation"`, group has accessible name, current-page item marked `aria-current="page"` |
| **Tab Bar (mobile)** | Fixed 5-destination bottom nav | active/inactive item | Never changes composition per persona; center item elevated | Each tab is a real link/button with label, not icon-only |
| **Breadcrumb** | 2-segment trail on detail/nested-creation screens only | Module/Record | Never renders on top-level module screens or for panel-depth navigation | `nav aria-label="Breadcrumb"`, current item not a link |
| **Tab Group** | In-page section switcher (Overview/Media/Compliance/etc.) | horizontal (desktop/tablet), select-style (mobile if >4 tabs) | Arrow-key navigation between tabs; content loads per-tab, not all upfront | `role="tablist"`/`role="tab"`/`role="tabpanel"`, each panel has a heading |
| **Slide-over Panel** | Contextual-navigation overlay (§5 in [02](02_NAVIGATION_BLUEPRINT.md)) | desktop/tablet overlay, mobile full-screen push | Escape closes; traps focus while open; every panel has an "open full record" escape hatch | Focus returns to trigger on close |
| **Command/Search Bar** | Top-bar/mobile-tab entry into GS-01/CMD-01 | query mode, `>` command mode | Debounced query; mode switch announced | `role="combobox"` pattern with live-region result count |

### Data display

| Component | Purpose | Variants | Interaction rules | Accessibility |
|---|---|---|---|---|
| **Record List** | Primary list for Properties/Projects/Leads(inbox)/Customers/Owners/Contracts | table (desktop/tablet), card list (mobile) | Search-first once list exceeds ~15 items; sortable columns; row click opens detail | Arrow-key row navigation + Enter (per [02](02_NAVIGATION_BLUEPRINT.md) §4); sortable headers announce sort state |
| **Kanban Board** | Stage-based pipeline view (Leads) | column-per-stage | Drag between columns AND a keyboard-operable "move to stage" menu per card — drag is never the only mechanism | Cards are focusable; stage-move menu is a real button, not drag-only |
| **Detail Header** | Identity + primary actions atop any detail screen | with/without status badge | Primary action always the highest-priority next step for the record's current state, not a generic "Edit" | Heading is a real `<h1>` for the record name |
| **Status Badge** | Lifecycle-state indicator | one per module lifecycle (Property's 8-state, Lead's pipeline stage, Contract's stage, etc.) | Icon + text always paired — never color alone (Design Principle "Accessibility") | Text content carries the state, not just a colored dot |
| **Metric Tile** | Home/Analytics summary figure | with/without trend indicator | Tap opens Explainability Popover; never purely decorative | `aria-label` states the metric's plain-language meaning |
| **Price/Status History Timeline** | Chronological record of changes (Price History, Customer interaction log) | vertical timeline | Newest-first by default; each entry independently focusable | Semantically ordered list (`<ol>`), not styled divs |
| **Compliance Checklist** | Guided requirement list (WF-COMPLIANCE) | pending/complete/blocked per item | Every item states its requirement in plain language before submission is attempted (front-loaded) | Real list with per-item checked-state announced |
| **Data Table (Finance/Reports)** | Tabular financial/report data | with export action | Real header/data-cell association | `<th scope="col/row">`, never a styled-only grid |

### Data entry

| Component | Purpose | Variants | Interaction rules | Accessibility |
|---|---|---|---|---|
| **Form Field** | Standard labeled input | text, number, select, date, currency | Validation inline, on blur and on submit — never only on submit for a long form | Real `<label>`, not placeholder-as-label; error announced via `aria-describedby` |
| **Wizard/Stepper** | Multi-step guided flow (Property/Project create) | linear steps with progress indicator | Requirements shown before step 1 (front-loaded); auto-saves as Draft at every step | Step change announced to screen readers |
| **File/Media Uploader** | Photo/document upload | single, multi, drag-and-drop + button fallback | Async processing shown as background progress, never blocks the form; per-file retry on failure | Keyboard-operable file picker always present alongside drag zone |
| **Toggle Switch** | Boolean setting (notification pref, automation rule enable) | on/off | Saves immediately on change, no separate save button | `role="switch"` + `aria-pressed`/`aria-checked` |
| **Filter/Sort Bar** | List refinement controls | chip-based (mobile), inline (desktop) | Filters never silently reset on navigation away and back within a session | Each filter chip removable via keyboard, announces active-filter count |
| **Bulk Action Bar** | Appears when ≥1 row selected | count + available actions | Always previews affected items before committing (Design Principle "Interaction philosophy") | Selection count announced live |

### Feedback & state

| Component | Purpose | Variants | Interaction rules | Accessibility |
|---|---|---|---|---|
| **Empty State Block** | Explains what would be here, why it's empty, the one action to fill it | positive ("all caught up"), guided (new account), zero-results (search) | Always a working control, never a static message (binding rule, [06](06_STATE_ARCHITECTURE.md)) | Action button has descriptive accessible name |
| **Skeleton Loader** | Loading placeholder matching real layout | per-component shape (list row, tile, form, chart) | Used for anything >~300ms; long operations (>~3s) hand off to background job + notification instead | `aria-busy="true"` on container |
| **Confirmation Dialog** | Destructive/consequential action gate | standard confirm, scoped-consequence confirm (deletion) | States the specific consequence in plain language, never generic "Are you sure?" | Focus-trapped, `role="alertdialog"` for destructive variant |
| **Inline Success Confirmation** | Completion feedback for a meaningful action | with/without "what happens next" statement | Never a bare "Saved" toast for a meaningful action (publish, close lead, renew) | Announced via `aria-live="polite"` |
| **Error Inline/Banner** | Plain-language failure explanation | field-level, page-level, incident-level | Never exposes raw system detail; always states what to try next | `role="alert"` for page/incident-level |

### AI & decision support

| Component | Purpose | Variants | Interaction rules | Accessibility |
|---|---|---|---|---|
| **Explainability Popover** | The five-question contract, on-demand from any metric/score/status/AI output | inline tooltip-scale, expandable detail | Never a tooltip that just repeats the label — must answer why/how/what-changed/action/impact ([07](07_DECISION_SUPPORT_SYSTEM.md)) | Triggered by a real button, not hover-only (keyboard/touch parity) |
| **Recommendation Card** | Today entry — one action, its reasoning, its urgency | Critical/High/Medium/Low urgency styling | Resolve inline where possible; dismiss/snooze always available | Urgency conveyed via icon+text, never color alone |
| **AI Suggestion Inline Block** | Embedded AI output (description, reply draft, price band) | text-generation, structured-suggestion (price band, tags) | Always shown as editable suggestion with confidence, never silently pre-filled as if human-authored | `aria-describedby` marks it as AI-suggested |
| **AI Conversation Thread** | AICP-01's chat surface | user turn, AI turn (with confidence + source citation) | Streamed responses use a live region | `aria-live="polite"` container |
| **Confidence Indicator** | High/Medium/Low disclosure on every AI output | badge alongside AI Suggestion Inline Block / Conversation Thread | Never hidden or omitted — binding rule, [08](08_AI_INTERACTION_BLUEPRINT.md) | Text label, not color-only |

### Domain-specific

| Component | Purpose | Used by |
|---|---|---|
| **Marketing Request Card** | Owner-originated request summary | OWN-02/03, TODAY-01 |
| **SLA Timer** | Visible countdown/elapsed indicator on a lead | LEAD-01/02/03, TODAY-01 |
| **Quota/Balance Meter** | Wallet quota or credit usage visualization | WAL-01, PROP-03/MKT-02 (pre-flight check) |
| **Permission Scope Selector** | Grouped, plain-language role-permission assignment | SET-02 |
| **Notification List Item** | Single entry in NOTIF-01 | NOTIF-01 |

## 2. Screen → component matrix

Every screen in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md) built from the components above; nothing screen-specific invented outside this library without a corresponding new row in §1.

| Screen | Core components used |
|---|---|
| HOME-01 | Metric Tile, Explainability Popover, Empty State Block (→ ONB-01), Skeleton Loader |
| TODAY-01 | Recommendation Card, Empty State Block, Skeleton Loader, SLA Timer |
| TASK-01/02 | Record List, Form Field, Confirmation Dialog, Inline Success Confirmation |
| PROP-01, PROJ-01 | Record List, Filter/Sort Bar, Bulk Action Bar, Status Badge, Empty State Block |
| PROP-02, PROJ-02 | Detail Header, Tab Group, Status Badge, Price/Status History Timeline, Slide-over Panel, AI Suggestion Inline Block, Confirmation Dialog |
| PROP-03, PROJ-03 | Wizard/Stepper, Form Field, File/Media Uploader, AI Suggestion Inline Block, Confidence Indicator |
| LEAD-01 | Kanban Board, SLA Timer, Status Badge, Filter/Sort Bar, Bulk Action Bar |
| LEAD-02 | Record List (row variant), SLA Timer, Status Badge |
| LEAD-03 | Detail Header, AI Suggestion Inline Block, Confidence Indicator, SLA Timer, Slide-over Panel, Confirmation Dialog (Lost) |
| CUST-01, OWN-01 | Record List, Filter/Sort Bar, Empty State Block |
| CUST-02 | Detail Header, Price/Status History Timeline (interaction log variant), AI Suggestion Inline Block |
| OWN-02 | Detail Header, Tab Group, Marketing Request Card |
| OWN-03 | Marketing Request Card (list), Status Badge, Empty State Block |
| CONT-01 | Record List, Status Badge, Filter/Sort Bar |
| CONT-02 | Detail Header, Compliance Checklist, Status Badge, AI Suggestion Inline Block, Confirmation Dialog |
| MKT-01 | Record List, Empty State Block, Status Badge |
| MKT-02 | Quota/Balance Meter, AI Suggestion Inline Block, Confirmation Dialog, Empty State Block (zero-eligible) |
| MKT-03 | Record List (queue variant), Status Badge, Empty State Block |
| FIN-01 | Data Table, Explainability Popover |
| WAL-01 | Quota/Balance Meter, Metric Tile |
| WAL-02 | Form Field, Confirmation Dialog, Inline Success Confirmation |
| ANL-01 | Metric Tile, Data Table (text-equivalent), Explainability Popover |
| RPT-01/02 | Data Table, Skeleton Loader, Error Inline/Banner |
| AUTO-01/02 | Toggle Switch, Form Field, Status Badge (last-run outcome) |
| AICP-01 | AI Conversation Thread, Confidence Indicator |
| AICP-02 | Data Table, Explainability Popover |
| NOTIF-01 | Notification List Item, Empty State Block |
| NOTIF-02 | Toggle Switch |
| KB-01/02 | Record List (article variant), Empty State Block (zero-results) |
| SET-01, SET-03 | Form Field, Inline Success Confirmation |
| SET-02 | Permission Scope Selector, Confirmation Dialog |
| SET-04 | Compliance Checklist, File/Media Uploader, AI Suggestion Inline Block |
| GS-01, CMD-01 | Command/Search Bar, Record List (results variant), Empty State Block (zero-results) |
| QA-01 | (bespoke minimal panel — no list/table components needed, just 4 action buttons) |
| ONB-01 | Wizard/Stepper, Form Field |

## 3. Reuse discipline

- **No screen invents a second pattern for something §1 already defines.** If PROP-01 and LEAD-02 both need a filterable list, they use the same Record List + Filter/Sort Bar contract — differing only in column/field content, never in interaction model.
- **Status Badge is one component with per-module state maps**, not five different badge implementations — Property's 8-state lifecycle and Contract's 6-state lifecycle both render through the same component contract, fed different state definitions from [06_STATE_ARCHITECTURE.md](06_STATE_ARCHITECTURE.md).
- **Any new component proposed during implementation** must first check this matrix — a proposal that duplicates an existing contract needs written justification (mirrors the Feature Principles template discipline, `tbos-definition/17_FEATURE_PRINCIPLES.md`, applied at component granularity).
