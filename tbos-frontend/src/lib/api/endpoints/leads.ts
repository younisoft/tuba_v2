import { apiClient, type RequestOptions } from '@/lib/api/client';
import {
  leadsForUser,
  leadById,
  leadActivitiesForLead,
  updateLeadStage,
  reassignLead,
  markLeadLost,
  reopenLead,
  addLeadNote,
  logLeadOutsideResponse,
  scheduleLeadFollowUp,
} from '@/mocks/api/db';
import type { Lead, LeadActivity, LeadStage, LeadLostReason } from '@/types/entities';
import type { RoleCode } from '@/types/rbac';

export interface LeadsUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** Follows the exact shape of lib/api/endpoints/notifications.ts — the one
 * seam every screen's Leads data access goes through (mocks/ is never
 * imported directly by a screen). */
export const leadsApi = {
  list: (user: LeadsUser, options?: RequestOptions) => apiClient.request<Lead[]>(() => leadsForUser(user), options),

  get: (leadId: string, options?: RequestOptions) => apiClient.request<Lead>(() => leadById(leadId), options),

  activities: (leadId: string, options?: RequestOptions) => apiClient.request<LeadActivity[]>(() => leadActivitiesForLead(leadId), options),

  changeStage: (leadId: string, toStage: LeadStage, actorName: string, options?: RequestOptions) =>
    apiClient.request<Lead>(() => updateLeadStage(leadId, toStage, actorName), options),

  reassign: (leadId: string, toAssigneeId: string, toAssigneeName: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Lead>(() => reassignLead(leadId, toAssigneeId, toAssigneeName, actorName), options),

  markLost: (leadId: string, reason: LeadLostReason, note: string | undefined, actorName: string, options?: RequestOptions) =>
    apiClient.request<Lead>(() => markLeadLost(leadId, reason, note, actorName), options),

  reopen: (leadId: string, actorName: string, options?: RequestOptions) => apiClient.request<Lead>(() => reopenLead(leadId, actorName), options),

  addNote: (leadId: string, note: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<LeadActivity>(() => addLeadNote(leadId, note, actorName), options),

  logOutsideResponse: (leadId: string, note: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<LeadActivity>(() => logLeadOutsideResponse(leadId, note, actorName), options),

  scheduleFollowUp: (
    leadId: string,
    agencyId: string,
    assigneeId: string,
    dueDate: string,
    title: string,
    actorName: string,
    options?: RequestOptions,
  ) => apiClient.request(() => scheduleLeadFollowUp(leadId, agencyId, assigneeId, dueDate, title, actorName), options),
};
