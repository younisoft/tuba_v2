# Information Architecture

Aqar's broker-relevant IA is **not a single tree** — it is two parallel systems that both claim to be "the account," plus a public marketplace shell that wraps around both. This document maps all three as directly observed.

## 1. Global chrome (present on every page)

Top bar, RTL, present on every screen including deep inside broker flows:

- **Right side (logo-adjacent in RTL)**: Aqar logo/home link
- **Center**: الإعلانات (marketplace listings search) → `/عقارات`, المشاريع (off-plan projects) → `/المشاريع-العقارية`, الحجوزات (short-term rental search) → `/الحجوزات`
- **Left side (RTL-leading)**: الخريطة (map search) → `/الخريطة`, إضافة (Add Listing entry point) → `/إضافة-إعلان`, account icon → `/my-account` (opens the account drawer as an overlay, does not navigate away from the current page)

## 2. Account drawer (`/my-account` overlay) — the consumer-style system

Opened from the account icon; renders as a slide-over on top of the current page rather than a route change. Structure observed, top to bottom:

- **Header**: شحن المحفظة (wallet top-up shortcut) → `/user/wallet`
- **Account switcher**: business identity (شركة أسبار الموحدة التجارية) → `/user/establishment-account`; personal profile (فهد حميد) → `/my-account`
- **Quick icons**: المفضلة (Favorites) → `/favorites`; التنبيهات (Notifications — in-panel toggle, not a routed page)
- **عقار+** (consumer premium bundle) → `/aqar-plus`
- **خدمات الترويج** (Promotion services — same destination as Featured Campaigns) → `/user/promotion`
- **الأنشطة (Activities)**:
  - إعلاناتي (My Ads) → `/my-listings`
  - التراخيص (Licenses) → `/mlr`
  - حملات وسيط الحي (District Broker campaigns) `[New]` → `/user/my-district-broker-bids`
  - عقود إيجار الوسيط (Broker Ejar Contracts) `[New]` → `/user/broker-ejar-contracts`
  - طلباتي (Saved Searches) → `/user/searches`
  - الحجوزات (My Bookings) → `/user/bookings`
  - عقود الإيجار (Rental Contracts) → `/my-rental-contracts`
  - طلبات حجز الوحدات (Off-plan Payment Requests) → `/user/my-payment-requests`
- **المكاتب (Offices)**:
  - معلومات الباقة (Subscription Info) `[New]` → `/user/subscription-info`
  - لوحة التحكم (Control Panel — entry into the *second* system) → `/offices-management`
- **المعلومات المالية (Financial Info)**:
  - المحفظة (Wallet) → `/user/wallet`
  - المدفوعات (Payments) → `/my-account/payments`
  - الحساب البنكي ومعلومات الضريبة (Bank Account & Tax Info) → `/user-actions/financial-info`
  - إدارة البطاقات (Card Management) → `/user-actions/cards-settings`
- **إدارة الحساب (Account Management)**:
  - تعديل الملف الشخصي (Edit Profile) → `/user-actions/profile-update`
  - تغيير الجوال (Change Phone) → `/user-actions/update-phone`
  - English (locale toggle) → `/user/bookings` **[bug — does not switch locale, see 11_WEAKNESSES]**
  - تسجيل الخروج (Logout) → `/`
- **Footer**: dark-mode toggle, app version stamp (`v1.0.2`)

## 3. Office Management console (`/offices-management`) — the "enterprise" system

A separate, self-contained shell with its own persistent right-hand sidebar (this is the screen titled "لوحة تحكم المدير" / Manager Control Panel):

- `/offices-management` — Dashboard (general stats + subscription detail widgets)
- `/offices-management/listings` — Listings (not opened in this pass beyond the sidebar link; parallels `/my-listings`)
- `/offices-management/wallet` — Wallet (parallels `/user/wallet`)
- `/offices-management/campaigns` — Featured Campaigns (parallels `/user/campaigns` / `/user/promotion`)
- `/offices-management/statistics` — Statistics (per-listing performance table with a Quality column)
- `/offices-management/users` — Users/Team management
- `/offices-management/invoices` — Payments & Invoices
- `/offices-management/settings` — Account Settings (avatar, display name, bio)

**Overlap with the account drawer**: Listings, Wallet, and Campaigns/Promotion all exist as reachable destinations in *both* systems, under different URLs, with (as far as observed) no cross-linking between the two versions of the same feature.

## 4. Listing creation sub-tree (`/add-listing`)

```
/add-listing
  → role select: مضيف (Host) | مالك/وكيل (Owner/Agent) | وسيط/مسوق (Broker/Marketer)
      → (Broker/Marketer selected) action cards:
          - إضافة إعلان عقاري (Add real-estate listing) → /add-listing/rega
              → REGA license number gate (mandatory field)
          - إصدار ترخيص مجاني (Issue free license) → /add-listing/rega?license=free
              → requirements screen → form: Wasata contract number, deed number,
                property price, ad type, POA toggle
          - روج حسابك في وسيط الحي (Promote in District Broker) [New] → /user/campaigns (routes into the promotion flow, not a distinct listing path)
```

## 5. District Broker sub-tree

```
/user/my-district-broker-bids  (list: قادمة/فعالة/منتهية tabs — Upcoming/Active/Ended)
  → "روج حسابك الآن" → /district-broker/bid
      → select المدينة (city: الرياض/جدة/الدمام)
      → select الجهة (zone — 5 broad zones per city, e.g. شمال/شرق/غرب/جنوب/وسط الرياض)
      → [bid amount step not reached — requires real payment]
```

## 6. Ejar sub-tree

- `/user/ejar-contracts` — paid contract-notarization service picker (إيجار سكني SAR 299 / إيجار تجاري SAR 499)
- `/user/broker-ejar-contracts` — assigned-contracts CRM view (conversion %, converted amount, contract value, completed count)
- `/my-rental-contracts` — "your own" rental contracts (separate from broker-assigned ones)

## 7. Public marketplace shell (demand side, reached from global top nav)

- `/عقارات` — for-sale/for-rent listing search (city/type filter chips, card grid)
- `/المشاريع-العقارية` — off-plan project marketplace (city chips, developer-branded project cards with "starting from" pricing)
- `/الحجوزات` — short-term/daily rental search
- `/الخريطة` — map-based search

## Structural observations

- **No breadcrumbs** were observed anywhere in the broker flows; the only "where am I" signal is the page's H1-style heading and the persistent global top nav.
- **Two independent "empty" root concepts** compete for the label "my account home": `/my-account` (redirects into My Ads) and `/offices-management` (a genuine dashboard). A new broker has no obvious signal for which one is the "real" starting point.
- **Deep links resolve directly** (e.g., `/add-listing/rega?license=free` is a real, directly-navigable URL, not purely client-state) — the product is built on server-resolvable routes even for multi-step flows, which is healthy for shareability/bookmarking but means the two duplicate systems are also duplicate *route trees*, not just duplicate UI.

See `diagrams/site-map.mmd` for the same structure as a Mermaid diagram.
