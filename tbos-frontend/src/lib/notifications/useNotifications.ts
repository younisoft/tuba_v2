import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/endpoints/notifications';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { AppNotification } from '@/types/entities';
import type { ApiError } from '@/types/api';

/**
 * The unread count must always be real — a direct fix for the current
 * platform's confirmed "0" badge defect (tbos-blueprint/04_SCREEN_INVENTORY.md
 * NOTIF-01). Both the list and the count are React Query-cached server state so
 * a markRead mutation's invalidation keeps every consumer (bell badge, panel) in
 * sync without prop drilling.
 */
export function useNotifications() {
  const { user } = useAuth();
  const recipientId = user?.id ?? '';
  const queryClient = useQueryClient();

  const listQuery = useQuery<AppNotification[], ApiError>({
    queryKey: ['notifications', recipientId],
    queryFn: async () => {
      const res = await notificationsApi.list(recipientId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!recipientId,
  });

  const unreadQuery = useQuery({
    queryKey: ['notifications', recipientId, 'unread-count'],
    queryFn: async () => {
      const res = await notificationsApi.unreadCount(recipientId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!recipientId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', recipientId] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id, true),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(recipientId),
    onSuccess: invalidate,
  });

  return {
    notifications: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    unreadCount: unreadQuery.data ?? 0,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  };
}
