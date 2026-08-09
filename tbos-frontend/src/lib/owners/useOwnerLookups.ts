import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api/endpoints/lookups';
import { useAuth } from '@/lib/auth/AuthProvider';

/** Agency-scoped TeamMember name lookups for a linked Property's broker —
 * mirrors lib/properties/usePropertyLookups.ts exactly. */
export function useOwnerLookups() {
  const { user } = useAuth();
  const agencyId = user?.agencyId ?? '';

  const teamMembers = useQuery({
    queryKey: ['lookups', 'teamMembers', agencyId],
    queryFn: async () => {
      const res = await lookupsApi.teamMembers(agencyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!agencyId,
  });

  return { teamMembers: teamMembers.data ?? [], isLoading: teamMembers.isLoading };
}
