import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api/endpoints/lookups';
import { useAuth } from '@/lib/auth/AuthProvider';

/** Agency-scoped Property/TeamMember name lookups for a Customer's linked
 * Leads — mirrors lib/properties/usePropertyLookups.ts exactly. */
export function useCustomerLookups() {
  const { user } = useAuth();
  const agencyId = user?.agencyId ?? '';

  const properties = useQuery({
    queryKey: ['lookups', 'properties', agencyId],
    queryFn: async () => {
      const res = await lookupsApi.properties(agencyId);
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
    properties: properties.data ?? [],
    teamMembers: teamMembers.data ?? [],
    isLoading: properties.isLoading || teamMembers.isLoading,
  };
}
