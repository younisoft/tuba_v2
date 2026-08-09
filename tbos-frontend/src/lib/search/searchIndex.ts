import { SCREEN_REGISTRY } from '@/registry/screens/screenRegistry';
import { db, customersForUser, ownersForUser, contractsForUser, campaignsForUser } from '@/mocks/api/db';
import { scopeFor } from '@/lib/permissions/evaluate';
import type { PermissionKey, RoleCode } from '@/types/rbac';
import type { SearchResult } from './types';

export interface SearchContext {
  agencyId: string;
  userId: string;
  role: RoleCode | null;
  can: (permission: PermissionKey) => boolean;
}

/**
 * RBAC-scoped, cross-entity search — a Property Consultant's search never
 * surfaces another agency's, or another consultant's own-scoped private,
 * record — tbos-blueprint/17_ACCEPTANCE_CRITERIA.md GS-01: "Search never
 * leaks out-of-scope records... a Property Consultant searches for a keyword
 * that matches another consultant's private lead... that lead does not
 * appear." (Fixed in TBOS_PRODUCT_UI_CONSISTENCY_AUDIT.md — this previously
 * checked agency membership only, not the 'own' scope tier, for both Leads
 * and Properties.) Screens are ranked first (navigation is the more common
 * intent for a foundation-phase demo with placeholder screens), entities
 * second, each capped to keep the palette scannable.
 */
export function search(query: string, ctx: SearchContext): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const screen of SCREEN_REGISTRY) {
    if (screen.overlayOnly || !screen.path) continue;
    if (screen.permission && !ctx.can(screen.permission)) continue;
    if (screen.name.toLowerCase().includes(q) || screen.id.toLowerCase() === q) {
      results.push({ id: `screen-${screen.id}`, category: 'screen', title: screen.name, subtitle: screen.id, path: screen.path });
    }
    if (results.length >= 8) break;
  }

  if (ctx.can('properties.view')) {
    const ownScopeOnly = scopeFor(ctx.role, 'properties.view') === 'own';
    for (const p of db.properties) {
      if (p.agencyId !== ctx.agencyId) continue;
      if (ownScopeOnly && p.brokerId !== ctx.userId) continue;
      if (p.title.toLowerCase().includes(q) || p.district.toLowerCase().includes(q)) {
        results.push({ id: `property-${p.id}`, category: 'property', title: p.title, subtitle: p.district, path: `/properties/${p.id}` });
      }
    }
  }

  if (ctx.can('leads.view')) {
    const ownScopeOnly = !ctx.can('leads.view.team');
    for (const l of db.leads) {
      if (l.agencyId !== ctx.agencyId) continue;
      if (ownScopeOnly && l.assigneeId !== ctx.userId) continue;
      const customer = db.customers.find((c) => c.id === l.customerId);
      if (customer && customer.name.toLowerCase().includes(q)) {
        results.push({ id: `lead-${l.id}`, category: 'lead', title: customer.name, subtitle: `Lead · ${l.stage}`, path: `/leads/${l.id}` });
      }
    }
  }

  // Scoped via customersForUser()/ownersForUser(), never the raw db.customers/
  // db.owners arrays — a Customer/Owner carries PII (phone) an out-of-scope
  // search must never surface, the same GS-01 rule Leads/Properties already
  // enforce, extended here after TBOS_RELATIONSHIP_UX_AUDIT.md P0-1 found it
  // had never been applied to Customers/Owners at all (agency-membership
  // check only, no 'own' tier).
  if (ctx.role && ctx.can('customers.view')) {
    for (const c of customersForUser({ id: ctx.userId, agencyId: ctx.agencyId, activeRole: ctx.role })) {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ id: `customer-${c.id}`, category: 'customer', title: c.name, subtitle: 'Customer', path: `/customers/${c.id}` });
      }
    }
  }

  if (ctx.role && ctx.can('owners.view')) {
    for (const o of ownersForUser({ id: ctx.userId, agencyId: ctx.agencyId, activeRole: ctx.role })) {
      if (o.name.toLowerCase().includes(q)) {
        results.push({ id: `owner-${o.id}`, category: 'owner', title: o.name, subtitle: 'Owner', path: `/owners/${o.id}` });
      }
    }
  }

  // Built scope-correct from day one via contractsForUser() (own vs. agency,
  // per tbos-blueprint/04_SCREEN_INVENTORY.md CONT-01's "OM full read/write;
  // PC read-only on own; AO full agency-wide") — never the raw db.contracts
  // array, directly applying the P0-1 lesson from Phase 7 (TBOS_RELATIONSHIP_
  // UX_AUDIT.md) instead of retrofitting it after the fact.
  if (ctx.role && ctx.can('contracts.view')) {
    for (const c of contractsForUser({ id: ctx.userId, agencyId: ctx.agencyId, activeRole: ctx.role })) {
      const customer = db.customers.find((cu) => cu.id === c.customerId);
      const property = db.properties.find((p) => p.id === c.propertyId);
      const haystack = `${customer?.name ?? ''} ${property?.title ?? ''} ${c.id}`.toLowerCase();
      if (haystack.includes(q)) {
        results.push({
          id: `contract-${c.id}`,
          category: 'contract',
          title: customer?.name ?? c.id,
          subtitle: `Contract · ${c.status}`,
          path: `/contracts/${c.id}`,
        });
      }
    }
  }

  // Built scope-correct from day one via campaignsForUser() — directly
  // applying the P0-1 lesson (never ship agency-membership-only scoping for a
  // new entity) proactively rather than needing a second fix cycle
  // (TBOS_MARKETING_UX_AUDIT.md).
  if (ctx.role && ctx.can('marketing.view')) {
    for (const c of campaignsForUser({ id: ctx.userId, agencyId: ctx.agencyId, activeRole: ctx.role })) {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ id: `campaign-${c.id}`, category: 'campaign', title: c.name, subtitle: `Campaign · ${c.status}`, path: `/marketing/new?campaignId=${c.id}` });
      }
    }
  }

  return results.slice(0, 20);
}
