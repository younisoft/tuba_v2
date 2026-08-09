import { useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { IconButton } from './IconButton';
import { cn } from '@/lib/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** `alertdialog` for a destructive/consequential confirmation — design-system/
   * 12_COMPONENT_GUIDELINES.md §4 Confirmation Dialog. */
  variant?: 'standard' | 'alertdialog';
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' } as const;

/**
 * TBOS-CMP-OVERLAY-003 — the generic modal: `elevation.4`, `radius.xl`,
 * `zIndex.modal` (design-system/09_ELEVATION_SYSTEM.md §1/§6). Every consumer
 * (ConfirmationDialog, future entity-creation modals) composes this rather
 * than reimplementing scrim/focus-trap/escape handling.
 */
export function Dialog({ open, onClose, title, children, footer, variant = 'standard', size = 'md' }: DialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-bg-overlay-scrim p-4" onMouseDown={onClose}>
      <div
        ref={containerRef}
        role={variant === 'alertdialog' ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn('w-full rounded-xl border border-border bg-bg-surface shadow-4', SIZE_CLASSES[size])}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="dialog-title" className="text-h3 text-text-primary">
            {title}
          </h2>
          <IconButton icon="x" label="Close" onClick={onClose} />
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
