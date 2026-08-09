import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { todayApi } from '@/lib/api/endpoints/today';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { TodayRecommendation } from '@/types/today';
import type { ApiError } from '@/types/api';

/** Dismiss is session-local only (never persisted) — the Recommendation Card
 * contract (tbos-blueprint/05_COMPONENT_MAPPING.md) requires dismiss/snooze to
 * always be available; it doesn't specify persistence, and there's no backend
 * in this phase to persist it against. */
export function useToday() {
  const { user } = useAuth();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const query = useQuery<TodayRecommendation[], ApiError>({
    queryKey: ['today', user?.agencyId, user?.activeRole, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await todayApi.list({ id: user.id, agencyId: user.agencyId, activeRole: user.activeRole });
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });

  const recommendations = (query.data ?? []).filter((r) => !dismissedIds.has(r.id));

  const dismiss = (id: string) => setDismissedIds((prev) => new Set(prev).add(id));

  return { recommendations, isLoading: query.isLoading, error: query.error, dismiss };
}
