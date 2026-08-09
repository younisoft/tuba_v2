import { apiClient, type RequestOptions } from '@/lib/api/client';
import { db, notificationsForRecipient, unreadNotificationCount, markNotificationRead } from '@/mocks/api/db';
import type { AppNotification } from '@/types/entities';

export const notificationsApi = {
  list: (recipientId: string, options?: RequestOptions) =>
    apiClient.request<AppNotification[]>(() => notificationsForRecipient(recipientId), options),

  unreadCount: (recipientId: string, options?: RequestOptions) =>
    apiClient.request<number>(() => unreadNotificationCount(recipientId), options),

  markRead: (id: string, read = true, options?: RequestOptions) =>
    apiClient.request<AppNotification>(() => markNotificationRead(id, read), options),

  markAllRead: (recipientId: string, options?: RequestOptions) =>
    apiClient.request<number>(() => {
      const mine = db.notifications.filter((n) => n.recipientId === recipientId && !n.read);
      mine.forEach((n) => {
        n.read = true;
      });
      return mine.length;
    }, options),
};
