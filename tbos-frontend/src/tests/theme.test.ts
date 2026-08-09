import { describe, expect, it, beforeEach } from 'vitest';
import { applyThemeToDocument } from '@/state/theme.store';

describe('theme engine', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  it('stamps data-theme="dark" and persists the flat key the no-flash script reads', () => {
    applyThemeToDocument('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('tbos.theme')).toBe('dark');
  });

  it('stamps data-theme="light" explicitly rather than leaving it unset', () => {
    applyThemeToDocument('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('"system" removes the attribute so the prefers-color-scheme media query governs', () => {
    applyThemeToDocument('dark');
    applyThemeToDocument('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem('tbos.theme')).toBeNull();
  });
});
