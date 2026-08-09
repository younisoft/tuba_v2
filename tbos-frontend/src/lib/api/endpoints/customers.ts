import { apiClient, type RequestOptions } from '@/lib/api/client';
import { customersForUser, customerById, leadsForCustomer, customerActivitiesForCustomer, logCustomerInteraction } from '@/mocks/api/db';
import type { Customer, CustomerListItem, CustomerActivity, Lead } from '@/types/entities';
import type { RoleCode } from '@/types/rbac';

export interface CustomersUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** Follows the exact shape of lib/api/endpoints/properties.ts — screens never
 * import mocks/ directly (MOCK_API.md). */
export const customersApi = {
  list: (user: CustomersUser, options?: RequestOptions) => apiClient.request<CustomerListItem[]>(() => customersForUser(user), options),

  get: (customerId: string, options?: RequestOptions) => apiClient.request<Customer>(() => customerById(customerId), options),

  leads: (customerId: string, options?: RequestOptions) => apiClient.request<Lead[]>(() => leadsForCustomer(customerId), options),

  activities: (customerId: string, options?: RequestOptions) => apiClient.request<CustomerActivity[]>(() => customerActivitiesForCustomer(customerId), options),

  logInteraction: (customerId: string, note: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<CustomerActivity>(() => logCustomerInteraction(customerId, note, actorName), options),
};
