import { useQuery } from '@tanstack/react-query';
import { marketingRequestsApi } from '@/lib/api/endpoints/marketingRequests';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { MarketingRequest } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** OWN-03's data source — same query shape as useProperties.ts, scoped by
 * marketingRequestsForUser() (agency-wide for MM, matched-only for PC/SB per
 * tbos-blueprint/04_SCREEN_INVENTORY.md OWN-03 permissions). */
export function useMarketingRequestsQueue() {
  const { user } = useAuth();

  const query = useQuery<MarketingRequest[], ApiError>({
    queryKey: ['marketingRequests', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await marketingRequestsApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { marketingRequests: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
