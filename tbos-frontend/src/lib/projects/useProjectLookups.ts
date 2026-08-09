import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api/endpoints/lookups';
import { useAuth } from '@/lib/auth/AuthProvider';

/** Agency-scoped Owner/TeamMember name lookups for Project cards/rows/detail
 * — mirrors lib/properties/usePropertyLookups.ts exactly. */
export function useProjectLookups() {
  const { user } = useAuth();
  const agencyId = user?.agencyId ?? '';

  const owners = useQuery({
    queryKey: ['lookups', 'owners', agencyId],
    queryFn: async () => {
      const res = await lookupsApi.owners(agencyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!agencyId,
  });

  const teamMembers = useQuery({
    queryKey: ['lookups', 'teamMembers', agencyId],
    queryFn: async () => {
      const res = await lookupsApi.teamMembers(agencyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!agencyId,
  });

  return {
    owners: owners.data ?? [],
    teamMembers: teamMembers.data ?? [],
    isLoading: owners.isLoading || teamMembers.isLoading,
  };
}
