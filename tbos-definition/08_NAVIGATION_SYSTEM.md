# 08 — Navigation System

**Status**: Recommended. Defines *how* the hierarchy in `07_INFORMATION_ARCHITECTURE.md` is presented and operated across devices and interaction modes. Diagram: `diagrams/navigation.mmd`.

---

## Desktop

**Pattern**: a persistent, collapsible left rail showing the three IA layers (Orientation / Operating / Intelligence) as visually distinct groups — not Tuba's current flat, ~27-item, ungrouped list (`tuba-current-state/03_INFORMATION_ARCHITECTURE.md`). Each group is collapsible independently; the Operating layer (the jobs a broker does daily) defaults to expanded, Intelligence & Control defaults to collapsed for anyone below Agency Owner.

**Top bar**: global search (see below), quick-action button, notifications, account/persona switcher (if the logged-in user has access to more than one role context — e.g., an Agency Owner who is also a Property Consultant on specific deals).

**Never duplicated**: unlike Tuba's current sidebar, which visually lists "الباقات" (Packages) as two separate entries pointing at the same destination (`tuba-current-state/03_INFORMATION_ARCHITECTURE.md`), no entity in the desktop rail appears more than once. If a feature seems to need two entry points, that's a signal the IA is wrong, not that a second nav link is warranted.

## Tablet

**Pattern**: the left rail collapses to icons-only by default (labels on hover/tap-hold), expandable to the full desktop rail with one tap. Detail pages (Property Detail, Lead Detail) use the full width freed by the collapsed rail rather than introducing a separate tablet-specific layout.

## Mobile

**Pattern**: bottom tab bar with exactly five destinations — **Home, Today, Search, Quick Actions (center, elevated), Notifications** — everything else reached through Search or through Home/Today's own links, not through a hamburger-menu replica of the desktop tree. This is a deliberate departure from Tuba's current mobile pattern, which collapses the entire flat sidebar into a single "Dashboard Navigation" dropdown menu — functional but not designed for the constraint (`tuba-current-state/08_UI_AUDIT.md`).

**Confirmed defect this design must not repeat**: Tuba's current mobile dashboard has a section heading clipped at the viewport edge and a floating "scroll" control overlapping the WhatsApp button and page content (`tuba-current-state/08_UI_AUDIT.md`). TBOS's mobile navigation reserves fixed, non-overlapping zones for the tab bar, any single floating support/help affordance (at most one), and content — enforced as a layout rule, not a per-screen judgment call.

## Search-first navigation

Global search (full behavior in `12_SEARCH_STRATEGY.md`) is not a secondary way to find things — for any persona managing more than a handful of records, it is the **primary** navigation method. The top bar's search field is keyboard-focusable from anywhere with a single shortcut (see Keyboard Navigation below) and returns entities across every module in the IA tree, ranked by relevance and recency, not siloed by module.

**Why this matters here specifically**: Tuba's current platform's one entity-heavy filter screen (`/property-requests`'s city/district selector) is a single flat `<select>` with several hundred un-searchable options (`tuba-current-state/04_PAGE_ANALYSIS.md`) — a concrete, live example of what happens when a navigation surface is designed without a search-first assumption. TBOS treats "will this list ever exceed ~15 items" as the trigger for search-first design, checked at spec time (`16_MODULE_SPECIFICATIONS.md`), not discovered after the fact.

## Quick actions

A single, persistent, elevated control (center of the mobile tab bar; a button in the desktop top bar) that opens the highest-frequency actions from `05_JOBS_TO_BE_DONE.md` ranks 1–4: **Add Lead, Add Property, Log Follow-up, Submit Compliance Document**. This exists because those four jobs happen many times a day and should never require navigating to their home module first — the module is where you *manage* leads/properties; Quick Actions is where you *capture* one in under two taps, from anywhere.

## Contextual navigation

Every detail page in the Operating layer surfaces its directly related records without a full navigation — a Property Detail page's "Leads" tab shows linked leads inline; clicking one opens it as a slide-over/panel, not a full page navigation that loses the Property's context. This pattern directly answers Design Principle "Speed" (no interaction performed often should take more than two steps) by keeping related-record lookups inside the current context rather than round-tripping through the IA tree.

## Keyboard navigation

- A single global shortcut opens search from anywhere (no click required).
- Every primary list (Leads, Properties, Contracts) supports arrow-key row navigation and Enter-to-open, for high-volume users (Sales Managers, Operations Managers) who process many records per session.
- Every modal/panel is dismissible with Escape and traps focus while open (a gap this system explicitly closes relative to Tuba's current modals, whose focus-trap behavior was not confirmed present in `tuba-current-state/10_COMPONENT_LIBRARY.md`'s live review).
- Destructive actions are never bound to a bare keyboard shortcut without a confirmation step, per Design Principle "Interaction philosophy."

## What replaces Tuba's current specific navigation defects

| Current defect (cited) | TBOS resolution |
|---|---|
| Flat ~27-item sidebar, no grouping (`tuba-current-state/03_INFORMATION_ARCHITECTURE.md`) | Three-layer grouped rail (above) |
| Duplicate "الباقات" entries pointing at the same page | Single-entry rule enforced by IA (`07_INFORMATION_ARCHITECTURE.md`) |
| Sidebar `@can()` mismatch makes some correctly-permissioned links invisible (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`) | RBAC-driven visibility resolved from one canonical role registry, not per-link permission strings (`07_INFORMATION_ARCHITECTURE.md`'s role table) |
| No dedicated navigation entry for Marketing Requests despite it being a real, monetized feature (`tuba-current-state/06_WORKFLOW_ANALYSIS.md` §3) | Surfaced in both Owners (canonical) and Today (when time-sensitive) — see `07_INFORMATION_ARCHITECTURE.md` note |
| Mobile heading clipping / overlapping floating controls (`tuba-current-state/08_UI_AUDIT.md`) | Fixed, non-overlapping zone rule (above) |
| Huge, un-searchable flat `<select>` for location filtering (`tuba-current-state/04_PAGE_ANALYSIS.md`) | Search-first pattern mandatory above a defined list-length threshold |
</content>
