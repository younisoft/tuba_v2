import { describe, expect, it } from 'vitest';
import { hasPermission, permissionsForRole } from '@/lib/permissions/evaluate';
import { PERMISSION_REGISTRY, PERMISSION_KEYS } from '@/lib/permissions/permissionRegistry';
import { ROLE_PERMISSIONS } from '@/lib/permissions/rolePermissions';

describe('RBAC evaluation', () => {
  it('grants Agency Owner agency-wide access to role management', () => {
    expect(hasPermission('AO', 'settings.roles.manage')).toBe(true);
  });

  it('denies Property Consultant access to role management', () => {
    expect(hasPermission('PC', 'settings.roles.manage')).toBe(false);
  });

  it('denies a null/undefined role everything', () => {
    expect(hasPermission(null, 'home.view')).toBe(false);
    expect(hasPermission(undefined, 'home.view')).toBe(false);
  });

  it('scopes "own" grants to the record owner when context is supplied', () => {
    expect(hasPermission('PC', 'properties.edit', { currentUserId: 'tm-reem', ownerId: 'tm-reem' })).toBe(true);
    expect(hasPermission('PC', 'properties.edit', { currentUserId: 'tm-reem', ownerId: 'tm-sara' })).toBe(false);
  });

  it('never grants ADM any Broker OS permission — Platform Console isolation', () => {
    const brokerPermissions = PERMISSION_REGISTRY.filter((p) => p.key !== 'platform_console.access');
    for (const permission of brokerPermissions) {
      expect(hasPermission('ADM', permission.key)).toBe(false);
    }
  });

  it('every permission every role is granted exists in the permission registry', () => {
    for (const grants of Object.values(ROLE_PERMISSIONS)) {
      for (const grant of grants) {
        expect(PERMISSION_KEYS.has(grant.permission), `unknown permission "${grant.permission}"`).toBe(true);
      }
    }
  });

  it('permissionsForRole returns a flat, deduplicated-by-registry list', () => {
    const perms = permissionsForRole('SB');
    expect(perms.length).toBeGreaterThan(0);
    expect(perms).toContain('properties.create');
  });
});
