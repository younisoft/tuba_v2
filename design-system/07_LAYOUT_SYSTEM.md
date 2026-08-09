# 07 — Layout System

Composition rules for the chrome every screen shares. Screen-specific content is [`tbos-blueprint/04_SCREEN_INVENTORY.md`](../tbos-blueprint/04_SCREEN_INVENTORY.md)'s job; this document is only the shell those screens render inside, per the navigation structure `tbos-blueprint/02_NAVIGATION_BLUEPRINT.md` already fixed.

## 1. The three chrome elements

| Element | Desktop/Wide | Tablet | Mobile |
|---|---|---|---|
| **Rail Nav Group** | Persistent left rail, collapsible icon-only ↔ expanded (`sizing.railWidth`: 64px collapsed / 240px expanded) | Icon-only by default, expands as an *overlay* on tap (never a layout reflow) | Not present — replaced by bottom Tab Bar |
| **Top Bar** | Search, Quick Actions button, notification bell, account/persona switcher | Same, Quick Actions renders as a top-bar button (desktop pattern, not bottom) | Condensed — page title + search entry only; Quick Actions lives in the elevated center tab |
| **Tab Bar (mobile only)** | Not present | Not present | Persistent bottom bar, exactly 5 destinations |

## 2. Rail Nav Group

Three visually distinct groups matching the module layers (`tbos-blueprint/00` §3 — use these exact names):

1. **Orientation** — Home, Today, Tasks. Default expanded, always visible.
2. **Operating** — Properties, Projects, Leads, Customers, Owners, Contracts, Marketing. Default expanded, always visible.
3. **Intelligence & Control** — Finance, Wallet, Analytics, Reports, Automation, AI Copilot, Notifications, Knowledge, Settings. **Collapsed by default below Agency Owner** (i.e., expanded by default only for AO; SB/SM/MM/OM/PC see it collapsed until they choose to expand it) — a direct implementation of the navigation blueprint's RBAC-scoped single-tree rule, never seven separate trees per persona.

Rail collapse state (icon-only vs. expanded) is a **per-user preference, persisted**, and never auto-collapses based on content — a broker who expands the rail keeps it expanded across sessions. Active item indicated by `bg.brand-subtle` background + `text.brand` label + `bodyEmphasis` weight, never color alone (an filled/outline icon-state pairing accompanies it, [11_ACCESSIBILITY.md](11_ACCESSIBILITY.md) §3).

Icon-only collapsed state still meets the 44×44px touch-target floor per item, with the label available via tooltip on hover/focus (desktop) — never removed, only visually deferred.

## 3. Top Bar

Fixed height `space.10` + `space.3` (56px), full-bleed width, `elevation.1` hairline border-bottom (never a shadow — see [09_ELEVATION_SYSTEM.md](09_ELEVATION_SYSTEM.md) §2 on flat chrome). Left-to-right in LTR (right-to-left in RTL, mirrored as a unit): rail-collapse toggle, then Command/Search Bar (persistent, not a button that opens search — the search bar itself is always visibly present per the "search is primary navigation" rule), then a spacer, then Quick Actions, notification bell (with live unread-count badge — see [12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) Notification List Item), and account/persona switcher (rendered only if the signed-in user holds more than one role context, per `tbos-blueprint/00` §2 — never shown as a disabled/empty control for single-role users, which would violate "no unexplained UI").

## 4. Tab Bar (mobile)

Exactly 5 destinations, fixed, never scrollable, never a 6th added: **Home, Today, Search, Quick Actions (elevated center), Notifications.** Quick Actions renders visually elevated (raised circular button breaking the bar's top edge) to mark it as the one-tap-to-4-actions affordance, not a navigation destination like the other four. At most one floating support/help affordance is permitted elsewhere on mobile screens, and it must never overlap the tab bar or in-flight content (binding rule from the navigation blueprint).

## 5. Content area composition per breakpoint

| Breakpoint | Composition |
|---|---|
| Mobile | Full-screen stack. List screens show Tab Bar + content. Detail screens push full-screen with a back affordance (`← [Module]`, collapsed breadcrumb) — no Slide-over Panels on mobile, full-screen push only. |
| Tablet | Rail (icon-only) + content. Detail screens use freed width for two columns: primary content + contextual Slide-over Panel (as an overlay panel, not permanently docked). |
| Desktop | Rail + content, 8/12-column primary + 4/12-column contextual panel on detail screens (docked, not overlay — see [06_GRID_SYSTEM.md](06_GRID_SYSTEM.md) §3). |
| Wide | Same as desktop, content capped at 1440px and centered within the remaining space. |

## 6. Slide-over Panel — placement rule

A Slide-over Panel is how a detail screen surfaces directly related records inline (e.g., `PROP-02` showing linked Leads/Contract) without navigating away — desktop/tablet only, per §5. **It is never the only way to reach a record** — every panel includes an "open full record" escape hatch to the record's own detail screen. This is the one deliberate, explicit exception `tbos-blueprint/02_NAVIGATION_BLUEPRINT.md` names to "one home per capability": Marketing Requests surface in both Owners (canonical home) and Today (derived, time-sensitive) — Today never lets a user *do* something Owners can't, it only surfaces *when* to look. No other duplicate-placement pattern is permitted without the same justification.

Panel width: `sizing.panelWidth` — `sm` (400px) for a single related-record summary, `md` (560px) for a form/edit context, `lg` (720px) for a multi-tab related-record view. Opens with a scrim (`bg.overlay-scrim`) on tablet; docks without a scrim on desktop/wide since it shares the viewport with primary content per the 8/4 column split.

## 7. Command Palette (CMD-01) and Global Search (GS-01)

Same visual surface, opened via the persistent Top Bar search field or the global keyboard shortcut. Centered overlay, `elevation.4`, max-width 640px, `zIndex.commandPalette`. Two visually distinct modes on the same input: plain query renders result rows grouped by module; `>` prefix switches to action mode (monospace-styled prefix chip, per [04_TYPOGRAPHY.md](04_TYPOGRAPHY.md) `mono` family) rendering matched commands instead. Context-aware ordering (property-scoped commands surface first when opened from `PROP-02`) is a data concern, not a layout one — the palette's visual structure doesn't change by context, only result ordering does.

## 8. Breadcrumb placement

Detail and nested-creation screens only, directly under the Top Bar, `caption` size, max 2 segments (`[Module] / [Record identifier]`) — never on top-level module list screens (their `h1` title is sufficient orientation). Wizards ([12_COMPONENT_GUIDELINES.md](12_COMPONENT_GUIDELINES.md) Wizard/Stepper) show step progress in this same slot instead of a breadcrumb, never both. Mobile collapses to a single `← [Module]` back affordance, no second segment.
