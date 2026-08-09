import type { PermissionDefinition } from '@/types/rbac';

/**
 * Canonical permission registry — every key referenced by screenRegistry.ts or
 * moduleRegistry.ts must be defined here first (enforced by validateRegistry.ts).
 * Grouped by module, derived from the Permissions field of each screen in
 * tbos-blueprint/04_SCREEN_INVENTORY.md and tbos-definition/16_MODULE_SPECIFICATIONS.md.
 */
export const PERMISSION_REGISTRY: PermissionDefinition[] = [
  { key: 'home.view', module: 'home', action: 'view', description: 'View the Home aggregation view.' },

  { key: 'today.view', module: 'today', action: 'view', description: 'View the prioritized Today worklist.' },
  { key: 'today.act', module: 'today', action: 'manage', description: 'Resolve or dismiss a Today entry.' },

  { key: 'tasks.view', module: 'tasks', action: 'view', description: 'View own tasks.' },
  { key: 'tasks.view.team', module: 'tasks', action: 'view', description: "View a team's tasks." },
  { key: 'tasks.create', module: 'tasks', action: 'create', description: 'Create a task.' },
  { key: 'tasks.assign', module: 'tasks', action: 'assign', description: 'Assign a task to someone else.' },

  { key: 'properties.view', module: 'properties', action: 'view', description: 'View property listings.' },
  { key: 'properties.create', module: 'properties', action: 'create', description: 'Create a property listing.' },
  { key: 'properties.edit', module: 'properties', action: 'edit', description: 'Edit a property listing.' },
  { key: 'properties.delete', module: 'properties', action: 'delete', description: 'Delete/archive a property listing.' },
  { key: 'properties.compliance.edit', module: 'properties', action: 'edit', description: "Edit a property's compliance tab." },

  { key: 'projects.view', module: 'projects', action: 'view', description: 'View development projects and units.' },
  { key: 'projects.create', module: 'projects', action: 'create', description: 'Create a project or unit.' },
  { key: 'projects.edit', module: 'projects', action: 'edit', description: 'Edit a project or unit.' },

  { key: 'leads.view', module: 'leads', action: 'view', description: 'View leads in the Unified Lead Pipeline.' },
  { key: 'leads.view.team', module: 'leads', action: 'view', description: "View a team's leads." },
  { key: 'leads.assign', module: 'leads', action: 'assign', description: 'Reassign a lead.' },
  { key: 'leads.respond', module: 'leads', action: 'manage', description: 'Respond to / progress a lead.' },
  { key: 'leads.export', module: 'leads', action: 'export', description: 'Export lead data.' },

  { key: 'customers.view', module: 'customers', action: 'view', description: 'View customer relationship records.' },
  { key: 'customers.edit', module: 'customers', action: 'edit', description: 'Edit a customer record.' },

  { key: 'owners.view', module: 'owners', action: 'view', description: 'View owner relationship records.' },
  { key: 'owners.edit', module: 'owners', action: 'edit', description: 'Edit an owner record.' },
  { key: 'marketing_requests.view', module: 'owners', action: 'view', description: 'View the Marketing Requests queue.' },
  { key: 'marketing_requests.respond', module: 'owners', action: 'manage', description: 'Claim or respond to a Marketing Request.' },

  { key: 'contracts.view', module: 'contracts', action: 'view', description: 'View contracts.' },
  { key: 'contracts.approve', module: 'contracts', action: 'approve', description: 'Approve a compliance step / activate a contract.' },

  { key: 'marketing.view', module: 'marketing', action: 'view', description: 'View campaigns.' },
  { key: 'marketing.manage', module: 'marketing', action: 'manage', description: 'Create/edit campaigns and content quality fixes.' },

  { key: 'finance.view', module: 'finance', action: 'view', description: 'View revenue/commission reporting.' },

  { key: 'wallet.view', module: 'wallet', action: 'view', description: 'View own wallet balance/usage.' },
  { key: 'wallet.view.agency', module: 'wallet', action: 'view', description: 'View agency-wide wallet balance.' },
  { key: 'wallet.manage', module: 'wallet', action: 'manage', description: 'Top up, change tier, manage payment method.' },

  { key: 'analytics.view', module: 'analytics', action: 'view', description: 'View the Analytics Explorer.' },
  { key: 'reports.view', module: 'reports', action: 'view', description: 'View/generate reports.' },

  { key: 'automation.view', module: 'automation', action: 'view', description: 'View automation rules.' },
  { key: 'automation.manage', module: 'automation', action: 'manage', description: 'Create/edit/enable automation rules.' },

  { key: 'ai_copilot.view', module: 'ai_copilot', action: 'view', description: 'Use the AI Copilot conversation surface.' },
  { key: 'ai_audit.view', module: 'ai_copilot', action: 'view', description: 'View own AI action audit log.' },
  { key: 'ai_audit.view.agency', module: 'ai_copilot', action: 'view', description: 'View agency-wide AI action audit log.' },

  { key: 'notifications.view', module: 'notifications', action: 'view', description: 'View own notifications.' },

  { key: 'knowledge.view', module: 'knowledge', action: 'view', description: 'View Knowledge articles.' },

  { key: 'settings.profile.edit', module: 'settings', action: 'edit', description: 'Edit own account/profile.' },
  { key: 'settings.roles.manage', module: 'settings', action: 'manage', description: 'Create roles, assign permissions (SET-02).' },
  { key: 'settings.integrations.manage', module: 'settings', action: 'manage', description: 'Connect/disconnect integrations.' },
  { key: 'settings.compliance.view', module: 'settings', action: 'view', description: 'View compliance documents.' },
  {
    key: 'settings.compliance.manage',
    module: 'settings',
    action: 'manage',
    description: 'Submit/renew compliance documents agency-wide.',
  },
  { key: 'settings.compliance.manage.own', module: 'settings', action: 'manage', description: 'Submit/renew own compliance documents.' },

  { key: 'platform_console.access', module: 'platform_console', action: 'view', description: 'Access the Platform Console (ADM only).' },
];

export const PERMISSION_KEYS = new Set(PERMISSION_REGISTRY.map((p) => p.key));
