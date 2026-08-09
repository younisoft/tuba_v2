import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/endpoints/projects';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Project } from '@/types/entities';
import type { ApiError } from '@/types/api';

/** PROJ-01's data source — mirrors lib/properties/useProperties.ts's shape exactly. */
export function useProjects() {
  const { user } = useAuth();

  const query = useQuery<Project[], ApiError>({
    queryKey: ['projects', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await projectsApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  return { projects: query.data ?? [], isLoading: query.isLoading, error: query.error };
}
