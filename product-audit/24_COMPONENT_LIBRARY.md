# Component Library (Reverse-Engineered)

Extracted from the captured screens across both audit passes, cross-checked against real computed DOM/CSS where noted `[DOM-verified]` (read-only `getComputedStyle` inspection of the live, already-authenticated session — see [[25_DESIGN_SYSTEM_AUDIT]] for the raw token values). Everything else is `[Observed]` from screenshots/snapshots only.

The underlying component kit is **Ant Design** (`ant-btn`, `ant-table`, `ant-progress`, `ant-row` class names were visible directly in DOM selectors during interaction) with a custom theme layer (`styleProfilio` class, custom brand CSS variables) on top — this is a themed component library, not a from-scratch design system. `[DOM-verified]`

---

### Sidebar Navigation
- **Purpose**: primary wayfinding across the 10 top-level modules.
- **Variants**: expanded (icon + label) / collapsed (icon-only rail), toggled by a "Collapse/Expand side menu" button.
- **States**: active item (highlighted), default, hover (not directly captured but implied by `cursor=pointer`).
- **Inputs**: click.
- **Outputs**: route change.
- **Accessibility**: items render as `menuitem` role — good semantic base — but several are `button`-driven rather than anchor-driven, which weakens middle-click/open-in-new-tab and browser history affordances.
- **Reusability**: high — same component instance persists across every authenticated route.

### Header Bar
- **Purpose**: global actions independent of the current page (download app, marketplace link, primary CTA, notifications, account).
- **Composition**: page title (left) + Download App link + "Go to Bayut.sa" outline button + "Post Listing" solid primary button + Notification bell (badge counter) + Avatar/account menu.
- **States**: badge counter changes (observed "24"); bell opens a panel, not a route change.
- **Reusability**: high, persistent across all routes.

### Stat / KPI Card
- **Purpose**: single-number highlight with a label (Active, Available Credits, Views, TruPoints™, etc.).
- **Variants**: plain number, number+delta% (e.g. "Views 1,675 759%"), number+sub-breakdown (Credits Balance: Available/Used/Total in one card).
- **States**: default; no loading/error/empty variant was captured for this component specifically.
- **Reusability**: very high — same visual pattern reused across Dashboard, Reports, Credits Usage, Agent Performance.

### Segmented Control / Tab Group
- **Purpose**: filter a data view without a full navigation (All/For Sale/For Rent/Daily Rentals; All/Basic/Hot/Signature).
- **DOM role**: `listbox`/`option` with `radio` inputs underneath — accessible pattern, confirmed in snapshot markup. `[Observed in accessibility tree]`
- **Reusability**: very high — identical component on Dashboard, Reports Summary, and (tier-only variant) Draft/Removed context filters.

### Data Table (Listings / Leads / Staff)
- **Purpose**: dense, scannable list of domain entities with inline actions.
- **Composition**: header row (`columnheader`), body rows, per-row action icon cluster (6 icons observed on Active listings: verify/promote, share, view, edit, discount, delete — none carry `aria-label` or `title` `[DOM-verified: confirmed empty via getAttribute on live buttons]`).
- **Variants**: with Performance column (Active, Removed) vs. without (Draft — nothing to measure pre-publish); with Upgrades column (Active only).
- **States observed**: populated, empty-implied (Pending (0), Ad License Requests (0) render as valid empty tabs, not exercised visually), a hidden zero-height "measure row" injected by the underlying Ant Table for column-width calculation `[DOM-verified]` — a pure implementation artifact, not a designed empty state.
- **Pagination**: numbered pages + prev/next arrows, disabled state on boundary pages.
- **Reusability**: very high — the same table shell renders Listings, Leads, and Staff with different column sets.

### Listing Preview Panel (Slide-over)
- **Purpose**: quick read-only inspection without navigation.
- **Composition**: title, "Posted By" attribution, hero image or placeholder, photo-count badge, price, location, area.
- **Trigger**: eye icon in the table's action cluster.
- **Reusability**: medium — currently single-purpose (listings only); the pattern (slide-over from a table row) is reusable for Leads/Staff detail with no observed precedent of it being used elsewhere.

### Badge Card (TruBroker)
- **Purpose**: present a gamified achievement with its qualifying metrics.
- **Composition**: icon/animation slot, title, Locked/Unlocked state pill, description, "Learn More" link, 2-column sub-metric row (e.g. Images Score / Features Score).
- **States**: Locked (100% of observed instances) — Unlocked state exists in the data model (implied by the concept) but was not directly observed.
- **Reusability**: medium — three near-identical instances on one page; not reused elsewhere in the captured surface.

### Progress Ring / Bar
- **Purpose**: completion feedback (Profile Completeness 90%; Credit Balance available-vs-total).
- **Variants**: circular ring with center label (profile completion), horizontal bar (credit balance).
- **Reusability**: high.

### Toggle Switch
- **Purpose**: binary preference control.
- **Observed instances**: Smart Credit Utilization, Push Notification, Image and Details Usage consent (Preferences); Share with agency staff (Licenses).
- **States**: on (teal fill) / off — all three Preferences toggles were on by default at capture time.
- **Reusability**: high, consistent visual treatment across two different Settings sub-pages.

### Notification Panel (Dropdown)
- **Purpose**: transient list of time-ordered alerts, mixing transactional and marketing content.
- **Composition**: header ("Notifications" + "Mark all as read" + refresh icon), scrollable card list (icon, title, body, relative timestamp).
- **Reusability**: single instance (global), not composed from smaller reusable list-item components elsewhere in the captured surface.

### Filter Bar
- **Purpose**: narrow a table's row set.
- **Observed fields**: numeric ID inputs (Listing ID, REGA Ad License Number), dropdown selects (Purpose, Property Type), date-range pickers (TruLeads), "Show More" progressive-disclosure toggle, "Clear filters" (disabled when no filters active — good affordance), "Search" primary action.
- **Reusability**: high — same shell on Listings and TruLeads with different field sets.

### Package Tier Card
- **Purpose**: present one pricing tier within a comparison set.
- **Composition**: tier name, price, credit allotment, per-benefit caps (Basic/Hot/Signature/Photography/Videography "up to N"), savings badge, CTA button (state-dependent label: "Downgrade Unavailable" / "Current Package" / "Get {Tier}").
- **States**: below current tier (disabled/"Downgrade Unavailable"), current tier (disabled/"Current Package"), above current tier (active "Get {Tier}" CTA).
- **Reusability**: single context (Packages page), 7 repeated instances.

### Form Field (Text / Select / Radio / Textarea / Phone)
- **Purpose**: standard input primitives used across every Settings sub-page and the Post Listing flow.
- **Notable variant**: phone input uses a dedicated third-party pattern (`PhoneInput*` CSS custom properties confirmed in DOM `[DOM-verified]`) with country-flag selector — not a bespoke Ant input.
- **Notable variant**: bilingual text/textarea pairs (English + Arabic side-by-side fields) with an "AI-generate" button attached to the Arabic *and* English agent-description textareas.
- **Reusability**: very high, the structural backbone of every settings form.

### Confirmation / Info Dialog
- **Purpose**: lightweight modal for "Why is this important?", "What are Credits?", "Learn More" — informational, not destructive-action confirmation (no delete-confirmation dialog was actually triggered in this audit, by design, to avoid mutating the account).
- **Reusability**: high, consistent trigger pattern (button → small overlay) across multiple pages.

---

## Accessibility summary across components

Confirmed via direct, read-only DOM inspection of the live session (not inference): the six per-row action icons in the Listings table have **no `title` and no `aria-label`** on any of them. Combined with icon-only rendering (no visible text), this is a real accessibility gap, not a screenshot-reading artifact — a screen-reader user cannot distinguish "view" from "delete" from the accessibility tree alone; they'd need to rely on icon shape or trial navigation.
