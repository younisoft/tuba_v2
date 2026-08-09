import { useEffect, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab/Shift+Tab inside `containerRef` while `active` and calls `onEscape`
 * on Escape — the shared mechanism behind every modal/slide-over/Quick Actions
 * panel per tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md §2. Focus restoration to
 * the triggering element is the caller's responsibility (state/ui.store.ts
 * already records `lastFocusedElement` when an overlay opens).
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active: boolean, onEscape: () => void) {
  // Separate effect, keyed only on `active` — moving initial focus must happen
  // exactly once per open, never again on every re-render. `onEscape` is an
  // inline callback at nearly every call site (Drawer/Dialog consumers), so a
  // *combined* effect keyed on it would re-run on every keystroke a
  // controlled field inside the trap causes upstream, re-stealing focus back
  // to the first focusable element (often a Close button) — a real, live bug
  // where a later Space/Enter keystroke lands on that button and closes the
  // panel, discarding whatever the user was typing.
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    focusables[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- containerRef is a stable ref object
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const focusables = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [active, containerRef, onEscape]);
}
