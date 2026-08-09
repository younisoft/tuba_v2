import { useQuery } from '@tanstack/react-query';
import { ownersApi } from '@/lib/api/endpoints/owners';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { OwnerListItem } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** OWN-01's data source — mirrors lib/properties/useProperties.ts's shape exactly. */
export function useOwners() {
  const { user } = useAuth();

  const query = useQuery<OwnerListItem[], ApiError>({
    queryKey: ['owners', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await ownersApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { owners: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
