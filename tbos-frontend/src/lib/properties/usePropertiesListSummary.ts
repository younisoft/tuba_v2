import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '@/lib/api/endpoints/properties';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { PropertyListSummary } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** PROP-01's data source — mirrors lib/properties/useProperties.ts's shape,
 * but returns the per-row summary (advertisement status, real leads count)
 * the redesigned list needs (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md §2). */
export function usePropertiesListSummary() {
  const { user } = useAuth();

  const query = useQuery<PropertyListSummary[], ApiError>({
    queryKey: ['properties', 'listWithSummary', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await propertiesApi.listWithSummary({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { summaries: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
