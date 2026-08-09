import { useRef, useState, type ReactNode } from 'react';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { cn } from '@/lib/cn';

export interface PopoverProps {
  /** Render-prop so the trigger can reflect open state (e.g. an active/pressed style). */
  trigger: (args: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  label: string;
  align?: 'start' | 'end';
  width?: 'sm' | 'md';
}

const WIDTH_CLASSES = { sm: 'w-64', md: 'w-80' } as const;

/**
 * TBOS-CMP-OVERLAY-002 — the generic click-triggered floating panel
 * (`elevation.2`, `zIndex.popover`, `radius.md` per design-system/09_ELEVATION_SYSTEM.md
 * §1/§6). Interactive content lives here, not Tooltip. Focus-trapped, closes
 * on Escape and returns focus to the trigger (lib/a11y/useFocusTrap.ts) — the
 * same mechanism every Foundation overlay already uses.
 */
export function Popover({ trigger, children, label, align = 'start', width = 'sm' }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(containerRef, open, close);

  return (
    <span className="relative inline-block">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          ref={containerRef}
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute top-full z-popover mt-2 rounded-md border border-border bg-bg-surface p-3 shadow-2',
            align === 'start' ? 'start-0' : 'end-0',
            WIDTH_CLASSES[width],
          )}
        >
          {children}
        </div>
      )}
    </span>
  );
}
