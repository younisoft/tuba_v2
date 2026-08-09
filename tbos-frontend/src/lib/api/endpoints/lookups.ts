import { apiClient, type RequestOptions } from '@/lib/api/client';
import { customersForAgency, propertiesForAgency, teamMembersForAgency, ownersForAgency, leadsForAgency } from '@/mocks/api/db';
import type { Customer, Property, TeamMember, Owner, Lead } from '@/types/entities';

/** Minimal read-only name-resolution surface for Lead/Property cards/rows/
 * detail — see mocks/api/db.ts's lookups comment. Not a Customers/Properties/
 * Owners/Team module; no create/edit, no routed screen. */
export const lookupsApi = {
  customers: (agencyId: string, options?: RequestOptions) => apiClient.request<Customer[]>(() => customersForAgency(agencyId), options),
  properties: (agencyId: string, options?: RequestOptions) => apiClient.request<Property[]>(() => propertiesForAgency(agencyId), options),
  teamMembers: (agencyId: string, options?: RequestOptions) => apiClient.request<TeamMember[]>(() => teamMembersForAgency(agencyId), options),
  owners: (agencyId: string, options?: RequestOptions) => apiClient.request<Owner[]>(() => ownersForAgency(agencyId), options),
  /** Added for CONT-02's record-level scope check (a Contract's 'own' scope
   * is derived transitively through its linked Lead's assigneeId — the same
   * FK-derived principle as Phase 7's Customer/Owner). */
  leads: (agencyId: string, options?: RequestOptions) => apiClient.request<Lead[]>(() => leadsForAgency(agencyId), options),
};
