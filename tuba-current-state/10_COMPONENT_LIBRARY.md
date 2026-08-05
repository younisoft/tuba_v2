# 10 — Component Library Audit

**Status**: Observed (direct read of `resources/views/components/*.blade.php`, `resources/views/login_layout/*.blade.php`). Live rendering/interaction states (hover, focus, error, loading) pending browser confirmation.

**Headline finding**: Tuba has no real component library. Laravel's Blade Component system (`resources/views/components/`) is used for exactly **6** small, single-purpose files. Everything else that functions as a "component" in practice — headers, footers, sidebars, cards, modals, tables — is a plain Blade `@include`/`@extends` partial with no formal props contract, no variant system, and frequently copy-pasted rather than parameterized (the July audit's `04_AGENT_DASHBOARD.md` documented six near-duplicate modals on the agent dashboard alone).

---

## 1. Formal Blade Components (`resources/views/components/`)

| Component | Purpose | Variants | Reusability | Notes |
|---|---|---|---|---|
| `og-meta.blade.php` | Open Graph meta tags | None | Used on ≥2 pages (single-property page, single-agent page) | Hardcodes `og:type = profile` in its fallback branch even for non-profile content — a confirmed bug (see [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md)) that was only partially fixed. |
| `pagination-info.blade.php` | "Showing X–Y of Z results" text | None | Single-use pattern, could be reused across every listing table but isn't consistently | |
| `payment-modal.blade.php` | Payment method selection modal (Mada/Visa/Mastercard/STC Pay) | None | Single instance | Tabby option is commented out in the markup (`<!-- tabby -->` block disabled) despite Tabby being a live, integrated payment method elsewhere in the codebase — a UI/backend mismatch. |
| `post_a_listing_modal.blade.php` | "Post a listing" CTA modal | None | Single instance | |
| `whatsapp-icon.blade.php` | Floating WhatsApp contact icon, agent-role-gated | None | Single instance | Contains a hardcoded literal WhatsApp business number in the template rather than a config/settings value — a maintainability smell (changing the number requires a code deploy). |
| `why-choose-us-ad-cards.blade.php` | Marketing card grid | None | Single instance (home page) | |

None of the six declare a `{{ $slot }}`-based composition pattern or typed props (`@props([...])`) beyond the bare minimum — they are effectively static includes, not a parameterized component API.

## 2. De facto "components" (shared layout partials, not formal Blade components)

| Partial | Role | Reusability observation |
|---|---|---|
| `login_layout/master.blade.php` | Base authenticated-area layout | Single shared shell for both admin CMS and agent dashboard |
| `login_layout/header.blade.php` / `home-header.blade.php` | Public site headers | Two separate header files rather than one parameterized header — a duplication, not a variant system |
| `login_layout/admin-header.blade.php` / `admin-sidebar.blade.php` / `admin-footer.blade.php` | Authenticated dashboard chrome | Flat, ungrouped sidebar (see [03_INFORMATION_ARCHITECTURE.md](03_INFORMATION_ARCHITECTURE.md)) |
| `login_layout/footer.blade.php` | Public site footer | Contains a non-functional Mailchimp newsletter form (no `action`, no JS handler) and placeholder `href="#"` social icons on at least one other page (`contact.blade.php`) that doesn't match the real, working footer icons — inconsistent, not componentized, so the same "social icons" concept is implemented at least twice with different fidelity |
| `login_layout/header-scripts.blade.php` / `footer-scripts.blade.php` | Global script includes | Not components in any framework sense — a monolithic script-tag dump (17+ unbundled `<script>` tags), loaded on every page regardless of whether that page's JS is needed |
| `login_layout/notification-items.blade.php` | Notification list item template | Reused for the notification bell dropdown |
| Modal markup inside `admin/agent_dashboard.blade.php` | Multiple settings/action modals | July audit documented **six near-duplicate modals** in this single 1,198-line file — a strong candidate for componentization that has not been done |

## 3. Cards, Tables, Forms, Buttons (pattern-level, not component-level)

- **Cards** (property cards, agent cards, package cards): implemented as repeated HTML/Blade blocks inline in each listing view, not as a shared `<x-property-card>`-style component — the same visual card is hand-copied per context (home page featured listings, search results, agent's-properties page, favorites page) with no single source of truth, meaning a visual change to "how a property card looks" currently requires editing multiple files.
- **Tables**: admin/agent dashboard tables (Properties, Projects, Agents, Users, Property Requests, etc.) are each hand-built Blade tables with Bootstrap classes; no shared data-table component (sorting, pagination-info integration, empty-state) — `pagination-info.blade.php` exists but its adoption across all these tables was not confirmed consistent.
- **Forms**: no shared form-field/input-group component; every form (property create/edit, project create/edit, agent settings, etc.) hand-writes its own `<div class="form-group">` markup, error-display pattern, and validation-message placement — the July audit's `07_UI_UX_REVIEW.md` documented inconsistent form styling across modules as a direct consequence of this.
- **Buttons**: no button component; classes like `btn-thm2`, `btn-log`, `btn-fpswd`, `btn-fb`, `btn-googl` appear as ad hoc, page-specific button styles in `style.css` rather than a small, reusable button variant set (primary/secondary/danger/ghost).

## 4. Accessibility of existing components (spot-checked)

- The payment modal and post-a-listing modal were not confirmed to trap focus or restore it on close (needs live confirmation).
- The buy/rent/sold pill toggle (`front-end/home/index.blade.php`) uses genuine `<button>` elements — correctly keyboard-focusable — but sets no `aria-pressed`/`role="switch"` state, so screen-reader users get no indication of which option is currently active.
- No `aria-live` region exists anywhere on the live search page, meaning the AJAX-driven list/map refresh (the platform's most-used interaction) announces nothing to assistive technology when results change.

## 5. What this means for a next-generation system

There is effectively no component library to migrate — six small Blade components and a large body of copy-pasted, non-parameterized layout/card/table/form markup. This is not a criticism unique to Tuba: neither Bayut nor Aqar's audits found a mature, documented component system either (both are template-driven Blade/PHP-equivalent stacks with ad hoc styling). But it does mean a next-gen Broker OS's component library is a **greenfield build**, not a migration — the one thing worth deliberately carrying forward is the RTL-aware asset-pairing discipline noted in [09_DESIGN_SYSTEM.md](09_DESIGN_SYSTEM.md), applied this time at the component level (i.e., components that flip direction/alignment via a prop or CSS logical properties, rather than a second parallel file per component).
</content>
