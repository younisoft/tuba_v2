import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/endpoints/projects';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Project, PropertyComplianceRequirement, PropertyMediaItem, ProjectActivity, ProjectPerformance, Unit, PropertyStatus } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** PROJ-02's data + every Project/Unit Action mutation, in one hook — mirrors
 * lib/properties/useProperty.ts's shape exactly. */
export function useProject(projectId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const projectQuery = useQuery<Project, ApiError>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await projectsApi.get(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  const complianceQuery = useQuery<PropertyComplianceRequirement[], ApiError>({
    queryKey: ['project', projectId, 'compliance'],
    queryFn: async () => {
      const res = await projectsApi.compliance(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  const mediaQuery = useQuery<PropertyMediaItem[], ApiError>({
    queryKey: ['project', projectId, 'media'],
    queryFn: async () => {
      const res = await projectsApi.media(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  const activitiesQuery = useQuery<ProjectActivity[], ApiError>({
    queryKey: ['project', projectId, 'activities'],
    queryFn: async () => {
      const res = await projectsApi.activities(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  const performanceQuery = useQuery<ProjectPerformance, ApiError>({
    queryKey: ['project', projectId, 'performance'],
    queryFn: async () => {
      const res = await projectsApi.performance(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  const unitsQuery = useQuery<Unit[], ApiError>({
    queryKey: ['project', projectId, 'units'],
    queryFn: async () => {
      const res = await projectsApi.units(projectId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!projectId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
  };

  const publish = useMutation({
    mutationFn: () => projectsApi.publish(projectId, actorName),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: () => projectsApi.archive(projectId, actorName),
    onSuccess: invalidate,
  });

  const resolveComplianceRequirement = useMutation({
    mutationFn: ({ requirementId, referenceNumber }: { requirementId: string; referenceNumber: string }) =>
      projectsApi.resolveComplianceRequirement(requirementId, referenceNumber, actorName),
    onSuccess: invalidate,
  });

  const addUnit = useMutation({
    mutationFn: ({ floorPlan, priceSar }: { floorPlan: string; priceSar: number }) => projectsApi.addUnit(projectId, floorPlan, priceSar, actorName),
    onSuccess: invalidate,
  });

  const updateUnitStatus = useMutation({
    mutationFn: ({ unitId, status }: { unitId: string; status: PropertyStatus }) => projectsApi.updateUnitStatus(unitId, status, actorName),
    onSuccess: invalidate,
  });

  const updateUnitPrice = useMutation({
    mutationFn: ({ unitId, priceSar }: { unitId: string; priceSar: number }) => projectsApi.updateUnitPrice(unitId, priceSar, actorName),
    onSuccess: invalidate,
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,
    compliance: complianceQuery.data ?? [],
    complianceLoading: complianceQuery.isLoading,
    media: mediaQuery.data ?? [],
    mediaLoading: mediaQuery.isLoading,
    activities: activitiesQuery.data ?? [],
    activitiesLoading: activitiesQuery.isLoading,
    performance: performanceQuery.data,
    performanceLoading: performanceQuery.isLoading,
    units: unitsQuery.data ?? [],
    unitsLoading: unitsQuery.isLoading,
    publish: publish.mutate,
    archive: archive.mutate,
    resolveComplianceRequirement: resolveComplianceRequirement.mutate,
    addUnit: addUnit.mutate,
    updateUnitStatus: updateUnitStatus.mutate,
    updateUnitPrice: updateUnitPrice.mutate,
  };
}
