import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api/endpoints/lookups';
import { marketingApi } from '@/lib/api/endpoints/marketing';
import { useAuth } from '@/lib/auth/AuthProvider';

/** Agency-scoped Property lookup (for resolving linked-inventory titles on
 * MKT-01/02) + the agency Wallet summary (for MKT-02's pre-flight Quota/
 * Balance Meter) — mirrors lib/contracts/useContractLookups.ts's shape. */
export function useMarketingLookups() {
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

  const wallet = useQuery({
    queryKey: ['wallet', agencyId],
    queryFn: async () => {
      const res = await marketingApi.wallet(agencyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!agencyId,
  });

  return {
    properties: properties.data ?? [],
    wallet: wallet.data ?? null,
    isLoading: properties.isLoading || wallet.isLoading,
  };
}
