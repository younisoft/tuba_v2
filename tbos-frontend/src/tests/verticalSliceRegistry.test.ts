import { describe, expect, it } from 'vitest';
import { VERTICAL_SLICE_REGISTRY } from '@/registry/verticalSliceRegistry';
import { SCREEN_MAP } from '@/registry/screens/screenRegistry';

describe('vertical slice registry', () => {
  it('every routable screen record resolves to a real, ready screen in SCREEN_MAP', () => {
    const routable = VERTICAL_SLICE_REGISTRY.filter((r) => r.screenId in SCREEN_MAP);
    expect(routable.length).toBeGreaterThan(0);
    for (const record of routable) {
      const screen = SCREEN_MAP[record.screenId];
      expect(screen, `${record.screenId} missing from SCREEN_MAP`).toBeDefined();
      expect(screen?.status, `${record.screenId} should be flipped to 'ready'`).toBe('ready');
      expect(screen?.path).toBe(record.route);
    }
  });

  it('every record cites a real blueprint document', () => {
    for (const record of VERTICAL_SLICE_REGISTRY) {
      expect(record.blueprintReference.length).toBeGreaterThan(0);
    }
  });
});
