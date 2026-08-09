import { describe, expect, it, beforeEach } from 'vitest';
import { useFeatureFlagStore } from '@/state/featureFlags.store';

describe('feature flags', () => {
  beforeEach(() => {
    useFeatureFlagStore.setState({ overrides: {} });
  });

  it('reflects the registry default when no override is set', () => {
    expect(useFeatureFlagStore.getState().isEnabled('tbos.analytics', 'AO')).toBe(true);
  });

  it('returns false for an unknown flag key', () => {
    expect(useFeatureFlagStore.getState().isEnabled('tbos.does.not.exist', 'AO')).toBe(false);
  });

  it('respects a dev override layered over the registry default', () => {
    useFeatureFlagStore.getState().setOverride('tbos.analytics', false);
    expect(useFeatureFlagStore.getState().isEnabled('tbos.analytics', 'AO')).toBe(false);
  });

  it('restricts a rolloutRoles-scoped flag to only those roles', () => {
    expect(useFeatureFlagStore.getState().isEnabled('tbos.platformConsole', 'ADM')).toBe(true);
    expect(useFeatureFlagStore.getState().isEnabled('tbos.platformConsole', 'AO')).toBe(false);
  });
});
