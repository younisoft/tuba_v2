import { useEffect, type ReactNode } from 'react';
import { validateRegistry } from '@/registry/screens/validateRegistry';
import { validateComponentRegistry } from '@/registry/components/validateComponentRegistry';

/**
 * Validates the screen/module/permission registries *and* the Component
 * Library registry once on boot (dev only — a broken registry should fail
 * loudly in development and in tests/registry.test.ts /
 * tests/componentRegistry.test.ts, not silently in production). Permission
 * *evaluation* itself is stateless (see evaluate.ts / useHasPermission.ts) so
 * this provider carries no context value.
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const result = validateRegistry();
      if (!result.valid) {
        // eslint-disable-next-line no-console
        console.error('[TBOS registry] Invalid screen/module/permission registry:\n' + result.errors.join('\n'));
      }

      const componentResult = validateComponentRegistry();
      if (!componentResult.valid) {
        // eslint-disable-next-line no-console
        console.error('[TBOS registry] Invalid component registry:\n' + componentResult.errors.join('\n'));
      }
    }
  }, []);

  return <>{children}</>;
}
