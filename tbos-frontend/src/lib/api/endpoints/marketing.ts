import { apiClient, type RequestOptions } from '@/lib/api/client';
import {
  campaignsForUser,
  campaignById,
  campaignActivitiesForCampaign,
  eligiblePropertiesForUser,
  createCampaign,
  selectCampaignInventory,
  launchCampaign,
  pauseCampaign,
  endCampaign,
  contentQualityQueueForUser,
  findWalletByAgency,
} from '@/mocks/api/db';
import type { Campaign, CampaignActivity, Property, WalletSummary } from '@/types/entities';
import type { LaunchCampaignResult, ContentQualityQueueEntry } from '@/mocks/api/db';
import type { RoleCode } from '@/types/rbac';

export interface MarketingUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** Follows the exact shape of lib/api/endpoints/contracts.ts — screens never
 * import mocks/ directly (MOCK_API.md). */
export const marketingApi = {
  listCampaigns: (user: MarketingUser, options?: RequestOptions) => apiClient.request<Campaign[]>(() => campaignsForUser(user), options),

  getCampaign: (campaignId: string, options?: RequestOptions) => apiClient.request<Campaign | null>(() => campaignById(campaignId), options),

  campaignActivities: (campaignId: string, options?: RequestOptions) => apiClient.request<CampaignActivity[]>(() => campaignActivitiesForCampaign(campaignId), options),

  eligibleProperties: (user: MarketingUser, options?: RequestOptions) => apiClient.request<Property[]>(() => eligiblePropertiesForUser(user), options),

  wallet: (agencyId: string, options?: RequestOptions) => apiClient.request<WalletSummary | null>(() => findWalletByAgency(agencyId), options),

  createCampaign: (agencyId: string, createdByUserId: string, name: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Campaign>(() => createCampaign(agencyId, createdByUserId, name, actorName), options),

  selectInventory: (campaignId: string, propertyIds: string[], options?: RequestOptions) => apiClient.request<Campaign | null>(() => selectCampaignInventory(campaignId, propertyIds), options),

  launch: (campaignId: string, actorName: string, options?: RequestOptions) => apiClient.request<LaunchCampaignResult>(() => launchCampaign(campaignId, actorName), options),

  pause: (campaignId: string, actorName: string, options?: RequestOptions) => apiClient.request<Campaign | null>(() => pauseCampaign(campaignId, actorName), options),

  end: (campaignId: string, actorName: string, options?: RequestOptions) => apiClient.request<Campaign | null>(() => endCampaign(campaignId, actorName), options),

  contentQualityQueue: (user: MarketingUser, options?: RequestOptions) => apiClient.request<ContentQualityQueueEntry[]>(() => contentQualityQueueForUser(user), options),
};
