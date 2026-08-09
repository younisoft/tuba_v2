import type { PermissionCheckContext, PermissionKey, RoleCode } from '@/types/rbac';
import { ROLE_PERMISSIONS } from './rolePermissions';

/**
 * Pure permission evaluation — no React, no store reads, so it's trivially unit
 * testable (tests/permissions.test.ts) and reusable from both the route guard
 * and the nav-filtering code without either owning the logic.
 *
 * Scope is checked only when the caller supplies enough context to check it
 * (e.g. an `ownerId`); a bare hasPermission(role, key) call answers "could this
 * role ever do this," which is exactly what nav-visibility needs. Component/
 * action-level checks that mutate a specific record should pass `context`.
 */
export function hasPermission(
  role: RoleCode | null | undefined,
  permission: PermissionKey,
  context?: PermissionCheckContext & { currentUserId?: string },
): boolean {
  if (!role) return false;
  const grants = ROLE_PERMISSIONS[role] ?? [];
  const grant = grants.find((g) => g.permission === permission);
  if (!grant) return false;

  if (!context) return true;

  switch (grant.scope) {
    case 'own':
      return !context.ownerId || !context.currentUserId || context.ownerId === context.currentUserId;
    case 'team':
    case 'agency':
    case 'platform':
      return true;
    default:
      return true;
  }
}

export function permissionsForRole(role: RoleCode | null | undefined): PermissionKey[] {
  if (!role) return [];
  return (ROLE_PERMISSIONS[role] ?? []).map((g) => g.permission);
}

/**
 * The grant scope itself ('own'/'team'/'agency'/'platform'), or null if the
 * role has no grant for this permission at all. Needed anywhere that has to
 * decide *how* to scope a list before rendering it (e.g. lib/search/searchIndex.ts
 * deciding whether to additionally filter by ownerId) — hasPermission() only
 * answers a yes/no for one specific record, not "what tier is this role at."
 */
export function scopeFor(role: RoleCode | null | undefined, permission: PermissionKey) {
  if (!role) return null;
  const grant = (ROLE_PERMISSIONS[role] ?? []).find((g) => g.permission === permission);
  return grant?.scope ?? null;
}
