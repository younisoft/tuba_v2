# 02 — Navigation Blueprint

The navigation *model* (rail structure, search-first rule, quick actions, keyboard basics) is already decided in `tbos-definition/08_NAVIGATION_SYSTEM.md` and is fixed input here — see [00](00_IMPLEMENTATION_BLUEPRINT.md) §7. This document makes it concrete: exact screen-level structure per device, the breadcrumb strategy and command palette that source document left open, and the navigation diagram.

## 1. Desktop navigation (≥1280px)

**Left rail** — persistent, collapsible, three visually distinct groups matching the IA layers:

```
┌─────────────────────────┐
│ [Logo]      [⌘K search] │  ← top bar: search, Quick Actions, notif bell, account
├─────────────────────────┤
│ ORIENTATION              │
│  🏠 Home        HOME-01  │
│  ⚡ Today       TODAY-01 │  ← default landing screen for all personas
│  ✓ Tasks        TASK-01  │
├─────────────────────────┤
│ OPERATING          [—]   │  ← expanded by default
│  Properties     PROP-01  │
│  Projects       PROJ-01  │
│  Leads          LEAD-01  │
│  Customers      CUST-01  │
│  Owners         OWN-01   │
│  Contracts      CONT-01  │
│  Marketing      MKT-01   │
├─────────────────────────┤
│ INTELLIGENCE & CONTROL[+]│  ← collapsed by default below Agency Owner
│  Finance        FIN-01   │
│  Wallet         WAL-01   │
│  Analytics      ANL-01   │
│  Reports        RPT-01   │
│  Automation     AUTO-01  │
│  AI Copilot     AICP-01  │
│  Notifications  NOTIF-01 │
│  Knowledge      KB-01    │
│  Settings       SET-01   │
└─────────────────────────┘
```

- Rail is collapsible to icon-only (broker preference, persisted). Never auto-collapses based on screen content.
- Each group header shows a collapse affordance only if it has hidden items to a given persona (RBAC visibility, per `tbos-definition/07_INFORMATION_ARCHITECTURE.md` role table) — a group with zero visible children doesn't render, rather than rendering empty.
- No item ever appears in two groups. Marketing Requests (OWN-03) is the one deliberate cross-surface exception — it does **not** get its own rail entry; it's reached via Owners (OWN-02/03) and surfaced as entries inside TODAY-01, never as a duplicate nav node.
- Top bar right side, persona-conditional: account/persona switcher only renders for a user holding more than one role context (e.g., an Agency Owner who is also a Property Consultant on their own deals).

## 2. Tablet navigation (768–1279px)

- Rail collapses to icon-only by default; one tap/click expands to the full desktop rail as an overlay (not a layout reflow — content underneath doesn't resize).
- Icon-only rail still preserves group boundaries via a thin divider and hover/long-press label, so a Sales Manager mid-shift can identify Leads vs. Contracts by icon position alone.
- Detail screens (PROP-02, LEAD-03, CONT-02, etc.) use the freed horizontal width for a two-column layout (primary content + contextual side panel) rather than a distinct tablet-only screen design — per `tbos-definition/08_NAVIGATION_SYSTEM.md`, no separate tablet IA.
- Quick Actions (QA-01) renders as a top-bar button, not a bottom bar (tablet keeps desktop's top-bar pattern, not mobile's bottom-tab pattern).

## 3. Mobile navigation (<768px)

Bottom tab bar, exactly 5 destinations, fixed and non-overlapping with content or any floating affordance:

```
┌──────┬──────┬──────┬──────┬──────┐
│ Home │Today │Search│  ⊕   │ 🔔   │
│HOME-01│TODAY-01│GS-01│QA-01│NOTIF-01│
└──────┴──────┴──────┴──────┴──────┘
                  ↑
        center, elevated —
        opens QA-01 (4 quick actions)
```

- Everything outside these 5 is reached through Search (GS-01) or through links surfaced on Home/Today — **not** a hamburger menu replicating the desktop tree. This is a deliberate rejection of the current platform's flat-sidebar pattern (`tuba-current-state/03_INFORMATION_ARCHITECTURE.md`).
- At most one floating support/help affordance is permitted anywhere on a mobile screen, and it must never overlap the tab bar or primary content — binding layout rule from `tbos-definition/03_DESIGN_PRINCIPLES.md` (Responsiveness).
- A persona whose RBAC scope excludes a destination never sees a broken/disabled tab — the tab bar itself doesn't change per persona (all 5 destinations are universal), but what's *inside* Search and Today is RBAC-scoped identically to desktop.
- Module list screens (PROP-01, LEAD-01, etc.) reached via Search results or Home/Today links render as full-screen list views with the tab bar still visible; detail screens push a full-screen stack view with a back affordance (not a slide-over on mobile — slide-overs are a tablet/desktop contextual-navigation pattern, see §5).

## 4. Keyboard-first workflow

Fixed from `tbos-definition/08_NAVIGATION_SYSTEM.md`, made concrete:

| Action | Shortcut | Scope |
|---|---|---|
| Open global search | Single global shortcut (e.g. `/` or `Cmd/Ctrl+K`) | Anywhere in Broker OS |
| Open Command Palette | `Cmd/Ctrl+K` if distinct from search, or search *is* the palette (see §6) | Anywhere |
| Navigate list rows | Arrow keys | LEAD-01/02, PROP-01, CONT-01, CUST-01, OWN-01, TASK-01 — every primary list |
| Open focused row | `Enter` | Same lists |
| Dismiss modal/panel | `Escape` | Every modal, slide-over, Quick Actions panel |
| Trigger a Quick Action | Number key `1`–`4` while QA-01 is open | QA-01 only, never global (avoids accidental destructive triggers) |
| Confirm a destructive action | Never bound to a bare key — always requires the confirmation UI, keyboard or not | Delete, archive-bulk, deletion recovery-window expiry |

**Focus management rule** (feeds [11_ACCESSIBILITY_BLUEPRINT.md](11_ACCESSIBILITY_BLUEPRINT.md)): every modal/panel traps focus while open and returns focus to the triggering element on close — no keyboard user is ever dropped back at the top of the page.

## 5. Contextual navigation

Detail screens surface directly related records inline rather than forcing a full navigation away — the mechanism behind Design Principle "Speed" (≤2 steps for frequent interactions).

| From | Shows inline | Opens as |
|---|---|---|
| PROP-02 | Linked Leads, active Contract | Slide-over panel (desktop/tablet), full-screen push (mobile) |
| LEAD-03 | Linked Customer/Owner history, related Property | Slide-over panel |
| OWN-02 | Marketing Requests (OWN-03 content), linked Properties | Inline tab, not a panel — OWN-03 is embedded, not overlaid |
| CONT-02 | Linked Lead/Customer/Owner/Property, compliance doc status | Slide-over panel |
| CUST-02 | Linked Leads and Contracts (relationship history) | Inline timeline, not a panel |

**Rule**: a slide-over/panel never becomes the only way to reach a record — everything shown in a panel is also reachable as its own canonical screen via Search or the panel's "open full record" affordance. This preserves "one home per capability" even though the *access path* is contextual.

## 6. Global Search

Full behavioral spec in [10_SEARCH_EXPERIENCE.md](10_SEARCH_EXPERIENCE.md). Navigation-relevant contract here: GS-01 is reachable from every screen via the top bar (desktop/tablet) or the Search tab (mobile), returns entities across every module ranked by relevance+recency together, and is RBAC-scoped identically to direct navigation (a Property Consultant's search never surfaces another consultant's private lead via keyword match).

**Trigger rule restated for nav design**: any list that can exceed ~15 items is search-first by default (search box prioritized over browsing/filtering chrome) — this applies to PROP-01, LEAD-01/02, CUST-01, OWN-01, CONT-01 as soon as an account has meaningful volume; Tasks (TASK-01) and Automation Rules (AUTO-01) stay browse-first since they're bounded, human-curated lists.

## 7. Quick Actions

QA-01 exposes exactly the top-4 JTBD-ranked actions (`tbos-definition/08_NAVIGATION_SYSTEM.md`): **Add Lead, Add Property, Log Follow-up, Submit Compliance Document.** Opens as a single persistent elevated control — center of the mobile tab bar, a top-bar button on desktop/tablet — and must complete capture in ≤2 taps/clicks from anywhere. QA-01 is for *capturing*, never for *managing* (managing an existing record always routes to its module).

RBAC note: a persona without permission to perform one of the four (e.g., a Property Consultant has no "Submit Compliance Document" permission if that's Operations-Manager-scoped in a given agency's role config) sees 3 actions, not a disabled 4th — consistent with the mobile tab-bar rule of never showing a broken affordance.

## 8. Command Palette (CMD-01)

Not separately specified in `tbos-definition/`; defined here as the keyboard-power-user layer the master prompt asks for, built as a **superset of Global Search**, not a parallel system (avoids "one home per capability" violation).

- Same trigger as Global Search (§4) — CMD-01 and GS-01 are the same surface with two entry modes: typing a plain query returns search results (GS-01 behavior); typing `>` followed by a command name returns actions (e.g., `> add property`, `> renew license`, `> switch role`).
- Command list is RBAC-scoped and context-aware: opening the palette from PROP-02 surfaces property-scoped commands (e.g., "> change price") above global ones.
- Every command the palette exposes must already exist as a reachable UI action elsewhere — the palette is an accelerator, never a hidden capability with no visual-UI equivalent (Design Principle "Consistency").

## 9. Breadcrumb strategy

Not specified upstream; defined here. TBOS uses breadcrumbs **only on detail and nested-creation screens**, never on top-level module screens (which are one level deep from the rail and need no trail).

- Pattern: `[Module] / [Record identifier]` — e.g., `Properties / Villa 42, Al Nakheel` — never more than 2 segments, because the IA is intentionally shallow (per `07_INFORMATION_ARCHITECTURE.md`, no screen sits deeper than Module → Detail → contextual panel).
- A contextual panel opened from a detail screen (§5) does **not** extend the breadcrumb — it's an overlay, not a navigation depth increase.
- Wizards (PROP-03, PROJ-03) show step progress (e.g., "Step 2 of 4: Compliance"), not a breadcrumb — different affordance for a different purpose (progress through a flow vs. position in a hierarchy).
- Mobile: breadcrumb collapses to a single back affordance with the parent module's name (`← Properties`), consistent with the platform's shallow-depth rule making a full trail unnecessary at small width.

## 10. Navigation diagram

See `diagrams/navigation.mmd`, indexed in [19_MASTER_MERMAID_DIAGRAMS.md](19_MASTER_MERMAID_DIAGRAMS.md). It renders: the three-device model above, RBAC-driven visibility branching per persona code, and Global Search / Quick Actions / Command Palette as cross-cutting entry points reachable from every branch — extending `tbos-definition/diagrams/navigation.mmd` (which stops at the strategy level) down to actual screen IDs.
