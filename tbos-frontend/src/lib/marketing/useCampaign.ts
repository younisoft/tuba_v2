import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketingApi } from '@/lib/api/endpoints/marketing';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Campaign, CampaignActivity, Property } from '@/types/entities';
import type { LaunchCampaignResult } from '@/mocks/api/db';
import type { ApiError } from '@/types/api';

/**
 * MKT-02's data + every Campaign action mutation, in one hook — mirrors
 * lib/contracts/useContract.ts's shape. `campaignId` is undefined in
 * "create new campaign" mode (the same single-flow route, `/marketing/new`,
 * serves both — TBOS_MARKETING_UX_AUDIT.md's resolution of MKT-02's one
 * registered path with no dynamic segment).
 */
export function useCampaign(campaignId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const campaignQuery = useQuery<Campaign | null, ApiError>({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      const res = await marketingApi.getCampaign(campaignId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!campaignId,
  });

  const activitiesQuery = useQuery<CampaignActivity[], ApiError>({
    queryKey: ['campaign', campaignId, 'activities'],
    queryFn: async () => {
      if (!campaignId) return [];
      const res = await marketingApi.campaignActivities(campaignId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!campaignId,
  });

  const eligiblePropertiesQuery = useQuery<Property[], ApiError>({
    queryKey: ['campaign-eligible-properties', user?.id, user?.agencyId, user?.activeRole],
    queryFn: async () => {
      if (!user) return [];
      const res = await marketingApi.eligibleProperties({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    queryClient.invalidateQueries({ queryKey: ['campaign'] });
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const create = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      const res = await marketingApi.createCampaign(user.agencyId, user.id, name, actorName);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const selectInventory = useMutation({
    mutationFn: async (propertyIds: string[]) => {
      if (!campaignId) throw new Error('No campaign');
      const res = await marketingApi.selectInventory(campaignId, propertyIds);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const launch = useMutation<LaunchCampaignResult, ApiError, void>({
    mutationFn: async () => {
      if (!campaignId) throw new Error('No campaign');
      const res = await marketingApi.launch(campaignId, actorName);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const pause = useMutation({
    mutationFn: async () => {
      if (!campaignId) throw new Error('No campaign');
      const res = await marketingApi.pause(campaignId, actorName);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const end = useMutation({
    mutationFn: async () => {
      if (!campaignId) throw new Error('No campaign');
      const res = await marketingApi.end(campaignId, actorName);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  return {
    campaign: campaignQuery.data,
    isLoading: campaignQuery.isLoading,
    error: campaignQuery.error,
    activities: activitiesQuery.data ?? [],
    eligibleProperties: eligiblePropertiesQuery.data ?? [],
    eligiblePropertiesLoading: eligiblePropertiesQuery.isLoading,
    createCampaign: create.mutateAsync,
    selectInventory: selectInventory.mutate,
    launch: launch.mutateAsync,
    lastLaunchResult: launch.data,
    pause: pause.mutate,
    end: end.mutate,
  };
}
