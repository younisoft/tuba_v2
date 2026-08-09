import { COMPONENT_REGISTRY } from './componentRegistry';
import { SCREEN_MAP } from '@/registry/screens/screenRegistry';

export interface ComponentRegistryValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Master prompt §44/§54: no duplicate IDs, no duplicate names, no orphan
 * components, no invalid screen references. Run in dev on app boot (see
 * PermissionProvider.tsx's sibling pattern) and covered by
 * tests/componentRegistry.test.ts.
 */
export function validateComponentRegistry(): ComponentRegistryValidationResult {
  const errors: string[] = [];

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (const component of COMPONENT_REGISTRY) {
    if (seenIds.has(component.componentId)) errors.push(`Duplicate componentId: ${component.componentId}`);
    seenIds.add(component.componentId);

    if (seenNames.has(component.name)) errors.push(`Duplicate component name: ${component.name}`);
    seenNames.add(component.name);

    if (!/^TBOS-(CMP|PAT|SHL)-[A-Z]+-\d{3}$/.test(component.componentId)) {
      errors.push(`${component.componentId} does not match the TBOS-{CMP|PAT|SHL}-{CATEGORY}-{NNN} format`);
    }

    for (const screenId of component.screenIds) {
      if (!SCREEN_MAP[screenId]) {
        errors.push(`${component.componentId} (${component.name}) references undefined screen ID "${screenId}"`);
      }
    }

    if (component.sourceDocuments.length === 0) {
      errors.push(`${component.componentId} (${component.name}) has no sourceDocuments — every component must trace to a requirement (master prompt §4)`);
    }
  }

  return { valid: errors.length === 0, errors };
}
