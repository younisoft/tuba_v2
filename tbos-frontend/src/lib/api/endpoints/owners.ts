import { apiClient, type RequestOptions } from '@/lib/api/client';
import { ownersForUser, ownerById, propertiesForOwner, marketingRequestsForOwner, ownerActivitiesForOwner } from '@/mocks/api/db';
import type { Owner, OwnerListItem, OwnerActivity, Property, MarketingRequest } from '@/types/entities';
import type { RoleCode } from '@/types/rbac';

export interface OwnersUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** Follows the exact shape of lib/api/endpoints/properties.ts — screens never
 * import mocks/ directly (MOCK_API.md). */
export const ownersApi = {
  list: (user: OwnersUser, options?: RequestOptions) => apiClient.request<OwnerListItem[]>(() => ownersForUser(user), options),

  get: (ownerId: string, options?: RequestOptions) => apiClient.request<Owner>(() => ownerById(ownerId), options),

  properties: (ownerId: string, options?: RequestOptions) => apiClient.request<Property[]>(() => propertiesForOwner(ownerId), options),

  marketingRequests: (ownerId: string, options?: RequestOptions) => apiClient.request<MarketingRequest[]>(() => marketingRequestsForOwner(ownerId), options),

  activities: (ownerId: string, options?: RequestOptions) => apiClient.request<OwnerActivity[]>(() => ownerActivitiesForOwner(ownerId), options),
};
