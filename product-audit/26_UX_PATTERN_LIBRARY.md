# UX Pattern Library

Each pattern is rated 1–10 on how well it was executed where observed, with a concrete improvement. Patterns not observed at all are listed at the end as confirmed gaps, not scored.

| Pattern | Observed instance | Rating | Improvement |
| --- | --- | --- | --- |
| Progressive disclosure (filters) | "Show More" on Listings/TruLeads filter bars | 7/10 | Persist the user's last-expanded state per session instead of resetting on every visit |
| Disabled-state affordance | "Clear filters" renders disabled until a filter is actually set | 8/10 | Good pattern — carry it forward as a default rule in Tuba (never show an actionable-looking control that does nothing) |
| Status pill / tag | Live (green), Basic/Hot/Signature (neutral/colored) | 7/10 | Extend the same pill language to the four Draft/Removed sub-reasons, which currently look identical to each other |
| Slide-over preview panel | Listing preview (eye icon) | 7.5/10 | Add a missing-media nudge when photo count is 0; extend the same pattern to Leads and Staff rows |
| Segmented control + tab combo | Performance widget (Dashboard, Reports): purpose segmented control above a Views/Clicks/Leads tab strip | 7/10 | Fine as a filter combo; needs a stated comparison baseline next to every percentage delta |
| Locked achievement / gamification | TruBroker badges | 6/10 | Concept is strong; execution stops short — no explicit progress-to-unlock shown |
| Notification feed | Header bell dropdown | 6.5/10 | Split transactional vs. marketing streams; add a filter or tab |
| Bilingual field pairing | Agency/agent description EN+AR side by side, incl. an AI-generate button per language | 7.5/10 | Genuinely good pattern for a bilingual market; extend AI-generation to other free-text fields (agency description) |
| Pagination | Listings table, numbered pages + prev/next, disabled boundary state | 7/10 | Standard and correct; would benefit from a page-size control on dense tables |
| Empty state (structural) | Pending (0), Ad License Requests (0) tabs render as valid empty tabs | 6/10 | Not exercised visually in this audit (no screenshot of the actual empty-state illustration/copy) — flag for direct verification |
| Autosave / draft handling | Draft tab exists as a destination, but no autosave indicator was observed during the Post Listing flow itself | 5/10 | No "Saving…" / "Saved" feedback was visible on the one form screen reached; likely present deeper in the form but not confirmable from this audit |
| Confirmation dialogs (destructive) | Not exercised (audit intentionally avoided delete/save actions) | n/a | Verify a real delete confirmation exists before Tuba assumes parity here |
| Toast / inline success feedback | Not captured (no mutating action was performed) | n/a | Same caveat as above |
| Skeleton loading | Not captured in any screenshot (all captures were post-load) | n/a | Cannot confirm presence or absence; worth a dedicated performance-focused pass |
| Keyboard navigation / focus states | Not specifically tested | n/a | Untested — flag as an open question, not a confirmed gap |

## Patterns confirmed absent (not just unobserved)

These were actively looked for and not found anywhere across ~20 captured screens:

- **No global search.** Every filter is scoped to its own module (Listings has ID/REGA search; TruLeads has its own Listing ID search) — there is no single search bar that spans listings, leads, and staff.
- **No saved views / saved filters.** Every filter panel resets between sessions (based on the fact filter state lives in the URL query string, not a persisted preference).
- **No bulk actions.** Every table row exposes only single-row actions; no row-selection checkboxes were seen on Listings, TruLeads, or Agency Staff.
- **No export control** (CSV/PDF) anywhere, including on the one page most likely to want it (Reports Summary).
- **No undo pattern.** Deletion of a listing appears to be recoverable only via the Removed tab's "Publish Now," which is a *recovery workflow*, not an undo affordance surfaced at the moment of the action.
- **No comparison-to-baseline framing.** Every percentage delta (e.g. "Views 1,675 759%") is shown without the number it's being compared against.

## Recommendation for Tuba

Adopt the patterns that scored well (disabled-state discipline, bilingual field pairing, slide-over preview) as defaults, and treat the five confirmed-absent patterns above as the actual competitive opening — global search, saved views, bulk actions, export, and comparison framing are exactly the "power user" affordances a growing agency will notice missing first, and none of them require new data, only better presentation of data Bayut already collects.
