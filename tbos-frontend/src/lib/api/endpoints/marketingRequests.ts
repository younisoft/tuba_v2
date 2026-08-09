import { apiClient, type RequestOptions } from '@/lib/api/client';
import { marketingRequestsForUser, respondToMarketingRequest, markMarketingRequestWon, markMarketingRequestLost } from '@/mocks/api/db';
import type { MarketingRequest, LeadLostReason } from '@/types/entities';
import type { RoleCode } from '@/types/rbac';

export interface MarketingRequestsUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** OWN-03 — Marketing Requests Queue: MM's agency-wide view of the same
 * MarketingRequest records OWN-02's tab shows scoped to one owner (the exact
 * "same query, two presentations" precedent LEAD-01/LEAD-02 already
 * established in Phase 5 — never a second data source). */
export const marketingRequestsApi = {
  list: (user: MarketingRequestsUser, options?: RequestOptions) => apiClient.request<MarketingRequest[]>(() => marketingRequestsForUser(user), options),

  respond: (requestId: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<MarketingRequest>(() => respondToMarketingRequest(requestId, actorName), options),

  markWon: (requestId: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<MarketingRequest>(() => markMarketingRequestWon(requestId, actorName), options),

  markLost: (requestId: string, reason: LeadLostReason, actorName: string, options?: RequestOptions) =>
    apiClient.request<MarketingRequest>(() => markMarketingRequestLost(requestId, reason, actorName), options),
};
