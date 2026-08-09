import { SCREEN_REGISTRY, ROUTABLE_SCREENS } from './screenRegistry';
import { MODULE_MAP } from '@/registry/modules/moduleRegistry';
import { PERMISSION_KEYS } from '@/lib/permissions/permissionRegistry';

export interface RegistryValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Enforces master prompt §9's registry invariants: no duplicate screen IDs, no
 * duplicate routes, no permission/module referenced that doesn't exist. Run in
 * dev on app boot (see app/providers/AppProviders.tsx) and covered by
 * tests/registry.test.ts so a broken registry fails CI, not just the console.
 */
export function validateRegistry(): RegistryValidationResult {
  const errors: string[] = [];

  const seenIds = new Set<string>();
  for (const screen of SCREEN_REGISTRY) {
    if (seenIds.has(screen.id)) errors.push(`Duplicate screen ID: ${screen.id}`);
    seenIds.add(screen.id);
  }

  const seenPaths = new Map<string, string>();
  for (const screen of ROUTABLE_SCREENS) {
    const existing = seenPaths.get(screen.path);
    if (existing) errors.push(`Duplicate route "${screen.path}" used by both ${existing} and ${screen.id}`);
    seenPaths.set(screen.path, screen.id);
  }

  for (const screen of SCREEN_REGISTRY) {
    if (screen.permission && !PERMISSION_KEYS.has(screen.permission)) {
      errors.push(`${screen.id} references undefined permission "${screen.permission}"`);
    }
    if (!MODULE_MAP[screen.moduleId]) {
      errors.push(`${screen.id} references undefined module "${screen.moduleId}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}
