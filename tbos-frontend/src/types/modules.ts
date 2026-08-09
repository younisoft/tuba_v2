import type { NavGroup } from './screens';
import type { PermissionKey } from './rbac';

export type ModuleStatus = 'foundation' | 'planned';

export interface ModuleDefinition {
  id: string;
  name: string;
  routePrefix: string;
  navGroup: NavGroup;
  /** Icon name — resolved against the icon registry in components/ui/icons. */
  icon: string;
  /** Permission that must be held (in any scope) for the module's rail entry to render. */
  visibilityPermission: PermissionKey | null;
  featureFlag?: string;
  /** Group collapse default per tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §1 — Intelligence
   * & Control defaults collapsed below Agency Owner; Operating defaults expanded. */
  defaultExpandedForRoles: string[] | 'all';
  status: ModuleStatus;
}
