import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { Tooltip } from '@/components/ui/Tooltip';
import type { PermissionCheckContext, PermissionKey } from '@/types/rbac';

export interface PermissionGateProps {
  permission: PermissionKey;
  context?: PermissionCheckContext & { currentUserId?: string };
  children: ReactNode;
  /** 'hide' — absent entirely (Rail Nav's rule: a link the user can't access
   * doesn't render, never grays out). 'disable' — rendered but inert, with a
   * Tooltip stating why (a Tab Group's contextual-restriction rule, distinct
   * from hide since the surrounding record is already visible). Both rules
   * are named explicitly in design-system/12_COMPONENT_GUIDELINES.md §1. */
  mode?: 'hide' | 'disable';
  fallback?: ReactNode;
}

/**
 * TBOS-CMP-PERMISSION-001 — the one place a component checks a permission
 * before rendering. Wraps `useHasPermission()` (lib/permissions/useHasPermission.ts)
 * — the exact same function RouteGuard and RailNav call — never a second
 * authorization implementation (master prompt §28/§51: "must not implement
 * their own authorization logic"). This is UX, not the security boundary;
 * see RBAC.md.
 */
export function PermissionGate({ permission, context, children, mode = 'hide', fallback = null }: PermissionGateProps) {
  const { can } = useHasPermission();
  const allowed = can(permission, context);

  if (allowed) return <>{children}</>;
  if (mode === 'hide') return <>{fallback}</>;

  if (isValidElement(children)) {
    const disabledChild = cloneElement(children as ReactElement<{ disabled?: boolean; 'aria-disabled'?: boolean }>, {
      disabled: true,
      'aria-disabled': true,
    });
    return (
      <Tooltip content="You don't have permission to do this — ask an Agency Owner to grant it.">
        <span className="inline-flex">{disabledChild}</span>
      </Tooltip>
    );
  }
  return <>{fallback}</>;
}
