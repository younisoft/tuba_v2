import {
  AGENCIES,
  TEAM_MEMBERS,
  PROPERTIES,
  PROPERTY_COMPLIANCE,
  PROPERTY_MEDIA,
  PROPERTY_ACTIVITIES,
  PROJECTS,
  UNITS,
  PROJECT_COMPLIANCE,
  PROJECT_MEDIA,
  PROJECT_ACTIVITIES,
  LEADS,
  LEAD_ACTIVITIES,
  CUSTOMERS,
  CUSTOMER_ACTIVITIES,
  OWNERS,
  OWNER_ACTIVITIES,
  MARKETING_REQUESTS,
  CONTRACTS,
  CONTRACT_COMPLIANCE,
  CONTRACT_DOCUMENTS,
  CONTRACT_ACTIVITIES,
  TASKS,
  NOTIFICATIONS,
  CAMPAIGNS,
  CAMPAIGN_ACTIVITIES,
  WALLETS,
} from '@/mocks/data/seed';
import { hasPermission, scopeFor } from '@/lib/permissions/evaluate';
import { computeRecommendations } from '@/lib/today/computeRecommendations';
import { computePropertyRecommendations } from '@/lib/properties/computeRecommendations';
import { computeRelationshipRecommendations } from '@/lib/relationships/computeRecommendations';
import { computeContractRecommendations } from '@/lib/contracts/computeRecommendations';
import { computeMarketingRecommendations } from '@/lib/marketing/computeRecommendations';
import { evaluatePropertyContentQuality } from '@/lib/marketing/contentQuality';
import type { RoleCode } from '@/types/rbac';
import type {
  LeadStage,
  LeadLostReason,
  LeadActivity,
  Property,
  PropertyStatus,
  PropertyActivity,
  PropertyActivityKind,
  PropertyPerformance,
  PropertyMediaItem,
  Project,
  Unit,
  ProjectActivity,
  ProjectPerformance,
  CustomerActivity,
  CustomerListItem,
  OwnerActivity,
  OwnerListItem,
  Contract,
  ContractComplianceItem,
  ContractDocument,
  ContractActivity,
  ContractStatus,
  Campaign,
  CampaignActivity,
  AppNotification,
} from '@/types/entities';

/**
 * The mock "database" — an in-memory read/write surface over the seed data, kept
 * as module-level state so mutations (e.g. marking a notification read) persist
 * for the session without a real backend. Real backend integration replaces this
 * file's contents behind the same lib/api/client.ts interface; nothing above that
 * layer should ever import from mocks/ directly (see MOCK_API.md).
 */
export const db = {
  agencies: [...AGENCIES],
  teamMembers: [...TEAM_MEMBERS],
  properties: [...PROPERTIES],
  propertyCompliance: [...PROPERTY_COMPLIANCE],
  propertyMedia: [...PROPERTY_MEDIA],
  propertyActivities: [...PROPERTY_ACTIVITIES],
  projects: [...PROJECTS],
  units: [...UNITS],
  projectCompliance: [...PROJECT_COMPLIANCE],
  projectMedia: [...PROJECT_MEDIA],
  projectActivities: [...PROJECT_ACTIVITIES],
  leads: [...LEADS],
  leadActivities: [...LEAD_ACTIVITIES],
  customers: [...CUSTOMERS],
  customerActivities: [...CUSTOMER_ACTIVITIES],
  owners: [...OWNERS],
  ownerActivities: [...OWNER_ACTIVITIES],
  marketingRequests: [...MARKETING_REQUESTS],
  contracts: [...CONTRACTS],
  contractCompliance: [...CONTRACT_COMPLIANCE],
  contractDocuments: [...CONTRACT_DOCUMENTS],
  contractActivities: [...CONTRACT_ACTIVITIES],
  tasks: [...TASKS],
  notifications: [...NOTIFICATIONS],
  campaigns: [...CAMPAIGNS],
  campaignActivities: [...CAMPAIGN_ACTIVITIES],
  wallets: [...WALLETS],
};

/**
 * `leads.view.team` (SM/AO) sees every lead in the agency; a bare `leads.view`
 * grant (PC/SB) sees only their own — `lib/permissions/evaluate.ts`'s scope
 * check is a route/action-level yes/no, not a list filter, so the actual
 * scoping happens here (TBOS_UI_INTEGRATION_AUDIT.md §1.J).
 */
export function leadsForUser(user: { id: string; agencyId: string; activeRole: RoleCode }) {
  if (!hasPermission(user.activeRole, 'leads.view')) return [];
  const canViewTeam = hasPermission(user.activeRole, 'leads.view.team');
  return db.leads.filter((l) => l.agencyId === user.agencyId && (canViewTeam || l.assigneeId === user.id));
}

export function leadById(id: string) {
  return db.leads.find((l) => l.id === id) ?? null;
}

export function leadActivitiesForLead(leadId: string) {
  return db.leadActivities.filter((a) => a.leadId === leadId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addLeadActivity(activity: Omit<LeadActivity, 'id' | 'timestamp'>) {
  const entry: LeadActivity = { ...activity, id: `la-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() };
  db.leadActivities.push(entry);
  return entry;
}

export function updateLeadStage(leadId: string, toStage: LeadStage, actorName: string) {
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  const fromStage = lead.stage;
  lead.stage = toStage;
  addLeadActivity({ leadId, kind: 'stage_changed', actorKind: 'human', actorName, detail: `Moved from ${fromStage} to ${toStage}.` });
  return lead;
}

export function reassignLead(leadId: string, toAssigneeId: string, toAssigneeName: string, actorName: string) {
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.assigneeId = toAssigneeId;
  addLeadActivity({ leadId, kind: 'reassigned', actorKind: 'human', actorName, detail: `Reassigned to ${toAssigneeName}.` });
  return lead;
}

export function markLeadLost(leadId: string, reason: LeadLostReason, note: string | undefined, actorName: string) {
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.stage = 'lost';
  lead.lostReason = reason;
  lead.lostReasonNote = note;
  addLeadActivity({ leadId, kind: 'marked_lost', actorKind: 'human', actorName, detail: note ? `Marked Lost — ${reason}: ${note}` : `Marked Lost — ${reason}` });
  return lead;
}

export function reopenLead(leadId: string, actorName: string) {
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  lead.stage = 'contacted';
  lead.lostReason = undefined;
  lead.lostReasonNote = undefined;
  addLeadActivity({ leadId, kind: 'reopened', actorKind: 'human', actorName, detail: 'Reopened — the Lost reason was premature.' });
  return lead;
}

export function addLeadNote(leadId: string, note: string, actorName: string) {
  return addLeadActivity({ leadId, kind: 'note_added', actorKind: 'human', actorName, detail: note });
}

export function logLeadOutsideResponse(leadId: string, note: string, actorName: string) {
  return addLeadActivity({ leadId, kind: 'logged_outside_response', actorKind: 'human', actorName, detail: note });
}

/** Blueprint's QA-01 "Log Follow-up" quick action creates a Task directly
 * (tbos-blueprint/04_SCREEN_INVENTORY.md TASK-01) — this mirrors that exact
 * behavior for LEAD-03's "Schedule follow-up" action. */
export function scheduleLeadFollowUp(leadId: string, agencyId: string, assigneeId: string, dueDate: string, title: string, actorName: string) {
  addLeadActivity({ leadId, kind: 'follow_up_scheduled', actorKind: 'human', actorName, detail: `Follow-up scheduled for ${dueDate}.` });
  const task = { id: `t-${Date.now()}`, agencyId, title, dueDate, assigneeId, linkedRecordId: leadId, status: 'open' as const };
  db.tasks.push(task);
  return task;
}

export function findWalletByAgency(agencyId: string) {
  return db.wallets.find((w) => w.agencyId === agencyId) ?? null;
}

export function notificationsForRecipient(recipientId: string) {
  return db.notifications
    .filter((n) => n.recipientId === recipientId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function unreadNotificationCount(recipientId: string) {
  return db.notifications.filter((n) => n.recipientId === recipientId && !n.read).length;
}

export function markNotificationRead(id: string, read = true) {
  const n = db.notifications.find((item) => item.id === id);
  if (n) n.read = read;
  return n ?? null;
}

export function tasksForAgency(agencyId: string) {
  return db.tasks.filter((t) => t.agencyId === agencyId);
}

/** Name-resolution-only lookups used by OTHER screens' detail views (e.g. a
 * Lead resolving its linked Customer's name) — deliberately unscoped, because
 * the calling screen (LeadDetailScreen/PropertyDetailScreen) has already
 * independently enforced record-level access to the *lead/property itself*;
 * resolving a name for display is not the same permission surface as listing
 * or searching Customers/Owners in their own right. NEVER use these for a
 * Customers/Owners list, search, or any screen whose primary subject is the
 * Customer/Owner record — use customersForUser()/ownersForUser() below for
 * that (TBOS_RELATIONSHIP_UX_AUDIT.md P0-1). */
export function customersForAgency(agencyId: string) {
  return db.customers.filter((c) => c.agencyId === agencyId);
}

export function propertiesForAgency(agencyId: string) {
  return db.properties.filter((p) => p.agencyId === agencyId);
}

export function teamMembersForAgency(agencyId: string) {
  return db.teamMembers.filter((m) => m.agencyId === agencyId);
}

export function leadsForAgency(agencyId: string) {
  return db.leads.filter((l) => l.agencyId === agencyId);
}

export function ownersForAgency(agencyId: string) {
  return db.owners.filter((o) => o.agencyId === agencyId);
}

/**
 * `customers.view` is `'own'`-scoped for PC/SB, `'agency'`-scoped for AO —
 * MM/SM/OM hold no customers.* grant at all (rolePermissions.ts) and correctly
 * see nothing. Customer has no stored assigneeId (TBOS_RELATIONSHIP_UX_AUDIT.md
 * P1-3): 'own' is derived transitively through the customer's linked Leads —
 * a customer is "own" if any of their Leads is assigned to the viewer, the
 * same relationship-first principle the master prompt asks this phase to
 * prove rather than inventing a redundant flat field.
 */
export function customersForUser(user: { id: string; agencyId: string; activeRole: RoleCode }): CustomerListItem[] {
  if (!hasPermission(user.activeRole, 'customers.view')) return [];
  const ownScopeOnly = scopeFor(user.activeRole, 'customers.view') === 'own';
  return db.customers
    .filter((c) => {
      if (c.agencyId !== user.agencyId) return false;
      if (!ownScopeOnly) return true;
      return db.leads.some((l) => l.customerId === c.id && l.assigneeId === user.id);
    })
    .map((c) => ({
      ...c,
      // Computed fresh from the FK side every read, never stored — the exact
      // P1-3 drift class this phase found and fixed for linkedPropertyIds.
      leadCount: db.leads.filter((l) => l.customerId === c.id).length,
      lastActivityAt: customerActivitiesForCustomer(c.id)[0]?.timestamp ?? null,
    }));
}

export function customerById(id: string) {
  return db.customers.find((c) => c.id === id) ?? null;
}

export function leadsForCustomer(customerId: string) {
  return db.leads.filter((l) => l.customerId === customerId);
}

export function customerActivitiesForCustomer(customerId: string) {
  return db.customerActivities.filter((a) => a.customerId === customerId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addCustomerActivity(activity: Omit<CustomerActivity, 'id' | 'timestamp'>) {
  const entry: CustomerActivity = { ...activity, id: `ca-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() };
  db.customerActivities.push(entry);
  return entry;
}

export function logCustomerInteraction(customerId: string, note: string, actorName: string) {
  return addCustomerActivity({ customerId, kind: 'interaction_logged', actorKind: 'human', actorName, detail: note });
}

/**
 * `owners.view` is `'own'`-scoped for PC, `'agency'`-scoped for AO/MM — SM/OM
 * hold no owners.* grant and correctly see nothing. Same transitive-scope
 * principle as customersForUser(), derived through the owner's linked
 * Properties (Property.ownerId, the authoritative FK — P1-3).
 */
export function ownersForUser(user: { id: string; agencyId: string; activeRole: RoleCode }): OwnerListItem[] {
  if (!hasPermission(user.activeRole, 'owners.view')) return [];
  const ownScopeOnly = scopeFor(user.activeRole, 'owners.view') === 'own';
  return db.owners
    .filter((o) => {
      if (o.agencyId !== user.agencyId) return false;
      if (!ownScopeOnly) return true;
      return db.properties.some((p) => p.ownerId === o.id && p.brokerId === user.id);
    })
    .map((o) => ({
      ...o,
      propertyCount: db.properties.filter((p) => p.ownerId === o.id).length,
      openMarketingRequestCount: db.marketingRequests.filter((m) => m.ownerId === o.id && m.status === 'open').length,
    }));
}

export function ownerById(id: string) {
  return db.owners.find((o) => o.id === id) ?? null;
}

export function propertiesForOwner(ownerId: string) {
  return db.properties.filter((p) => p.ownerId === ownerId);
}

export function ownerActivitiesForOwner(ownerId: string) {
  return db.ownerActivities.filter((a) => a.ownerId === ownerId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addOwnerActivity(activity: Omit<OwnerActivity, 'id' | 'timestamp'>) {
  const entry: OwnerActivity = { ...activity, id: `oa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() };
  db.ownerActivities.push(entry);
  return entry;
}

/** tbos-blueprint/04_SCREEN_INVENTORY.md OWN-03 permissions: "MM sees
 * agency-wide queue; PC/SB see only requests matched/assigned to them." */
export function marketingRequestsForOwner(ownerId: string) {
  return db.marketingRequests.filter((m) => m.ownerId === ownerId);
}

export function marketingRequestsForUser(user: { id: string; agencyId: string; activeRole: RoleCode }) {
  if (!hasPermission(user.activeRole, 'marketing_requests.view')) return [];
  const agencyWide = scopeFor(user.activeRole, 'marketing_requests.view') === 'agency';
  return db.marketingRequests.filter((m) => {
    if (m.agencyId !== user.agencyId) return false;
    return agencyWide || m.matchedBrokerId === user.id;
  });
}

export function respondToMarketingRequest(requestId: string, actorName: string) {
  const request = db.marketingRequests.find((m) => m.id === requestId);
  if (!request) return null;
  request.status = 'in_progress';
  addOwnerActivity({ ownerId: request.ownerId, kind: 'marketing_request_responded', actorKind: 'human', actorName, detail: `Responded to the marketing request — ${request.propertyContext}.` });
  return request;
}

export function markMarketingRequestWon(requestId: string, actorName: string) {
  const request = db.marketingRequests.find((m) => m.id === requestId);
  if (!request) return null;
  request.status = 'won';
  addOwnerActivity({ ownerId: request.ownerId, kind: 'marketing_request_won', actorKind: 'human', actorName, detail: `Marketing request converted — ${request.propertyContext}.` });
  return request;
}

export function markMarketingRequestLost(requestId: string, reason: LeadLostReason, actorName: string) {
  const request = db.marketingRequests.find((m) => m.id === requestId);
  if (!request) return null;
  request.status = 'lost';
  request.lostReason = reason;
  addOwnerActivity({ ownerId: request.ownerId, kind: 'marketing_request_lost', actorKind: 'human', actorName, detail: `Marketing request marked Lost — ${reason}.` });
  return request;
}

export function todayRecommendationsForUser(user: { id: string; agencyId: string; activeRole: RoleCode }) {
  const leads = leadsForUser(user);
  const tasks = db.tasks.filter((t) => t.agencyId === user.agencyId && t.assigneeId === user.id);
  const properties = propertiesForUser(user);
  const marketingRequests = marketingRequestsForUser(user);
  const contracts = contractsForUser(user);
  const leadRecs = computeRecommendations({ leads, tasks, customers: db.customers, properties: db.properties, currentUserId: user.id });
  const propertyRecs = computePropertyRecommendations({ properties });
  const relationshipRecs = computeRelationshipRecommendations({ marketingRequests, owners: db.owners });
  const contractRecs = computeContractRecommendations({ contracts, canApprove: hasPermission(user.activeRole, 'contracts.approve') });
  const marketingRecs = computeMarketingRecommendations({ properties, propertyMedia: db.propertyMedia, canManage: hasPermission(user.activeRole, 'marketing.manage') });
  return [...leadRecs, ...propertyRecs, ...relationshipRecs, ...contractRecs, ...marketingRecs].sort((a, b) => {
    const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
    return rank[a.priority] - rank[b.priority];
  });
}

/**
 * `properties.view` is `'own'`-scoped for PC/SB (brokerId === viewer),
 * `'agency'`-scoped for AO/MM/OM — same scoping principle as leadsForUser(),
 * applied here rather than left to the route-level permission check alone
 * (TBOS_UI_INTEGRATION_AUDIT.md §1.J / TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md P1-1).
 */
export function propertiesForUser(user: { id: string; agencyId: string; activeRole: RoleCode }) {
  if (!hasPermission(user.activeRole, 'properties.view')) return [];
  const ownScopeOnly = scopeFor(user.activeRole, 'properties.view') === 'own';
  return db.properties.filter((p) => p.agencyId === user.agencyId && (!ownScopeOnly || p.brokerId === user.id));
}

export function propertyById(id: string) {
  return db.properties.find((p) => p.id === id) ?? null;
}

/**
 * PROP-03's "save Draft" / final step — WF-PROPERTY-NEW (tbos-definition/
 * 09_WORKFLOW_ARCHITECTURE.md): "a live listing, or an explicitly-saved
 * Draft — never an ambiguous in-between state." Always creates a Draft;
 * publishProperty() (already real, unchanged) is the only path from Draft to
 * Active/Pending Compliance, so the two-step create-then-publish shape this
 * phase's wizard uses is the exact same shape Phase 6 already built, not a
 * second creation path.
 */
export function createProperty(input: {
  agencyId: string;
  ownerId: string;
  brokerId: string;
  title: string;
  propertyType: Property['propertyType'];
  district: string;
  city: string;
  priceSar: number;
  description?: string;
  amenityTags?: string[];
  actorName: string;
}): Property {
  const property: Property = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    agencyId: input.agencyId,
    ownerId: input.ownerId,
    brokerId: input.brokerId,
    title: input.title,
    propertyType: input.propertyType,
    district: input.district,
    city: input.city,
    priceSar: input.priceSar,
    status: 'draft',
    linkedLeadCount: 0,
    listedDate: null,
    description: input.description,
    amenityTags: input.amenityTags,
  };
  db.properties.push(property);
  db.propertyCompliance.push(
    { id: `pc-${property.id}-1`, propertyId: property.id, name: 'FAL License', status: 'missing' },
    { id: `pc-${property.id}-2`, propertyId: property.id, name: 'REGA Ad License', status: 'missing' },
    { id: `pc-${property.id}-3`, propertyId: property.id, name: 'Nafath Owner Verification', status: 'missing' },
  );
  addPropertyActivity({ propertyId: property.id, kind: 'created', actorKind: 'human', actorName: input.actorName, detail: 'Draft started.' });
  return property;
}

export function propertyComplianceForProperty(propertyId: string) {
  return db.propertyCompliance.filter((c) => c.propertyId === propertyId);
}

export function propertyMediaForProperty(propertyId: string) {
  return db.propertyMedia.filter((m) => m.propertyId === propertyId).sort((a, b) => a.order - b.order);
}

export function propertyActivitiesForProperty(propertyId: string) {
  return db.propertyActivities.filter((a) => a.propertyId === propertyId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** No enumerated performance metrics exist in tbos-blueprint/tbos-definition
 * (TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md research) — leadsGenerated is real,
 * computed from actual Lead.propertyId links, never fabricated; daysOnMarket
 * is real when listedDate exists, null otherwise (master prompt §26). */
export function propertyPerformanceForProperty(propertyId: string): PropertyPerformance {
  const property = propertyById(propertyId);
  const leadsGenerated = db.leads.filter((l) => l.propertyId === propertyId).length;
  const daysOnMarket = property?.listedDate ? Math.max(0, Math.floor((Date.now() - new Date(property.listedDate).getTime()) / 86_400_000)) : null;
  return { propertyId, leadsGenerated, daysOnMarket };
}

export function addPropertyActivity(activity: Omit<PropertyActivity, 'id' | 'timestamp'>) {
  const entry: PropertyActivity = { ...activity, id: `pa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() };
  db.propertyActivities.push(entry);
  return entry;
}

function logPropertyStatusChange(propertyId: string, from: PropertyStatus, to: PropertyStatus, actorName: string, detail?: string) {
  const kind: PropertyActivityKind = 'status_changed';
  addPropertyActivity({ propertyId, kind, actorKind: 'human', actorName, detail: detail ?? `Moved from ${from} to ${to}.` });
}

export function changePropertyPrice(propertyId: string, newPriceSar: number, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  const oldPrice = property.priceSar;
  property.priceSar = newPriceSar;
  addPropertyActivity({
    propertyId,
    kind: 'price_changed',
    actorKind: 'human',
    actorName,
    detail: `Price changed from ${oldPrice.toLocaleString('en-US')} SAR to ${newPriceSar.toLocaleString('en-US')} SAR.`,
  });
  return property;
}

/** Added for MKT-03's fix-suggestion loop to be real, not decorative
 * (TBOS_MARKETING_UX_AUDIT.md P3-1) — mirrors changePropertyPrice()'s exact
 * shape, the smallest addition that lets "accept the AI suggestion" actually
 * change the record and re-score, rather than merely displaying advice. */
export function updatePropertyDescription(propertyId: string, description: string, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  property.description = description;
  addPropertyActivity({ propertyId, kind: 'description_updated', actorKind: 'human', actorName, detail: 'Description updated.' });
  return property;
}

/** PROP-03's media step persists each file only once the (simulated) upload
 * genuinely completes — the wizard component owns the per-file uploading/
 * processing/failed state locally; this mutation is called only on success,
 * matching WF-PROPERTY-NEW's "media upload with real-time processing status"
 * requirement without a real upload backend. */
export function addPropertyMedia(propertyId: string, caption: string): PropertyMediaItem {
  const order = db.propertyMedia.filter((m) => m.propertyId === propertyId).length + 1;
  const entry: PropertyMediaItem = { id: `pm-${propertyId}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, propertyId, status: 'approved', caption, order };
  db.propertyMedia.push(entry);
  return entry;
}

export function publishProperty(propertyId: string, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  const allVerified = propertyComplianceForProperty(propertyId).every((r) => r.status === 'verified' || r.status === 'expiring');
  const from = property.status;
  property.status = allVerified ? 'active' : 'pending_compliance';
  if (property.status === 'active') property.listedDate = property.listedDate ?? new Date().toISOString().slice(0, 10);
  logPropertyStatusChange(propertyId, from, property.status, actorName);
  return property;
}

export function archiveProperty(propertyId: string, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  const from = property.status;
  property.status = 'archived';
  logPropertyStatusChange(propertyId, from, 'archived', actorName);
  return property;
}

export function markPropertySoldRented(propertyId: string, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  const from = property.status;
  property.status = 'sold_rented';
  logPropertyStatusChange(propertyId, from, 'sold_rented', actorName);
  return property;
}

export function renewPropertyCompliance(propertyId: string, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  const from = property.status;
  property.status = 'active';
  property.expiryDate = new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  db.propertyCompliance
    .filter((c) => c.propertyId === propertyId && (c.status === 'expiring' || c.status === 'expired'))
    .forEach((c) => {
      c.status = 'verified';
      c.expiryDate = property.expiryDate;
    });
  logPropertyStatusChange(propertyId, from, 'active', actorName, 'License renewed — compliance restored.');
  return property;
}

export function resubmitRejectedProperty(propertyId: string, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  const from = property.status;
  property.status = 'pending_compliance';
  property.rejectionReason = undefined;
  property.rejectionField = undefined;
  logPropertyStatusChange(propertyId, from, 'pending_compliance', actorName, 'Resubmitted for compliance review.');
  return property;
}

export function reassignPropertyBroker(propertyId: string, toBrokerId: string, toBrokerName: string, actorName: string) {
  const property = db.properties.find((p) => p.id === propertyId);
  if (!property) return null;
  property.brokerId = toBrokerId;
  addPropertyActivity({ propertyId, kind: 'status_changed', actorKind: 'human', actorName, detail: `Reassigned to ${toBrokerName}.` });
  return property;
}

export function resolveComplianceRequirement(requirementId: string, referenceNumber: string, actorName: string) {
  const requirement = db.propertyCompliance.find((c) => c.id === requirementId);
  if (!requirement) return null;
  requirement.status = 'verified';
  requirement.referenceNumber = referenceNumber || requirement.referenceNumber;
  requirement.expiryDate = requirement.expiryDate ?? new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  addPropertyActivity({
    propertyId: requirement.propertyId,
    kind: 'status_changed',
    actorKind: 'human',
    actorName,
    detail: `${requirement.name} verified.`,
  });
  return requirement;
}

/**
 * `projects.view` is `'own'`-scoped for PC/SB (brokerId === viewer),
 * `'agency'`-scoped for AO/MM/OM — the exact same scoping shape as
 * propertiesForUser(), applied to Projects per tbos-definition/
 * 16_MODULE_SPECIFICATIONS.md Projects: "Depends On: same as Properties."
 */
export function projectsForUser(user: { id: string; agencyId: string; activeRole: RoleCode }): Project[] {
  if (!hasPermission(user.activeRole, 'projects.view')) return [];
  const ownScopeOnly = scopeFor(user.activeRole, 'projects.view') === 'own';
  return db.projects.filter((p) => p.agencyId === user.agencyId && (!ownScopeOnly || p.brokerId === user.id));
}

export function projectById(id: string) {
  return db.projects.find((p) => p.id === id) ?? null;
}

export function projectComplianceForProject(projectId: string) {
  return db.projectCompliance.filter((c) => c.propertyId === projectId);
}

export function projectMediaForProject(projectId: string) {
  return db.projectMedia.filter((m) => m.propertyId === projectId).sort((a, b) => a.order - b.order);
}

export function projectActivitiesForProject(projectId: string) {
  return db.projectActivities.filter((a) => a.projectId === projectId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function projectPerformanceForProject(projectId: string): ProjectPerformance {
  const project = projectById(projectId);
  const leadsGenerated = db.leads.filter((l) => l.propertyId === projectId).length;
  const daysOnMarket = project?.listedDate ? Math.max(0, Math.floor((Date.now() - new Date(project.listedDate).getTime()) / 86_400_000)) : null;
  return { projectId, leadsGenerated, daysOnMarket };
}

export function addProjectActivity(activity: Omit<ProjectActivity, 'id' | 'timestamp'>) {
  const entry: ProjectActivity = { ...activity, id: `proja-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() };
  db.projectActivities.push(entry);
  return entry;
}

function logProjectStatusChange(projectId: string, from: PropertyStatus, to: PropertyStatus, actorName: string, detail?: string) {
  addProjectActivity({ projectId, kind: 'status_changed', actorKind: 'human', actorName, detail: detail ?? `Moved from ${from} to ${to}.` });
}

export function createProject(input: { agencyId: string; ownerId: string; brokerId: string; title: string; district: string; city: string; description?: string; actorName: string }): Project {
  const project: Project = {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    agencyId: input.agencyId,
    ownerId: input.ownerId,
    brokerId: input.brokerId,
    title: input.title,
    district: input.district,
    city: input.city,
    status: 'draft',
    linkedLeadCount: 0,
    listedDate: null,
    description: input.description,
  };
  db.projects.push(project);
  db.projectCompliance.push(
    { id: `projc-${project.id}-1`, propertyId: project.id, name: 'FAL License', status: 'missing' },
    { id: `projc-${project.id}-2`, propertyId: project.id, name: 'REGA Ad License', status: 'missing' },
    { id: `projc-${project.id}-3`, propertyId: project.id, name: 'Nafath Owner Verification', status: 'missing' },
  );
  addProjectActivity({ projectId: project.id, kind: 'created', actorKind: 'human', actorName: input.actorName, detail: 'Draft started.' });
  return project;
}

export function addProjectMedia(projectId: string, caption: string): PropertyMediaItem {
  const order = db.projectMedia.filter((m) => m.propertyId === projectId).length + 1;
  const entry: PropertyMediaItem = { id: `projm-${projectId}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, propertyId: projectId, status: 'approved', caption, order };
  db.projectMedia.push(entry);
  return entry;
}

/**
 * tbos-blueprint/04_SCREEN_INVENTORY.md PROJ-03: "at least one unit required
 * to publish" — the one completeness rule Projects adds on top of Property's
 * publish gate (compliance verification).
 */
export function publishProject(projectId: string, actorName: string) {
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;
  const hasUnit = db.units.some((u) => u.projectId === projectId);
  if (!hasUnit) return null;
  const allVerified = projectComplianceForProject(projectId).every((r) => r.status === 'verified' || r.status === 'expiring');
  const from = project.status;
  project.status = allVerified ? 'active' : 'pending_compliance';
  if (project.status === 'active') project.listedDate = project.listedDate ?? new Date().toISOString().slice(0, 10);
  logProjectStatusChange(projectId, from, project.status, actorName);
  return project;
}

export function archiveProject(projectId: string, actorName: string) {
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) return null;
  const from = project.status;
  project.status = 'archived';
  logProjectStatusChange(projectId, from, 'archived', actorName);
  return project;
}

export function resolveProjectComplianceRequirement(requirementId: string, referenceNumber: string, actorName: string) {
  const requirement = db.projectCompliance.find((c) => c.id === requirementId);
  if (!requirement) return null;
  requirement.status = 'verified';
  requirement.referenceNumber = referenceNumber || requirement.referenceNumber;
  requirement.expiryDate = requirement.expiryDate ?? new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  addProjectActivity({ projectId: requirement.propertyId, kind: 'status_changed', actorKind: 'human', actorName, detail: `${requirement.name} verified.` });
  return requirement;
}

export function unitsForProject(projectId: string): Unit[] {
  return db.units.filter((u) => u.projectId === projectId);
}

export function addUnit(projectId: string, floorPlan: string, priceSar: number, actorName: string): Unit {
  const unit: Unit = { id: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, projectId, floorPlan, priceSar, status: 'active' };
  db.units.push(unit);
  addProjectActivity({ projectId, kind: 'unit_added', actorKind: 'human', actorName, detail: `Unit added — ${floorPlan}, ${priceSar.toLocaleString('en-US')} SAR.` });
  return unit;
}

export function updateUnitStatus(unitId: string, status: PropertyStatus, actorName: string) {
  const unit = db.units.find((u) => u.id === unitId);
  if (!unit) return null;
  const from = unit.status;
  unit.status = status;
  addProjectActivity({ projectId: unit.projectId, kind: 'unit_status_changed', actorKind: 'human', actorName, detail: `Unit ${unit.floorPlan} moved from ${from} to ${status}.` });
  return unit;
}

export function updateUnitPrice(unitId: string, priceSar: number, actorName: string) {
  const unit = db.units.find((u) => u.id === unitId);
  if (!unit) return null;
  const oldPrice = unit.priceSar;
  unit.priceSar = priceSar;
  addProjectActivity({ projectId: unit.projectId, kind: 'unit_price_changed', actorKind: 'human', actorName, detail: `Unit ${unit.floorPlan} price changed from ${oldPrice.toLocaleString('en-US')} SAR to ${priceSar.toLocaleString('en-US')} SAR.` });
  return unit;
}

/**
 * `contracts.view` is `'own'`-scoped for PC/SB, `'agency'`-scoped for AO/OM —
 * SM/MM hold no contracts.* grant at all (rolePermissions.ts, matching
 * tbos-definition/07_INFORMATION_ARCHITECTURE.md's role table: explicitly "no
 * Contracts/Finance" for Marketing Manager; Sales Manager's exact level is
 * unstated in the source docs, and this repo's existing grant table —
 * unmodified by this phase — already excludes SM too, TBOS_CONTRACTS_
 * COMPLIANCE_UX_AUDIT.md research). Contract has no stored assigneeId: 'own'
 * is derived transitively through the contract's linked Lead, the same
 * relationship-first principle Phase 7 established for Customer/Owner.
 */
export function contractsForUser(user: { id: string; agencyId: string; activeRole: RoleCode }): Contract[] {
  if (!hasPermission(user.activeRole, 'contracts.view')) return [];
  const ownScopeOnly = scopeFor(user.activeRole, 'contracts.view') === 'own';
  return db.contracts.filter((c) => {
    if (c.agencyId !== user.agencyId) return false;
    if (!ownScopeOnly) return true;
    const lead = db.leads.find((l) => l.id === c.leadId);
    return lead?.assigneeId === user.id;
  });
}

export function contractById(id: string) {
  return db.contracts.find((c) => c.id === id) ?? null;
}

export function contractComplianceForContract(contractId: string): ContractComplianceItem[] {
  return db.contractCompliance.filter((c) => c.contractId === contractId);
}

export function contractDocumentsForContract(contractId: string): ContractDocument[] {
  return db.contractDocuments.filter((d) => d.contractId === contractId);
}

export function contractActivitiesForContract(contractId: string): ContractActivity[] {
  return db.contractActivities.filter((a) => a.contractId === contractId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addContractActivity(activity: Omit<ContractActivity, 'id' | 'timestamp'>) {
  const entry: ContractActivity = { ...activity, id: `cta-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() };
  db.contractActivities.push(entry);
  return entry;
}

/** Computed live from the linked Property's own real compliance records —
 * never stored per contract, so it can never drift (the same P1-3 lesson
 * Phase 7 learned for Owner↔Property; TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md). */
export function linkedPropertyComplianceVerified(propertyId: string): boolean {
  const requirements = db.propertyCompliance.filter((c) => c.propertyId === propertyId);
  if (requirements.length === 0) return false;
  return requirements.every((r) => r.status === 'verified' || r.status === 'expiring');
}

function logContractStageChange(contractId: string, from: ContractStatus, to: ContractStatus, actorName: string, detail?: string) {
  addContractActivity({ contractId, kind: 'stage_changed', actorKind: 'human', actorName, detail: detail ?? `Moved from ${from} to ${to}.` });
}

export function startComplianceChecklist(contractId: string, actorName: string) {
  const contract = db.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status !== 'draft') return null;
  contract.status = 'pending_compliance';
  logContractStageChange(contractId, 'draft', 'pending_compliance', actorName, 'Compliance checklist started.');
  return contract;
}

export function resolveContractComplianceItem(itemId: string, actorName: string) {
  const item = db.contractCompliance.find((c) => c.id === itemId);
  if (!item) return null;
  item.status = 'complete';
  item.blockedReason = undefined;
  addContractActivity({ contractId: item.contractId, kind: 'compliance_updated', actorKind: 'human', actorName, detail: `${item.requirement} — resolved.` });
  return item;
}

/** tbos-blueprint/17_ACCEPTANCE_CRITERIA.md WF-CONTRACT-NEW — both scenarios
 * enforced here: (1) a document flagged 'mismatch' blocks activation, no
 * automated process advances past it; (2) activation requires an explicit
 * confirmation action, gated to contracts.approve (OM/AO only) at the
 * permission layer in the screen, never auto-triggered by 100% checklist
 * completion alone. */
export function activateContract(contractId: string, actorName: string) {
  const contract = db.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status !== 'pending_compliance') return null;
  const items = contractComplianceForContract(contractId);
  const documents = contractDocumentsForContract(contractId);
  const allItemsComplete = items.every((i) => i.status === 'complete');
  const noMismatch = documents.every((d) => d.status !== 'mismatch');
  const propertyCompliant = linkedPropertyComplianceVerified(contract.propertyId);
  if (!allItemsComplete || !noMismatch || !propertyCompliant) return null;
  contract.status = 'active';
  contract.activeSince = new Date().toISOString().slice(0, 10);
  contract.renewalDueDate = new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  logContractStageChange(contractId, 'pending_compliance', 'active', actorName, `Contract active — renewal reminder set for ${contract.renewalDueDate}.`);
  return contract;
}

/** Renewal extends the existing record rather than creating a new one — a
 * documented ASSUMPTION (the source docs don't specify which, TBOS_CONTRACTS_
 * COMPLIANCE_UX_AUDIT.md research), chosen for consistency with Property's
 * renewCompliance() precedent (Phase 6). */
export function renewContract(contractId: string, actorName: string) {
  const contract = db.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status !== 'renewal_due') return null;
  contract.status = 'active';
  contract.renewalDueDate = new Date(Date.now() + 365 * 86_400_000).toISOString().slice(0, 10);
  logContractStageChange(contractId, 'renewal_due', 'active', actorName, `Renewed — next renewal due ${contract.renewalDueDate}.`);
  return contract;
}

export function declineContractRenewal(contractId: string, reason: string, actorName: string) {
  const contract = db.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status !== 'renewal_due') return null;
  contract.status = 'cancelled';
  contract.cancelledDate = new Date().toISOString().slice(0, 10);
  contract.cancellationReason = reason;
  logContractStageChange(contractId, 'renewal_due', 'cancelled', actorName, `Renewal declined: ${reason}`);
  return contract;
}

export function cancelContract(contractId: string, reason: string, actorName: string) {
  const contract = db.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status === 'closed' || contract.status === 'cancelled') return null;
  contract.status = 'cancelled';
  contract.cancelledDate = new Date().toISOString().slice(0, 10);
  contract.cancellationReason = reason;
  addContractActivity({ contractId, kind: 'cancelled', actorKind: 'human', actorName, detail: `Cancelled: ${reason}` });
  return contract;
}

/** A fixed demo SAR-per-quota-unit rate — the real Wallet spend/quota
 * conversion is an unresolved pricing decision (TBOS_MARKETING_UX_AUDIT.md,
 * "Wallet spend model"), never presented as a ratified price. */
const DEMO_SAR_PER_QUOTA_UNIT = 1500;

/**
 * MKT-01/02's list scope — mirrors contractsForUser()'s own-vs-agency shape.
 * 'own' (SB) has no real second-creator collision to test in the current
 * persona roster — SB exists alone in agency-2, the same situation Properties/
 * Contracts already had — documented in TBOS_MARKETING_VERTICAL_SLICE_REPORT.md
 * as a testing-coverage note, not a defect.
 */
export function campaignsForUser(user: { id: string; agencyId: string; activeRole: RoleCode }): Campaign[] {
  if (!hasPermission(user.activeRole, 'marketing.view')) return [];
  const ownScopeOnly = scopeFor(user.activeRole, 'marketing.view') === 'own';
  return db.campaigns.filter((c) => c.agencyId === user.agencyId && (!ownScopeOnly || c.createdByUserId === user.id));
}

export function campaignById(id: string) {
  return db.campaigns.find((c) => c.id === id) ?? null;
}

export function campaignActivitiesForCampaign(campaignId: string): CampaignActivity[] {
  return db.campaignActivities.filter((a) => a.campaignId === campaignId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addCampaignActivity(activity: Omit<CampaignActivity, 'id' | 'timestamp'>) {
  const entry: CampaignActivity = { ...activity, id: `campa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() };
  db.campaignActivities.push(entry);
  return entry;
}

/**
 * tbos-definition/16_MODULE_SPECIFICATIONS.md: "a campaign cannot be started
 * with zero eligible inventory — this state is prevented at the entry point."
 * Eligible = currently live (active/expiring) — an ASSUMPTION resolving the
 * source's undefined rule content (TBOS_MARKETING_UX_AUDIT.md P1-2), reusing
 * Property's own already-ratified lifecycle rather than inventing a second
 * taxonomy. Scoped through propertiesForUser() so an SB never sees/selects a
 * teammate's inventory to promote.
 */
export function eligiblePropertiesForUser(user: { id: string; agencyId: string; activeRole: RoleCode }): Property[] {
  return propertiesForUser(user).filter((p) => p.status === 'active' || p.status === 'expiring');
}

function addCampaignNotification(campaign: Campaign, title: string, body: string) {
  const entry: AppNotification = {
    id: `n-camp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    agencyId: campaign.agencyId,
    recipientId: campaign.createdByUserId,
    type: 'campaign',
    priority: 'medium',
    title,
    body,
    sourceScreenId: 'MKT-02',
    sourceRecordId: campaign.id,
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(entry);
  return entry;
}

export function createCampaign(agencyId: string, createdByUserId: string, name: string, actorName: string): Campaign {
  const campaign: Campaign = {
    id: `camp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    agencyId,
    createdByUserId,
    name,
    status: 'draft',
    spendSar: 0,
    quotaCost: 1,
    linkedPropertyIds: [],
    launchedAt: null,
    endedAt: null,
  };
  db.campaigns.push(campaign);
  addCampaignActivity({ campaignId: campaign.id, kind: 'created', actorKind: 'human', actorName, detail: 'Campaign created.' });
  return campaign;
}

export function selectCampaignInventory(campaignId: string, propertyIds: string[]) {
  const campaign = db.campaigns.find((c) => c.id === campaignId);
  if (!campaign || campaign.status !== 'draft') return null;
  campaign.linkedPropertyIds = propertyIds;
  return campaign;
}

export type CampaignLaunchBlockedReason = 'no_inventory_selected' | 'inventory_no_longer_eligible' | 'insufficient_balance';

export interface LaunchCampaignResult {
  campaign: Campaign | null;
  blockedReason: CampaignLaunchBlockedReason | null;
  shortfall?: number;
}

/**
 * Handles both the initial Draft→Running launch and a Paused→Running resume
 * through the same validated path — a paused campaign's linked inventory can
 * have drifted out of eligibility since it was launched, so resume re-checks
 * exactly like a fresh launch rather than trusting the original approval.
 */
export function launchCampaign(campaignId: string, actorName: string): LaunchCampaignResult {
  const campaign = db.campaigns.find((c) => c.id === campaignId);
  if (!campaign || (campaign.status !== 'draft' && campaign.status !== 'paused')) return { campaign: null, blockedReason: null };

  if (campaign.linkedPropertyIds.length === 0) {
    addCampaignActivity({ campaignId, kind: 'launch_blocked', actorKind: 'system', actorName, detail: 'Launch blocked — no eligible inventory selected.' });
    return { campaign, blockedReason: 'no_inventory_selected' };
  }

  const stillEligible = campaign.linkedPropertyIds.every((id) => {
    const p = db.properties.find((prop) => prop.id === id);
    return !!p && (p.status === 'active' || p.status === 'expiring');
  });
  if (!stillEligible) {
    addCampaignActivity({ campaignId, kind: 'launch_blocked', actorKind: 'system', actorName, detail: 'Launch blocked — linked inventory is no longer eligible.' });
    addCampaignNotification(campaign, 'Campaign eligibility blocked', `"${campaign.name}" can't launch — its linked inventory is no longer eligible.`);
    return { campaign, blockedReason: 'inventory_no_longer_eligible' };
  }

  const wallet = db.wallets.find((w) => w.agencyId === campaign.agencyId);
  const remaining = wallet ? wallet.quotaTotal - wallet.quotaUsed : 0;
  if (!wallet || remaining < campaign.quotaCost) {
    const shortfall = campaign.quotaCost - remaining;
    addCampaignActivity({ campaignId, kind: 'launch_blocked', actorKind: 'system', actorName, detail: `Launch blocked — insufficient Wallet quota (short by ${shortfall}).` });
    addCampaignNotification(campaign, 'Campaign launch blocked — insufficient balance', `"${campaign.name}" needs ${shortfall} more quota unit(s) than your Wallet has available.`);
    return { campaign, blockedReason: 'insufficient_balance', shortfall };
  }

  wallet.quotaUsed += campaign.quotaCost;
  // A fixed demo per-quota-unit cost — the real spend/quota conversion is an
  // unresolved pricing decision (TBOS_MARKETING_UX_AUDIT.md, "Wallet spend
  // model"). Without this, spendSar would stay at 0 through a real launch,
  // silently contradicting the Spend metric shown on-screen.
  campaign.spendSar += campaign.quotaCost * DEMO_SAR_PER_QUOTA_UNIT;
  const wasResume = campaign.status === 'paused';
  campaign.status = 'running';
  campaign.launchedAt = campaign.launchedAt ?? new Date().toISOString();
  addCampaignActivity({
    campaignId,
    kind: wasResume ? 'resumed' : 'launched',
    actorKind: 'human',
    actorName,
    detail: wasResume ? 'Campaign resumed.' : `Campaign launched — ${campaign.linkedPropertyIds.length} listing(s), ${campaign.quotaCost} quota unit(s).`,
  });
  return { campaign, blockedReason: null };
}

export function pauseCampaign(campaignId: string, actorName: string) {
  const campaign = db.campaigns.find((c) => c.id === campaignId);
  if (!campaign || campaign.status !== 'running') return null;
  campaign.status = 'paused';
  addCampaignActivity({ campaignId, kind: 'paused', actorKind: 'human', actorName, detail: 'Campaign paused.' });
  return campaign;
}

export function endCampaign(campaignId: string, actorName: string) {
  const campaign = db.campaigns.find((c) => c.id === campaignId);
  if (!campaign || (campaign.status !== 'running' && campaign.status !== 'paused')) return null;
  campaign.status = 'ended';
  campaign.endedAt = new Date().toISOString();
  addCampaignActivity({ campaignId, kind: 'ended', actorKind: 'human', actorName, detail: 'Campaign ended.' });
  return campaign;
}

export interface ContentQualityQueueEntry {
  property: Property;
  quality: ReturnType<typeof evaluatePropertyContentQuality>;
}

/**
 * MKT-03 — scoped to marketing.manage (matches screenRegistry's MKT-03
 * permission), restricted to currently-live listings (same active/expiring
 * set as campaign eligibility, §eligiblePropertiesForUser — one "live
 * inventory" rule, not two), sorted worst-first per tbos-blueprint/
 * 03_USER_JOURNEYS.md Journey 4 ("Queue shows listings below a content-
 * quality threshold, worst-first").
 */
export function contentQualityQueueForUser(user: { id: string; agencyId: string; activeRole: RoleCode }): ContentQualityQueueEntry[] {
  if (!hasPermission(user.activeRole, 'marketing.manage')) return [];
  const live = propertiesForUser(user).filter((p) => p.status === 'active' || p.status === 'expiring');
  return live
    .map((property) => ({
      property,
      quality: evaluatePropertyContentQuality(
        property,
        db.propertyMedia.filter((m) => m.propertyId === property.id && m.status === 'approved').length,
      ),
    }))
    .filter((entry) => entry.quality.score === 'needs_attention')
    .sort((a, b) => b.quality.missingItems.length - a.quality.missingItems.length);
}
