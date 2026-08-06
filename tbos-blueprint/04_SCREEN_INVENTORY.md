# 04 — Screen Inventory

The definitive, implementation-ready list of every TBOS screen. IDs match the canon in [00](00_IMPLEMENTATION_BLUEPRINT.md) §4. No visual design — behavior only. General accessibility bar is [11_ACCESSIBILITY_BLUEPRINT.md](11_ACCESSIBILITY_BLUEPRINT.md); each screen below only notes what's *specific* to it. General state-taxonomy definitions are [06_STATE_ARCHITECTURE.md](06_STATE_ARCHITECTURE.md); each screen below only notes its *specific* content for each state.

**Card fields**: Purpose · Primary user · Permissions · Required data · Primary actions · Secondary actions · Quick actions · AI actions · Nav entry · Dependencies · States (Empty/Loading/Error/Success) · Accessibility note.

---

## Orientation layer

### HOME-01 — Home
- **Purpose**: account-level front door; answers "how is my business doing" at a glance.
- **Primary user**: All (content RBAC-scoped).
- **Permissions**: read-only aggregation; no write actions live here.
- **Required data**: Wallet status, Analytics summary, Properties/Projects/Leads counts.
- **Primary actions**: tap any tile → drills into the owning module (ANL-01, WAL-01, etc.).
- **Secondary actions**: switch persona/role context (if user holds multiple).
- **Quick actions**: QA-01 accessible from top bar, not embedded in tile grid.
- **AI actions**: AI Insights narrative annotation per tile, on demand.
- **Nav entry**: rail "Home" (always first item); default landing after login for a returning session that isn't mid-task.
- **Dependencies**: Wallet, Analytics (read-only).
- **States**: Empty → new account sees guided onboarding (ONB-01), never a blank dashboard. Loading → skeleton tiles matching real layout. Error → per-tile graceful degradation (one failed tile doesn't blank the page); Success → tiles render with as-of timestamp if not real-time.
- **Accessibility**: tiles are landmark regions with descriptive `aria-label` including the metric's plain-language meaning, not just its number.

### TODAY-01 — Today
- **Purpose**: prioritized, cross-module, continuously-refreshed worklist — the primary rendering surface of the Decision Support System. Full ranking logic: [07_DECISION_SUPPORT_SYSTEM.md](07_DECISION_SUPPORT_SYSTEM.md).
- **Primary user**: All (RBAC-scoped; a PC never sees another PC's items even if objectively higher priority agency-wide).
- **Permissions**: read entries scoped to role; act on an entry requires the same permission the underlying action would (e.g., resolving a compliance item requires OM-level compliance permission).
- **Required data**: live query across every Operating-layer module + Automation + Notifications.
- **Primary actions**: resolve an entry inline (where possible) or navigate to source record.
- **Secondary actions**: dismiss/snooze an entry; mark "not relevant" (feeds ranking-quality signal).
- **Quick actions**: QA-01 always available from this screen since it's the default landing surface.
- **AI actions**: every entry satisfies the Explainability contract (why ranked here, how calculated) on demand.
- **Nav entry**: rail "Today"; default landing screen for all personas per [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md).
- **Dependencies**: every Operating-layer module (read), Automation, Notifications.
- **States**: Empty → explicit "You're all caught up" (positive, never blank/broken-looking, per `tbos-definition/16_MODULE_SPECIFICATIONS.md`). Loading → skeleton list. Offline → last-cached list with as-of timestamp banner. Error → partial list with a visible "some items may be missing" note, never silent truncation. Success → ranked list, Critical items pinned above the ranking algorithm's normal order.
- **Accessibility**: list is keyboard-navigable (arrow keys + Enter, per [02](02_NAVIGATION_BLUEPRINT.md) §4); urgency is never conveyed by color alone — an icon + text label accompanies every priority tier.

### TASK-01 — Tasks List
- **Purpose**: durable, assignable, checkable worklist — distinct from Today's derived/algorithmic nature (see [00](00_IMPLEMENTATION_BLUEPRINT.md) §9).
- **Primary user**: All; managers (AO/SM) additionally assign tasks to others.
- **Permissions**: view own tasks always; view/assign team tasks requires management scope.
- **Required data**: Task entity (title, due date, assignee, linked record, status).
- **Primary actions**: create task, complete task, reassign task.
- **Secondary actions**: filter by due/overdue/assignee; bulk-complete.
- **Quick actions**: "Log Follow-up" (QA-01) creates a Task here directly.
- **AI actions**: none required — Tasks are explicitly a non-algorithmic, human-curated surface.
- **Nav entry**: rail "Tasks" (Orientation group).
- **Dependencies**: Automation (recurring tasks), Notifications (due/overdue alerts).
- **States**: Empty → explicit "No tasks — add one or check Today for what needs attention" with a working create action. Loading → skeleton rows. Error → standard error state (see [06](06_STATE_ARCHITECTURE.md)). Success → overdue items visually distinct from upcoming (never by color alone — icon + label).
- **Accessibility**: due-date urgency announced via `aria-label`, not relying on color/strikethrough alone.

### TASK-02 — Task Detail (panel)
- **Purpose**: view/edit a single task without leaving the calling context.
- **Primary user**: All.
- **Permissions**: edit requires ownership or management scope over the assignee.
- **Required data**: single Task record + linked record reference.
- **Primary actions**: complete, edit due date/assignee, add note.
- **Secondary actions**: delete (soft-delete, per WF-DELETION), link to another record.
- **Quick actions**: none (this is itself reached via Quick Action in some flows).
- **AI actions**: none.
- **Nav entry**: opened from TASK-01 row, or from TODAY-01/any detail screen's linked-task indicator.
- **Dependencies**: TASK-01.
- **States**: Loading → skeleton. Error → inline retry. Success → confirmation on complete stating what happens next if the task was gating something (e.g., "this was blocking Contract #123 — it can now proceed").
- **Accessibility**: opens as a focus-trapped panel (see [02](02_NAVIGATION_BLUEPRINT.md) §4), returns focus to trigger on close.

---

## Operating layer

### PROP-01 — Properties List
- **Purpose**: browse/filter/search the broker's or agency's property inventory.
- **Primary user**: SB, AO, PC (own scope), MM (read/write content), OM (read-only).
- **Permissions**: PC sees only their own listings by default (agency-configurable); MM has content-write, not compliance-write; OM read-only.
- **Required data**: Property records (status, compliance, media thumbnail, price, district).
- **Primary actions**: create property (→ PROP-03), open property (→ PROP-02).
- **Secondary actions**: bulk actions (archive, reassign), filter by status/district/type, sort.
- **Quick actions**: "Add Property" (QA-01) lands here as the entry list refreshes after creation.
- **AI actions**: none at list level (AI lives inside PROP-02/03, per Philosophy Principle #3 — no AI-as-a-tab).
- **Nav entry**: rail "Properties" (Operating group); search-first once inventory exceeds ~15 items ([02](02_NAVIGATION_BLUEPRINT.md) §6).
- **Dependencies**: Wallet (quota check on create), Leads (linked-lead counts shown inline).
- **States**: Empty → new account sees guided "create your first property" CTA, not a bare table. Loading → skeleton rows. Error → standard. Success → list reflects real-time status (Draft/Active/Expiring/Expired/Rejected/Sold-Rented/Archived), each with distinct visual treatment (never ambiguous, per WF-PROPERTY-NEW's two-terminal-state rule).
- **Accessibility**: status badges carry text, not color alone; bulk-select checkboxes are individually labeled with the record's identifying name, not just "row 3."

### PROP-02 — Property Detail
- **Purpose**: single source of truth for one property across its full lifecycle.
- **Primary user**: SB, AO, PC (own), MM (content tab), OM (compliance tab, read).
- **Permissions**: tab-level RBAC — Compliance tab edit requires OM/AO scope even if the broker owns the listing.
- **Required data**: Property core record, Media, Compliance status, Price History, linked Leads/Contract, Performance metrics.
- **Primary actions**: edit, change price (→ WF-PRICE-CHANGE inline), publish/unpublish, archive.
- **Secondary actions**: duplicate as new listing, view price history, export.
- **Quick actions**: none additional beyond global QA-01.
- **AI actions**: AI-suggested price band (Price Change), content-quality score + fix suggestions, "similar listings" recommendation.
- **Nav entry**: from PROP-01 row, Global Search, or a contextual panel link from LEAD-03/CONT-02.
- **Dependencies**: Leads (contextual panel), Contracts (contextual panel), Wallet (compliance-linked quota), AI Strategy.
- **States**: full lifecycle set (Draft, Pending Compliance, Active, Expiring, Expired, Rejected, Sold/Rented, Archived) — each with its own explanation + primary action per [06_STATE_ARCHITECTURE.md](06_STATE_ARCHITECTURE.md). Loading → skeleton matching tab layout. Error → tab-level graceful degradation. Success → explicit confirmation with next-step statement on every meaningful transition (Design Principle "Success states").
- **Accessibility**: tabs are keyboard-navigable (arrow/Tab), each tab panel has a distinct heading for screen-reader landmark navigation.

### PROP-03 — Create/Edit Property (wizard)
- **Purpose**: guided, front-loaded creation/edit flow. Full workflow: WF-PROPERTY-NEW in [01](01_EXPERIENCE_ARCHITECTURE.md).
- **Primary user**: SB, AO, PC.
- **Permissions**: create requires available Wallet quota; publish (final step) may require manager approval per agency RBAC config.
- **Required data**: property fields, license/REGA lookup, media, AI-generated content (optional).
- **Primary actions**: advance step, save Draft, publish.
- **Secondary actions**: skip optional fields, regenerate AI description, remove uploaded media.
- **Quick actions**: entry point from QA-01 "Add Property."
- **AI actions**: description/SEO generation, amenity-tag suggestion, price-band context.
- **Nav entry**: PROP-01 "New Property," QA-01.
- **Dependencies**: Wallet (quota), Automation (completeness check), AI Strategy.
- **States**: Empty (fresh wizard) → requirements checklist shown before first field. Loading → async media/AI generation shown as background progress, never blocking. Error → per-field validation inline, per-file upload retry. Success → two-terminal-state confirmation (Live or explicit Draft, never ambiguous).
- **Accessibility**: step progress announced to screen readers on each step change; no step advances on Enter alone if a required field is empty (traps with a clear inline error, not a silent no-op).

### PROJ-01 — Projects List
- **Purpose**: browse/filter developer/multi-unit inventory, structurally separate from Properties (different data shape — units, floor plans).
- **Primary user**: SB, AO, PC, MM (content), OM (read-only).
- **Permissions**: same pattern as PROP-01.
- **Required data**: Project records + aggregate unit-availability summary.
- **Primary actions**: create project (→ PROJ-03), open project (→ PROJ-02).
- **Secondary actions**: filter by completion status, unit availability.
- **Quick actions**: none dedicated (Projects isn't in the top-4 JTBD ranked list; reached via module nav or Search).
- **AI actions**: none at list level.
- **Nav entry**: rail "Projects."
- **Dependencies**: Wallet, Leads.
- **States**: same pattern as PROP-01, applied per-project (aggregate) and drilling to per-unit in PROJ-02.
- **Accessibility**: same pattern as PROP-01.

### PROJ-02 — Project Detail
- **Purpose**: single source of truth for a project and its units.
- **Primary user**: SB, AO, PC, MM (content), OM (compliance, read).
- **Permissions**: unit-level edits inherit project-level RBAC.
- **Required data**: Project core, Units (floor plan, availability, price), Media, Compliance, Performance.
- **Primary actions**: edit project, add/edit unit, change unit price/availability.
- **Secondary actions**: bulk-update units, export unit list.
- **Quick actions**: none additional.
- **AI actions**: description/SEO generation (extended here, not Property-only per `10_AI_STRATEGY.md` fast-follow), content-quality scoring per unit.
- **Nav entry**: from PROJ-01, Global Search.
- **Dependencies**: same as PROP-02.
- **States**: same lifecycle set as PROP-02, applied per-unit and per-project.
- **Accessibility**: unit table is keyboard-navigable with row-level focus, same as any primary list.

### PROJ-03 — Create/Edit Project (wizard)
- **Purpose**: guided creation flow, project-plus-units.
- **Primary user**: SB, AO, PC.
- **Permissions**: same pattern as PROP-03.
- **Required data**: project fields + one-or-more unit definitions.
- **Primary actions**: advance step, add unit, save Draft, publish.
- **Secondary actions**: duplicate unit as template for next unit (reduces repetitive entry — a Minimalism-principle efficiency, not a new capability).
- **Quick actions**: none dedicated.
- **AI actions**: same as PROP-03, applied per unit.
- **Nav entry**: PROJ-01 "New Project."
- **Dependencies**: same as PROP-03.
- **States**: same pattern as PROP-03, with an added "at least one unit required to publish" completeness rule.
- **Accessibility**: same as PROP-03.

### LEAD-01 — Leads Pipeline (stage view, default)
- **Purpose**: the Unified Lead Pipeline — kanban-style stage view of every lead (buyer-inbound + owner-originated) in one scored, SLA-timed system. Direct fix for the live-confirmed misrouting defect.
- **Primary user**: PC (own leads), SM (team, full pipeline), AO (agency-wide), SB (own, full).
- **Permissions**: PC scoped to own; SM/AO see team/agency; MM sees only Marketing-Request-linked leads.
- **Required data**: Lead (source, stage, score, SLA state, assignee).
- **Primary actions**: move lead stage (drag or action), open lead (→ LEAD-03), reassign.
- **Secondary actions**: filter by SLA risk, source, score; bulk reassign.
- **Quick actions**: "Add Lead" (QA-01) creates directly into this pipeline.
- **AI actions**: Lead Scoring displayed per card; scoring rationale on demand.
- **Nav entry**: rail "Leads" (default sub-view).
- **Dependencies**: Automation (routing), Notifications (SLA alerts), Customers/Owners (merge target).
- **States**: Empty → "No leads yet" with guided next step (varies: SB sees "leads will appear here" vs. new agency sees onboarding). Loading → skeleton kanban columns. Error → standard. Success → SLA-risk cards visually flagged (icon + label, not color alone), consistent with LEAD-03.
- **Accessibility**: drag-and-drop stage changes have a keyboard-operable equivalent (a per-card "move to stage" menu), since drag alone is never sufficient for keyboard/screen-reader users.

### LEAD-02 — Leads Inbox (chronological view, alternate — same data as LEAD-01)
- **Purpose**: same Lead data as LEAD-01, presented chronologically for brokers who think in "what came in when" rather than pipeline stage.
- **Primary user**: same as LEAD-01.
- **Permissions**: identical to LEAD-01 (same data, different view — no separate permission model, per "one home per capability" applied to *data*, not *view*).
- **Required data**: identical to LEAD-01.
- **Primary actions**: identical to LEAD-01, reachable inline per row instead of per card.
- **Secondary actions**: toggle back to LEAD-01 view (persisted preference).
- **Quick actions**: same as LEAD-01.
- **AI actions**: same as LEAD-01.
- **Nav entry**: view toggle from LEAD-01, not a separate rail item (avoids "one home per capability" violation — this is a view mode, not a new destination).
- **Dependencies**: same as LEAD-01.
- **States**: same as LEAD-01, list-row presentation instead of card.
- **Accessibility**: standard list keyboard navigation (arrow/Enter).

### LEAD-03 — Lead Detail
- **Purpose**: unified detail for one lead — buyer-inbound or owner-originated, same schema.
- **Primary user**: assigned PC/SB primarily; SM/AO for oversight/reassignment.
- **Permissions**: assignee has full read/write; SM/AO can reassign; others in the agency have no access unless explicitly shared.
- **Required data**: Lead record, linked Customer/Owner, linked Property/Project, message/interaction history, SLA state.
- **Primary actions**: respond (reply/draft), change stage, reassign, convert to Contract (Won).
- **Secondary actions**: mark Lost (with required reason), merge with existing Customer, log outside-platform response.
- **Quick actions**: "Log Follow-up" (QA-01) can target this lead directly.
- **AI actions**: reply drafting, next-best-action suggestion, lead score with rationale, duplicate-match suggestion.
- **Nav entry**: from LEAD-01/02, TODAY-01, Global Search, push notification deep link.
- **Dependencies**: Customers, Owners, Automation, Notifications, Contracts (on Won).
- **States**: New, Assigned, Contacted, Qualified, Negotiating, Won (→Contract), Lost (with reason) — each with distinct action set. Loading → skeleton. Error → standard. Success → confirmation on stage change with next-step statement (e.g., moving to Won states "Contract created — continue in Contracts").
- **Accessibility**: reply-draft text area is a standard labeled form control; AI-suggested text is announced as a suggestion (`aria-describedby` noting "AI-suggested, editable") not silently pre-filled as if broker-authored.

### CUST-01 — Customers List
- **Purpose**: persistent relationship records, independent of any single listing.
- **Primary user**: PC (own), SM/AO (team/agency), SB (own).
- **Permissions**: PC scoped to own customers; SM/AO broader.
- **Required data**: Customer (contact info, relationship stage, linked Leads/Contracts count).
- **Primary actions**: create customer, open customer (→ CUST-02).
- **Secondary actions**: merge duplicates, filter by relationship stage (prospective/active/past).
- **Quick actions**: none dedicated (Customers isn't top-4 JTBD; created implicitly via Lead conversion in the common case).
- **AI actions**: duplicate-detection suggestion at create time.
- **Nav entry**: rail "Customers."
- **Dependencies**: Leads, Contracts.
- **States**: Empty → guided create/first-lead-conversion explanation. Loading → skeleton. Error → standard. Success → standard list.
- **Accessibility**: standard list pattern.

### CUST-02 — Customer Detail
- **Purpose**: unified relationship view — interaction history, linked leads/deals.
- **Primary user**: same as CUST-01.
- **Permissions**: same as CUST-01.
- **Required data**: Customer core, linked Leads (timeline), linked Contracts.
- **Primary actions**: edit contact info, log interaction, create new Lead for this customer.
- **Secondary actions**: merge/split, archive.
- **Quick actions**: none additional.
- **AI actions**: Customer Intelligence — synthesized relationship summary (interaction history, stated preferences, deal-readiness signal).
- **Nav entry**: from CUST-01, LEAD-03 contextual panel, Global Search.
- **Dependencies**: Leads, Contracts.
- **States**: Loading → skeleton. Error → standard. Success → relationship timeline renders chronologically with source attribution per entry.
- **Accessibility**: timeline is a semantically ordered list (not a div soup), each entry independently focusable.

### OWN-01 — Owners List
- **Purpose**: supply-side counterpart to Customers — property owners and their relationship to the agency.
- **Primary user**: SB, AO, MM (primary — Marketing Requests), PC.
- **Permissions**: MM has broad read/write on Marketing-Request-linked owners; others scoped to their own relationships.
- **Required data**: Owner (contact info, linked properties, open Marketing Requests count).
- **Primary actions**: create owner, open owner (→ OWN-02).
- **Secondary actions**: filter by open Marketing Requests, linked property status.
- **Quick actions**: none dedicated at list level.
- **AI actions**: none at list level.
- **Nav entry**: rail "Owners."
- **Dependencies**: Wallet (Marketing Request tier-gating), Properties.
- **States**: Empty → guided explanation (owners are created via listing or Marketing Request in the common case, not usually manual-first). Loading → skeleton. Error → standard. Success → standard list, open Marketing Requests visually flagged.
- **Accessibility**: standard list pattern.

### OWN-02 — Owner Detail
- **Purpose**: single canonical record per owner interaction.
- **Primary user**: same as OWN-01.
- **Permissions**: same as OWN-01.
- **Required data**: Owner core, linked Properties, Marketing Requests (OWN-03 content embedded here as a tab).
- **Primary actions**: edit contact info, respond to Marketing Request, create listing on owner's behalf.
- **Secondary actions**: merge/split (per WF-OWNER-NEW recovery path), archive.
- **Quick actions**: none additional.
- **AI actions**: Marketing Requests matched to broker capacity/specialty (surfaced as recommendation, not generated here).
- **Nav entry**: from OWN-01, TODAY-01 (Marketing Request entries), Global Search.
- **Dependencies**: Properties, Wallet.
- **States**: Loading → skeleton. Error → standard. Success → Marketing Request tab shows Won/Lost-with-reason discipline matching Leads.
- **Accessibility**: tab pattern same as PROP-02.

### OWN-03 — Marketing Requests Queue
- **Purpose**: owner-originated requests for marketing/sale assistance — real, monetized, tier-gated. Structurally embedded inside Owners; also derived-surfaced on TODAY-01 (the platform's one deliberate exception to strict single-placement, per `tbos-definition/07_INFORMATION_ARCHITECTURE.md`).
- **Primary user**: MM (primary), PC/SB (their own matched requests).
- **Permissions**: MM sees agency-wide queue; PC/SB see only requests matched/assigned to them.
- **Required data**: Marketing Request records (owner, property context, status, tier eligibility).
- **Primary actions**: claim/respond to request, mark Won/Lost (with reason).
- **Secondary actions**: reassign to a better-matched broker.
- **Quick actions**: none dedicated (reached via Owners or Today, never a rail item of its own).
- **AI actions**: AI-surfaced matching to broker capacity/specialty.
- **Nav entry**: embedded tab in OWN-02; derived entries on TODAY-01 (both point to the same canonical record).
- **Dependencies**: Owners, Wallet (tier gating).
- **States**: Empty → "No open Marketing Requests" (real, not a hidden dead-end — this fixes the current platform's buried/undiscoverable Marketing Requests finding). Loading → skeleton. Error → standard. Success → same Won/Lost-with-reason discipline as Leads.
- **Accessibility**: standard list/tab pattern.

### CONT-01 — Contracts List
- **Purpose**: every deal as a documented, auditable transaction record.
- **Primary user**: OM (primary), AO (oversight), PC (own deals, read).
- **Permissions**: OM full read/write; PC read-only on own; AO full agency-wide.
- **Required data**: Contract (type, stage, linked Lead/Customer/Owner/Property, compliance status).
- **Primary actions**: open contract (→ CONT-02).
- **Secondary actions**: filter by stage (Draft/Pending Compliance/Active/Renewal Due/Closed/Cancelled).
- **Quick actions**: none dedicated (contracts originate from Lead conversion, not manual-first).
- **AI actions**: none at list level.
- **Nav entry**: rail "Contracts."
- **Dependencies**: Leads/Customers/Owners, Automation, Knowledge.
- **States**: Empty → explanatory (no active deals yet). Loading → skeleton. Error → standard. Success → Pending Compliance items visually distinct and linked to their blocking requirement.
- **Accessibility**: standard list pattern.

### CONT-02 — Contract Detail
- **Purpose**: full lifecycle of one contract — negotiation terms, compliance checklist, documents.
- **Primary user**: OM (primary approver), PC (originating deal, read/limited-write), AO (oversight).
- **Permissions**: compliance approval strictly OM/AO-scoped regardless of who originated the deal.
- **Required data**: Contract core, compliance checklist status, documents, linked records.
- **Primary actions**: advance compliance step, approve/activate, generate document.
- **Secondary actions**: renew, cancel (with reason), export.
- **Quick actions**: none additional.
- **AI actions**: Document Intelligence (OCR/extraction, mismatch flagging) — assistive, human-confirmed.
- **Nav entry**: from CONT-01, LEAD-03 (Won trigger), TODAY-01, Global Search.
- **Dependencies**: Automation, Knowledge (compliance guidance links).
- **States**: Draft, Pending Compliance, Active, Renewal Due, Closed, Cancelled — each with explicit blocking-requirement statement where applicable. Loading → skeleton. Error → standard. Success → explicit confirmation on activation stating what's now true (e.g., "Contract active — renewal reminder set for [date]").
- **Accessibility**: compliance checklist is a semantically real checklist (`role="list"` with checked-state per item announced), not a static image/table.

### MKT-01 — Campaigns List
- **Purpose**: outbound campaign/promotion management — distinct from inbound Marketing Requests (OWN-03).
- **Primary user**: MM (primary), SB (lighter version, no approval layer), AO (oversight).
- **Permissions**: MM full write agency-wide; SB full write on own account.
- **Required data**: Campaign (linked inventory, spend, tier, performance snapshot).
- **Primary actions**: create campaign (→ MKT-02), open campaign.
- **Secondary actions**: pause/resume, filter by status/performance.
- **Quick actions**: none dedicated.
- **AI actions**: under-promoted-inventory recommendation feeding campaign creation.
- **Nav entry**: rail "Marketing."
- **Dependencies**: Wallet, Properties/Projects, Analytics.
- **States**: Empty → explanatory with a direct "create your first campaign" CTA. Loading → skeleton. Error → standard. Success → live performance snapshot per campaign (real, not decorative).
- **Accessibility**: standard list pattern.

### MKT-02 — Campaign Create/Detail
- **Purpose**: single flow for creating and later managing a campaign — eligibility checked before inventory-selection UI even renders.
- **Primary user**: MM, SB.
- **Permissions**: same as MKT-01.
- **Required data**: eligible inventory, Wallet balance/quota, spend tier options.
- **Primary actions**: select inventory, select spend tier, launch.
- **Secondary actions**: edit running campaign's budget, pause.
- **Quick actions**: none additional.
- **AI actions**: campaign copy generation.
- **Nav entry**: from MKT-01, TODAY-01 recommendation.
- **Dependencies**: Wallet, Properties/Projects.
- **States**: zero-eligible-inventory → explains why per listing with a direct fix link (never a dead end, per WF-MARKETING-CAMPAIGN). Loading → async spend-check. Error → insufficient-balance state links directly to WAL-02. Success → running-campaign confirmation with attribution link into ANL-01.
- **Accessibility**: inventory multi-select is keyboard-operable with clear selected-count announcement.

### MKT-03 — Content Quality Queue
- **Purpose**: AI-assisted review queue keeping live inventory content-complete.
- **Primary user**: MM (primary); for SB accounts, surfaced directly on TODAY-01/PROP-02 instead (see Journey 4 persona variation).
- **Permissions**: MM agency-wide; owning broker for anything requiring their input.
- **Required data**: Content Quality Score per listing, missing-asset detail.
- **Primary actions**: fix inline (MM-editable fields), assign fix-task to owning broker.
- **Secondary actions**: re-score on demand.
- **Quick actions**: none dedicated.
- **AI actions**: content-quality scoring, fix suggestions.
- **Nav entry**: rail "Marketing" → Content Quality tab.
- **Dependencies**: Properties/Projects, Tasks (assigning fixes).
- **States**: Empty → "All listings meet quality bar" (positive, explicit). Loading → skeleton. Error → standard. Success → score trend visible per listing over time.
- **Accessibility**: standard queue/list pattern.

---

## Intelligence & Control layer

### FIN-01 — Finance Overview
- **Purpose**: revenue/commission reporting derived from closed Contracts — not general-ledger accounting (explicit non-goal, `tbos-definition/20_NON_GOALS.md` #1).
- **Primary user**: AO (primary), OM (scoped).
- **Permissions**: AO full; SM/MM/PC no default access (grantable).
- **Required data**: derived from Contracts (read-only aggregation).
- **Primary actions**: view breakdown by agent/period/property-type.
- **Secondary actions**: export.
- **Quick actions**: none.
- **AI actions**: AI Insights narrative on revenue trend anomalies.
- **Nav entry**: rail "Finance" (Intelligence group, collapsed by default below AO).
- **Dependencies**: Contracts.
- **States**: Empty → "No closed deals yet" explanatory. Loading → skeleton. Error → standard. Success → every figure real-time-accurate or explicitly as-of timestamped (Design Principle "Trust").
- **Accessibility**: financial tables have real header/data cell association (`<th scope>`), never a styled-only grid.

### WAL-01 — Wallet Overview
- **Purpose**: spendable-balance layer — package/quota entitlements, credit balance. Daily-relevant, foundational/leaf module.
- **Primary user**: All (view own balance); AO/SM manage team allocation.
- **Permissions**: view own always available; agency-wide balance view is AO-scoped.
- **Required data**: Package/Subscription, Credit Balance, Quota Usage.
- **Primary actions**: view balance/usage, top up, change tier (→ WAL-02).
- **Secondary actions**: view transaction history.
- **Quick actions**: none dedicated (Wallet is checked reactively from other flows, e.g., MKT-02's balance check).
- **AI actions**: tier-recommendation nudge based on usage pattern.
- **Nav entry**: rail "Wallet."
- **Dependencies**: none (foundational — everything else depends on it).
- **States**: no tier ever shows "no data found" — every advertised tier has real content (binding rule from `tbos-definition/16_MODULE_SPECIFICATIONS.md`). Loading → skeleton. Error → standard. Success → real-time balance, never stale without an as-of flag.
- **Accessibility**: balance figures are plain text (not canvas-rendered numbers), screen-reader legible.

### WAL-02 — Package/Subscription Detail & Upgrade
- **Purpose**: change tier, view entitlement detail, complete payment.
- **Primary user**: AO, SB.
- **Permissions**: AO/SB only (billing-adjacent, not delegated by default).
- **Required data**: available tiers, current entitlement, payment method.
- **Primary actions**: select tier, confirm upgrade/downgrade, update payment method.
- **Secondary actions**: view invoice history.
- **Quick actions**: none.
- **AI actions**: none (financial/regulated action — no AI in the payment path).
- **Nav entry**: from WAL-01, or a deep link from an insufficient-balance error elsewhere (e.g., MKT-02).
- **Dependencies**: WAL-01.
- **States**: Loading → real payment-processing state shown async, never a frozen screen (Design Principle "Speed"). Error → plain-language failure reason, retry path, never raw gateway error text. Success → explicit confirmation stating new entitlement effective date.
- **Accessibility**: payment form fields have real labels and error announcements, no placeholder-as-label anti-pattern.

### ANL-01 — Analytics Explorer
- **Purpose**: exploratory, real-time "how am I doing" layer with Explainability-backed metrics — distinct from Reports (generated artifacts).
- **Primary user**: AO, SM, MM, OM (each scoped to their domain); PC personal-metrics view.
- **Permissions**: RBAC-scoped per persona (per `07_INFORMATION_ARCHITECTURE.md` visibility table).
- **Required data**: query layer over every other module (read-only).
- **Primary actions**: explore a metric, drill into its Explainability detail.
- **Secondary actions**: save a view, export to Reports (→ RPT-02).
- **Quick actions**: none.
- **AI actions**: AI Insights narrative layer behind every metric — the primary AI surface for this module.
- **Nav entry**: rail "Analytics."
- **Dependencies**: every module (read-only).
- **States**: insufficient-data → explicit "not enough data yet" message, never a fabricated chart (binding rule). Loading → skeleton chart shapes. Error → per-widget graceful degradation. Success → every metric traces to real underlying data, satisfying the Explainability contract on demand.
- **Accessibility**: every chart has a text-equivalent data table alternative, not chart-only presentation.

### RPT-01 — Reports List
- **Purpose**: generated, exportable, shareable documents — the artifact counterpart to Analytics' live exploration.
- **Primary user**: AO (primary), OM (compliance-focused reports).
- **Permissions**: same RBAC scoping as Analytics.
- **Required data**: Report (generated artifact, schedule, recipients).
- **Primary actions**: generate on-demand, open report.
- **Secondary actions**: schedule recurring, manage recipients.
- **Quick actions**: none.
- **AI actions**: none at list level.
- **Nav entry**: rail "Reports."
- **Dependencies**: Analytics.
- **States**: generation-in-progress vs. ready vs. failed-with-retry, never silent failure (binding rule). Loading → real progress indicator for long-running generation. Error → visible failed state with retry, escalating to a support path if retry also fails. Success → ready report with delivery confirmation to recipients.
- **Accessibility**: standard list pattern; generated PDF/export outputs must themselves be screen-reader-accessible where technically feasible (tagged PDF), noted as an implementation requirement.

### RPT-02 — Report Detail/Builder
- **Purpose**: view a generated report, or compose a custom one from the same metrics as Analytics.
- **Primary user**: AO, OM.
- **Permissions**: same as RPT-01.
- **Required data**: same metric layer as ANL-01.
- **Primary actions**: compose/edit report structure, export, share.
- **Secondary actions**: duplicate as template.
- **Quick actions**: none.
- **AI actions**: plain-language narrative summary accompanying charts, traceable to real data.
- **Nav entry**: from RPT-01, or "export to Reports" action on ANL-01.
- **Dependencies**: Analytics.
- **States**: same failure/success pattern as RPT-01.
- **Accessibility**: same as RPT-01.

### AUTO-01 — Automation Rules List
- **Purpose**: visible, editable configuration surface for lead-routing, renewal reminders, auto-follow-ups, etc. — never hidden in code or Settings.
- **Primary user**: AO, SM (team-scoped rules), OM (compliance-related rules).
- **Permissions**: creating/editing a rule requires management scope over the domain it touches.
- **Required data**: Automation Rule (trigger, condition, action, last-run status).
- **Primary actions**: enable/disable rule, edit rule (→ AUTO-02), view last-run outcome.
- **Secondary actions**: view full run history.
- **Quick actions**: none.
- **AI actions**: none in the routing/reminder logic itself (deterministic by design); AI may draft the plain-language "why" explanation for a run.
- **Nav entry**: rail "Automation."
- **Dependencies**: Notifications, every workflow-bearing module.
- **States**: every rule shows last-run status and outcome (binding rule). Loading → skeleton. Error → a failed automation surfaces as a visible incident here, not a silent gap. Success → clear enabled/disabled state, never ambiguous.
- **Accessibility**: toggle switches use real `role="switch"`/`aria-pressed`, announcing state.

### AUTO-02 — Automation Rule Editor
- **Purpose**: configure a single rule's trigger/condition/action/threshold.
- **Primary user**: same as AUTO-01.
- **Permissions**: same as AUTO-01.
- **Required data**: rule schema, available triggers/actions for the user's RBAC scope.
- **Primary actions**: set condition/threshold, save, test (dry-run where feasible).
- **Secondary actions**: view which records this rule has affected historically.
- **Quick actions**: none.
- **AI actions**: none (deterministic logic by design, per Automation Strategy guardrail).
- **Nav entry**: from AUTO-01.
- **Dependencies**: AUTO-01.
- **States**: Loading → skeleton form. Error → inline validation. Success → confirmation stating when the rule takes effect.
- **Accessibility**: form fields fully labeled; threshold inputs have explicit units in their label, not just a placeholder.

### AICP-01 — AI Copilot Conversation
- **Purpose**: thin, dedicated surface for open-ended requests — the one legitimate reason to visit AI as a destination (Philosophy Principle #3 exception).
- **Primary user**: All.
- **Permissions**: conversation scoped to the user's own RBAC visibility — Copilot never answers with data the user couldn't otherwise see.
- **Required data**: conversation history, grounding content from Knowledge, live query access to permitted modules.
- **Primary actions**: ask a question, request an action (with confirmation step for anything consequential).
- **Secondary actions**: view/continue past conversations.
- **Quick actions**: none (this screen is itself reached for open-ended needs, not a shortcut target).
- **AI actions**: this entire screen is the AI action; every response cites its grounding source and shows confidence.
- **Nav entry**: rail "AI Copilot."
- **Dependencies**: Knowledge (grounding), every module (read, RBAC-scoped).
- **States**: Empty → suggested starter prompts relevant to the persona's role. Loading → visible "thinking" state for anything >~300ms per Design Principle "Loading philosophy." Error → graceful fallback message, never a broken chat bubble. Success → response with confidence + source citation.
- **Accessibility**: conversation is a live region (`aria-live="polite"`) so screen-reader users get streamed responses announced without losing focus position.

### AICP-02 — AI Action Audit Log
- **Purpose**: reviewable record of every AI action taken on the broker's behalf across all embedding points — the concrete implementation of the Explainability contract applied to AI specifically, and the primary tool for Operations Manager's audit needs.
- **Primary user**: All (own actions); OM/AO (agency-wide audit).
- **Permissions**: own-scope always visible; agency-wide requires OM/AO.
- **Required data**: AI Action Log entries (what, where, when, confidence, outcome, human-review status).
- **Primary actions**: review an entry, flag as incorrect (feeds model/prompt improvement signal).
- **Secondary actions**: filter by module/date/confidence.
- **Quick actions**: none.
- **AI actions**: N/A — this screen is the audit surface, not an AI actor itself.
- **Nav entry**: tab within AI Copilot (AICP-01), or direct link from a "why did AI do this" prompt anywhere else in the product.
- **Dependencies**: every module (read, as the source of logged actions).
- **States**: Empty → "No AI actions yet" (only for brand-new accounts). Loading → skeleton. Error → standard. Success → every entry satisfies the five-question Explainability contract.
- **Accessibility**: log is a real table with sortable columns, keyboard-operable sort controls.

### NOTIF-01 — Notification Center
- **Purpose**: timeline of every notification the broker has received in-app; unread count must always be real (binding rule, direct fix for the confirmed "0" badge defect).
- **Primary user**: All.
- **Permissions**: own notifications only.
- **Required data**: Notification (type, channel, read state, timestamp, source link).
- **Primary actions**: open notification (deep-links to source), mark read/unread.
- **Secondary actions**: mark all read, filter by type.
- **Quick actions**: bottom-tab entry on mobile ([02](02_NAVIGATION_BLUEPRINT.md) §3).
- **AI actions**: none in the mechanism; AI-generated content may be *displayed* here (e.g., an AI action notification).
- **Nav entry**: rail bell icon (desktop/tablet top bar), bottom tab (mobile).
- **Dependencies**: every module (event sources).
- **States**: Empty → "You're all caught up" — same tone as TODAY-01's empty state for consistency. Loading → skeleton. Error → a failed-delivery notification is itself visible here, never silently dropped (anti-fatigue rule #5). Success → count always matches real unread state.
- **Accessibility**: unread items announced with `aria-live` on arrival if the panel is open; bell icon badge has a real accessible name ("3 unread notifications"), not just a visual number.

### NOTIF-02 — Notification Preferences
- **Purpose**: per-type channel opt-in/out, never all-or-nothing.
- **Primary user**: All.
- **Permissions**: own preferences only.
- **Required data**: Preference (per-type channel toggle).
- **Primary actions**: toggle a channel for a given notification type.
- **Secondary actions**: view why a type is locked (safety/compliance-critical types are re-channelable but never fully disable-able).
- **Quick actions**: none.
- **AI actions**: none.
- **Nav entry**: from NOTIF-01, or Settings.
- **Dependencies**: NOTIF-01.
- **States**: Loading → skeleton form. Error → inline. Success → immediate confirmation, no save button ambiguity (each toggle saves on change).
- **Accessibility**: every toggle is a real switch control with state announced.

### KB-01 — Knowledge Home/Search
- **Purpose**: compliance guidance, platform help, explanatory content — also the AI grounding-content source, so AI and human help content never contradict.
- **Primary user**: All.
- **Permissions**: read-only for all; content authored by an internal content team (out of broker-facing RBAC scope).
- **Required data**: Article, FAQ.
- **Primary actions**: search, browse by category, open article (→ KB-02).
- **Secondary actions**: bookmark.
- **Quick actions**: none.
- **AI actions**: this content is what AI cites — Knowledge itself has no embedded AI generation.
- **Nav entry**: rail "Knowledge."
- **Dependencies**: none (foundational/leaf).
- **States**: Empty (zero search results) → suggests related articles/broadened query, never a bare "no results" (per [10_SEARCH_EXPERIENCE.md](10_SEARCH_EXPERIENCE.md)). Loading → skeleton. Error → standard. Success → standard content list.
- **Accessibility**: article content follows real heading hierarchy for screen-reader navigation.

### KB-02 — Knowledge Article Detail
- **Purpose**: single article/explanation, deep-linked from Explainability "why" answers platform-wide.
- **Primary user**: All.
- **Permissions**: read-only.
- **Required data**: single Article.
- **Primary actions**: read, navigate to related articles.
- **Secondary actions**: bookmark, share link.
- **Quick actions**: none.
- **AI actions**: none.
- **Nav entry**: from KB-01, or any Explainability "learn more" deep link elsewhere.
- **Dependencies**: KB-01.
- **States**: Loading → skeleton. Error → standard. Success → standard article render.
- **Accessibility**: same as KB-01.

### SET-01 — Account & Profile
- **Purpose**: personal account settings.
- **Primary user**: All.
- **Permissions**: own profile only.
- **Required data**: user profile fields.
- **Primary actions**: edit profile, change password, manage 2FA.
- **Secondary actions**: manage connected devices/sessions.
- **Quick actions**: none.
- **AI actions**: none.
- **Nav entry**: rail "Settings" default tab.
- **Dependencies**: none.
- **States**: Loading → skeleton form. Error → inline validation. Success → immediate confirmation.
- **Accessibility**: standard form pattern.

### SET-02 — Team & Roles (RBAC configuration)
- **Purpose**: the real RBAC surface — role creation, scoped permission assignment. Foundational module every other module's access model depends on; Phase 1 build priority.
- **Primary user**: AO (primary), SB (n/a, single-user).
- **Permissions**: AO-only by default (an agency's highest-trust screen).
- **Required data**: Role definitions, permission scopes, team member assignments.
- **Primary actions**: create role, assign permissions, assign team member to role.
- **Secondary actions**: view role's effective permission list in plain language (not a raw 40-toggle grid — explicit non-goal §3, `20_NON_GOALS.md`).
- **Quick actions**: none.
- **AI actions**: none (a regulated-adjacent, high-trust configuration surface — no AI in the permission-grant path).
- **Nav entry**: rail "Settings" → Team & Roles.
- **Dependencies**: none (foundational — every module's RBAC depends on it).
- **States**: a role cannot be deleted while assigned to an active user without explicit reassignment (binding rule). Loading → skeleton. Error → standard. Success → explicit confirmation of what changed and who's affected.
- **Accessibility**: permission-scope selection uses grouped, labeled checkboxes/radio patterns, never a bare data grid with no row/column headers.

### SET-03 — Integrations
- **Purpose**: manage third-party/government integration credentials and connections (distinct from SET-04's compliance-document focus).
- **Primary user**: AO, OM.
- **Permissions**: AO/OM-scoped.
- **Required data**: Integration credential status.
- **Primary actions**: connect/disconnect an integration, view connection health.
- **Secondary actions**: view integration-specific logs.
- **Quick actions**: none.
- **AI actions**: none.
- **Nav entry**: rail "Settings" → Integrations.
- **Dependencies**: none.
- **States**: Loading → skeleton. Error → connection-failure state explains the specific failure (never a generic "disconnected"). Success → confirmed-connected state with last-sync timestamp.
- **Accessibility**: standard form/list pattern.

### SET-04 — Compliance Documents
- **Purpose**: Nafath/FAL/REGA credentials and documents — the home of WF-COMPLIANCE and WF-RENEWAL's document-facing steps.
- **Primary user**: OM (primary), SB, AO.
- **Permissions**: OM full read/write agency-wide; SB own; AO oversight.
- **Required data**: compliance credentials/documents, expiry dates, verification status.
- **Primary actions**: submit/renew a document, view verification status.
- **Secondary actions**: view dependent-listings impact (per `product-audit/32_FEATURE_DEPENDENCY_GRAPH.md`'s license-cascade finding).
- **Quick actions**: "Submit Compliance Document" (QA-01) lands here.
- **AI actions**: Document Intelligence (OCR/extraction pre-fill, mismatch flagging).
- **Nav entry**: rail "Settings" → Compliance Documents; also reachable from TODAY-01 renewal entries.
- **Dependencies**: Knowledge (guidance links).
- **States**: full compliance-lifecycle set (see [06](06_STATE_ARCHITECTURE.md)) — never a checkbox-only exercise, always a guided checklist. Loading → skeleton. Error → specific mismatch explanation, never generic rejection. Success → confirmed status with next-renewal date set automatically.
- **Accessibility**: document upload has a keyboard-operable file picker and clear format/size requirements stated before upload attempt, not discovered on failure.

---

## Cross-cutting overlays (no fixed nav slot — see [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md))

### GS-01 — Global Search Results
- **Purpose**: primary navigation method for any list beyond a handful of items; spans every entity. Full spec: [10_SEARCH_EXPERIENCE.md](10_SEARCH_EXPERIENCE.md).
- **Primary user**: All.
- **Permissions**: results RBAC-filtered identically to direct module navigation.
- **Required data**: search index across Properties, Projects, Leads, Customers, Owners, Contracts (+ Knowledge for help queries).
- **Primary actions**: select a result → navigate to its canonical screen.
- **Secondary actions**: filter results by type, save search (live subscription).
- **Quick actions**: search box doubles as Command Palette entry (`>` prefix).
- **AI actions**: NL-to-structured-query translation.
- **Nav entry**: top-bar search (desktop/tablet), "Search" tab (mobile), global keyboard shortcut.
- **Dependencies**: every module (read, RBAC-scoped).
- **States**: zero-results → suggests broadened query/nearest matches, never bare "no results." Loading → inline spinner within the search field (not full-page). Error → standard. Success → results explain *why* they matched when the match isn't literal (semantic/AI match), per Explainability applied to search.
- **Accessibility**: results list is keyboard-navigable (arrow/Enter) with live region announcing result count as the query changes.

### QA-01 — Quick Actions panel
- **Purpose**: 2-tap capture of the top-4 JTBD-ranked actions.
- **Primary user**: All (RBAC may reduce to 3 of 4, never shows a disabled 4th).
- **Permissions**: per-action, inherited from the target module's create-permission.
- **Required data**: minimal — just enough to create a stub record, full detail completed on the target screen if needed.
- **Primary actions**: Add Lead, Add Property, Log Follow-up, Submit Compliance Document.
- **Secondary actions**: none — this panel is intentionally minimal (Minimalism principle).
- **Quick actions**: N/A — this *is* the Quick Actions screen.
- **AI actions**: none in the panel itself (any AI assistance happens after landing on the target screen).
- **Nav entry**: elevated center mobile tab, top-bar button (desktop/tablet), number-key shortcut while open.
- **Dependencies**: Leads, Properties, Tasks, Settings→Compliance Documents.
- **States**: Loading → N/A (panel opens instantly, no data fetch required to render the 4 options). Error → if a target module's quota/permission blocks the action, the option shows why inline rather than failing after tap.
- **Accessibility**: panel traps focus, each action is a real button with a descriptive accessible name (not icon-only with no label).

### CMD-01 — Command Palette
- **Purpose**: keyboard-power-user superset of Global Search — plain query returns results, `>` prefix returns actions. See [02_NAVIGATION_BLUEPRINT.md](02_NAVIGATION_BLUEPRINT.md) §8.
- **Primary user**: All (keyboard-first users especially — AO/OM/SM doing high-volume daily triage).
- **Permissions**: same as GS-01, plus command list is RBAC-scoped (a command with no permission doesn't appear, rather than appearing disabled).
- **Required data**: same as GS-01 + a registered command list.
- **Primary actions**: execute a command, or fall through to search result selection.
- **Secondary actions**: none.
- **Quick actions**: N/A — this is itself an accelerator layer.
- **AI actions**: same NL-parsing as GS-01.
- **Nav entry**: same trigger as GS-01 (same surface, two modes).
- **Dependencies**: GS-01.
- **States**: same as GS-01, plus an empty command list for a query with no valid `>` match shows the nearest valid commands, never a bare dead end.
- **Accessibility**: same as GS-01; mode switch (`>`) is announced to screen readers when triggered.

### ONB-01 — Guided Onboarding
- **Purpose**: replace a blank dashboard for a new account with a guided first-use path (explicit requirement on HOME-01/PROP-01/etc.'s Empty states).
- **Primary user**: SB, AO (account creator).
- **Permissions**: N/A (pre-data account state).
- **Required data**: none yet — this screen exists because none exists.
- **Primary actions**: complete first meaningful setup step (e.g., create first Property, invite first team member).
- **Secondary actions**: skip a step (never blocks progress, but never hides that it was skipped).
- **Quick actions**: N/A.
- **AI actions**: none required.
- **Nav entry**: automatically shown in place of HOME-01/module-Empty-states for a genuinely new account; not a separate rail item.
- **Dependencies**: none.
- **States**: this screen *is* an empty-state resolution — it has no further Empty state of its own. Loading → skeleton. Error → standard. Success → transitions to the normal module view once real data exists.
- **Accessibility**: standard form/wizard pattern.

---

## Platform Console (ADM only — architecturally separate; behavioral detail intentionally light this phase, see [18_OPEN_QUESTIONS.md](18_OPEN_QUESTIONS.md))

Per `tbos-definition/06_PRODUCT_ARCHITECTURE.md`, Platform Console is scoped but "not detailed this phase" at the product-definition layer, and per `tbos-definition/19_PRODUCT_ROADMAP.md` its expansion sits in Phase 6. Consistent with that, these five screens get purpose/user/permissions/nav-entry only — full field-level detail (states, components, AI actions) is deferred as an explicitly named open item, not silently skipped.

| ID | Purpose | Primary user | Permissions | Nav entry |
|---|---|---|---|---|
| PC-01 | Review flagged listings/users | ADM | Platform Console session only | Console home |
| PC-02 | Maintain reference data (cities, categories, property types, districts) | ADM | Platform Console session only | Console nav |
| PC-03 | Platform-wide compliance oversight | ADM | Platform Console session only | Console nav |
| PC-04 | Escalated support/compliance issue handling | ADM | Platform Console session only | Console nav |
| PC-05 | Platform-level configuration | ADM | Platform Console session only | Console nav |

None of PC-01–05 ever appears in a Broker OS nav tree, breadcrumb, search result, or notification — architectural isolation is absolute (Constitution Article V).
