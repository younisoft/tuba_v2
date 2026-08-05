# Product Philosophy

> Method note: this document infers intent from observed structure — what was built, what was gated behind money or government paperwork, what was left flat or unfinished. Inferences are labeled `[Inferred]`; everything else was directly observed in the captured screens.

## What kind of product this is `[Observed]`

Aqar is a **consumer real-estate marketplace with broker tooling grafted on**, not a purpose-built agency back-office. The evidence: broker features are reached through the *same* account drawer as consumer features (Favorites, Aqar+, saved searches sit beside My Ads and Licenses), the same visual chrome and marketplace-search top nav (الإعلانات / المشاريع / الحجوزات) persists on every broker screen, and a second, more "enterprise" console (`/offices-management`) exists in parallel rather than as the sole home for business operations. A broker using Aqar never fully leaves the consumer shopping experience; they operate inside it.

## Who it is optimized for `[Observed + Inferred]`

- **Primary persona, observed directly**: a small brokerage or individual broker on the "Basic Individual" (الأفراد الأساسية) plan — 1 user seat, 30 ad-space credits, one establishment (CR-registered company, but effectively a solo operator: 1/1 seats used). The subscription defaults (single seat, flat "increase user count" upsell rather than a multi-seat plan by default) read as designed for exactly this shape of customer.
- **Secondary persona, inferred from structure**: a larger office, implied by the existence of `/offices-management`'s Users/Team page and per-listing "marketer name" attribution in Statistics — but the Users page has no role selector, no permission model, and no bulk-invite path, so this persona is supported shallowly, similar to the gap the Bayut audit identifies for Bayut's own agency-staff features.
- **Property owners and renters** are a co-equal audience inside the same product, not a separate consumer app — Aqar+ (a paid *consumer* search/filter upsell) is surfaced inside the *broker's* account drawer, and "Marketing Request" listings (owners asking to be represented) sit in the broker's own Favorites list. Aqar's architecture treats supply (brokers) and demand (owners/renters) as two roles a single account can move between, not two separate products.

## Business priorities, ranked by what got engineering investment `[Inferred]`

1. **Regulatory compliance as a funnel, not a footnote.** No other single mechanic in the product has as many distinct states, forms, and sub-requirements as license issuance: a mandatory REGA license number gate, a full alternate free-license form (Wasata contract number + deed number + price + ad type + power-of-attorney toggle), and a 7-state license lifecycle tracker. This is disproportionate engineering investment for what is nominally a "before you can post" step — it suggests REGA/Wasata/Ejar compliance is treated as core product surface, likely because non-compliant listings carry real regulatory risk for Aqar itself, not just the broker.
2. **Monetize attention twice: once via subscription, once via wallet.** Ad-space credits (subscription-bundled, annual) and wallet balance (cash top-up, expiring) are kept as two separate ledgers with two separate purchase flows, rather than one unified credit system like Bayut's. This gives Aqar two independent revenue taps — predictable annual subscription revenue, plus a use-it-or-lose-it cash balance that pressures faster ad-hoc spend on promotion.
3. **Sell visibility as an auction, not just a tier.** District Broker's city-zone bidding model monetizes the single scarcest resource on a marketplace — top placement — through price competition between brokers rather than a fixed rate card. This is a fundamentally different lever from Bayut's fixed-tier "Hot/Signature" listing upgrades.
4. **Extend into adjacent transaction types opportunistically.** Ejar rental-contract notarization, off-plan project unit-reservation tracking, and daily/monthly short-term-rental hosting (Bookings' "customer bookings" tab) are all present but each feels like a bolted-on extension of the core listings/marketplace engine rather than a deeply built vertical — each has a single simple table/form, not a workflow.
5. **Team/role governance — least invested, more so than Bayut.** Team management is a bare phone-number-entry table with no roles, no permissions, and (unlike Bayut's binary license-sharing toggle) no visible access-control primitive of any kind.

## Design philosophy `[Observed]`

- **Marketplace visual language throughout.** Every broker screen — even the dedicated Office Management console — keeps the public marketplace's top navigation, footer mega-links (quick search categories, "أحدث الصفقات", blog), and app-store badges. There is no visual mode-switch signaling "you are now in business tools," unlike Bayut Profolio's fully separate agency shell.
- **Forms over guidance.** Multi-step flows (Add Listing, Free License, District Broker Bid, Featured Campaign) present as a bare sequence of required fields with almost no inline explanation of *why* a field is needed or what happens next — e.g., the free-license form asks for a Wasata contract number and deed number with no link to what those are or how to obtain them if missing.
- **Numeric transparency without narrative**, similar to Bayut: wallet history shows raw amounts and expiry dates, subscription info shows a raw day-countdown slider, but neither explains what a healthy number looks like or what action a low number should trigger.
- **RTL-Arabic-first, single-market.** No locale-appropriate secondary language experience was found working correctly — the "English" control in the account drawer links to `/user/bookings`, not an English locale (see `11_WEAKNESSES.md`).

## Navigation philosophy `[Observed]`

Two full, semi-overlapping navigation systems coexist: the top-level account drawer (flat list, ~20 links across five loosely-labeled groups — Activities, Offices, Financial Info, Account Management) and the Office Management console's own left sidebar (8 items, single level). A broker managing wallet balance, for instance, can reach a wallet screen from *either* system, at two different URLs (`/user/wallet` and `/offices-management/wallet`), each independently maintained. This is the mirror image of the Bayut audit's finding of "a single flat sidebar, ten items, no grouping" — Aqar's problem isn't flatness, it's **duplication**, which is arguably the more expensive failure mode for a user building a mental model of where things live.

## Workflow philosophy `[Observed]`

Workflows are **transactional and self-contained rather than orchestrated**: Add Listing, Free License, Ejar Contract issuance, District Broker Bid, and Featured Campaign are each an isolated few-step form with its own start and end, not steps inside one broader "grow your business" flow. Nothing observed connects, say, a newly issued license to prompting a Featured Campaign, or a completed Ejar contract to a review/testimonial request. Every workflow assumes the broker already knows to come looking for it — reinforced by the account drawer being the *only* discovery surface for most of these, with no in-context prompts on, e.g., the empty My Ads screen suggesting "issue a free license" as the next step (it only offers the generic "Add Listing" button).

## Commercial strategy `[Inferred]`

Aqar runs **three simultaneous monetization primitives** where Bayut runs one: (1) tiered annual subscriptions for ad-space capacity, (2) an expiring cash wallet for promotional/booking spend, and (3) a competitive-bid auction for the single scarcest inventory (city-zone visibility). The wallet's expiry window (~3 months observed) is a deliberate use-it-or-lose-it lever absent from Bayut's model, where credits were observed sitting unused with no expiry pressure. Layered on top, Aqar takes a direct transaction fee for Ejar contract notarization (SAR 299–499) — monetizing a *government-mandated* compliance step directly, which Bayut's audit did not find an equivalent of.

## Trust and compliance strategy `[Observed]`

Where Bayut's trust layer (TruBroker, Nafath, FAL license) is built to project trust signals *to the public marketplace*, Aqar's compliance layer (REGA license gate, Wasata contract requirement, 7-state license tracker, Ejar notarization) is built to keep the *transaction itself* provably compliant with Saudi real-estate regulation — closer to a documentation/paper-trail system than a reputation system. Aqar has no directly observed equivalent of TruBroker's public quality/responsiveness badge; District Broker is a visibility mechanic, not a trust mechanic, since it is bid-based rather than performance-based.

## What problems Aqar is actually trying to solve `[Inferred]`

Not "help brokers run a business" as a general goal, and not primarily "build agency software" the way Bayut Profolio's audit concludes Bayut is doing. The evidence points to a narrower goal: **keep every listing and every rental/sale transaction moving through Aqar provably REGA/Ejar-compliant, while monetizing broker visibility through as many independent levers as the marketplace can support (subscription, wallet, auction, transaction fee).** Broker "operations" tooling (team management, statistics, invoices) exists mainly to make the compliance and monetization machinery usable, not as a first-class CRM investment — which is consistent with team management being the thinnest, least-governed part of the entire product.
