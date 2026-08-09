import type { ReactNode } from 'react';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { useFeatureFlag } from '@/lib/featureFlags/useFeatureFlag';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import type { ScreenDefinition } from '@/types/screens';

/**
 * Route-level enforcement — the same `can()` check nav-filtering (RailNav) uses,
 * so a screen hidden from nav is *also* refused if reached by direct URL. This
 * is UX, not the security boundary (RBAC.md): a real backend must reject the
 * underlying API calls regardless of what this guard renders.
 */
export function RouteGuard({ screen, children }: { screen: ScreenDefinition; children: ReactNode }) {
  const { can } = useHasPermission();
  const flagEnabled = useFeatureFlag(screen.featureFlag ?? '__none__');

  if (screen.permission && !can(screen.permission)) {
    return <NoPermissionState />;
  }
  if (screen.featureFlag && !flagEnabled) {
    return <NoPermissionState />;
  }

  return <>{children}</>;
}
