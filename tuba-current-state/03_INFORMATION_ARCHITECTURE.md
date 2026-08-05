# 03 — Information Architecture

**Status**: Observed (source-code read: `routes/web.php`, `routes/api.php`, `resources/views/login_layout/header.blade.php`, `resources/views/login_layout/admin-sidebar.blade.php`). Live-browser confirmation of actual rendered navigation/discoverability is pending — see [18_SCREENSHOT_INDEX.md](18_SCREENSHOT_INDEX.md).

---

## 1. Top-level site map (public + authenticated, as routed)

```
tuba.com.sa/
├─ / (home — search box, popular locations, featured listings)
├─ buy | rent | search              (status-wise property listing, legacy route)
├─ properties/listing               (live "all-properties-listing" — dev-named "test" controller)
├─ test/properties                  (AJAX data source for the above)
├─ map-test, map-test-property       (map-search views)
├─ property/{slug}                  (property detail)
├─ view/project/{slug}               (project detail — no dedicated project LISTING/search page found; see 02_PRODUCT_INVENTORY §1)
├─ agent-detail-{id}                  (public agent profile)
├─ agent-properties/{id}/{type}
├─ agents-listing-ajax
├─ services/  (resource)
├─ newsrooms/ (resource)
├─ faq
├─ contact
├─ about-us
├─ support-center
├─ neighborhood
├─ featured-project-details
├─ single-package                   (pricing page)
├─ terms-conditions, privacy-policy, terms-of-advertising, copyright
├─ download                         (app download page)
├─ agent-register, agent-login       (agent onboarding, separate from customer auth flows)
└─ /dashboard  (authenticated — role-branches at render time, see below)
    ├─ [role: User/customer]  → customerProfile view
    └─ [role: Agent/AgentUser/SuperAdmin/other] → admin.agent_dashboard OR admin.dashboard
         (same URL, same controller method, different Blade view — no distinct URL space
          for "admin panel" vs "agent dashboard"; see 11_TECHNICAL_ARCHITECTURE.md §3)
```

**Structural observation**: there is exactly one authenticated destination URL (`/dashboard`) for three functionally distinct personas (customer, agent/broker, internal admin/staff). Which of ~15+ shared backend modules a given user sees is entirely a client-side/Blade-level `@can()` decision, not a URL-level one. This is architecturally the opposite of the TBX principle "one home per capability" recommended in the Bayut/Aqar synthesis — here it's "one URL, many capabilities, resolved invisibly by role."

## 2. Public site navigation (as rendered in `header.blade.php`)

Confirmed (per verification pass C) that the header nav currently contains, in order:
1. **Buy/Rent** → `all-properties-listing`
2. **Services**
3. **Newsrooms**
4. **Login / Register**

No "Projects" link exists in the current header — consistent with the project-listing/search surface appearing to have been removed since the July audit (see [02_PRODUCT_INVENTORY.md](02_PRODUCT_INVENTORY.md)). This should be re-confirmed live: if genuinely removed, the only way a visitor reaches a Project at all is a direct link to `view/project/{slug}` (e.g., from a shared link or an agent's public profile), with no on-site discovery path.

## 3. Authenticated dashboard navigation (`admin-sidebar.blade.php`)

The sidebar is a **single, flat, un-nested list** covering all ~27 Backend modules regardless of whether the logged-in user is an internal admin or a paying agent — visibility of each item is governed by `@can('<permission>')` checks against Spatie permissions. Modules observed in the sidebar include (grouped here by apparent function, not by any grouping present in the source, which has none):

- **Listings**: Properties, Projects
- **CRM/Leads**: Property Requests, Agent Inbox, Favorites
- **Commerce**: Packages, License Packages, Single Packages, Developer Packages, Payment/Billing history
- **People**: Agents, Agent Users (sub-users), Users (customers), Roles
- **Content**: Newsrooms, Services, FAQs, Page SEO
- **Reference data**: Countries, Regions, Cities, Districts, Categories, Property Types, Ban Numbers, Contact Us submissions
- **Compliance**: Nafath Verification, FAL License
- **Account**: My Profile, Account Settings, Notifications

**Confirmed defect**: three sidebar links (`packages-list`, `license-packages-list`) check permission strings that do not match what the corresponding controllers/seeder actually enforce (`package-list`, `license-package-list`) — these links are **permanently invisible** to any role except SuperAdmin, regardless of what that role's permissions actually grant. This is a navigation-level bug, not just a permissions bug: a correctly-permissioned Agent literally cannot see the entry point to a feature they're allowed to use.

No grouping, no collapsible sections beyond whatever generic accordion markup exists, and no distinction in the navigation between "things an internal admin needs" and "things a paying broker needs" — both personas scroll the same flat list, filtered only by which `@can()` checks happen to pass.

## 4. Feature hierarchy (functional grouping, independent of navigation as-rendered)

```
Tuba Platform
├─ Discovery (public)
│  ├─ Search & Map          [Eloquent scope chain, no relevance engine]
│  ├─ Property Detail
│  ├─ Project Detail        [Project LISTING/search surface appears removed]
│  ├─ Agent Directory / Public Profile
│  └─ Content (Services, Newsroom, FAQ)
├─ Lead Generation
│  ├─ Property Request (broadcast to matched agents)   [notification routing bug]
│  └─ Agent Inbox Request (direct contact)              [one-way, no reply]
├─ Broker Operations (agent dashboard == admin CMS, same code)
│  ├─ Listing Management (Property, Project CRUD)
│  ├─ Lead Management (flat list, no pipeline/stages)
│  ├─ Package/Billing (Package, License Package, Single Package + Payment/Tabby/HyperPay)
│  ├─ Sub-user Management (Agent Users)
│  ├─ Compliance (Nafath, FAL License)
│  └─ Analytics (one real report: Rent Now Click)
├─ Internal Admin
│  ├─ Reference Data (Countries→Regions→Cities→Districts, Categories, Property Types)
│  ├─ Access Control (Roles — no Policies, inconsistent permission gating)
│  ├─ Content Management (Page SEO, Newsrooms, Services, FAQs)
│  └─ Moderation (Ban Numbers, Contact Us)
└─ Mobile API (separate surface, same data model)
   ├─ Customer app endpoints (/user/*)
   └─ Agent app endpoints (/agent/*)
```

## 5. Workflow hierarchy (cross-cutting, spans multiple modules — see [06_WORKFLOW_ANALYSIS.md](06_WORKFLOW_ANALYSIS.md) for live-verified detail)

1. **Agent onboarding** → register → OTP verify (bypassable — Critical) → Nafath verification → FAL license submission → package selection/payment → listing creation.
2. **Listing creation** → dual form UI exists (`?chk=1` routes to a legacy `old_edit`/`old_add` form alongside the current one) → media upload (currently likely broken, see [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §0) → AI description generation (Property only) → publish.
3. **Lead handling** → buyer submits PropertyRequest or AgentInboxRequest → one-way notification (with a misrouting bug on the PropertyRequest path) → agent can view/offer, but not reply in-platform → no accept/reject/close loop (`PropertyRequestOffer` fields exist, unused).
4. **Payment/entitlement** → package selection → HyperPay (TLS-disabled) or Tabby (unauthenticated-fulfilment) → entitlement/quota update via `PaymentService` (no DB transactions) → receipt (PDF service dependency currently absent).

## 6. IA-level findings

- **No URL-level tenant/role separation** is the single most consequential IA fact about this platform — every other admin-vs-agent authorization bug downstream inherits from this one architectural decision.
- **Flat, ungrouped sidebar** at ~27 items with no information scent beyond the label itself — this is the same "one navigation system, but overloaded rather than duplicated" failure mode the TBX synthesis flags as the opposite pole from Aqar's problem (two navigation systems). Tuba doesn't have Aqar's duplication problem, but it has the sibling problem: one navigation system asked to serve three personas without differentiation.
- **A permission-name/navigation-visibility bug** means correct backend authorization does not guarantee a user can find the feature they're authorized to use — worth calling out separately from the RBAC gap in [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md), since fixing RBAC alone would not fix this without also reconciling sidebar `@can()` strings against actual seeded permission names.
- **Possible silent removal of an entire discovery surface** (Project listing/search) is an IA regression worth live-confirming before the next-gen system's IA is designed — if intentional, the Project detail page is now an orphaned destination with no on-site path leading to it.
</content>
