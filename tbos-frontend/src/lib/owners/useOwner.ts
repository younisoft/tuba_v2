import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ownersApi } from '@/lib/api/endpoints/owners';
import { marketingRequestsApi } from '@/lib/api/endpoints/marketingRequests';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Owner, Property, MarketingRequest, OwnerActivity, LeadLostReason } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** OWN-02's data + the spec'd Owner Actions (respond to Marketing Request,
 * mirrors the exact Open→In Progress→Won/Lost state machine
 * tbos-blueprint/06_STATE_ARCHITECTURE.md defines) — mirrors
 * lib/properties/useProperty.ts's shape exactly. */
export function useOwner(ownerId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const ownerQuery = useQuery<Owner, ApiError>({
    queryKey: ['owner', ownerId],
    queryFn: async () => {
      const res = await ownersApi.get(ownerId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!ownerId,
  });

  const propertiesQuery = useQuery<Property[], ApiError>({
    queryKey: ['owner', ownerId, 'properties'],
    queryFn: async () => {
      const res = await ownersApi.properties(ownerId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!ownerId,
  });

  const marketingRequestsQuery = useQuery<MarketingRequest[], ApiError>({
    queryKey: ['owner', ownerId, 'marketingRequests'],
    queryFn: async () => {
      const res = await ownersApi.marketingRequests(ownerId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!ownerId,
  });

  const activitiesQuery = useQuery<OwnerActivity[], ApiError>({
    queryKey: ['owner', ownerId, 'activities'],
    queryFn: async () => {
      const res = await ownersApi.activities(ownerId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!ownerId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['owners'] });
    queryClient.invalidateQueries({ queryKey: ['owner', ownerId] });
    queryClient.invalidateQueries({ queryKey: ['marketingRequests'] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
  };

  const respondToRequest = useMutation({
    mutationFn: (requestId: string) => marketingRequestsApi.respond(requestId, actorName),
    onSuccess: invalidate,
  });

  const markRequestWon = useMutation({
    mutationFn: (requestId: string) => marketingRequestsApi.markWon(requestId, actorName),
    onSuccess: invalidate,
  });

  const markRequestLost = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: LeadLostReason }) => marketingRequestsApi.markLost(requestId, reason, actorName),
    onSuccess: invalidate,
  });

  return {
    owner: ownerQuery.data,
    isLoading: ownerQuery.isLoading,
    error: ownerQuery.error,
    properties: propertiesQuery.data ?? [],
    propertiesLoading: propertiesQuery.isLoading,
    marketingRequests: marketingRequestsQuery.data ?? [],
    marketingRequestsLoading: marketingRequestsQuery.isLoading,
    activities: activitiesQuery.data ?? [],
    activitiesLoading: activitiesQuery.isLoading,
    respondToRequest: respondToRequest.mutate,
    markRequestWon: markRequestWon.mutate,
    markRequestLost: markRequestLost.mutate,
  };
}
