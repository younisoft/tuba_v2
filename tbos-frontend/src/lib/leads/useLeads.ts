import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api/endpoints/leads';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Lead } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** LEAD-01/LEAD-02's shared data source — same query key, so the pipeline
 * (Kanban) view and the inbox (chronological) view of LEAD-02 never drift
 * out of sync (tbos-blueprint: "same lead data as LEAD-01... a view mode,
 * not a new destination"). */
export function useLeads() {
  const { user } = useAuth();

  const query = useQuery<Lead[], ApiError>({
    queryKey: ['leads', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await leadsApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { leads: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
