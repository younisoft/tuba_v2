# Information Architecture

```text
Profolio
├── Overview
│   ├── Profile completion (progress ring + CTA)
│   ├── Listings summary (Active/For Sale/To Rent/Daily Rentals/Signature/Hot/Basic)
│   ├── Credits balance (Available/Used/Total, current plan)
│   ├── Performance KPIs (Views/Clicks/Leads/Calls/WhatsApp/SMS/Emails, date-range filter)
│   └── Recent listings table
├── Post Listing
│   ├── Sell or Rent Property
│   └── Daily Rentals (badged "NEW")
├── My Listings
│   ├── Active (12) — full lifecycle table: performance, upgrades, actions
│   ├── Draft (3) — Not Posted / Insufficient Credits states, Publish Now
│   ├── Pending (0)
│   ├── Removed (29) — Ad License Expired / Deleted sub-states, lifetime performance retained
│   ├── Ad License Requests (0)
│   └── Listing preview panel (read-only side sheet from the eye icon)
├── Credits Usage
│   ├── Package status (available/used/total, current plan)
│   ├── Usage breakdown (Basic/Hot/Signature Listing, Refresh, Photography, Videography, Drone)
│   └── Credits usage history (per-listing ledger with timestamps)
├── TruLeads
│   ├── Lead metrics (Total Leads, TruLeads, Bayut Match)
│   ├── Call Insights (Clicked/Received/Answered/Missed/Response Rate/Avg Duration/Avg Resp. Time)
│   ├── WhatsApp Insights (Clicked/Received/Chat Initiated/Response Rate/Avg Resp. Time)
│   ├── Lead filters (Listing ID, date range, Lead Received/Last Interaction)
│   ├── Lead table (All Leads / Bayut Match tabs)
│   ├── Add New Lead / Add Task actions
│   └── Onboarding checklist overlay ("Finish" walkthrough)
├── Agent Performance
│   ├── Agent header (name, public profile link)
│   ├── Leaderboard rank + TruPoints™ + Activity
│   ├── Unlock TruBroker™ progress (Complete Profile / 2+ Active Listings / Active Bayut Package)
│   ├── Badge cards: Quality Lister, Responsive Broker, Super Lister (each Locked, with sub-metrics)
│   └── Team performance table (Staff, Badges, Rank & TruPoints™, Quality Score, Responsiveness, Active Listings)
├── Reports (Summary)
│   ├── Listings breakdown (Active/For Sale/To Rent/Daily Rentals/Signature/Hot/Basic)
│   ├── Breakdown by location (per-purpose, % share by district)
│   ├── Performance (Views/Clicks/Leads/Calls/WhatsApp/SMS/Emails, segmented by purpose, date range)
│   └── Daily time-series chart, filterable by listing tier (All/Basic/Hot/Signature)
├── Agency Staff
│   └── Manage Staff (staff table: name/role, credits limit, used credits; Invite User)
├── Settings
│   ├── User Settings (personal profile, service area, languages, agent bio EN/AR, AI bio generator, photo)
│   ├── Agency Settings (agency name, website, phone, city, address, description, logo)
│   ├── Licenses (FAL license, CR number, license owner, validity, "Share with agency staff" toggle)
│   ├── Preferences (Smart Credit Utilization, Push Notifications, Image/Details usage consent for TruBroker marketing)
│   └── Change Password
├── Credits & Packages
│   ├── Current package summary (tier, credits, end date, top-ups purchased)
│   ├── Package comparison grid (Starter → Titanium, 7 tiers, annual/6-month toggle)
│   └── Credit top-up (custom amount)
└── Notifications (header bell)
    └── Lifecycle/engagement nudges: new lead alerts, upgrade prompts, TruBroker onboarding nudges
```

See `diagrams/site-map.mmd` for the Mermaid sitemap.

## Notes on this pass

- "Agent Performance" and "Reports" are two separate nav items, not one — the original capture's automated text-scrape concatenated their adjacent labels and then failed to find a menu item literally named "Agent Performance Reports". Corrected in this pass.
- The Pending and Ad License Requests tabs were empty (0) for this account at capture time — structure inferred from tab presence and column headers only.
