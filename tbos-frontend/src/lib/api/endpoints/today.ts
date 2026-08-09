import { apiClient, type RequestOptions } from '@/lib/api/client';
import { todayRecommendationsForUser } from '@/mocks/api/db';
import type { TodayRecommendation } from '@/types/today';
import type { RoleCode } from '@/types/rbac';

export interface TodayUser {
  id: string;
  agencyId: string;
  activeRole: RoleCode;
}

export const todayApi = {
  list: (user: TodayUser, options?: RequestOptions) => apiClient.request<TodayRecommendation[]>(() => todayRecommendationsForUser(user), options),
};
