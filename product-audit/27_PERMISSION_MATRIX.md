# Permission Matrix (Reverse-Engineered)

## Important caveat

The audited account was a **single-seat agency** (one user, "Owner," on the staff table). No second role was ever logged in, so **no permission boundary in this matrix was directly tested** — everything below is either read off UI affordances that *imply* a boundary (`[Inferred from UI structure]`) or a recommended model for Tuba (`[Recommended]`). Nothing here should be taken as confirmed Bayut behavior beyond "the Owner role can do X," which was directly observed.

## Roles actually named or implied in the product

- **Owner** — the only role label observed anywhere (next to the single staff row, and as the License "Owner" field). `[Observed]`
- Everything below "Owner" is `[Inferred]` from the existence of a staff table with per-row credit limits and an "Invite User" action, implying at least one other role exists, undefined in the UI.

## Matrix

Legend: ✅ confirmed via direct observation · 🟡 inferred (structure implies this) · ❓ unknown/untested · ⛔ confirmed unavailable in this product

| Feature / Resource | Owner | Invited Staff (undifferentiated) | Tuba: Admin `[Recommended]` | Tuba: Listing Manager `[Recommended]` | Tuba: Agent `[Recommended]` | Tuba: Finance `[Recommended]` | Tuba: Read-only Analyst `[Recommended]` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| View Dashboard/Overview | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create/Publish Listing | ✅ | 🟡 | ✅ | ✅ | 🟡 scoped to own listings | ⛔ | ⛔ |
| Edit Listing | ✅ | 🟡 | ✅ | ✅ | 🟡 own listings only | ⛔ | ⛔ |
| Delete Listing | ✅ | ❓ | ✅ | 🟡 with approval | ⛔ | ⛔ | ⛔ |
| View License | ✅ | 🟡 gated by "Share with agency staff" toggle | ✅ | 🟡 read-only | ⛔ | ⛔ | 🟡 read-only |
| Edit/Renew License | ✅ | ❓, likely ⛔ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Manage Staff (invite/remove) | ✅ | ❓, likely ⛔ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Set per-staff Credit Limit | ✅ | ⛔ (this is the control being set on them) | ✅ | ⛔ | ⛔ | 🟡 | ⛔ |
| Spend Credits (publish/boost) | ✅ | ✅, capped by Credit Limit | ✅ | ✅, capped | 🟡 capped, smaller default | ✅ | ⛔ |
| Purchase Package / Top-up | ✅ | ❓, likely ⛔ | ✅ | ⛔ | ⛔ | ✅ | ⛔ |
| View Credits Usage History | ✅ | 🟡 | ✅ | 🟡 own spend only | 🟡 own spend only | ✅ | ✅ |
| View TruLeads | ✅ | 🟡 | ✅ | ✅ | ✅ own leads | ⛔ | ✅ |
| Add/Assign Lead | ✅ | 🟡 | ✅ | ✅ | ✅ | ⛔ | ⛔ |
| Add Task | ✅ | 🟡 | ✅ | ✅ | ✅ | ⛔ | ⛔ |
| View Agent Performance (own) | ✅ | 🟡 | ✅ | ✅ | ✅ | ⛔ | ✅ |
| View Agent Performance (team table) | ✅ | ❓, likely ⛔ | ✅ | 🟡 | ⛔ | ⛔ | ✅ |
| View Reports Summary | ✅ | ❓ | ✅ | ✅ | 🟡 own scope only | ✅ | ✅ |
| Export Reports `[Recommended feature, not observed in Bayut]` | n/a | n/a | ✅ | 🟡 | ⛔ | ✅ | ✅ |
| Edit own User Settings | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Agency Settings | ✅ | ❓, likely ⛔ | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Edit Preferences (Smart Credit Utilization etc.) | ✅ | ❓ | ✅ (agency-level) | ⛔ | ⛔ | 🟡 | ⛔ |
| Change own Password | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Audit Log `[Recommended, not observed in Bayut]` | n/a | n/a | ✅ | 🟡 own actions | ⛔ | 🟡 own actions | ✅ |

## What was actually confirmed about Bayut's own permission model

1. Exactly **two** granular access-control primitives exist: per-staff **Credits Limit**, and the license's **"Share with agency staff"** toggle. Both are coarse — a cap and a binary switch, not a role-permission matrix.
2. There is **no visible role picker** anywhere in the Agency Staff or Invite User surfaces that were reached — "Owner" appears to be a status derived from being the license holder, not a role selected from a list.
3. Agent Performance's team table implies **agency-wide visibility of every staff member's individual quality/responsiveness scores** — i.e. performance data is not private to the agent, which is itself a permission decision (transparency by default) worth calling out explicitly rather than assuming.

## Recommendation for Tuba

Ship explicit, named roles from day one (the six in the matrix above are a reasonable starting set for a real-estate agency: Owner, Admin, Listing Manager, Agent, Finance, Read-only Analyst) rather than Bayut's implicit "Owner vs. everyone else" model. Scope the two things Bayut already scopes (credit spend, license visibility) *per role*, not agency-wide, and add the two controls Bayut is missing entirely: an audit log, and export permissions independent from view permissions.
