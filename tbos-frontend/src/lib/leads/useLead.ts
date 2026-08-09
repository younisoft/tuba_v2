import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api/endpoints/leads';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { LeadStage, LeadLostReason, Lead, LeadActivity } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** LEAD-03's data + every Lead Action mutation, in one hook — mirrors
 * lib/notifications/useNotifications.ts's shape (React Query cache +
 * mutation-invalidates-query), the established pattern for this app. */
export function useLead(leadId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const leadQuery = useQuery<Lead, ApiError>({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const res = await leadsApi.get(leadId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!leadId,
  });

  const activitiesQuery = useQuery<LeadActivity[], ApiError>({
    queryKey: ['lead', leadId, 'activities'],
    queryFn: async () => {
      const res = await leadsApi.activities(leadId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!leadId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
  };

  const changeStage = useMutation({
    mutationFn: (toStage: LeadStage) => leadsApi.changeStage(leadId, toStage, actorName),
    onSuccess: invalidate,
  });

  const reassign = useMutation({
    mutationFn: ({ toAssigneeId, toAssigneeName }: { toAssigneeId: string; toAssigneeName: string }) =>
      leadsApi.reassign(leadId, toAssigneeId, toAssigneeName, actorName),
    onSuccess: invalidate,
  });

  const markLost = useMutation({
    mutationFn: ({ reason, note }: { reason: LeadLostReason; note?: string }) => leadsApi.markLost(leadId, reason, note, actorName),
    onSuccess: invalidate,
  });

  const reopen = useMutation({
    mutationFn: () => leadsApi.reopen(leadId, actorName),
    onSuccess: invalidate,
  });

  const addNote = useMutation({
    mutationFn: (note: string) => leadsApi.addNote(leadId, note, actorName),
    onSuccess: invalidate,
  });

  const logOutsideResponse = useMutation({
    mutationFn: (note: string) => leadsApi.logOutsideResponse(leadId, note, actorName),
    onSuccess: invalidate,
  });

  const scheduleFollowUp = useMutation({
    mutationFn: ({ dueDate, title }: { dueDate: string; title: string }) => {
      const lead = leadQuery.data;
      if (!lead) throw new Error('Lead not loaded yet');
      return leadsApi.scheduleFollowUp(leadId, lead.agencyId, lead.assigneeId, dueDate, title, actorName);
    },
    onSuccess: invalidate,
  });

  return {
    lead: leadQuery.data,
    isLoading: leadQuery.isLoading,
    error: leadQuery.error,
    activities: activitiesQuery.data ?? [],
    activitiesLoading: activitiesQuery.isLoading,
    changeStage: changeStage.mutate,
    reassign: reassign.mutate,
    markLost: markLost.mutate,
    reopen: reopen.mutate,
    addNote: addNote.mutate,
    logOutsideResponse: logOutsideResponse.mutate,
    scheduleFollowUp: scheduleFollowUp.mutate,
  };
}
