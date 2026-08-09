/**
 * The Component Library's own registry schema — master prompt §6/§44. Mirrors
 * the screen/module registry pattern already established in registry/screens
 * and registry/modules: one flat array, validated on dev boot, cross-checked
 * against SCREEN_REGISTRY so "usedBy" never references a screen ID that
 * doesn't exist.
 */
export type ComponentLevel = 'primitive' | 'tbos' | 'pattern' | 'shell';

export type ComponentCategory =
  | 'action' // Button, IconButton, Dropdown/Menu
  | 'form' // Input, Select, Field, Wizard
  | 'overlay' // Dialog, Drawer, Popover, Tooltip
  | 'display' // Avatar, Divider, Progress, Tabs
  | 'status' // StatusBadge, LifecycleIndicator
  | 'data' // MetricCard, DataTable
  | 'entity' // EntityHeader, EntityCard
  | 'ai' // AIInsight, AIConfidence
  | 'explainability'
  | 'permission'
  | 'compliance'
  | 'notification'
  | 'activity'
  | 'search'
  | 'filter'
  | 'feedback' // EmptyState, ConfirmationDialog, Toast
  | 'navigation'
  | 'layout';

export type ComponentStatus = 'ready' | 'in-development' | 'planned';

export interface ComponentResponsiveBehavior {
  desktop: string;
  tablet: string;
  mobile: string;
}

export interface ComponentRegistryEntry {
  /** Stable ID, format TBOS-{CMP|PAT|SHL}-{CATEGORY}-{NNN} — master prompt §7. Never reused. */
  componentId: string;
  name: string;
  level: ComponentLevel;
  category: ComponentCategory;
  description: string;
  /** Doc(s) this component's behavior contract traces back to — usually
   * design-system/12_COMPONENT_GUIDELINES.md's matching section and/or
   * tbos-blueprint/05_COMPONENT_MAPPING.md's component table. */
  sourceDocuments: string[];
  /** Screen IDs from SCREEN_REGISTRY that consume this component — validated
   * against the real registry, never a free-text guess. */
  screenIds: string[];
  states: string[];
  /** Permission key(s) this component's behavior depends on, if any — e.g.
   * PermissionGate takes one at render time, so this lists the *concept*, not
   * a specific instance. */
  permissions?: string[];
  responsiveBehavior: ComponentResponsiveBehavior;
  accessibilityRequirements: string[];
  rtlBehavior: string;
  darkModeBehavior: string;
  status: ComponentStatus;
  /** Relative path from src/, for humans navigating the registry. */
  filePath: string;
}
