import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '@/lib/api/endpoints/properties';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Property, PropertyComplianceRequirement, PropertyMediaItem, PropertyActivity, PropertyPerformance } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** PROP-02's data + every Property Action mutation, in one hook — mirrors
 * lib/leads/useLead.ts's shape exactly. */
export function useProperty(propertyId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const propertyQuery = useQuery<Property, ApiError>({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const res = await propertiesApi.get(propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!propertyId,
  });

  const complianceQuery = useQuery<PropertyComplianceRequirement[], ApiError>({
    queryKey: ['property', propertyId, 'compliance'],
    queryFn: async () => {
      const res = await propertiesApi.compliance(propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!propertyId,
  });

  const mediaQuery = useQuery<PropertyMediaItem[], ApiError>({
    queryKey: ['property', propertyId, 'media'],
    queryFn: async () => {
      const res = await propertiesApi.media(propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!propertyId,
  });

  const activitiesQuery = useQuery<PropertyActivity[], ApiError>({
    queryKey: ['property', propertyId, 'activities'],
    queryFn: async () => {
      const res = await propertiesApi.activities(propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!propertyId,
  });

  const performanceQuery = useQuery<PropertyPerformance, ApiError>({
    queryKey: ['property', propertyId, 'performance'],
    queryFn: async () => {
      const res = await propertiesApi.performance(propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!propertyId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
  };

  const changePrice = useMutation({
    mutationFn: (newPriceSar: number) => propertiesApi.changePrice(propertyId, newPriceSar, actorName),
    onSuccess: invalidate,
  });

  const publish = useMutation({
    mutationFn: () => propertiesApi.publish(propertyId, actorName),
    onSuccess: invalidate,
  });

  const archive = useMutation({
    mutationFn: () => propertiesApi.archive(propertyId, actorName),
    onSuccess: invalidate,
  });

  const markSoldRented = useMutation({
    mutationFn: () => propertiesApi.markSoldRented(propertyId, actorName),
    onSuccess: invalidate,
  });

  const renewCompliance = useMutation({
    mutationFn: () => propertiesApi.renewCompliance(propertyId, actorName),
    onSuccess: invalidate,
  });

  const resubmit = useMutation({
    mutationFn: () => propertiesApi.resubmit(propertyId, actorName),
    onSuccess: invalidate,
  });

  const reassign = useMutation({
    mutationFn: ({ toBrokerId, toBrokerName }: { toBrokerId: string; toBrokerName: string }) =>
      propertiesApi.reassign(propertyId, toBrokerId, toBrokerName, actorName),
    onSuccess: invalidate,
  });

  const resolveComplianceRequirement = useMutation({
    mutationFn: ({ requirementId, referenceNumber }: { requirementId: string; referenceNumber: string }) =>
      propertiesApi.resolveComplianceRequirement(requirementId, referenceNumber, actorName),
    onSuccess: invalidate,
  });

  return {
    property: propertyQuery.data,
    isLoading: propertyQuery.isLoading,
    error: propertyQuery.error,
    compliance: complianceQuery.data ?? [],
    complianceLoading: complianceQuery.isLoading,
    media: mediaQuery.data ?? [],
    mediaLoading: mediaQuery.isLoading,
    activities: activitiesQuery.data ?? [],
    activitiesLoading: activitiesQuery.isLoading,
    performance: performanceQuery.data,
    performanceLoading: performanceQuery.isLoading,
    changePrice: changePrice.mutate,
    publish: publish.mutate,
    archive: archive.mutate,
    markSoldRented: markSoldRented.mutate,
    renewCompliance: renewCompliance.mutate,
    resubmit: resubmit.mutate,
    reassign: reassign.mutate,
    resolveComplianceRequirement: resolveComplianceRequirement.mutate,
  };
}
