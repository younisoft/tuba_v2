import { describe, expect, it, beforeEach } from 'vitest';
import { applyLocaleToDocument } from '@/state/locale.store';
import { DICTIONARIES } from '@/lib/i18n/dictionaries';

describe('RTL / locale foundation', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  it('sets dir="rtl" and lang="ar" for Arabic', () => {
    applyLocaleToDocument('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
  });

  it('sets dir="ltr" and lang="en" for English', () => {
    applyLocaleToDocument('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('every English dictionary key has an Arabic counterpart — no leaked-token risk', () => {
    const enKeys = Object.keys(DICTIONARIES.en);
    const arKeys = new Set(Object.keys(DICTIONARIES.ar));
    const missing = enKeys.filter((key) => !arKeys.has(key));
    expect(missing).toEqual([]);
  });
});
