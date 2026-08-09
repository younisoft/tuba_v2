import { apiClient, type RequestOptions } from '@/lib/api/client';
import {
  contractsForUser,
  contractById,
  contractComplianceForContract,
  contractDocumentsForContract,
  contractActivitiesForContract,
  startComplianceChecklist,
  resolveContractComplianceItem,
  activateContract,
  renewContract,
  declineContractRenewal,
  cancelContract,
} from '@/mocks/api/db';
import type { Contract, ContractComplianceItem, ContractDocument, ContractActivity } from '@/types/entities';
import type { RoleCode } from '@/types/rbac';

export interface ContractsUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** Follows the exact shape of lib/api/endpoints/properties.ts — screens never
 * import mocks/ directly (MOCK_API.md). */
export const contractsApi = {
  list: (user: ContractsUser, options?: RequestOptions) => apiClient.request<Contract[]>(() => contractsForUser(user), options),

  get: (contractId: string, options?: RequestOptions) => apiClient.request<Contract>(() => contractById(contractId), options),

  compliance: (contractId: string, options?: RequestOptions) => apiClient.request<ContractComplianceItem[]>(() => contractComplianceForContract(contractId), options),

  documents: (contractId: string, options?: RequestOptions) => apiClient.request<ContractDocument[]>(() => contractDocumentsForContract(contractId), options),

  activities: (contractId: string, options?: RequestOptions) => apiClient.request<ContractActivity[]>(() => contractActivitiesForContract(contractId), options),

  startComplianceChecklist: (contractId: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Contract>(() => startComplianceChecklist(contractId, actorName), options),

  resolveComplianceItem: (itemId: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<ContractComplianceItem>(() => resolveContractComplianceItem(itemId, actorName), options),

  activate: (contractId: string, actorName: string, options?: RequestOptions) => apiClient.request<Contract>(() => activateContract(contractId, actorName), options),

  renew: (contractId: string, actorName: string, options?: RequestOptions) => apiClient.request<Contract>(() => renewContract(contractId, actorName), options),

  declineRenewal: (contractId: string, reason: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Contract>(() => declineContractRenewal(contractId, reason, actorName), options),

  cancel: (contractId: string, reason: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Contract>(() => cancelContract(contractId, reason, actorName), options),
};
