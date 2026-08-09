import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/endpoints/customers';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Customer, Lead, CustomerActivity } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** CUST-02's data + the one spec'd Customer Action (log interaction) — mirrors
 * lib/properties/useProperty.ts's shape exactly. */
export function useCustomer(customerId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const customerQuery = useQuery<Customer, ApiError>({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const res = await customersApi.get(customerId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!customerId,
  });

  const leadsQuery = useQuery<Lead[], ApiError>({
    queryKey: ['customer', customerId, 'leads'],
    queryFn: async () => {
      const res = await customersApi.leads(customerId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!customerId,
  });

  const activitiesQuery = useQuery<CustomerActivity[], ApiError>({
    queryKey: ['customer', customerId, 'activities'],
    queryFn: async () => {
      const res = await customersApi.activities(customerId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!customerId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
  };

  const logInteraction = useMutation({
    mutationFn: (note: string) => customersApi.logInteraction(customerId, note, actorName),
    onSuccess: invalidate,
  });

  return {
    customer: customerQuery.data,
    isLoading: customerQuery.isLoading,
    error: customerQuery.error,
    leads: leadsQuery.data ?? [],
    leadsLoading: leadsQuery.isLoading,
    activities: activitiesQuery.data ?? [],
    activitiesLoading: activitiesQuery.isLoading,
    logInteraction: logInteraction.mutate,
  };
}
