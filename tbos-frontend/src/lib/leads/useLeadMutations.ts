import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api/endpoints/leads';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { LeadStage } from '@/types/entities';

/** Stage-change mutation not bound to a single lead's query (unlike
 * lib/leads/useLead.ts, which is LEAD-03-scoped) — LEAD-01's Kanban board
 * moves whichever card the user drags/selects, a different lead each call. */
export function useLeadMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const invalidate = (leadId: string) => {
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
    queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
  };

  const changeStageMutation = useMutation({
    mutationFn: ({ leadId, toStage }: { leadId: string; toStage: LeadStage }) => leadsApi.changeStage(leadId, toStage, actorName),
    onSuccess: (_res, vars) => invalidate(vars.leadId),
  });

  const reassignMutation = useMutation({
    mutationFn: ({ leadId, toAssigneeId, toAssigneeName }: { leadId: string; toAssigneeId: string; toAssigneeName: string }) =>
      leadsApi.reassign(leadId, toAssigneeId, toAssigneeName, actorName),
    onSuccess: (_res, vars) => invalidate(vars.leadId),
  });

  return {
    changeStage: (leadId: string, toStage: LeadStage) => changeStageMutation.mutate({ leadId, toStage }),
    reassign: (leadId: string, toAssigneeId: string, toAssigneeName: string) => reassignMutation.mutate({ leadId, toAssigneeId, toAssigneeName }),
  };
}
