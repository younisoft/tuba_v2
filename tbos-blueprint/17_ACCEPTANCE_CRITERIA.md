# 17 — Acceptance Criteria

Given/When/Then criteria for the highest-risk workflows — chosen because each is either a P0 fix for a live-confirmed defect, a regulated/destructive action, or a foundational dependency everything else relies on. These are the scenarios QA writes automated/manual test cases against; [16_IMPLEMENTATION_CHECKLIST.md](16_IMPLEMENTATION_CHECKLIST.md) is the broader completeness checklist, this document is the precise pass/fail bar for the scenarios that matter most.

## WF-LEAD-NEW — Unified Lead Pipeline

**Scenario: Confident auto-routing**
- Given a new lead arrives via any capture path (buyer-inbound, owner-originated, manual)
- And exactly one broker matches the routing criteria (capacity + specialty + district) with high confidence
- When the lead is captured
- Then the lead is assigned to that broker, an SLA clock starts and is visible on LEAD-03, and the broker receives a Critical-urgency push notification within the delivery SLA defined in [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md)

**Scenario: No confident routing match**
- Given a new lead arrives
- And no broker resolves with high confidence (e.g., all matching brokers are at capacity)
- When the lead is captured
- Then the lead lands in the Sales Manager's manual-assignment queue (LEAD-01 filtered view), flagged "needs manual assignment"
- And the lead is never broadcast to all brokers and never silently dropped

**Scenario: SLA breach escalation**
- Given a lead is Assigned with an active SLA clock
- When the SLA window elapses with no logged response
- Then the lead's state visibly changes to SLA-risk/breach on LEAD-01/02/03 and TODAY-01
- And the assigned broker's Sales Manager receives a High-urgency in-app + push notification
- And the lead is never removed from view or marked resolved automatically

**Scenario: Duplicate lead detected**
- Given a new lead's phone number exactly matches an existing Customer record
- When the lead is captured
- Then the system auto-merges into the existing Customer record and preserves the new interaction as a logged event
- And a partial (non-exact) match instead flags for broker confirmation rather than auto-merging

## WF-PROPERTY-NEW — Publishing gate

**Scenario: Incomplete listing blocks Publish**
- Given a broker is in PROP-03 with at least one required field missing (e.g., no photos)
- When the broker reaches the final review step
- Then the Publish action is disabled
- And the specific missing requirement(s) are listed inline, each linking directly back to the step where it can be fixed

**Scenario: Complete listing publishes successfully**
- Given all required fields, compliant license data, and at least one photo are present
- When the broker taps Publish
- Then the listing transitions to Active (or Pending Compliance if government verification is still outstanding)
- And an explicit success confirmation states which state it entered and why

**Scenario: Media upload fails mid-flow**
- Given a broker is uploading multiple photos in PROP-03
- When one file fails to upload (network interruption)
- Then only that file shows a retry affordance
- And the rest of the flow (already-entered fields, already-uploaded files) remains intact and unaffected

## SET-02 — Real RBAC

**Scenario: Permission-scoped visibility**
- Given a Property Consultant account with no team-management permission
- When that user navigates to SET-02
- Then Team & Roles either doesn't appear in their rail at all, or shows a No Permission state — never a broken/empty admin screen

**Scenario: Role deletion with active assignment blocked**
- Given a role is currently assigned to at least one active team member
- When an Agency Owner attempts to delete that role
- Then the deletion is blocked with an explicit message naming who's still assigned
- And deletion only proceeds after those members are explicitly reassigned

**Scenario: Permission change takes effect without re-login**
- Given a team member is actively using TBOS
- When an Agency Owner changes that member's role/permissions in SET-02
- Then the affected user's visible navigation and available actions update on their next screen load, without requiring them to log out and back in

## WF-CONTRACT-NEW — Compliance-gated activation

**Scenario: Document Intelligence flags a mismatch**
- Given a compliance document is uploaded to CONT-02 with a name that doesn't match the system's record for that party
- When the OCR/extraction step completes
- Then the contract stays at Pending Compliance
- And the specific mismatch (field, expected value, extracted value) is shown to the Operations Manager
- And no automated process advances the contract's state past this point

**Scenario: Operations Manager approval is mandatory**
- Given every automated pre-check on a contract's compliance checklist has passed
- When the checklist reaches 100% automated completion
- Then the contract still requires an explicit Operations Manager confirmation action before transitioning to Active
- And no role other than Operations Manager/Agency Owner can perform that confirmation, verified against every other role in the system

## WF-DELETION — Destructive action safety

**Scenario: Deletion requires scoped, plain-language confirmation**
- Given a broker initiates deletion of a record with dependent data (e.g., a Property with linked Leads)
- When the confirmation dialog appears
- Then it states exactly what will be deleted and what else is affected, in plain language — never a generic "Are you sure?"

**Scenario: Recovery window honored**
- Given a record was deleted less than the defined recovery window ago
- When a user with appropriate permission requests restoration
- Then the record and its associations are fully restored with no data loss

**Scenario: Recovery window expired**
- Given a record was deleted more than the defined recovery window ago
- When any user attempts to restore it
- Then restoration is unavailable, and this was stated explicitly at the time of deletion (not a surprise discovered later)

**Scenario: No unscoped mass-delete path exists**
- Given any bulk-delete action anywhere in the product
- When it's invoked
- Then it previews the exact affected record set before committing, scoped strictly to what was selected — direct regression test for the current platform's confirmed mass-delete IDOR (`tuba-current-state/12_SOURCE_CODE_ASSESSMENT.md`)

## WF-RENEWAL — License/contract/package renewal

**Scenario: Proactive reminder cadence**
- Given a license is approaching its expiry date
- When the escalating reminder thresholds are crossed (per [09_NOTIFICATION_BLUEPRINT.md](09_NOTIFICATION_BLUEPRINT.md))
- Then the channel and urgency escalate correctly at each threshold, without duplicate/redundant notifications at the same threshold

**Scenario: Lapsed license shows cascading impact**
- Given a license lapses without renewal
- When the broker/Operations Manager views SET-04 or TODAY-01
- Then the number and identity of dependent listings affected is shown explicitly, not discovered separately

## AUTO-01/02 — Automation failure visibility

**Scenario: Failed automation is never silent**
- Given an automation rule (e.g., lead auto-routing) fails to execute on a triggering event
- When the failure occurs
- Then it appears as a visible incident on AUTO-01 with last-run status "Failed" and a reason
- And the rule owner receives a Critical-urgency notification
- And the underlying event that should have triggered the automation is not silently lost — it still surfaces for manual handling (e.g., the lead still lands in a manual queue)

## GS-01 — Search RBAC enforcement

**Scenario: Search never leaks out-of-scope records**
- Given a Property Consultant searches for a keyword that matches another consultant's private lead
- When results are returned
- Then that lead does not appear, identically to how it wouldn't appear via direct navigation
- And this holds for AI/semantic-matched results exactly as strictly as literal keyword matches

## AI fallback — cross-cutting

**Scenario: AI unavailability never blocks a workflow**
- Given any AI-embedded capability (from [08_AI_INTERACTION_BLUEPRINT.md](08_AI_INTERACTION_BLUEPRINT.md)) is unavailable or errors
- When the broker reaches that point in a workflow (e.g., description generation in PROP-03)
- Then the workflow continues fully functional with manual entry
- And no error message blocks progress — it degrades gracefully with a brief, honest note that AI assistance is unavailable right now

## Notification accuracy — cross-cutting

**Scenario: Unread count is always real**
- Given a broker has N genuinely unread notifications
- When they view the notification bell/badge from any screen
- Then the displayed count exactly equals N
- And this is verified after: a new notification arrives while the app is open, a notification is marked read, and after a page reload — three distinct scenarios, all must pass (direct regression test for the confirmed "0" badge defect)
