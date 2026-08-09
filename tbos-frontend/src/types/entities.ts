import type { RoleCode } from './rbac';

/**
 * Mock domain entities — deliberately small and hand-linked (not randomly
 * generated) so a lead really does reference a real property/customer, per the
 * master prompt's "coherent mock broker account" requirement. Shapes here are a
 * foundation-phase approximation of tbos-definition/16_MODULE_SPECIFICATIONS.md's
 * Core Entities — full field sets are business-feature work, out of scope here.
 */

export interface Agency {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  tier: 'starter' | 'growth' | 'enterprise';
}

export interface TeamMember {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  roles: RoleCode[];
  avatarInitials: string;
}

/** tbos-blueprint/06_STATE_ARCHITECTURE.md §2 — the canonical 8-state set. */
export type PropertyStatus = 'draft' | 'pending_compliance' | 'active' | 'expiring' | 'expired' | 'rejected' | 'sold_rented' | 'archived';

/** Not itemized in tbos-blueprint (PROP-01 only says "filter by status/district/type")
 * — a reasonable, documented Saudi-market type list, not a spec-derived enum. */
export type PropertyType = 'apartment' | 'villa' | 'townhouse' | 'land' | 'office' | 'retail';

export interface Property {
  id: string;
  agencyId: string;
  ownerId: string;
  brokerId: string;
  title: string;
  propertyType: PropertyType;
  district: string;
  city: string;
  priceSar: number;
  status: PropertyStatus;
  linkedLeadCount: number;
  /** null until first published (Draft has never had a live date). */
  listedDate: string | null;
  /** Set only in the Rejected state — tbos-blueprint's per-state message is
   * "Rejected: [specific reason]. Fix [specific field] to resubmit." */
  rejectionReason?: string;
  rejectionField?: string;
  /** Set only in Expiring/Expired — drives the countdown/overdue message. */
  expiryDate?: string;
  /** Not itemized as a Property field anywhere in tbos-definition/tbos-blueprint
   * (Foundation-phase gap) — added because MKT-03's Content Quality rubric
   * (tbos-blueprint/08_AI_INTERACTION_BLUEPRINT.md "description length/
   * quality") needs a real field to check, the same class of honest addition
   * as listedDate (TBOS_MARKETING_UX_AUDIT.md P3-1). Optional — most
   * Foundation-phase properties predate this field. */
  description?: string;
  /** Not itemized anywhere as a Property field — added to support WF-PROPERTY-
   * NEW's own named AI action ("AI-suggested amenity tags from photos,"
   * tbos-blueprint/01_EXPERIENCE_ARCHITECTURE.md), the same class of honest,
   * necessary addition as description. Optional — most existing properties
   * predate this field. */
  amenityTags?: string[];
}

/** tbos-blueprint/04_SCREEN_INVENTORY.md PROP-02 required data: "Compliance
 * status" — no itemized field list exists (§3 of the audit's research), so
 * requirement *names* below (FAL/REGA/Nafath) are the three government
 * integrations tbos-definition/21_GLOSSARY.md actually names; the structure
 * around them (status/expiry/reference) is this phase's implementation. */
export type ComplianceRequirementStatus = 'missing' | 'pending_verification' | 'verified' | 'expiring' | 'expired';

export interface PropertyComplianceRequirement {
  id: string;
  propertyId: string;
  name: string;
  status: ComplianceRequirementStatus;
  expiryDate?: string;
  referenceNumber?: string;
}

export type PropertyMediaStatus = 'missing' | 'uploading' | 'uploaded' | 'processing' | 'approved' | 'rejected';

export interface PropertyMediaItem {
  id: string;
  propertyId: string;
  status: PropertyMediaStatus;
  caption: string;
  /** Set only when status is 'rejected' — master prompt §24: never just
   * "Invalid image" without saying what's wrong and how to fix it. */
  issue?: string;
  order: number;
}

/** Only Price and Status changes are specified anywhere in tbos-blueprint
 * (05_COMPONENT_MAPPING.md: "Price/Status History Timeline") — deliberately
 * not extended with unsupported categories (media/assignment/marketing). */
export type PropertyActivityKind = 'created' | 'status_changed' | 'price_changed' | 'description_updated';

export interface PropertyActivity {
  id: string;
  propertyId: string;
  kind: PropertyActivityKind;
  actorKind: 'human' | 'system' | 'ai';
  actorName: string;
  detail: string;
  timestamp: string;
}

/** No enumerated Property performance metrics exist anywhere in tbos-blueprint
 * or tbos-definition (confirmed by exhaustive search) — this phase's Performance
 * tab only ever shows figures with a real, traceable data source (leadsGenerated
 * is computed from actual Lead.propertyId links) and says "not enough data yet"
 * for everything else, per master prompt §26's explicit "no misleading analytics"
 * rule, rather than fabricating Views/Conversion Rate/etc. */
export interface PropertyPerformance {
  propertyId: string;
  leadsGenerated: number;
  daysOnMarket: number | null;
}

/**
 * tbos-definition/16_MODULE_SPECIFICATIONS.md Projects: "Required States:
 * same set as Properties, applied per-unit as well as per-project" — verified
 * verbatim against tbos-blueprint/06_STATE_ARCHITECTURE.md (no separate
 * Project state table exists; the one Property/Project table is explicitly
 * headed "Property / Project lifecycle (PROP-02, PROJ-02)"). Reuses
 * PropertyStatus directly rather than a duplicate identical enum.
 */
export interface Project {
  id: string;
  agencyId: string;
  ownerId: string;
  brokerId: string;
  title: string;
  district: string;
  city: string;
  status: PropertyStatus;
  linkedLeadCount: number;
  listedDate: string | null;
  rejectionReason?: string;
  rejectionField?: string;
  expiryDate?: string;
  description?: string;
}

/**
 * tbos-definition/16_MODULE_SPECIFICATIONS.md: "Unit (child entity — floor
 * plan, availability, price)" — the only field-level detail given anywhere in
 * the source for Unit (confirmed by exhaustive search); floorPlan is a plain
 * descriptive string (no bedroom-count/size taxonomy is specified, so none is
 * invented). "Availability" is the Unit's own PropertyStatus, the same
 * per-unit lifecycle tracking the module spec names.
 */
export interface Unit {
  id: string;
  projectId: string;
  floorPlan: string;
  priceSar: number;
  status: PropertyStatus;
}

export type ProjectActivityKind = 'created' | 'status_changed' | 'price_changed' | 'description_updated' | 'unit_added' | 'unit_status_changed' | 'unit_price_changed';

export interface ProjectActivity {
  id: string;
  projectId: string;
  kind: ProjectActivityKind;
  actorKind: 'human' | 'system' | 'ai';
  actorName: string;
  detail: string;
  timestamp: string;
}

export interface ProjectPerformance {
  projectId: string;
  leadsGenerated: number;
  daysOnMarket: number | null;
}

export type LeadStage = 'new' | 'assigned' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost';
export type LeadSource = 'buyer_inbound' | 'owner_originated';

export interface Lead {
  id: string;
  agencyId: string;
  source: LeadSource;
  stage: LeadStage;
  score: number;
  slaMinutesRemaining: number | null;
  assigneeId: string;
  customerId: string;
  propertyId: string | null;
  lostReason?: LeadLostReason;
  /** Optional free-text elaboration alongside the structured reason code —
   * preserves specific human context without sacrificing the enum's
   * analytics value (master prompt §17 "preserve future analytics value"). */
  lostReasonNote?: string;
}

/**
 * tbos-blueprint has no ratified Lost Reason taxonomy (confirmed by exhaustive
 * search — every mention says "required reason," none enumerate one). This list
 * is a documented ASSUMPTION for this phase (TBOS_UI_INTEGRATION_AUDIT.md §3
 * item 6), not a ratified spec — flagged for product-definition follow-up.
 */
export type LeadLostReason = 'price' | 'timing' | 'chose_competitor' | 'unresponsive' | 'not_qualified' | 'changed_mind' | 'duplicate' | 'other';

/** Not a stored field — tbos-blueprint models urgency as derived from SLA state
 * + score, never as its own persisted attribute (confirmed by exhaustive search
 * of the Lead entity's documented fields). Computed by lib/leads/priority.ts,
 * matching the same four-tier scale tbos-blueprint/00_IMPLEMENTATION_BLUEPRINT.md
 * §6 already uses for Notification urgency and Today ranking. */
export type LeadPriority = 'critical' | 'high' | 'medium' | 'low';

export type LeadActivityKind =
  | 'lead_created'
  | 'assigned'
  | 'reassigned'
  | 'stage_changed'
  | 'note_added'
  | 'follow_up_scheduled'
  | 'contacted'
  | 'reply_sent'
  | 'logged_outside_response'
  | 'marked_lost'
  | 'reopened'
  | 'ai_suggestion';

export interface LeadActivity {
  id: string;
  leadId: string;
  kind: LeadActivityKind;
  actorKind: 'human' | 'system' | 'ai';
  actorName: string;
  detail: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  agencyId: string;
  name: string;
  phone: string;
  relationshipStage: 'prospective' | 'active' | 'past';
  /** Not treated as authoritative by any Phase 7 code — a Customer's actual
   * linked leads are derived from Lead.customerId (TBOS_RELATIONSHIP_UX_AUDIT.md
   * P1-3: this array had already drifted from the FK side for Owner/Property,
   * the same-shaped risk this field carries). Kept only for backward
   * compatibility with prior-phase code that may still read it. */
  linkedLeadIds: string[];
}

/** CUST-01's required data ("linked Leads/Contracts count") — a computed view,
 * never a stored field, per TBOS_RELATIONSHIP_UX_AUDIT.md P1-3's lesson: a
 * count derived from the FK side (Lead.customerId) fresh on every read can
 * never drift, where a stored counter could. */
export interface CustomerListItem extends Customer {
  leadCount: number;
  lastActivityAt: string | null;
}

/** tbos-blueprint/05_COMPONENT_MAPPING.md: "Price/Status History Timeline...
 * Customer interaction log" variant — a real, documented concept, reusing the
 * existing ActivityTimeline component. No channel-type schema (WhatsApp/email/
 * call) exists in any source document (TBOS_RELATIONSHIP_UX_AUDIT.md P3-2), so
 * this stays a narrow, generic kind set rather than an invented taxonomy. */
export type CustomerActivityKind = 'created' | 'interaction_logged' | 'relationship_stage_changed' | 'lead_linked';

export interface CustomerActivity {
  id: string;
  customerId: string;
  kind: CustomerActivityKind;
  actorKind: 'human' | 'system' | 'ai';
  actorName: string;
  detail: string;
  timestamp: string;
}

export interface Owner {
  id: string;
  agencyId: string;
  name: string;
  phone: string;
  /** Not authoritative — see Customer.linkedLeadIds' note above; an Owner's
   * actual linked properties are derived from Property.ownerId. */
  linkedPropertyIds: string[];
}

/** OWN-01's required data ("linked properties, open Marketing Requests
 * count") — computed view, never stored, same rationale as CustomerListItem. */
export interface OwnerListItem extends Owner {
  propertyCount: number;
  openMarketingRequestCount: number;
}

export type OwnerActivityKind =
  | 'created'
  | 'property_linked'
  | 'marketing_request_opened'
  | 'marketing_request_responded'
  | 'marketing_request_won'
  | 'marketing_request_lost';

export interface OwnerActivity {
  id: string;
  ownerId: string;
  kind: OwnerActivityKind;
  actorKind: 'human' | 'system' | 'ai';
  actorName: string;
  detail: string;
  timestamp: string;
}

export type MarketingRequestStatus = 'open' | 'in_progress' | 'won' | 'lost';

export interface MarketingRequest {
  id: string;
  agencyId: string;
  ownerId: string;
  propertyContext: string;
  status: MarketingRequestStatus;
  matchedBrokerId: string | null;
  /** Not itemized as a required field in tbos-blueprint/04_SCREEN_INVENTORY.md
   * OWN-03 (only "owner, property context, status, tier eligibility" are
   * named) — added because the ratified state table
   * (tbos-blueprint/06_STATE_ARCHITECTURE.md "Marketing Request states")
   * itself requires a time reference ("Responded [time ago]"), the same class
   * of honest, necessary addition as Property.listedDate in Phase 6. */
  createdAt: string;
  /** Reuses LeadLostReason rather than inventing a second taxonomy — neither
   * Lead nor Marketing Request Lost has a ratified reason taxonomy anywhere
   * in the source docs (TBOS_RELATIONSHIP_UX_AUDIT.md research); both mark
   * "[required reason]" only. Master prompt §32: "Do NOT create a second
   * taxonomy." */
  lostReason?: LeadLostReason;
}

/** tbos-blueprint/06_STATE_ARCHITECTURE.md "Contract lifecycle (CONT-02)" —
 * the complete, closed 6-state set (verified verbatim, TBOS_CONTRACTS_
 * COMPLIANCE_UX_AUDIT.md research). Never extend without updating that
 * source table first. */
export type ContractStatus = 'draft' | 'pending_compliance' | 'active' | 'renewal_due' | 'closed' | 'cancelled';

/** The only contract types named anywhere in the source docs
 * (tbos-definition/09_WORKFLOW_ARCHITECTURE.md "New Contract" workflow). */
export type ContractType = 'brokerage_agreement' | 'sale' | 'lease';

export interface Contract {
  id: string;
  agencyId: string;
  type: ContractType;
  /** Direct links to Lead/Customer/Owner/Property — tbos-definition/
   * 16_MODULE_SPECIFICATIONS.md and tbos-blueprint/04_SCREEN_INVENTORY.md
   * both list all four as first-class required data, not merely Lead/Property
   * with Customer/Owner reachable transitively (TBOS_CONTRACTS_COMPLIANCE_UX_
   * AUDIT.md P2-2 — contrast Phase 7's Customer↔Owner, which genuinely has no
   * direct link in the spec). */
  leadId: string;
  customerId: string;
  ownerId: string;
  propertyId: string;
  status: ContractStatus;
  /** Only the generic word "terms" is spec'd at the Contract-entity level;
   * no specific financial field is named (Finance/Revenue/Commission are
   * separate *derived* records from *closed* Contracts, tbos-definition/
   * 20_NON_GOALS.md — TBOS is not an ERP). valueSar predates this phase
   * (Foundation phase) and is kept for backward compatibility, but is
   * honestly an ASSUMPTION beyond the literal spec, not a verified field. */
  valueSar: number;
  /** Needed to render the state table's own exact message copy ("Active
   * since [date]. Renewal due [date]." / "Closed on [date]." / "Cancelled on
   * [date]: [reason].") — an honest, necessary addition, the same class as
   * Property.listedDate in Phase 6. */
  activeSince?: string;
  renewalDueDate?: string;
  closedDate?: string;
  cancelledDate?: string;
  /** Free-text, not a coded enum — no cancellation-reason taxonomy exists in
   * any source document (unlike Lead/Marketing Request Lost, which at least
   * have a documented-as-assumption precedent); inventing one here would be
   * a second, unrelated fabrication. */
  cancellationReason?: string;
}

/** tbos-blueprint/17_ACCEPTANCE_CRITERIA.md WF-CONTRACT-NEW scenario 1:
 * Document Intelligence OCR/extraction can flag a 'mismatch' — the contract
 * must stay at Pending Compliance with the specific field/expected/extracted
 * value shown, never auto-advance. Reuses the already-registered
 * ComplianceStatus vocabulary (components/tbos/compliance/ComplianceStatus.tsx),
 * built for CONT-02 since the Component Library phase but never consumed
 * until now (TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md P2-1). */
export type ContractComplianceState = 'not_started' | 'pending_verification' | 'verified' | 'expiring' | 'expired' | 'mismatch';

/** ComplianceChecklist's own 3-state vocabulary (front-loaded overview),
 * deliberately separate from ContractComplianceState (the finer 6-state
 * per-document vocabulary) — two different registered components, two
 * different, both-real vocabularies (TBOS-CMP-COMPLIANCE-001 vs. -003). */
export type ContractChecklistStatus = 'incomplete' | 'complete' | 'blocked';

export interface ContractComplianceItem {
  id: string;
  contractId: string;
  /** Plain-language, front-loaded — never a bare checkbox (tbos-definition/
   * 20_NON_GOALS.md #9 "compliance is never a checkbox exercise"). */
  requirement: string;
  status: ContractChecklistStatus;
  /** Only set when status === 'blocked' — the specific reason, never a bare
   * red X (ComplianceChecklist's own documented contract). */
  blockedReason?: string;
}

export interface ContractDocument {
  id: string;
  contractId: string;
  fileName: string;
  status: ContractComplianceState;
  /** Set only when status === 'mismatch' — WF-CONTRACT-NEW scenario 1's
   * exact required detail: the specific field, expected value, and extracted
   * value, shown to the Operations Manager. */
  mismatchDetail?: { field: string; expected: string; extracted: string };
}

/** tbos-blueprint/09_NOTIFICATION_BLUEPRINT.md's "Contract stage change"
 * event is the only documented Contract activity signal — kept narrow. */
export type ContractActivityKind = 'created' | 'stage_changed' | 'compliance_updated' | 'renewed' | 'cancelled';

export interface ContractActivity {
  id: string;
  contractId: string;
  kind: ContractActivityKind;
  actorKind: 'human' | 'system' | 'ai';
  actorName: string;
  detail: string;
  timestamp: string;
}

export interface Task {
  id: string;
  agencyId: string;
  title: string;
  dueDate: string;
  assigneeId: string;
  linkedRecordId: string | null;
  status: 'open' | 'complete' | 'overdue';
}

export type NotificationType = 'sla_risk' | 'compliance' | 'lead' | 'marketing_request' | 'contract' | 'campaign' | 'system' | 'ai_action';

/** Matches the four-tier urgency scale in tbos-blueprint/00_IMPLEMENTATION_BLUEPRINT.md §6. */
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface AppNotification {
  id: string;
  agencyId: string;
  recipientId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  /** Deep-link target — the record/screen this notification is about. Doubles
   * as its "action" (opening it *is* the action, per NOTIF-01's spec). */
  sourceScreenId: string | null;
  /** The specific record within sourceScreenId's screen, e.g. a Lead id, so
   * "open notification (deep-links to source)" (tbos-blueprint NOTIF-01) can
   * navigate to /leads/:leadId rather than only the generic /leads route.
   * Optional and additive — existing notifications without it still fall back
   * to the screen-level route unchanged. */
  sourceRecordId?: string;
  read: boolean;
  createdAt: string;
}

/** No ratified state table exists for Campaign anywhere in the source (unlike
 * Property/Lead/Contract/Marketing Request, each of which has one in
 * tbos-blueprint/06_STATE_ARCHITECTURE.md) — this 4-state set is inferred from
 * scattered language (MKT-01's "pause/resume", MKT-02's "running-campaign
 * confirmation") and explicitly flagged as an ASSUMPTION, not a spec quote
 * (TBOS_MARKETING_UX_AUDIT.md P1-1). The zero-eligible-inventory/insufficient-
 * balance conditions are NOT stored statuses — they are a computed, live-
 * evaluated gate on the creation flow (mirrors Contract's canActivate
 * pattern), never a state a saved Campaign sits in. */
export type CampaignStatus = 'draft' | 'running' | 'paused' | 'ended';

export interface Campaign {
  id: string;
  agencyId: string;
  /** Honest, necessary addition (TBOS_MARKETING_UX_AUDIT.md P2-2) — without a
   * creator field, marketing.view/manage's 'own' scope (SB, rolePermissions.ts)
   * has nothing to check against, the same gap every other module already
   * closed (Property.brokerId, Lead.assigneeId, Contract's Lead-derived scope). */
  createdByUserId: string;
  name: string;
  status: CampaignStatus;
  /** tbos-definition/16_MODULE_SPECIFICATIONS.md Campaign core entity:
   * "linked inventory, spend, package/tier." */
  spendSar: number;
  /** ASSUMPTION resolving the spend-vs-quota ambiguity flagged in
   * tbos-blueprint/18_OPEN_QUESTIONS.md (Wallet pricing is explicitly an
   * unresolved business decision) — a Campaign consumes agency Wallet
   * *quota* (unit-based, reusing QuotaBalanceMeter's existing used/total
   * contract) rather than deducting creditBalance (SAR). A fixed, clearly-
   * labeled demo cost stands in for the real, undecided pricing rule. */
  quotaCost: number;
  linkedPropertyIds: string[];
  /** Set only once launched — null for a still-draft campaign. */
  launchedAt: string | null;
  endedAt: string | null;
}

export type CampaignActivityKind = 'created' | 'launched' | 'paused' | 'resumed' | 'ended' | 'launch_blocked';

export interface CampaignActivity {
  id: string;
  campaignId: string;
  kind: CampaignActivityKind;
  actorKind: 'human' | 'system' | 'ai';
  actorName: string;
  detail: string;
  timestamp: string;
}

export interface WalletSummary {
  agencyId: string;
  tier: 'starter' | 'growth' | 'enterprise';
  creditBalance: number;
  quotaUsed: number;
  quotaTotal: number;
}
