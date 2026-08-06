# 16 — Implementation Checklist

The per-screen, per-workflow checklist engineering and QA work against before calling anything "done." Two levels: a **universal Definition of Done** every screen must clear (derived from the binding rules already established across this folder — nothing new invented here, just made checkable), and a **workflow-level checklist** for the 14 workflows in [01_EXPERIENCE_ARCHITECTURE.md](01_EXPERIENCE_ARCHITECTURE.md).

## 1. Universal Definition of Done (every screen in [04_SCREEN_INVENTORY.md](04_SCREEN_INVENTORY.md))

**Behavior**
- [ ] Every field in the screen's [04](04_SCREEN_INVENTORY.md) card is implemented: primary/secondary/quick/AI actions all present and functional.
- [ ] RBAC permissions match the card exactly — verified with at least one account per relevant persona code, not just an admin account.
- [ ] Every applicable state from [06_STATE_ARCHITECTURE.md](06_STATE_ARCHITECTURE.md) (universal + module-specific) is implemented and manually triggered at least once in QA, not just the happy path.
- [ ] No screen invents a component outside [05_COMPONENT_MAPPING.md](05_COMPONENT_MAPPING.md) without a written justification added to that document first.

**Explainability & Decision Support** (only where the screen carries a metric/score/AI output, per its [04](04_SCREEN_INVENTORY.md) card)
- [ ] Every metric/score/status/AI output answers all five Explainability questions on demand (why, how calculated, what changed, recommended action, business impact).
- [ ] Any widget matching a [07_DECISION_SUPPORT_SYSTEM.md](07_DECISION_SUPPORT_SYSTEM.md) catalog entry ships with its full What/Why/Impact/Action/Priority/Deadline/AI/Outcome set, not a bare number.

**AI** (only where the screen embeds an [08_AI_INTERACTION_BLUEPRINT.md](08_AI_INTERACTION_BLUEPRINT.md) capability)
- [ ] Confidence is visibly shown, never hidden.
- [ ] A manual fallback exists and was tested with AI unavailable/erroring.
- [ ] The invocation logs to AICP-02 per that capability's audit-trail row (unless explicitly marked "not logged individually").
- [ ] Nothing consequential (regulated approval, destructive action) executes without an explicit human confirmation step.

**Notifications** (only where the screen is a notification source or destination, per [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md))
- [ ] The event's urgency/channel/digest-vs-timeline behavior matches its catalog row exactly.
- [ ] A simulated delivery failure surfaces visibly in-app (anti-fatigue rule #5), verified in QA, not assumed.

**Accessibility** ([11_ACCESSIBILITY_BLUEPRINT.md](11_ACCESSIBILITY_BLUEPRINT.md))
- [ ] Full keyboard operability verified (no mouse-only path).
- [ ] Screen-reader pass completed (heading structure, live regions, ARIA roles per component contract).
- [ ] Contrast checked against WCAG 2.1 AA on every state, not just the default.
- [ ] RTL verified as a real layout, not a mirrored afterthought.
- [ ] Touch targets ≥44×44px on mobile/tablet.

**Motion** ([12_MOTION_PHILOSOPHY.md](12_MOTION_PHILOSOPHY.md))
- [ ] Every animation traceable to one of the four justified jobs (orient/confirm/continue/guide attention); anything else removed.
- [ ] `prefers-reduced-motion` tested and confirmed lossless.

**Localization**
- [ ] No untranslated tokens/enum values leak into either language's UI.
- [ ] AI-generated content verified natively generated per language, not machine-translated.

## 2. Workflow-level checklist

Applied on top of the per-screen checklist above, for each of the 14 workflows — verifies the *sequence*, not just each screen in isolation.

### WF-LEAD-NEW
- [ ] A lead created via every capture path (buyer-inbound, owner-originated, manual) lands in the same unified pipeline with identical schema.
- [ ] Capacity-aware routing resolves correctly across at least 3 test scenarios: confident match, no match (manual queue), and reassignment.
- [ ] SLA clock visibly starts at assignment and correctly triggers escalation at the defined threshold.
- [ ] A duplicate lead (matching phone/email) is correctly flagged, not silently duplicated.
- [ ] North Star Metric instrumentation (time from creation to first qualified response) is actually recording, not just designed.

### WF-PROPERTY-NEW
- [ ] Front-loaded requirements checklist appears before any field entry.
- [ ] REGA license lookup auto-fill tested against both a resolving and a non-resolving license number.
- [ ] Media upload tested with a forced mid-upload failure — confirms per-file retry, not a flow-wide crash.
- [ ] Pre-publish completeness check correctly blocks Publish when incomplete and correctly enables it when complete.
- [ ] Draft state resumable after closing and reopening the flow.

### WF-OWNER-NEW
- [ ] New-owner and existing-owner-with-new-request paths both tested.
- [ ] Merge/un-merge (split) both function and are logged.

### WF-CONTRACT-NEW
- [ ] Compliance checklist generated correctly per contract type (requires the Business Validation item in [13](13_FEATURE_READINESS_MATRIX.md) resolved first).
- [ ] Document Intelligence mismatch flagging tested against at least one deliberately mismatched document.
- [ ] OM approval step cannot be bypassed by any role, verified explicitly.

### WF-MARKETING-CAMPAIGN
- [ ] Zero-eligible-inventory state tested and confirmed non-dead-end (explains why, links to fix).
- [ ] Insufficient-balance state tested and confirmed it links directly to WAL-02.
- [ ] Attribution appears in ANL-01 within the same session as launch.

### WF-PRICE-CHANGE
- [ ] Every price change produces a permanent Price History entry — tested that no overwrite path exists.
- [ ] AI comparables context correctly withheld/degraded gracefully when the price-history pipeline has insufficient data.

### WF-LISTING-EXPIRED
- [ ] Escalating reminder cadence tested at each threshold.
- [ ] Auto-archive after grace window tested; un-archive restores full record with no data loss.

### WF-LISTING-REJECTED
- [ ] Rejection reason renders the specific failing field(s), tested against at least 2 distinct rejection causes.
- [ ] Resubmission re-enters the review queue automatically without a separate ceremony.

### WF-COMPLIANCE
- [ ] Requirement stated upfront, tested that no requirement is discovered mid-submission.
- [ ] Mismatch explanation tested for specificity (not a generic rejection).

### WF-RENEWAL
- [ ] One-click renewal tested for licenses, contracts, and packages independently (three distinct entity types, same pattern).
- [ ] Dependent-listing cascade impact correctly displayed when a license lapses.

### WF-PUBLISHING
- [ ] Publish disabled state correctly lists every missing requirement, tested with multiple simultaneous gaps.

### WF-ARCHIVING
- [ ] Un-archive tested from every module that supports archiving (Properties, Projects, Owners, Customers, Contracts).

### WF-DELETION
- [ ] Confirmation dialog states the specific, scoped consequence — tested that it never shows a generic "Are you sure?"
- [ ] Recovery window tested: restore succeeds inside the window, permanently unavailable after.
- [ ] Verified this workflow has zero AI/automation touchpoints, by design.

### WF-AUTOMATION
- [ ] Every rule's last-run status/outcome is visible and accurate, tested against both a successful and a deliberately-failed run.
- [ ] A failed automation correctly triggers the Critical notification escalation defined in [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md).

## 3. Release-gate checklist

Before any release in [15_RELEASE_PLAN.md](15_RELEASE_PLAN.md) ships:

- [ ] Every screen scoped to that release passes the Universal Definition of Done (§1).
- [ ] Every workflow scoped to that release passes its workflow-level checklist (§2).
- [ ] That release's exit criteria (stated per-release in [15](15_RELEASE_PLAN.md)) are independently verified, not self-reported by the team that built the feature.
- [ ] No Blocked or Needs Legal Review item from [13_FEATURE_READINESS_MATRIX.md](13_FEATURE_READINESS_MATRIX.md) scoped to that release remains unresolved.
- [ ] R0's security exit criteria remain confirmed closed (re-verified, not assumed still true from an earlier check) — regressions here block every subsequent release regardless of that release's own readiness.
