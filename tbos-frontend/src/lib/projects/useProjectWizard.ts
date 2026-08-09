import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/endpoints/projects';
import { useAuth } from '@/lib/auth/AuthProvider';

/** PROJ-03's creation-flow mutations — mirrors lib/properties/usePropertyWizard.ts exactly. */
export function useProjectWizard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
  };

  const create = useMutation({
    mutationFn: async (input: Omit<Parameters<typeof projectsApi.create>[0], 'actorName'>) => {
      if (!user) throw new Error('Not authenticated');
      const res = await projectsApi.create({ ...input, actorName });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const addMedia = useMutation({
    mutationFn: async ({ projectId, caption }: { projectId: string; caption: string }) => {
      const res = await projectsApi.addMedia(projectId, caption);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const addUnit = useMutation({
    mutationFn: async ({ projectId, floorPlan, priceSar }: { projectId: string; floorPlan: string; priceSar: number }) => {
      const res = await projectsApi.addUnit(projectId, floorPlan, priceSar, actorName);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  return {
    createProject: create.mutateAsync,
    addMedia: addMedia.mutateAsync,
    addUnit: addUnit.mutateAsync,
  };
}
