import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api/endpoints/lookups';
import { useAuth } from '@/lib/auth/AuthProvider';

/** Agency-scoped Customer/Owner/Property name lookups for Contract List/Detail
 * — mirrors lib/properties/usePropertyLookups.ts exactly. */
export function useContractLookups() {
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

  const owners = useQuery({
    queryKey: ['lookups', 'owners', agencyId],
    queryFn: async () => {
      const res = await lookupsApi.owners(agencyId);
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

  const leads = useQuery({
    queryKey: ['lookups', 'leads', agencyId],
    queryFn: async () => {
      const res = await lookupsApi.leads(agencyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!agencyId,
  });

  return {
    customers: customers.data ?? [],
    owners: owners.data ?? [],
    properties: properties.data ?? [],
    leads: leads.data ?? [],
    isLoading: customers.isLoading || owners.isLoading || properties.isLoading || leads.isLoading,
  };
}
