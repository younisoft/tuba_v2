import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi } from '@/lib/api/endpoints/properties';
import { useAuth } from '@/lib/auth/AuthProvider';

/** PROP-03's creation-flow mutations — a separate, small hook from
 * lib/properties/useProperty.ts (which assumes an existing record) since
 * create-then-manage is a genuinely different concern from the read+mutate
 * shape every other Detail hook has. */
export function usePropertyWizard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? 'Unknown';

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    queryClient.invalidateQueries({ queryKey: ['property'] });
    queryClient.invalidateQueries({ queryKey: ['today'] });
  };

  const create = useMutation({
    mutationFn: async (input: Omit<Parameters<typeof propertiesApi.create>[0], 'actorName'>) => {
      if (!user) throw new Error('Not authenticated');
      const res = await propertiesApi.create({ ...input, actorName });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const addMedia = useMutation({
    mutationFn: async ({ propertyId, caption }: { propertyId: string; caption: string }) => {
      const res = await propertiesApi.addMedia(propertyId, caption);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  return {
    createProperty: create.mutateAsync,
    addMedia: addMedia.mutateAsync,
  };
}
