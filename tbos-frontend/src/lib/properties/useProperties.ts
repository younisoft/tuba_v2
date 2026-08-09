import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '@/lib/api/endpoints/properties';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Property } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** PROP-01's data source — mirrors lib/leads/useLeads.ts's shape exactly. */
export function useProperties() {
  const { user } = useAuth();

  const query = useQuery<Property[], ApiError>({
    queryKey: ['properties', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await propertiesApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { properties: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
