import { useQuery } from '@tanstack/react-query';
import { marketingApi } from '@/lib/api/endpoints/marketing';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Campaign } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** MKT-01's data source — mirrors lib/contracts/useContracts.ts's shape exactly. */
export function useCampaigns() {
  const { user } = useAuth();

  const query = useQuery<Campaign[], ApiError>({
    queryKey: ['campaigns', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await marketingApi.listCampaigns({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { campaigns: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
