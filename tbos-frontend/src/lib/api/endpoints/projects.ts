import { apiClient, type RequestOptions } from '@/lib/api/client';
import {
  projectsForUser,
  projectById,
  projectComplianceForProject,
  projectMediaForProject,
  projectActivitiesForProject,
  projectPerformanceForProject,
  createProject,
  addProjectMedia,
  publishProject,
  archiveProject,
  resolveProjectComplianceRequirement,
  unitsForProject,
  addUnit,
  updateUnitStatus,
  updateUnitPrice,
} from '@/mocks/api/db';
import type { Project, PropertyComplianceRequirement, PropertyMediaItem, ProjectActivity, ProjectPerformance, Unit, PropertyStatus } from '@/types/entities';
import type { RoleCode } from '@/types/rbac';

export interface ProjectsUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

/** Follows the exact shape of lib/api/endpoints/properties.ts — screens
 * never import mocks/ directly (MOCK_API.md). */
export const projectsApi = {
  list: (user: ProjectsUser, options?: RequestOptions) => apiClient.request<Project[]>(() => projectsForUser(user), options),

  get: (projectId: string, options?: RequestOptions) => apiClient.request<Project>(() => projectById(projectId), options),

  compliance: (projectId: string, options?: RequestOptions) => apiClient.request<PropertyComplianceRequirement[]>(() => projectComplianceForProject(projectId), options),

  media: (projectId: string, options?: RequestOptions) => apiClient.request<PropertyMediaItem[]>(() => projectMediaForProject(projectId), options),

  activities: (projectId: string, options?: RequestOptions) => apiClient.request<ProjectActivity[]>(() => projectActivitiesForProject(projectId), options),

  performance: (projectId: string, options?: RequestOptions) => apiClient.request<ProjectPerformance>(() => projectPerformanceForProject(projectId), options),

  units: (projectId: string, options?: RequestOptions) => apiClient.request<Unit[]>(() => unitsForProject(projectId), options),

  create: (input: Parameters<typeof createProject>[0], options?: RequestOptions) => apiClient.request<Project>(() => createProject(input), options),

  addMedia: (projectId: string, caption: string, options?: RequestOptions) => apiClient.request<PropertyMediaItem>(() => addProjectMedia(projectId, caption), options),

  publish: (projectId: string, actorName: string, options?: RequestOptions) => apiClient.request<Project>(() => publishProject(projectId, actorName), options),

  archive: (projectId: string, actorName: string, options?: RequestOptions) => apiClient.request<Project>(() => archiveProject(projectId, actorName), options),

  resolveComplianceRequirement: (requirementId: string, referenceNumber: string, actorName: string, options?: RequestOptions) =>
    apiClient.request<PropertyComplianceRequirement>(() => resolveProjectComplianceRequirement(requirementId, referenceNumber, actorName), options),

  addUnit: (projectId: string, floorPlan: string, priceSar: number, actorName: string, options?: RequestOptions) =>
    apiClient.request<Unit>(() => addUnit(projectId, floorPlan, priceSar, actorName), options),

  updateUnitStatus: (unitId: string, status: PropertyStatus, actorName: string, options?: RequestOptions) =>
    apiClient.request<Unit>(() => updateUnitStatus(unitId, status, actorName), options),

  updateUnitPrice: (unitId: string, priceSar: number, actorName: string, options?: RequestOptions) =>
    apiClient.request<Unit>(() => updateUnitPrice(unitId, priceSar, actorName), options),
};
