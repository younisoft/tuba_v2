import { create } from 'zustand';

export interface ToastItem {
  id: string;
  tone: 'success' | 'info' | 'danger';
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

/** Backs the Inline Success Confirmation component (design-system/17_COMPONENT_CATALOG.md
 * "Feedback & state"). Auto-dismisses after 4s unless the user is hovering/focused —
 * handled by ToastViewport, not the store, so the store stays a plain data list. */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (toast) => set((s) => ({ toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
