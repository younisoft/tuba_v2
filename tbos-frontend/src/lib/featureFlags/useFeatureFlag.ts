import { useAuth } from '@/lib/auth/AuthProvider';
import { useFeatureFlagStore } from '@/state/featureFlags.store';

export function useFeatureFlag(key: string): boolean {
  const { user } = useAuth();
  return useFeatureFlagStore((s) => s.isEnabled(key, user?.activeRole ?? null));
}
