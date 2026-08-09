import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api/endpoints/lookups';
import { useAuth } from '@/lib/auth/AuthProvider';

/** Agency-scoped Customer/Property/TeamMember name lookups for Lead cards/rows/
 * detail — see lib/api/endpoints/lookups.ts. */
export function useLeadLookups() {
  const { user } = useAuth();
  const agencyId = user?.agencyId ?? '';

  const customers = useQuery({
    queryKey: ['lookups', 'customers', agencyId],
    queryFn: async () => {
      const res = await lookupsApi.customers(agencyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!agencyId,
  });

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
    customers: customers.data ?? [],
    properties: properties.data ?? [],
    teamMembers: teamMembers.data ?? [],
    isLoading: customers.isLoading || properties.isLoading || teamMembers.isLoading,
  };
}
