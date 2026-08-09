import { useQuery } from '@tanstack/react-query';
import { contractsApi } from '@/lib/api/endpoints/contracts';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Contract } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** CONT-01's data source — mirrors lib/properties/useProperties.ts's shape exactly. */
export function useContracts() {
  const { user } = useAuth();

  const query = useQuery<Contract[], ApiError>({
    queryKey: ['contracts', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await contractsApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { contracts: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
