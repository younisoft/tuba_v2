import type { PermissionKey } from './rbac';

/** The three IA layers from tbos-definition/07_INFORMATION_ARCHITECTURE.md, plus
 * the cross-cutting overlays and the architecturally isolated Platform Console. */
export type NavGroup = 'orientation' | 'operating' | 'intelligence' | 'cross-cutting' | 'platform-console' | 'none';

export type ScreenStatus = 'placeholder' | 'in-development' | 'ready';

export interface ScreenDefinition {
  /** Canonical screen ID from tbos-blueprint/04_SCREEN_INVENTORY.md, e.g. "PROP-01". */
  id: string;
  name: string;
  /** Route path, relative to the app root. */
  path: string;
  moduleId: string;
  /** Permission required to view this screen. Screens with no gate (rare — e.g. Home) use null. */
  permission: PermissionKey | null;
  /** Feature flag key gating this screen's visibility, if any. */
  featureFlag?: string;
  navGroup: NavGroup;
  /** Whether this screen gets a rail/tab-bar nav entry at all — several screens in the
   * inventory are deliberately reached only via Search/Today/a parent screen. */
  hasNavEntry: boolean;
  /** QA-01 and CMD-01 are panels, not pages — registered for RBAC/documentation
   * completeness but never mounted as a <Route>. */
  overlayOnly?: boolean;
  status: ScreenStatus;
  /** One-line purpose, copied from the screen inventory's Purpose field — shown on the
   * dev placeholder so the scaffold stays traceable back to source. */
  purpose: string;
}
