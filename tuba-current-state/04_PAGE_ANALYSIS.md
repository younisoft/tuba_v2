# 04 — Page Analysis

**Status**: Observed (live, authenticated browser session, 2026-08-06, logged in as agent "فهد"/Fahd, company "شركة اسبار"/Esbar). Covers the pages actually walked in this pass — a broader crawl (internal admin/SuperAdmin view, remaining settings/profile pages) was not completed and should be treated as a follow-up, not assumed identical to the agent view documented here. Cross-reference [18_SCREENSHOT_INDEX.md](18_SCREENSHOT_INDEX.md) for visual evidence.

---

## `/dashboard` — Agent Dashboard Home

**Purpose**: Landing page after login; account status + listing/promotion stats + recent listings.

**Observed**:
- Personalized greeting ("هلا, شركة اسبار") and a profile-completion nudge banner ("أوشكت على الانتهاء! أضف المزيد من التفاصيل إلى ملفك الشخصي...") — a genuinely good, present onboarding nudge.
- Six-tile "الإعلانات" (Listings) stat row: Active (2), Pending (0), Sold (1), For Rent (47), For Sale (6), **Ratings and Reviews (0)**. The last tile is confirmed hardcoded — it does not reflect this agent's actual review activity, it is a static `0` regardless of real data, matching the source-code finding exactly.
- Three-tile "الترقيات" (Promotions) row: Basic ad (22), Featured ad (4), Featured Pro ad (2) — these appear to be real counts (they vary meaningfully and align with the promotion-tier data seen later on `/agent-packages`).
- "الإعلانات الأخيرة" (Recent Listings) table — shows only 2 rows regardless of the 53-total listing count seen on `/properties`; functions as a "most recent" widget, not a full listing view.
- Global script error on load (`pricing-slider.js` — see [18_SCREENSHOT_INDEX.md](18_SCREENSHOT_INDEX.md)), and four ad-attribution/analytics pixels fire (Google, Facebook, TikTok, Snapchat) — see [06_WORKFLOW_ANALYSIS.md](06_WORKFLOW_ANALYSIS.md) §5.
- WhatsApp floating icon pre-fills the logged-in agent's own real name into the support message — functions correctly for its stated purpose (contacting Tuba support), confirming the source-code finding about `Auth::user()->name` injection.

## `/properties` — My Properties (Listing Management)

**Purpose**: The agent's property inventory, segmented by status.

**Observed**:
- Seven status tabs with live counts: فعال/Active (2), مسودة/Draft (0), معلق/Pending (0), محذوفة/Deleted (25), مباع/Sold (1), اعلانات منتهية/Expired (20), اعلانات مرفوضة/Rejected (5) — totaling 53, consistent with the dashboard's 47+6 rent/sale split. The sheer weight of Deleted (25) + Expired (20) + Rejected (5) = 50 non-active listings against only 2 currently active is a real signal about this account's listing churn, worth noting for [06_WORKFLOW_ANALYSIS.md](06_WORKFLOW_ANALYSIS.md).
- Filter bar: Tuba reference number, ad-license number, title search, sort dropdown, reset/search buttons, and an additional "فلاتر" (Filters) expandable button — a reasonably complete filter set for a listing table.
- Empty state (Draft tab, 0 results): "لم يتم العثور على عقارات" (No properties found) with an icon whose `alt` text is misspelled ("no propertes"). No inline call-to-action repeated within the empty panel itself (the page-level "Add new property" button above remains the only path forward) — less severe than Aqar's confirmed dead-end pattern, but not a best-practice empty state either.
- Each listing row shows a rich info block: thumbnail, tier badge, title, location, Tuba reference number, ad-license number, publish/expiry dates, creator attribution (e.g., "أنشئ بواسطة: عبدالحاكم" — confirms sub-user-created listings are correctly attributed), and a performance snapshot (reach, visits, leads — "عملاء محتملين: 0" appears on every row sampled, worth checking whether this is a real zero or another decorative counter).
- Two live JavaScript console errors fire on this page (see [18_SCREENSHOT_INDEX.md](18_SCREENSHOT_INDEX.md)) — one page-specific (`Cannot read properties of null (reading 'addEventListener')`), one global (the same `pricing-slider.js` error seen on the dashboard).
- Action icons (Edit/View/Delete) carry English-language accessible names ("Edit"/"View"/"Delete") on an otherwise fully Arabic page — a small but real localization inconsistency.

## `/properties/create` (direct navigation)

**Observed**: Returns a live **HTTP 500 Server Error** — a plain, non-debug error page with no stack trace exposed (confirming production correctly has `APP_DEBUG` off, unlike the checkout's own `.env.example` default noted in [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md)). This is the resource-style Laravel route (`Route::resource('properties', ...)`'s `create` action) and is directly reachable, but broken. See [06_WORKFLOW_ANALYSIS.md](06_WORKFLOW_ANALYSIS.md) for how this relates to the actual product entry point, which uses a different, working flow.

## `/agent-inbox` — Lead Inbox

**Purpose**: Unified inbox for all inbound contact (direct property inquiries, broadcast property requests).

**Observed**:
- 12 total entries spanning over a year (oldest: 2025-06-11, newest: 2026-06-15), paginated 10/page, no filtering by type/read-state visible in this view.
- Entry types are mixed and unlabeled in any consistent taxonomy: "Property," "Property Request," and "N/A" (a broken/unlinked entry) all appear in the same flat list.
- **Critical live finding**: multiple entries display the SENDER's contact block as the logged-in agent's own identity — name "فهد حميد عبدالكريم الظاهري" / "FAHAD" / "Asbar Real Estate," email `yunes@tuba.com.sa`, phone `966535020288` — which are this agent's own account details, not a real prospective buyer's. This is the live, user-visible symptom of the notification/data-relationship bug documented from source in [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) and [15_CURRENT_STATE_VS_TARGET_STATE.md](15_CURRENT_STATE_VS_TARGET_STATE.md) §3: the agent cannot actually contact the real lead from several of these entries, because the platform is showing them their own information back.
- Two entries are unmistakable test/QA data left live in production ("test 02," "test 03," sender "hello" / `rayyan@gmail.com`) — a data-hygiene issue independent of the code-level findings.
- One "Property Request" entry contains a message reading "your offer has accepted please contact me" — suggesting the offer-acceptance step that source code confirms has no real backend implementation is being worked around via free-text messaging between parties, off-platform from any structured accept/reject action.
- No reply action, no read/unread state, and no reply composer are visible anywhere on this page — confirming the one-way lead-drop finding live.

## `/property-requests` — Property Requests

**Purpose**: A second, related-but-distinct request-management surface with 4 tabs.

**Observed**:
- Tabs: **طلبات العقارات** (Property Requests), **طلبات التسويق** (Marketing Requests), **تم التواصل** (Contacted), **المفضلة** (Favorites).
- **New finding, not identified from source-code review alone**: the **Marketing Requests** tab is a real, functioning owner-originated demand surface — 3 live cards observed, each showing listing details (type, price, size, location, age of request), a running count of offers already submitted by other agents, and a "قدم عرض خدمة" (Submit a service offer) / "تم ارسال العرض" (Offer already sent) button whose state changes once this agent has submitted. This is functionally close to the Aqar "Marketing Request" mechanic the TBX synthesis specifically flagged as something Tuba appeared to lack — see the updated [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md) for the corrected comparison.
- **Live i18n bug**: card titles render literal, untranslated internal tokens directly into Arabic UI text — e.g. "عمارة في **for_sale** جدة" and "عمارة في **for_rent** جدة" — the English enum value leaked into a user-facing Arabic string instead of being translated.
- The **Contacted** tab shows the same request once an offer has been submitted, now displaying "تم تقديم العرض: 2.5%" — confirming the commission-percentage offer mechanic (`PropertyRequestOffer.percentage`) works end-to-end for submission, even though the *acceptance* side remains, per source-code review, unbuilt.
- The filter panel on this page renders an extremely long, flat `<select>` for city/district — hundreds of entries in a single non-searchable dropdown, a real usability defect for a country-scale location taxonomy, and one that ballooned the accessibility-tree size dramatically during this audit, itself a mild signal of the control's poor scalability.

## `/agent-users` — Team Management

**Purpose**: Sub-agent (Agent User) account management.

**Observed**: A minimal three-column table — #, Name, Mobile Number — plus Edit/Delete actions and an "أضف جديدا" (Add new) button. **No role, permission, or scope column exists anywhere in this UI.** This directly, visually confirms the RBAC gap documented from source: team management here is exactly as flat as the "zero-permission phone-number-only add" pattern the TBX synthesis documented for Aqar — Tuba does not currently do any better in the rendered product than its weakest-RBAC competitor.

## `/developer-packages` — Developer Packages

**Purpose**: (Per navigation label) a package catalog for property-developer customers.

**Observed**: A confirmed **dead end** — "لم يتم العثور على بيانات" (No data found) with no package cards, no pricing, no purchase flow of any kind. The right-hand column lists what appear to be intended feature/add-on names (blog posts, dedicated account manager, 3D floor plans, professional photography, drone video, virtual tour video) as static text, not live, purchasable items. This is a direct, live confirmation of the source-code finding that the `DeveloperPackage` catalog no longer exists in the backend — and it is structurally identical to the Aqar dead-end (`/user/campaigns/new` rendering a heading over a blank screen) that the TBX synthesis specifically named as a cautionary example.

## `/agent-packages` — Agent Packages

**Purpose**: The agent's own package/subscription tier selection.

**Observed**: A real, fully-functioning 3-tier pricing UI (أعمال "Business" SAR 2,450–4,900/yr, بداية "Start" SAR 1,450–2,900/yr, حياك "Life" SAR 1,000–1,900/yr) with a duration toggle (6 months/1 year) and a feature-comparison list including numeric limits (listing counts, district counts) and boolean features (✓/✗), one of which is explicitly "تلقي طلبات التسويق من الملاك" (receive marketing requests from owners) — confirming Marketing Requests is a real, tier-gated, monetized feature, not an experimental or orphaned one. This page is one of the platform's genuinely production-ready surfaces.

## Mobile viewport (`/dashboard` at 390×844)

**Observed**: The sidebar correctly collapses into a "Dashboard Navigation" dropdown — a sound responsive pattern. However, the "الترقيات" (Promotions) section heading is visibly clipped at the right edge of the viewport (an RTL horizontal-overflow defect), and a floating circular "scroll" control overlaps directly on top of the stats grid alongside the WhatsApp button, creating a crowded, ambiguous tap-target area in the bottom-right corner of the screen. The recent-listings table does not reflow into a card layout for narrow viewports.
</content>
