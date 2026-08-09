import { useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { PermissionCheckContext, PermissionKey } from '@/types/rbac';
import { hasPermission, permissionsForRole } from './evaluate';

/**
 * The one hook screens/components use for permission checks — route level
 * (RouteGuard), navigation level (RailNav/MobileTabBar filtering), component
 * level (conditionally rendering an action), and action level (disabling a
 * button) all call this same function, per master prompt §16.
 */
export function useHasPermission() {
  const { user } = useAuth();

  const can = useCallback(
    (permission: PermissionKey, context?: PermissionCheckContext & { currentUserId?: string }) =>
      hasPermission(user?.activeRole, permission, { currentUserId: user?.id, ...context }),
    [user],
  );

  return { can, permissions: permissionsForRole(user?.activeRole), role: user?.activeRole ?? null };
}
