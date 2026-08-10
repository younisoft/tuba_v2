import { apiClient, type RequestOptions } from '@/lib/api/client';
import {
  propertiesForUser,
  propertiesWithSummaryForUser,
  propertyById,
  propertyComplianceForProperty,
  propertyMediaForProperty,
  propertyActivitiesForProperty,
  propertyPerformanceForProperty,
  changePropertyPrice,
  updatePropertyDescription,
  publishProperty,
  archiveProperty,
  markPropertySoldRented,
  renewPropertyCompliance,
  resubmitRejectedProperty,
  reassignPropertyBroker,
  resolveComplianceRequirement,
  createProperty,
  addPropertyMedia,
} from '@/mocks/api/db';
import type { Property, PropertyComplianceRequirement, PropertyMediaItem, PropertyActivity, PropertyPerformance, PropertyListSummary } from '@/types/entities';
import type { RoleCode } from '@/types/rbac';

export interface PropertiesUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** Follows the exact shape of lib/api/endpoints/leads.ts — screens never
 * import mocks/ directly (MOCK_API.md). */
export const propertiesApi = {
  list: (user: PropertiesUser, options?: RequestOptions) => apiClient.request<Property[]>(() => propertiesForUser(user), options),

  /** PROP-01's list-row summary — advertisement status + real leads count in one bulk read (TBOS_MY_PROPERTIES_SCREEN_INVENTORY.md). */
  listWithSummary: (user: PropertiesUser, options?: RequestOptions) => apiClient.request<PropertyListSummary[]>(() => propertiesWithSummaryForUser(user), options),

  get: (propertyId: string, options?: RequestOptions) => apiClient.request<Property>(() => propertyById(propertyId), options),

  compliance: (propertyId: string, options?: RequestOptions) =>
    apiClient.request<PropertyComplianceRequirement[]>(() => propertyComplianceForProperty(propertyId), options),

  media: (propertyId: string, options?: RequestOptions) => apiClient.request<PropertyMediaItem[]>(() => propertyMediaForProperty(propertyId), options),

  activities: (propertyId: string, options?: RequestOptions) =>
    apiClient.request<PropertyActivity[]>(() => propertyActivitiesForProperty(propertyId), options),

  performance: (propertyId: string, options?: RequestOptions) =>
    apiClient.request<PropertyPerformance>(() => propertyPerformanceForProperty(propertyId), options),

  changePrice: (propertyId: string, newPriceSar: number, actorName: string, options?: RequestOptions) =>
    apiClient.request<Property>(() => changePropertyPrice(propertyId, newPriceSar, actorName), options),

  updateDescription: (propertyId: string, description: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Property>(() => updatePropertyDescription(propertyId, description, actorName), options),

  publish: (propertyId: string, actorName: string, options?: RequestOptions) => apiClient.request<Property>(() => publishProperty(propertyId, actorName), options),

  archive: (propertyId: string, actorName: string, options?: RequestOptions) => apiClient.request<Property>(() => archiveProperty(propertyId, actorName), options),

  markSoldRented: (propertyId: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Property>(() => markPropertySoldRented(propertyId, actorName), options),

  renewCompliance: (propertyId: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Property>(() => renewPropertyCompliance(propertyId, actorName), options),

  resubmit: (propertyId: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Property>(() => resubmitRejectedProperty(propertyId, actorName), options),

  reassign: (propertyId: string, toBrokerId: string, toBrokerName: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<Property>(() => reassignPropertyBroker(propertyId, toBrokerId, toBrokerName, actorName), options),

  resolveComplianceRequirement: (requirementId: string, referenceNumber: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<PropertyComplianceRequirement>(() => resolveComplianceRequirement(requirementId, referenceNumber, actorName), options),

  create: (input: Parameters<typeof createProperty>[0], options?: RequestOptions) => apiClient.request<Property>(() => createProperty(input), options),

  addMedia: (propertyId: string, caption: string, options?: RequestOptions) => apiClient.request<PropertyMediaItem>(() => addPropertyMedia(propertyId, caption), options),
};
