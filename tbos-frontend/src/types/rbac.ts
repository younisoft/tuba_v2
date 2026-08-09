/**
 * RBAC primitives — see tbos-definition/04_PERSONAS.md for the persona narratives
 * these codes come from, and tbos-blueprint/04_SCREEN_INVENTORY.md for the
 * per-screen Permissions field this type system encodes.
 *
 * Frontend RBAC improves UX (hide/disable what a user can't act on) — it does not
 * replace backend authorization. Every mutation must be re-checked server-side;
 * this layer exists so the UI never dangles an action a permission check will
 * ultimately reject.
 */

/** Broker OS persona codes. ADM (Administrator) is architecturally isolated to the
 * Platform Console and never shares a route/nav surface with the six below. */
export type RoleCode = 'SB' | 'AO' | 'SM' | 'MM' | 'OM' | 'PC' | 'ADM';

export interface Role {
  code: RoleCode;
  name: string;
  description: string;
  /** true only for ADM — used to enforce the Broker OS / Platform Console split. */
  isPlatformRole: boolean;
}

/** module.resource.action — e.g. "properties.view", "leads.assign", "settings.roles.manage" */
export type PermissionKey = string;

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'assign' | 'approve' | 'export' | 'manage';

export type PermissionScope = 'own' | 'team' | 'agency' | 'platform';

export interface PermissionDefinition {
  key: PermissionKey;
  module: string;
  action: PermissionAction;
  description: string;
}

/** A role's grant of a permission, optionally narrowed to a scope narrower than
 * "agency" (e.g. a Property Consultant's `leads.view` grant is scoped "own"). */
export interface PermissionGrant {
  permission: PermissionKey;
  scope: PermissionScope;
}

export type RolePermissionMap = Record<RoleCode, PermissionGrant[]>;

/** Passed to a permission check so scope can be evaluated against a concrete
 * record (e.g. "own" means ownerId === currentUser.id). Foundation phase has no
 * real records, so this is the extension point future feature work fills in. */
export interface PermissionCheckContext {
  ownerId?: string;
  teamId?: string;
  agencyId?: string;
}
