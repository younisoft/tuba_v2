# AI Opportunities

Framed against what was *directly observed missing or shallow* in Aqar, not generic AI feature ideas. Each opportunity names the specific Aqar gap it responds to.

## 1. Compliance co-pilot for license/Wasata paperwork

**Gap observed**: the REGA license gate and the free-license Wasata form (contract number, deed number, ad type, POA toggle) offer zero inline guidance — a broker unfamiliar with the terminology has no self-serve path (`04_PAGE_ANALYSIS.md`, `11_WEAKNESSES.md`).
**Opportunity**: an AI assistant that explains each required field in plain language on demand, flags likely data-entry mistakes (e.g., a deed number in the wrong format) before submission, and — where permitted by REGA/Wasata data-sharing terms — pre-fills known fields from a previously verified license or contract on file for the same broker.

## 2. License-lifecycle risk alerts

**Gap observed**: the 7-state license tracker (`/mlr`) has no glossary and no link from a state to the action that advances it, and license expiry (Bayut's audit finds the same root problem) is not connected to which listings are actually at risk (`06_USER_JOURNEYS.md` Journey 2).
**Opportunity**: proactive natural-language alerts — "3 listings will stop being visible in 9 days because license #X expires; renew now or these will be paused" — generated from the state-transition data Aqar/Tuba already has, turning a passive status tab into an active worklist.

## 3. Wallet spend-it-or-lose-it forecasting

**Gap observed**: wallet balances expire (~3 months observed) with no pre-expiry warning found anywhere in the product — real money was silently forfeited in the audited account's own transaction history (`04_PAGE_ANALYSIS.md`, `11_WEAKNESSES.md`).
**Opportunity**: a forecasting nudge that tells a broker, in plain language and with a specific recommendation, how to spend an expiring balance productively — e.g., "your 100 SAR expires in 5 days; based on your inventory, boosting listing #4821 would use it and is projected to add ~30 views" — converting a silent loss into a guided decision.

## 4. Bid-recommendation assistant for visibility auctions

**Gap observed**: District Broker's bidding flow (`06_USER_JOURNEYS.md` Journey 4) presents a bare city/zone selector with no visible guidance on what a competitive bid actually looks like, and the feature's real granularity (broad zones, not neighborhoods) is easy to misjudge.
**Opportunity**: if Tuba builds an equivalent auction mechanic, pair it with a recommendation engine that shows a broker the current competitive range for a zone/time window and a suggested bid based on their own listing mix and historical performance — turning a blind auction into an informed one.

## 5. Listing-readiness and quality scoring before publish

**Gap observed**: Office Statistics exposes a per-listing "Quality" score attributed to a marketer, but only after the fact, in an analytics table — not at creation time, and Add Listing itself has no pre-publish quality check (`04_PAGE_ANALYSIS.md`).
**Opportunity**: move quality scoring to the point of listing creation — an AI check on photo count/quality, description completeness, and pricing plausibility (vs. comparable local inventory) before a listing goes live, rather than discovering low quality only in a retrospective statistics table.

## 6. Marketing Request matching and inbox

**Gap observed**: owner-originated "Marketing Request" listings exist and are genuinely discoverable, but only inside a generic Favorites list — there is no dedicated broker inbox, no filtering by request type, and no visible claim/respond workflow (`04_PAGE_ANALYSIS.md`, `06_USER_JOURNEYS.md` Journey 7).
**Opportunity**: an AI-matched lead inbox that proactively surfaces new owner marketing requests matching a broker's stated specialty (location, property type, price band) — turning a passive, undiscoverable mechanic into an active lead-generation channel, which would be a genuine differentiator neither Bayut nor Aqar currently appears to offer at this level.

## 7. Conversion-funnel coaching on assigned Ejar contracts

**Gap observed**: Broker Ejar Contracts already surfaces a real conversion-rate KPI (`09_FEATURE_CATALOG.md`) but with no explanation of what's driving it or what to do differently — it's a number, not a coaching signal.
**Opportunity**: pair the conversion-rate KPI with AI-generated, specific-to-the-broker recommendations ("contracts assigned more than 5 days ago without a follow-up convert 40% less often — you have 2 such contracts now") — the same "numbers-first, explanation-second" gap the Bayut audit identifies for Bayut's own KPI tiles, addressable with the same pattern on both platforms.

## 8. Guided onboarding for the role/path fork

**Gap observed**: Add Listing's first step (Host / Owner-Agent / Broker-Marketer) offers no explanation of how the three roles differ, and choosing wrong likely leads to a dead end or the wrong compliance path (`04_PAGE_ANALYSIS.md`).
**Opportunity**: a short conversational intake ("what are you trying to do?") that routes a user to the correct role and the correct license path (existing REGA number vs. free-license-via-Wasata) automatically, rather than requiring the user to already know which of three unexplained cards applies to them.

## Cross-cutting architecture note

Any AI feature Tuba builds on top of a broker back-office should be **deliberately excluded from the kind of consumer ad-attribution instrumentation observed on Aqar's `/offices-management`** (`08_TECHNICAL_OBSERVATIONS.md`) — an AI assistant that reads broker operational data (listings, contracts, wallet balance) to generate recommendations is a materially different trust relationship than a marketplace tracking a shopper, and should be built and disclosed as such.
