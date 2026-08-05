# 18 — Screenshot Index

**Status**: Observed. Captured 2026-08-06 via authenticated live browser session, logged in as agent "فهد" (Fahd), company "شركة اسبار" (Esbar Company), at `https://tuba.com.sa`. All files in `screenshots/`.

| # | File | Page | Key evidence captured |
|---|---|---|---|
| 01 | `01_agent_dashboard_home.png` | `/dashboard` | Full agent dashboard home; "التقييمات والمراجعات" (Ratings & Reviews) tile hardcoded to `0`, confirming the source-code finding live |
| 02 | `02_properties_list.png` | `/properties?tab=2` | Active-listings tab; 7-tab status breakdown (Active/Draft/Pending/Deleted/Sold/Expired/Rejected); dual "Edit"/"View"/"Delete" action icons |
| 03 | `03_agent_inbox.png` | `/agent-inbox` | 12-entry flat lead inbox; multiple entries show the logged-in agent's OWN name/email/phone as the "sender" — a live, visible symptom of the lead-notification misrouting bug; two entries are unmistakable test data ("test 02"/"test 03") left in production |
| 04 | `04_property_requests.png` | `/property-requests` | 4-tab structure (Property Requests / **Marketing Requests** / Contacted / Favorites) — the Marketing Requests tab was not identified from source-code review alone; a full city dropdown with hundreds of district-level entries |
| 05 | `05_marketing_requests_tab.png` | `/property-requests` (Marketing Requests tab) | 3 live owner-originated demand cards with commission-offer buttons; literal untranslated `for_sale`/`for_rent` tokens leaking into Arabic UI text |
| 06 | `06_contacted_tab.png` | `/property-requests` (Contacted tab) | Confirms the commission-offer mechanic live: "تم تقديم العرض: 2.5%" (offer submitted: 2.5%) |
| 07 | `07_team_management.png` | `/agent-users` | Sub-agent user list — name, mobile number, edit/delete only; zero role/permission/scope column anywhere in the UI |
| 08 | `08_developer_packages.png` | `/developer-packages` | Confirmed live dead-end: "لم يتم العثور على بيانات" (no data found), no functional catalog behind it — matches source-code finding that the `DeveloperPackage` model no longer exists; static marketing copy for 3D plans/photography/drone video is the only content on the page |
| 09 | `09_agent_packages.png` | `/agent-packages` | Real, functioning 3-tier package pricing grid (أعمال/بداية/حياك) with feature-comparison rows, including "تلقي طلبات التسويق من الملاك" (receive marketing requests from owners) as a paid tier feature |
| 10 | `10_properties_create_500error.png` | `/properties/create` | **Live HTTP 500 Server Error** on direct navigation — a plain, non-debug error page (no stack trace exposed, confirming `APP_DEBUG` is correctly off in production); consistent with the dependency-inconsistency risk flagged in [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §0 |
| 11 | `11_add_property_modal.png` | `/properties` (Add Property modal) | The real "Add Property" entry point is a modal, not a direct page load — it front-loads a REGA ad-license/Commercial-Registry lookup step before the property form opens (a partial refinement of the "no upfront checklist" characterization in [15_CURRENT_STATE_VS_TARGET_STATE.md](15_CURRENT_STATE_VS_TARGET_STATE.md)). Stopped here per the observation-only method — did not enter a fabricated license number. |
| 12 | `12_dashboard_mobile_390px.png` | `/dashboard` at 390×844 (mobile viewport) | Sidebar correctly collapses to a "Dashboard Navigation" dropdown; but the "الترقيات" (Promotions) heading is clipped at the viewport edge, and a floating "scroll" button overlaps the stats grid — a live responsive-design defect |

## Console errors captured (not separately screenshotted, logged via browser console API)

- **Dashboard + Properties list**: `TypeError: Cannot read properties of null (reading 'nodeName')` thrown by `login_asset/js/pricing-slider.js` on every page load — a global script error firing regardless of whether the current page has a pricing-slider element, consistent with the "unbundled, non-conditional script loading" finding in [09_DESIGN_SYSTEM.md](09_DESIGN_SYSTEM.md).
- **Properties list specifically**: an additional `TypeError: Cannot read properties of null (reading 'addEventListener')` thrown by an inline script at `tuba.com.sa/properties:23885`.

## Network requests captured

- Four separate consumer ad-attribution/analytics pixels fire on the authenticated agent dashboard: **Google Analytics/Tag Manager** (`G-3VTJVZGFFS`, sending `page_view` and `scroll` events with client/session IDs), **Facebook Pixel** (`fbevents.js`, `PageView` event with extensive browser-fingerprint parameters), **TikTok Pixel** (`analytics.tiktok.com`, identify + pixel calls), and **Snapchat Pixel** (`tr.snapchat.com`/`tr6.snapchat.com`, multiple beacons). See [06_WORKFLOW_ANALYSIS.md](06_WORKFLOW_ANALYSIS.md) and the updated [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md) for why this matters relative to the Aqar comparison.

## What was NOT captured (explicit scope boundary)

- No government-ID-gated flow was completed (REGA license number, Nafath verification submission) — per the observation-only method, these were walked up to and stopped at the point a real credential would be required.
- No destructive action was taken (no property/lead/sub-user was deleted, no package was purchased).
- Screenshots are from a single agent account on one company profile ("شركة اسبار"/Esbar) — the SuperAdmin/internal-admin view of the same shared codebase (`admin.dashboard` rather than `admin.agent_dashboard`) was not captured in this pass, since the authenticated session available was an agent account, not an internal staff account.
</content>
