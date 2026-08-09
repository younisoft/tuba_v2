import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/endpoints/customers';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { CustomerListItem } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** CUST-01's data source — mirrors lib/properties/useProperties.ts's shape exactly. */
export function useCustomers() {
  const { user } = useAuth();

  const query = useQuery<CustomerListItem[], ApiError>({
    queryKey: ['customers', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await customersApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { customers: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
