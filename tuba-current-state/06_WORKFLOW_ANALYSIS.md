# 06 — Workflow Analysis

**Status**: Observed (live, authenticated browser session, 2026-08-06). Updates and confirms/refines the source-code-inferred workflows in [15_CURRENT_STATE_VS_TARGET_STATE.md](15_CURRENT_STATE_VS_TARGET_STATE.md).

---

## 1. Listing creation (started, deliberately not completed)

**Observed sequence**:
1. Clicking "إضافة عقار جديد" (Add New Property) from the dashboard header or the Properties page does **not** navigate to a page — it opens a modal.
2. The modal's first (and, as far as this pass observed, only) step is a **REGA ad-license/Commercial-Registry lookup**: a "السجل التجاري/ الهوية الوطنية" (Commercial Registry / National ID) button, a "نوع الترخيص" (license type) toggle defaulting to "منشأة" (Establishment), a "الرقم الموحد" (Unified Number) field, and a "رقم ترخيص الإعلان" (Ad License Number) field.
3. Per this assessment's observation-only method (matching the discipline already applied in the Bayut/Aqar audits), this workflow was **deliberately stopped here** — entering a fabricated REGA/Commercial-Registry number would violate the never-invent-findings discipline this entire assessment is built on.

**What this confirms and what it refines**: Source-code review (via the `?chk=1` legacy-form parameter and the general "dual fork, no readiness guidance" framing borrowed from the Bayut/Aqar comparison) suggested Tuba's listing-creation flow gives no upfront signal of what's required. **Live observation refines this**: the real, current entry point is a single, modal-gated compliance step (enter your license/registry info first) — closer to a guided flow than a blank form, though it is still a single field-entry gate rather than the TBX-recommended full checklist ("what you'll need: license number, photos, pricing" shown before any input starts). Whether the subsequent steps (after a valid license number is entered) reveal further requirements progressively or dump the full form at once could not be observed in this pass without a real credential.

**Separately confirmed**: navigating directly to the Laravel resource route `/properties/create` returns a live **HTTP 500 Server Error**. This route is not the product's actual entry point (the modal is), but its brokenness is still a real, live-confirmed defect — and is the single clearest piece of live evidence supporting the checkout-consistency concern raised in [12_SOURCE_CODE_ASSESSMENT.md](12_SOURCE_CODE_ASSESSMENT.md) §0: something in this exact application state does not function correctly on a core, frequently-used path. Whether the *actual* modal-driven flow shares the same underlying failure was not tested (would require a real license number to proceed far enough to trigger it), so this should be read as corroborating evidence, not final proof, of the media/dependency concern specifically.

## 2. Lead intake and response (fully observable, confirmed broken in a specific, visible way)

**Observed sequence**:
1. A prospective buyer's inquiry lands in one of two places: `/agent-inbox` (direct/property-linked contact) or `/property-requests` (broadcast-style requests, including the newly-identified Marketing Requests sub-type — see §3).
2. On `/agent-inbox`, several entries — spanning different dates and different linked properties — display the "sender" contact block as the **logged-in agent's own name, email, and phone number**, not a real prospective buyer's.
3. No reply mechanism exists on this page for any entry type.

**Conclusion**: this is a live, user-visible confirmation of the notification/relationship bug found in source (`AgentPropertyRequest` notifying the wrong party). The practical consequence, observed directly rather than inferred: **an agent using this inbox to follow up on a lead may end up calling or emailing themselves**, not the actual interested party, for at least some fraction of the entries in their own inbox. This is more severe in practice than "the notification goes to the wrong place" — the inbox's own historical record is affected, not just the real-time notification, meaning the data-integrity problem persists after the fact and cannot be worked around by the agent checking their inbox directly instead of waiting for a notification.

## 3. Marketing Requests / owner-originated demand (new workflow, not identified from source review)

**Observed sequence**:
1. `/property-requests` → "طلبات التسويق" (Marketing Requests) tab shows a list of owner-originated listing requests (e.g., "عمارة للبيع في جدة" — a building for sale in Jeddah), each with price, size, location, request age, and a running count of offers already submitted by other agents.
2. An agent can click "قدم عرض خدمة" (Submit a service offer) — the button becomes "تم ارسال العرض" (Offer sent) once submitted.
3. The submitted offer then appears under the "تم التواصل" (Contacted) tab, showing the specific commission percentage offered (observed: "تم تقديم العرض: 2.5%").
4. This mechanic is tier-gated: `/agent-packages` explicitly lists "تلقي طلبات التسويق من الملاك" (receive marketing requests from owners) as a paid package feature, confirming it is a real, monetized part of the product, not a leftover experiment.

**Significance**: this workflow closes what this assessment's [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md) (written before this live session, based on source-code review alone) had characterized as a gap versus Aqar's Marketing Request mechanic. Tuba has a comparable feature; the corrected comparison is in the updated Gap Analysis. The workflow's own weakness, directly observed: the card titles contain an untranslated internal token ("for_sale"/"for_rent") rendered directly into otherwise-Arabic UI text — a live, visible localization defect on a monetized, tier-gated feature.

## 4. Team/sub-user management (fully observable)

**Observed sequence**: `/agent-users` → a flat table of sub-agents (name, mobile number) → Add/Edit/Delete. No step in this flow at any point asks what the new sub-user should be allowed to do. This matches the source-code finding (`AgentUsersController::store()` hardcodes the sub-user's role by magic ID) and the flat, ungated navigation documented in [03_INFORMATION_ARCHITECTURE.md](03_INFORMATION_ARCHITECTURE.md) — there is no live UI surface anywhere in this workflow where scoped permissions could even be assigned, confirming this is a genuine product gap, not merely a hidden/unsurfaced backend capability.

## 5. Back-office instrumentation (new finding — resolves an explicitly flagged open question)

[13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md) (pre-live-session version) explicitly flagged as unknown "whether Tuba's dashboard is free of consumer ad-attribution tracking" — the one area where Tuba might have out-differentiated Aqar's confirmed weakness (Google Ads, Snapchat, LinkedIn Insight Tag, Microsoft Clarity on Aqar's authenticated console).

**Observed**: it is not free of such tracking — if anything, the authenticated Tuba agent dashboard carries a **broader** set of consumer ad-attribution pixels than what was documented for Aqar:

| Vendor | Evidence observed |
|---|---|
| Google Analytics / Tag Manager (`G-3VTJVZGFFS`) | `page_view` and `scroll` events fired with client ID, session ID, screen resolution, full user-agent string |
| Facebook Pixel (`fbevents.js`, pixel ID `1786097939041572`) | `PageView` event with extensive browser-fingerprint/matching parameters (`fbp` cookie, hashed signals) |
| TikTok Pixel | Identify + pixel API calls |
| Snapchat Pixel | Multiple tracking beacons across page loads |

All four fire on ordinary authenticated dashboard navigation (observed on `/dashboard` and `/developer-packages`), not just on public marketing pages. This directly contradicts what would have been a clean, low-effort differentiation opportunity named in the TBX synthesis ("a back-office genuinely free of consumer ad-attribution instrumentation... an explicit architectural principle, not just a marketing claim") — Tuba currently does not have this differentiator and would need to actively remove this instrumentation from authenticated routes to claim it. See the updated [13_GAP_ANALYSIS.md](13_GAP_ANALYSIS.md) row.

## 6. Empty states (resolves a second explicitly flagged open question)

**Observed**: `/developer-packages` is a confirmed, live dead end — a bare "لم يتم العثور على بيانات" (no data found) message with no functional catalog, no purchase path, and no call-to-action beyond static descriptive text for services that aren't actually orderable from this screen. This is structurally the same failure mode the TBX synthesis named as Aqar's cautionary example (`/user/campaigns/new` — a heading over a blank screen). Tuba shares this failure mode on at least one screen; whether it's isolated to this one now-orphaned feature or recurs elsewhere was not exhaustively tested in this pass.

By contrast, the `/properties` Draft-tab empty state ("لم يتم العثور على عقارات") is a **milder** version of the same pattern — a real message rather than a truly blank screen, though still with no repeated call-to-action inside the empty panel itself and a misspelled image `alt` attribute ("no propertes").
</content>
