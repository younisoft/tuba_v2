# Feature Catalog

Every feature directly observed, grouped by domain. Status reflects what this audit could confirm, not assumed completeness.

| Feature | Location | Status observed | Notes |
| --- | --- | --- | --- |
| **Listing Management** |
| My Ads (listing inventory) | `/my-listings` | Empty (0 across all tabs) | 6-tab lifecycle: All/Published/Suspended/Expired/Archived/Featured |
| Office Listings | `/offices-management/listings` | Not opened beyond sidebar link | Parallels My Ads under the Office Management shell |
| Add Listing (role fork) | `/add-listing` | Fully walked | 3 roles: Host / Owner-Agent / Broker-Marketer |
| REGA license gate | `/add-listing/rega` | Fully walked to submission point | Mandatory field; not submitted (real ID required) |
| Free license issuance | `/add-listing/rega?license=free` | Fully walked to submission point | Requires Wasata contract # + deed # + price + ad type + POA toggle |
| License request tracking | `/mlr` | Empty (0 across all tabs) | 7-state lifecycle, no counts shown per tab |
| **Monetization** |
| Subscription / Package | `/user/subscription-info` | Fully observed | 30 ad-spaces, 1/1 seats, 259-day term, upgrade/renew CTAs, FAQ |
| Wallet | `/user/wallet` | Observed with real history | Separate cash balance; top-ups expire (~3mo observed) |
| Wallet top-up | Modal on `/user/wallet` | Opened, not submitted | Card or bank transfer |
| Featured Listings / Campaigns | `/user/campaigns`, `/offices-management/campaigns` | Explainer + broken creation flow | Dead end at `/user/campaigns/new` with 0 listings |
| District Broker (bid-based visibility) | `/user/my-district-broker-bids`, `/district-broker/bid` | Walked to bid-amount step | City → zone (5 broad zones, not fine neighborhoods) |
| Ejar contract notarization (paid) | `/user/ejar-contracts` | Pricing screen observed | SAR 299 residential / SAR 499 commercial |
| Aqar+ (consumer premium tier) | `/aqar-plus` | Fully observed | SAR 29.99; perks are consumer-facing, surfaced in broker drawer |
| Invoices / Billing history | `/offices-management/invoices` | Observed, 1 real entry | No amount column, no invoice download found |
| Payments | `/my-account/payments` | Linked, not opened in depth | — |
| Bank account & tax info | `/user-actions/financial-info` | Linked, not opened in depth | — |
| Card management | `/user-actions/cards-settings` | Linked, not opened in depth | — |
| **Team / Office** |
| Office Management console | `/offices-management` | Fully observed | Separate dashboard+sidebar shell, duplicates parts of account drawer |
| Team/Users | `/offices-management/users` | Empty (0 users) | Add-by-phone-number only; no roles/permissions of any kind |
| Office Statistics | `/offices-management/statistics` | Observed, all-zero data | Per-listing table incl. a "Quality" score column with info icon |
| Office Settings (profile) | `/offices-management/settings` | Fully observed | Avatar, username, bio only |
| Establishment Account | `/user/establishment-account` | Fully observed | Business name, CR number, verified badge, logo |
| **Leads / CRM-adjacent** |
| Broker Ejar Contracts (assigned) | `/user/broker-ejar-contracts` | Empty (0 contracts) | Conversion-rate KPI, converted amount, contract value, completed count |
| Rental Contracts (own) | `/my-rental-contracts` | Linked, not opened in depth | Distinct from Broker Ejar Contracts |
| Saved Searches ("طلباتي") | `/user/searches` | Empty, well-designed | Demand-side alerting for matching inventory |
| Marketing Request listings | Discovered via `/favorites` | Real examples observed | Owner-posted "seeking broker" listings; no dedicated broker inbox found |
| **Rentals / Bookings** |
| Bookings (guest + host) | `/user/bookings` | Empty (0), both tabs | "حجوزاتي" (guest) / "حجوزات العملاء" (host/operator) |
| Off-plan Payment Requests | `/user/my-payment-requests` | Empty (0) | Unit-reservation payment tracking for off-plan projects |
| **Consumer-facing / Marketplace** |
| Public listing search | `/عقارات` | Linked, IA-mapped only | City/type filter chips |
| Off-plan Projects marketplace | `/المشاريع-العقارية` | Fully observed | City chips, developer-branded project cards |
| Map search | `/الخريطة` | Linked, IA-mapped only | — |
| Favorites | `/favorites` | Observed with real data | Tabs: Listings / Projects |
| **Account** |
| Personal profile edit | `/user-actions/profile-update` | Linked, not opened in depth | — |
| Phone number change | `/user-actions/update-phone` | Linked, not opened in depth | — |
| Locale toggle | Account drawer "English" link | **Bug** | Links to `/user/bookings`, not an English locale |
| Dark mode toggle | Global footer | Present | Not deeply tested for coverage/contrast |
| Logout | Account drawer | Present | — |

## Feature-family comparison flags vs. the Bayut audit (`product-audit/`)

- **No direct Aqar equivalent found** for: Bayut's TruBroker gamification (leaderboard/points/badges tied to a public trust badge), Bayut's per-listing lifetime-performance retention after removal (untestable here — no listings existed to remove), Bayut's Reports location-composition breakdown.
- **No direct Bayut equivalent documented** for: Aqar's wallet-with-expiry mechanic, Aqar's bid-based (District Broker) visibility auction, Aqar's paid Ejar notarization service, Aqar's owner-originated Marketing Request lead flow, Aqar's dual daily/monthly short-term-rental hosting integrated into the same account.
- **Present in both, implemented differently**: license/compliance tracking (Aqar: 7-state granular tracker; Bayut: license card + binary staff-sharing toggle per the Bayut audit), team management (Aqar: flat phone-number add, zero permissions; Bayut: per-staff credit limit + binary license-sharing toggle, itself already flagged as too coarse in the Bayut audit).
