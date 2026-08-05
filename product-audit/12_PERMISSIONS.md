# Permissions

Observed permission signals:

- Agency Staff module is visible, with a staff table (Staff Details, Credits Limit, Used Credits, Actions) and "Invite User" — this account had 1 user (the owner), so multi-seat behavior (what a second seat can/can't see) was not directly observable.
- Per-staff **Credits Limit** is the one concrete, granular permission-like control found: each staff member can be capped on how many credits they're allowed to spend, independent of the agency's total balance.
- Licenses screen has a **"Share with agency staff"** toggle on the FAL license — the only other real access-control primitive in the product. It is binary: the license (and by extension, presumably, the ability to publish/reference it) is either visible to the whole staff list or to no one. There is no per-role or per-listing scoping.
- User Settings module is visible and is personal-scope only; Agency Settings, Licenses, and Preferences are agency-scope but sit under the same "Settings" umbrella with no visible role gate stopping a non-owner staff member from reaching them (not testable further without a second seat).
- Staff management appears separated from personal profile settings.
- Agent Performance's team table implies staff-level visibility of quality/responsiveness scores is agency-wide (owner sees every staff member's Quality Score and Responsiveness), i.e. performance data is not private to the individual agent.

Not visible in captured session (single-seat account):

- Explicit role definitions (Owner/Admin/Agent/Finance/etc.) — nothing in the UI names a role beyond "Owner" shown next to the one staff row.
- Fine-grained feature-level permissions (e.g. can a given staff member publish a listing vs. only view it).
- Invite/disable user workflow details beyond the "Invite User" button existing.
- Audit log of who changed what.
- Approval chains for listing publication or credit spend above a threshold.

Recommendation: Tuba should model permissions explicitly around agency owner, admin, listing manager, agent, finance/package manager, and read-only analyst roles, and should scope sensitive records (license sharing, credit limits) per-role rather than as agency-wide binary toggles — Bayut's own license-sharing control is the clearest example of a permission that exists but isn't actually granular.
