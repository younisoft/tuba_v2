# Component Library

Reverse-engineered from direct observation across all captured screens. Variants and states listed are only those actually observed; anything not seen is noted as such rather than assumed.

## Buttons

- **Primary**: white text on brand green (`rgb(0,130,54)` / `#008236`), `border-radius: 6px`, `padding: 6px 16px`, `font-size: 14px`, `font-weight: 500`, subtle drop shadow (`0 1px 3px rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)`). Used for the dominant action on every screen (أضف إعلان, التالي, ترقية الباقة, شحن المحفظة, حفظ التغييرات).
- **Secondary/outline**: white background, green border and text, same sizing as primary. Used for the lower-priority alternative action alongside a primary (e.g., "تجديد الاشتراك" beside "ترقية الباقة").
- **Disabled/muted state**: observed on the REGA license "التالي" button before a value is entered — a lighter, desaturated green fill rather than a grey disabled style, which slightly under-communicates "this is not yet clickable" compared to a conventional grey-disabled pattern.
- **Icon+label pill button**: used for "أضف إعلان" (`+` icon), "إضافة حملة" (`+` icon), "إضافة موظف" — consistent `+` prefix convention for all "create new" actions across the product.
- **Tab-style toggle buttons**: pill-shaped, single-select, used for lifecycle filters (My Ads' 6 tabs, Licenses' 7 tabs, Wallet's 4 tabs, District Broker's 3 tabs, Bookings' 2 tabs). Active state: solid green fill, white text. Inactive: white/outline, dark text. This is the single most reused pattern in the product.

## Cards

- **DOM-verified base card**: white background, `border-radius: 8px`, `border: 0.8px solid rgba(204,204,204,.8)`, no box-shadow, `padding: 4px` at the outer wrapper (inner content typically re-pads itself). Used for the Subscription Info card, the Establishment Account card, and marketplace listing/project cards.
- **Marketplace listing card** (public + Favorites): thumbnail image (or a generic illustrated placeholder when no photo exists — see Empty/Placeholder Illustrations below) on one side, title/location/price/description stack on the other, with a small icon row for bed/bath/area specs on for-sale/rent cards.
- **Off-plan project card**: darker overlay treatment — hero image with a bottom gradient scrim, colored footer bar (color varies per developer brand) carrying "starting from" price, project name, and location; top-left status badges (على الخارطة / متاح / unit-type) as small white pill chips over the image.

## Tables

- Used for: My Ads' (would-be) inventory list, Team/Users, Office Statistics, Wallet history, Broker Ejar Contracts, Invoices.
- **Consistent column pattern**: an identity/name column first (RTL-rightmost), then descriptive metadata columns, then numeric/status columns, then an "خيارات" (Options) actions column last (RTL-leftmost).
- **No bulk-action affordances observed** on any table (no row checkboxes, no "select all," no bulk edit/delete) — every table observed operates on single-row actions only, and most were empty so even single-row actions could not be exercised.
- **No column sort/filter controls observed** beyond the tab-level lifecycle filters sitting above a table — no in-header column sort arrows were found.

## Empty States

Three distinct qualities observed, worth treating as three sub-patterns:

1. **Good — Saved Searches** (`/user/searches`): icon + specific explanatory sentence + a single clear CTA that matches the sentence's action.
2. **Adequate — most list screens** (My Ads, Licenses, Featured Campaigns, District Broker, Broker Ejar Contracts, Bookings, Payment Requests): icon + short label ("لا توجد إعلانات" / "لا توجد حملات حالياً" / etc.) with no CTA inside the empty state itself — any path forward exists only in a button placed elsewhere on the page (usually the header), not connected to the empty state visually.
3. **Broken — Featured Campaign creation** (`/user/campaigns/new`): heading only, blank body, no icon, no message, no CTA — the empty-state pattern is entirely absent rather than merely minimal.

Each empty-state icon is illustration-style and topic-matched (a calendar for Bookings, a folder for Licenses, a magnifying glass for Saved Searches/District Broker, a cash-and-receipt icon for Payment Requests) — the illustration system itself is consistent even where the surrounding empty-state completeness is not.

## Form Fields

- **Text input**: minimal chrome — DOM-verified base input carries no visible border/background of its own (`border: 0px`, `background: transparent`) and inherits styling from a wrapping container div, consistent across the REGA license field, the Wasata contract/deed/price fields, and Office Settings' username/bio fields.
- **Dropdown/select**: custom-rendered (not a native `<select>`) — observed on Ad Type (free-license form) and City/Zone (District Broker bid) — opens as an in-flow expanding list rather than a native OS picker, with a default "الرجاء الاختيار" (Please Choose) / "اختر المدينة" (Choose City) placeholder row always present as the first list item.
- **Toggle switch**: pill-style on/off switch, used for the free-license "power of attorney" flag and the auto-renewal setting — green when on, grey when off, consistent across both usages.
- **Slider (read-only/progress)**: used non-interactively to visualize remaining ad-space capacity, remaining user seats, and remaining subscription days on both Subscription Info and Office Management Dashboard — a single filled-track component reused for three different "remaining of total" metrics.

## Modals

- **Wallet top-up modal**: centered overlay, dimmed backdrop, close (`×`) icon top-left (RTL), segmented control for payment method (Card/Bank Transfer), single amount field, explanatory caption, single full-width submit button. This is the only true modal-dialog pattern observed in the audit — every other multi-step flow (Add Listing, License issuance, District Broker Bid) is a full-page-navigation wizard rather than a modal.

## Accordions

- **FAQ accordion** (Subscription Info): six collapsible rows, chevron-down icon, one visible open/closed state per row, no visible "expand all" control. Simple, standard implementation.

## Status Badges / Pills

- **"جديد" (New) badge**: small red-filled pill, used to flag newly launched features in the account drawer (District Broker campaigns, Broker Ejar Contracts) and inline in the Add Listing action-card list (District Broker promotion card) — a single consistent visual treatment for "new feature" across at least two different UI contexts (list item and drawer link).
- **"موثق" (Verified) badge**: green outline pill with checkmark-style treatment, used on the Establishment Account screen.
- **Notification dot**: small red circular dot, observed on the "معلومات الباقة" (Package Info) button in My Ads — used to draw attention without a numeric count.

## Illustrations / Placeholder Art

- A consistent light, rounded, two-tone illustration style (a stylized house/villa outline in green/grey) is used wherever a listing has no photo (Favorites list items for text-only "طلب تسويق" posts) and wherever a benefit/step needs visual support (Featured Campaign's 3-step explainer, Ejar Contract's hero image). This is a legitimate, deliberate design-system asset, not a broken-image fallback — confirmed by its reuse across unrelated contexts with consistent styling.

## Navigation Components

- **Global top nav**: fixed, persists across every screen including deep workflow steps — never collapses into a "focused" or "distraction-free" mode even mid-flow (e.g., still fully present during the REGA license gate and the District Broker bid steps).
- **Account drawer**: right-side slide-over panel (in RTL, opens from the right), overlays the current page rather than navigating away — closing it returns to the exact same underlying page/scroll position.
- **Office Management sidebar**: persistent right-hand vertical list, single-level (no nesting/collapse), each item icon + label, active item shown with a light-grey background fill (`rgb(234,234,234)` DOM-verified) rather than the green used for active tab-pills elsewhere — a minor inconsistency in how "currently selected" is communicated between the sidebar and the tab-pill pattern used everywhere else.
