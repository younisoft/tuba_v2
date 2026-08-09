import { describe, expect, it } from 'vitest';
import { validateRegistry } from '@/registry/screens/validateRegistry';
import { SCREEN_REGISTRY, ROUTABLE_SCREENS, primaryScreenForModule } from '@/registry/screens/screenRegistry';
import { MODULE_REGISTRY } from '@/registry/modules/moduleRegistry';

describe('screen + module registry', () => {
  it('has no duplicate IDs, routes, or dangling permission/module references', () => {
    const result = validateRegistry();
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('covers the full tbos-blueprint/04_SCREEN_INVENTORY.md screen set', () => {
    // Orientation(4) + Operating(19) + Intelligence(18) + cross-cutting(4) + Platform Console(5)
    expect(SCREEN_REGISTRY.length).toBe(50);
  });

  it('routes every non-overlay screen exactly once', () => {
    const paths = ROUTABLE_SCREENS.map((s) => s.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every module with a nav entry a resolvable primary screen', () => {
    for (const module of MODULE_REGISTRY) {
      const screen = primaryScreenForModule(module.id);
      expect(screen, `module "${module.id}" has no hasNavEntry screen`).toBeDefined();
    }
  });

  it('never lets a Platform Console screen carry a Broker OS module ID', () => {
    const consoleScreens = SCREEN_REGISTRY.filter((s) => s.id.startsWith('PC-'));
    expect(consoleScreens.every((s) => s.moduleId === 'platform_console')).toBe(true);
  });
});
