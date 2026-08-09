import { useRef, type ReactNode } from 'react';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { IconButton } from './IconButton';
import { Button } from './Button';
import { cn } from '@/lib/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Every panel has an "open full record" escape hatch — design-system/
   * 12_COMPONENT_GUIDELINES.md §1 Slide-over Panel rule. Omit only for a
   * panel that has no canonical full-screen equivalent to escape to. */
  onOpenFullRecord?: () => void;
}

const SIZE_CLASSES = { sm: 'tablet:max-w-panel-sm', md: 'tablet:max-w-panel-md', lg: 'tablet:max-w-panel-lg' } as const;

/**
 * TBOS-CMP-OVERLAY-004 — the Slide-over Panel primitive
 * (tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §5, design-system/12_COMPONENT_GUIDELINES.md §1).
 * Enters from the inline-end edge on desktop/tablet (mirrors correctly in RTL
 * by construction, since `end-0` is a logical property); full-screen push on
 * mobile, per the same source's mobile behavior note.
 */
export function Drawer({ open, onClose, title, children, footer, size = 'md', onOpenFullRecord }: DrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-panel flex justify-end bg-bg-overlay-scrim" onMouseDown={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn('flex h-full w-full flex-col border-s border-border bg-bg-surface shadow-3', SIZE_CLASSES[size])}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="drawer-title" className="text-h3 text-text-primary">
            {title}
          </h2>
          <IconButton icon="x" label="Close" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {(footer || onOpenFullRecord) && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            {onOpenFullRecord ? (
              <Button variant="ghost" size="sm" onClick={onOpenFullRecord}>
                Open full record
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
