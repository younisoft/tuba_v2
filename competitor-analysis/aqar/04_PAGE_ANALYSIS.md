# Page-by-Page Analysis

Every page below was directly observed and screenshotted (see `screenshots/`, numbered in audit order). Empty states are documented as empty states, not populated with invented data.

---

## My Ads — `/my-listings` (screenshot `01`)

- **Purpose**: primary listing-inventory home; equivalent to Bayut's "My Listings."
- **Business goal**: keep the broker returning to manage/renew/promote inventory; surface the package-upgrade CTA.
- **Primary user**: the broker/agent managing their own posted inventory.
- **Components**: page header with "أضف إعلان" (Add Listing) primary button and "معلومات الباقة" (Package Info) secondary button carrying a red notification dot; a 6-tab lifecycle filter bar — الكل (All), منشورة (Published), معلقة (Suspended), منتهية الصلاحية (Expired), مؤرشفة (Archived), مؤرشفة (Featured) — each showing a live `(0)` count.
- **Empty state**: a centered icon + "لا توجد إعلانات" (No listings) message, no secondary CTA inside the empty state itself (the only way forward is the header's Add Listing button, already visible above).
- **Observed gap vs Bayut**: Bayut's equivalent screen retains full lifetime performance data on removed/expired listings; this screen offers no way to check that behavior since no listings existed to test — flagged as untested, not claimed either way.
- **Accessibility/UX**: tab counts update inline; no loading skeleton observed (page rendered fully formed on load, consistent with server-rendered Next.js output — see `08_TECHNICAL_OBSERVATIONS.md`).

## Subscription Info — `/user/subscription-info` (screenshot `02`)

- **Purpose**: shows current plan capacity and renewal status.
- **Components**: a capacity bar ("عدد المساحات: 30" total / "المتبقي: 30" remaining / "المستخدم: 0" used); a subscription card (plan name "الأفراد الأساسية", start/end dates, "1/1" user-seat usage, 259-day countdown); two CTAs — "ترقية الباقة" (Upgrade Package, primary green) and "تجديد الاشتراك" (Renew Subscription, secondary outline); a 6-item FAQ accordion (what is a "space," how is free license issuance done, how are extra spaces priced, what happens when spaces run out, can I add users, can I change my package).
- **Business goal**: pre-empt "why can't I post" questions and upsell before the broker hits a hard capacity wall.
- **UX quality**: the FAQ accordion directly answers the two most likely support questions (running out of spaces, adding users) inline rather than requiring a support ticket — a genuinely good pattern.

## Add Listing — role select (`/add-listing`, screenshot `03`) and category select (screenshot `04`)

- **Purpose**: entry fork for listing creation.
- **Workflow**: step 1 asks "هل أنت؟" (Are you?) with three role cards — مضيف (Host, short-term-rental icon), مالك/وكيل (Owner/Agent), وسيط/مسوق (Broker/Marketer, briefcase icon). Selecting a role reveals a second in-page section, "ما الذي تحاول الإعلان عنه؟" (What are you trying to advertise?), with three action rows for the Broker/Marketer role: إضافة إعلان عقاري (Add a real-estate listing), إصدار ترخيص مجاني (Issue a free license), and روج حسابك في وسيط الحي (Promote your account in District Broker) — the latter tagged "جديد" (New).
- **Validation/guidance**: none visible at this step beyond the binary role/category selection — no explanatory copy on what differs between the three roles.
- **UX quality**: clean, low-friction fork; the "New" badge on District Broker is a reasonable in-context discovery mechanism for a newly launched feature, better than requiring the broker to find it in the account drawer first.

## REGA License Gate — `/add-listing/rega` (screenshot `05`)

- **Purpose**: mandatory compliance checkpoint before any listing can be created.
- **Components**: explanatory copy ("To add a listing on Aqar you must have a listing license number issued by REGA"), a single required text field ("رقم ترخيص الإعلان" / Ad License Number), a help link ("ما هو ترخيص الإعلان؟" / What is an ad license?), a primary "التالي" (Next) button (rendered disabled/muted-green until a value is entered), and a fallback link to the free-license flow for brokers without an existing license.
- **Validation**: field-level validation not observable without a real REGA number (not fabricated, per audit rules).
- **Business goal**: keep 100% of Aqar's live inventory REGA-traceable — this is a harder gate than anything documented in the Bayut audit, which references license fields but not a blocking pre-listing lookup step.

## Free License Issuance — requirements (screenshot `06`) and form (screenshot `07`)

- **Purpose**: lets a broker with an active Wasata (brokerage/mediation) marketing contract issue a REGA license through Aqar itself rather than a separate government portal.
- **Requirements screen**: single bullet requirement ("وجود عقد تسويق ساري في منصة الوساطة" / an active marketing contract on the Wasata platform) plus explanatory copy and a "التالي" button.
- **Form fields**: رقم عقد الوساطة (Wasata contract number, required), رقم الصك (deed number, required), سعر العقار (property price, required, SAR-suffixed input), نوع الإعلان (ad type, required dropdown, unselected default "الرجاء الاختيار" / Please choose), and a toggle "هل معتمد العقد وكيل عن المالك؟" (Is the contract based on power-of-attorney on behalf of the owner?).
- **Observed gap**: no inline help/tooltips on any of the four fields — a first-time broker unfamiliar with Wasata terminology has no in-product explanation of where to find a contract or deed number.

## Licenses / License Requests — `/mlr` (screenshot `08`)

- **Purpose**: tracks every license request through its full compliance lifecycle, separate from the listing itself.
- **Components**: 7-tab status filter — بانتظار المعلومات (Awaiting Information, default/selected), جاري إصدار العقد (Contract Issuance in Progress), بانتظار الموافقة على العقد (Awaiting Contract Approval), جاري الترخيص (Licensing in Progress), إعلانات مرخصة (Licensed Listings), بانتظار الدفع (Awaiting Payment), رخصة منتهية (Expired License) — each a pill-style tab, no visible counts (unlike My Ads' tabs, which do show counts).
- **Empty state**: "لا توجد طلبات بانتظار المعلومات حالياً" (No requests awaiting information currently) with a folder-style icon.
- **Comparative note**: this 7-state model is meaningfully more granular than the ~4 non-active states the Bayut audit documents for Bayut listings (Not Posted / Insufficient Credits / Ad License Expired / Deleted) — but like Bayut, no glossary or inline "how to move to the next state" guidance was observed on this screen.

## Wallet — `/user/wallet` (screenshot `09`) and top-up modal (screenshot `10`)

- **Purpose**: a separate cash-value balance (distinct from subscription ad-space credits) for promotional and booking-fee spend.
- **Components**: balance display ("الرصيد: 0 §"), a 4-tab history filter (الكل/تم الشراء/مستخدم/منتهي الصلاحية — All/Purchased/Used/Expired), a transaction table (type, date, expiry date, amount), and explanatory copy: "يمكن استخدام الرصيد لشراء خدمات عقار مثل حجوزات الوحدات اليومية/الشهرية، والعروض الترويجية، وما إلى ذلك" (balance can be used for daily/monthly unit booking fees, promotional offers, etc.).
- **Observed transaction history**: a +100 SAR top-up dated 21/04/26 with an expiry date of 22/07/26, and a matching -100 SAR "منتهي الصلاحية" (Expired) row with the same expiry date and no expiry-date value in the "-" row itself — i.e., the wallet balance genuinely lapsed unused.
- **Top-up modal**: choice of "الدفع بالبطاقة" (card) or "تحويل بنكي" (bank transfer), a freeform SAR amount field (pre-filled with the last-used value, 100), the same usage explainer, and a "شحن المحفظة" (Top Up Wallet) submit button. Not submitted (would trigger a real payment).
- **Business-model finding**: no visible pre-expiry warning notification setting was found anywhere in the product for wallet balance — the 100 SAR lapsed with only the after-the-fact ledger entry as a record.

## Office Management — Dashboard (`/offices-management`, screenshot `11`)

- **Purpose**: the "real" operational dashboard — separate from `/my-listings`, richer, sidebar-driven.
- **Components**: a time-range switcher (اليوم/الأسبوع/الشهر/السنة — Today/Week/Month/Year); three KPI tiles (التفاعل مع الإعلانات / Listing Interactions, مشاهدات الإعلانات / Listing Views, ظهور الإعلانات / Listing Impressions — all 0); a "ترقية الباقة" (Upgrade Package) button; a subscription-detail panel duplicating much of `/user/subscription-info` (ad-space slider, user-seat slider, auto-renewal toggle with a stated 20% discount incentive, subscription type/start/end/days-remaining); and the persistent right-hand sidebar (لوحة تحكم المدير / الإعلانات / المحفظة / حملات التمييز / الإحصائيات / المستخدمين / المدفوعات و الفواتير / إعدادات الحساب).
- **Notable micro-copy**: the auto-renewal toggle explicitly states the discount incentive for enabling it ("عند تفعيله سيتم خصم مبلغ التجديد مباشرة مع خصم 20%") — a clear, disclosed nudge rather than a dark pattern (the discount is named, not hidden).

## Office Management — Users/Team (`/offices-management/users`, screenshot `12`)

- **Purpose**: team member management for the office/establishment account.
- **Components**: an "إضافة موظف" (Add Employee) control paired with a bare phone-number input field; a table with columns اسم المستخدم (username), رقم الجوال (phone), تاريخ الانضمام (join date), البريد الإلكتروني (email), عدد الإعلانات (listing count), خيارات (options/actions).
- **Empty state**: "لا يوجد مستخدمون" (No users) with a generic avatar icon.
- **Critical gap**: no role selector, no permission checkbox, no license-sharing toggle of any kind is present anywhere in this add-employee flow — team members are added by phone number alone. This is flatter than even Bayut's binary license-sharing toggle (documented in the Bayut audit as already too coarse).

## Office Management — Featured Campaigns (`/offices-management/campaigns`, screenshot `13`)

- **Purpose**: manage paid "featured/boosted" listing campaigns.
- **Components**: "إضافة حملة" (Add Campaign) button, empty state "لا توجد حملات حالياً" (No campaigns currently).

## Featured Listings landing — `/user/campaigns` (screenshot `14`)

- **Purpose**: marketing/explainer page for the paid featured-listing product, reached from both the account drawer ("خدمات الترويج") and Office Management's "Add Campaign" button.
- **Components**: a 3-step visual explainer (1. اختر إعلان من قائمة إعلاناتك / choose a listing, 2. حدد الميزانية اليومية / set a daily budget, 3. اختر تاريخ انتهاء تمييز الإعلان / choose an end date); three benefit blocks with illustration (أيقونة خاصة / special icon, ظهور مميز / prominent placement, تفاعلات أكثر / more interactions); a single "ابدأ الخدمة" (Start Service) CTA.
- **UX quality**: the 3-step explainer with benefit illustrations is a genuinely clear, well-designed marketing-style onboarding pattern — better explained than most other flows in the product.

## Featured Campaign creation — `/user/campaigns/new` (screenshot `15`)

- **Purpose**: step 1 of actually creating a campaign (select a listing).
- **Observed defect**: renders only the heading "إختر إعلان من قائمة إعلاناتك" (Choose a listing from your list) with a **completely blank content area** — no listing picker, no empty-state message, no "you have no listings yet, add one first" CTA. This is a genuine dead end for any broker without existing listings (which, per this account's state, is not a rare edge case) — see `11_WEAKNESSES.md`.

## Office Management — Statistics (`/offices-management/statistics`, screenshot `16`)

- **Purpose**: per-listing performance analytics, broken out from the dashboard's aggregate tiles.
- **Components**: time-range switcher (الأسبوع/الشهر/السنة — Week/Month/Year); three KPI tiles (impressions/views/interactions, all 0); an empty chart canvas; and a detailed table with columns رقم الإعلان (ad ID), العنوان (title), الفئة (category), السعر (price), ظهور الإعلانات (impressions), مشاهدات الإعلانات (views), التفاعل مع الإعلانات (interactions), اسم المسوق (marketer name), الجودة (Quality — with an info icon, implying a tooltip/definition), خيارات (options).
- **Notable finding**: a per-listing **Quality** score column exists, attributed to a specific marketer/agent name — the closest thing in Aqar to Bayut's TruBroker quality signal, but scoped to listing-level analytics rather than surfaced as its own gamified profile feature.

## Office Management — Invoices (`/offices-management/invoices`, screenshot `17`)

- **Purpose**: billing history.
- **Observed content**: a single real transaction row — payment method "VISA," description "اشتراك سنوي في الباقة الأساسية" (Annual subscription to the Basic package), timestamped 21:56 21/04/26.
- **Notable gap**: **no amount/price column is shown** for the transaction, and no invoice download/PDF link was found — a materially thinner billing record than typical SaaS invoice history (no line-item amount visible at all).

## Office Management — Settings (`/offices-management/settings`, screenshot `18`)

- **Purpose**: office-level profile (distinct from the personal profile at `/user-actions/profile-update`).
- **Components**: avatar upload ("تغيير الصورة" / Change Picture), a username text field, a bio/description textarea ("نبذة عنك" / About You), and a "حفظ التغييرات" (Save Changes) button.
- **Gap vs a real business profile**: no address, service-area, business-hours, or license-number cross-reference fields — notably thinner than Bayut's dedicated Licenses screen, which the Bayut audit describes as carrying FAL license and CR number together as "the compliance backbone."

## Aqar+ — `/aqar-plus` (screenshot `19`)

- **Purpose**: a paid **consumer-facing** premium tier (SAR 29.99), surfaced inside the broker's own account drawer.
- **Listed perks**: فلترة عقارات المالك (filter owner-direct listings), استخدام خريطة عقار على الويب (use the Aqar web map), البحث بالعقارات المباشرة مع المالك (search properties directly with owners), البحث بمحتوى الإعلان (search by listing content/full text), سجل إحصائيات الإعلان (listing statistics log), طلبات عقارية إلى 20 طلب (up to 20 property requests), عرض المفضلة عبر الخريطة (view favorites on the map), plus unspecified "خدمات أخرى" (other services).
- **Structural observation**: every listed perk benefits a *property seeker*, not a broker managing their own inventory — its presence in the broker's own drawer is a genuine blurring of the two sides of the marketplace inside one account UI (see `02_PRODUCT_PHILOSOPHY.md`).

## District Broker — campaigns list (`/user/my-district-broker-bids`, screenshot `20`), bid flow city (screenshot `21`) and zone (screenshot `22`)

- **Purpose**: pay-to-bid weekly visibility auction for broker accounts, scoped by city and zone.
- **List page**: three tabs — قادمة (Upcoming), فعالة (Active), منتهية (Ended) — with منتهية selected by default in the observed state; a "روج حسابك الآن" (Promote Your Account Now) CTA; empty state "لا توجد حملات" (No campaigns) with a search-icon illustration.
- **Bid flow**: heading "معلومات المزايدة" (Bid Information), explanatory copy "اختر حي الظهور وشارك في المزايدة على ترويج حسابك لمدة أسبوع" (choose the appearance neighborhood and participate in the bid to promote your account for a week); a المدينة (City) dropdown (الرياض/جدة/الدمام — Riyadh/Jeddah/Dammam observed); once a city is chosen, a second الجهة (Zone) dropdown appears with five broad compass-direction zones (e.g., شمال/شرق/غرب/جنوب/وسط الرياض for Riyadh).
- **Naming-vs-reality gap**: the feature is branded "وسيط الحي" (Neighborhood Broker) but the actual selectable unit is a broad city zone, not an individual neighborhood/district — a real granularity gap between the feature's name and its implementation.
- **Not completed**: the bid-amount entry step, which would require a real monetary commitment.

## Ejar Contract Issuance — `/user/ejar-contracts` (screenshot `23`)

- **Purpose**: paid documentation/notarization service layered on top of the government Ejar rental-contract platform.
- **Components**: explanatory copy ("This service lets you document a rental contract through the Ejar platform for residential or commercial contracts"); two priced options — إيجار سكني (Residential Rental) SAR 299, إيجار تجاري (Commercial Rental) SAR 499 — each a selectable row with an icon and price.

## Broker Ejar Contracts — `/user/broker-ejar-contracts` (screenshot `24`)

- **Purpose**: CRM-style tracking of rental contracts assigned to this broker via Ejar.
- **Components**: four KPI tiles — النسبة المحولة (Conversion Rate, 0%), المحول منها (Converted Amount, 0 SAR), قيمة العقود (Contract Value, 0 SAR), عقد مُنجز (Completed Contracts, 0); a searchable/filterable "الكل" (All) contract-type dropdown; empty state "لا توجد عقود مسندة" (No assigned contracts).
- **Notable finding**: the Conversion Rate KPI is a genuine sales-funnel metric with no directly comparable equivalent surfaced in the Bayut audit's documented feature set.

## Saved Searches ("طلباتي") — `/user/searches` (screenshot `25`)

- **Purpose**: demand-side alerting — save a property request and get notified of matching inventory.
- **Empty state**: clean, well-worded — "لا توجد طلبات جديد حالياً، أضف طلب جديد للحصول على تنبيهات بالعروض المطابقة لطلباتك" (You have no requests yet; add a new request to get alerts on offers matching your requests) — paired with a clear "إضافة طلب" (Add Request) CTA. One of the better-designed empty states observed in the product.

## Bookings — `/user/bookings` (screenshot `26`)

- **Purpose**: short-term/daily-monthly rental booking management, dual-sided within one screen.
- **Components**: two tabs — حجوزاتي (My Bookings, as a guest) and حجوزات العملاء (Customer Bookings, as a host/operator) — with حجوزاتي selected by default.
- **Empty state**: calendar icon, "لا توجد حجوزات" (No bookings).
- **Structural finding**: this confirms Aqar integrates Airbnb-style short-term-rental hosting directly into the same broker account used for standard sale/rental listings — a vertical the Bayut audit does not document an equivalent of.

## Off-plan Payment Requests — `/user/my-payment-requests` (screenshot `27`)

- **Purpose**: tracks unit-reservation/booking-fee payment requests for off-plan project purchases.
- **Empty state**: "لا توجد طلبات دفع" (No payment requests), receipt-with-cash icon.

## Establishment Account — `/user/establishment-account` (screenshot `28`)

- **Purpose**: the business/company identity record.
- **Components**: establishment logo (editable via "إضغط لتعديل الشعار" / Click to Edit Logo), a "موثق" (Verified) status badge, establishment name (شركة أسبار الموحدة التجارية), and CR number (رقم السجل التجاري: 4030407410).
- **Gap**: no address, no REGA/FAL license number cross-reference, no team-size or founding-date field — a materially thinner business profile than the compliance-centric Licenses screen the Bayut audit documents for Bayut.

## Favorites — `/favorites` (screenshots `29`, `29b`)

- **Purpose**: saved-listing bookmarking, shared UI between consumer and broker use.
- **Components observed**: two tabs, الإعلانات (Listings) and المشاريع (Projects); a real, pre-existing set of six favorited listings spanning multiple cities (Mecca, Jeddah, Al-Ahsa) and types (rental buildings, villas, land).
- **Notable finding**: several favorited listings are tagged "طلب تسويق" (Marketing Request) rather than a price — these are property-owner posts requesting broker representation, discoverable and favoritable like any other listing. This is a real, working two-sided lead-generation mechanic (owners seeking brokers) hiding inside a generic bookmarking feature with no dedicated broker inbox, filter, or "claim this request" action observed.

## Public Projects Marketplace — `/المشاريع-العقارية` (screenshot `30`)

- **Purpose**: consumer-facing off-plan project discovery (documented for IA completeness; demand-side, not broker back-office).
- **Components**: a horizontal city-filter chip bar (14 cities plus "الكل" / All, plus a "تصفية" / Filter button); a responsive card grid with project cards showing a hero image, status badges (على الخارطة / Off-plan, متاح / Available, unit-type badge), developer logo, starting price ("يبدأ من X ألف/مليون ﷼"), project name, and location line.
