import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  /** Persisted per-user preference, per tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §1
   * ("Rail is collapsible to icon-only... persisted. Never auto-collapses"). */
  railCollapsed: boolean;
  toggleRail: () => void;
  setRailCollapsed: (collapsed: boolean) => void;

  commandPaletteOpen: boolean;
  commandPaletteMode: 'search' | 'command';
  openCommandPalette: (mode?: 'search' | 'command') => void;
  closeCommandPalette: () => void;

  quickActionsOpen: boolean;
  setQuickActionsOpen: (open: boolean) => void;

  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;

  /** The element that had focus before an overlay opened — restored on close,
   * per tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md §2. */
  lastFocusedElement: HTMLElement | null;
  setLastFocusedElement: (el: HTMLElement | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      railCollapsed: false,
      toggleRail: () => set({ railCollapsed: !get().railCollapsed }),
      setRailCollapsed: (collapsed) => set({ railCollapsed: collapsed }),

      commandPaletteOpen: false,
      commandPaletteMode: 'search',
      openCommandPalette: (mode = 'search') =>
        set({ commandPaletteOpen: true, commandPaletteMode: mode, lastFocusedElement: document.activeElement as HTMLElement }),
      closeCommandPalette: () => {
        set({ commandPaletteOpen: false });
        get().lastFocusedElement?.focus?.();
      },

      quickActionsOpen: false,
      setQuickActionsOpen: (open) =>
        set({ quickActionsOpen: open, lastFocusedElement: open ? (document.activeElement as HTMLElement) : get().lastFocusedElement }),

      notificationPanelOpen: false,
      setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),

      lastFocusedElement: null,
      setLastFocusedElement: (el) => set({ lastFocusedElement: el }),
    }),
    { name: 'tbos.ui.preferences', partialize: (state) => ({ railCollapsed: state.railCollapsed }) },
  ),
);
