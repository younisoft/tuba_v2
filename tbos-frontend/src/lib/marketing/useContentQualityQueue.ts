import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingApi } from '@/lib/api/endpoints/marketing';
import { propertiesApi } from '@/lib/api/endpoints/properties';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { ContentQualityQueueEntry } from '@/mocks/api/db';
import type { ApiError } from '@/types/api';

/** MKT-03's data source + the one real fix action (edit description) that
 * closes the AISuggestion accept loop — TBOS_MARKETING_UX_AUDIT.md P3-1. */
export function useContentQualityQueue() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const query = useQuery<ContentQualityQueueEntry[], ApiError>({
    queryKey: ['contentQualityQueue', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await marketingApi.contentQualityQueue({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  const updateDescription = useMutation({
    mutationFn: async ({ propertyId, description }: { propertyId: string; description: string }) => {
      const res = await propertiesApi.updateDescription(propertyId, description, actorName);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentQualityQueue'] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });

  return {
    queue: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    updateDescription: updateDescription.mutate,
  };
}
