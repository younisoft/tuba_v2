import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractsApi } from '@/lib/api/endpoints/contracts';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Contract, ContractComplianceItem, ContractDocument, ContractActivity } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** CONT-02's data + every Contract Action mutation, in one hook — mirrors
 * lib/properties/useProperty.ts's shape exactly. */
export function useContract(contractId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const contractQuery = useQuery<Contract, ApiError>({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      const res = await contractsApi.get(contractId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!contractId,
  });

  const complianceQuery = useQuery<ContractComplianceItem[], ApiError>({
    queryKey: ['contract', contractId, 'compliance'],
    queryFn: async () => {
      const res = await contractsApi.compliance(contractId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!contractId,
  });

  const documentsQuery = useQuery<ContractDocument[], ApiError>({
    queryKey: ['contract', contractId, 'documents'],
    queryFn: async () => {
      const res = await contractsApi.documents(contractId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!contractId,
  });

  const activitiesQuery = useQuery<ContractActivity[], ApiError>({
    queryKey: ['contract', contractId, 'activities'],
    queryFn: async () => {
      const res = await contractsApi.activities(contractId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!contractId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['contracts'] });
    queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
  };

  const startComplianceChecklist = useMutation({
    mutationFn: () => contractsApi.startComplianceChecklist(contractId, actorName),
    onSuccess: invalidate,
  });

  const resolveComplianceItem = useMutation({
    mutationFn: (itemId: string) => contractsApi.resolveComplianceItem(itemId, actorName),
    onSuccess: invalidate,
  });

  const activate = useMutation({
    mutationFn: () => contractsApi.activate(contractId, actorName),
    onSuccess: invalidate,
  });

  const renew = useMutation({
    mutationFn: () => contractsApi.renew(contractId, actorName),
    onSuccess: invalidate,
  });

  const declineRenewal = useMutation({
    mutationFn: (reason: string) => contractsApi.declineRenewal(contractId, reason, actorName),
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (reason: string) => contractsApi.cancel(contractId, reason, actorName),
    onSuccess: invalidate,
  });

  return {
    contract: contractQuery.data,
    isLoading: contractQuery.isLoading,
    error: contractQuery.error,
    compliance: complianceQuery.data ?? [],
    complianceLoading: complianceQuery.isLoading,
    documents: documentsQuery.data ?? [],
    documentsLoading: documentsQuery.isLoading,
    activities: activitiesQuery.data ?? [],
    activitiesLoading: activitiesQuery.isLoading,
    startComplianceChecklist: startComplianceChecklist.mutate,
    resolveComplianceItem: resolveComplianceItem.mutate,
    activate: activate.mutate,
    renew: renew.mutate,
    declineRenewal: declineRenewal.mutate,
    cancel: cancel.mutate,
  };
}
