import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { Icon, type IconName } from './Icon';
import { cn } from '@/lib/cn';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  danger?: boolean;
  onSelect: () => void;
}

export interface DropdownProps {
  trigger: (args: { open: boolean; toggle: () => void }) => ReactNode;
  items: DropdownItem[];
  label: string;
  align?: 'start' | 'end';
}

/**
 * TBOS-CMP-ACTION-001 — the generic action menu. Real `role="menu"`/`"menuitem"`
 * with arrow-key navigation, never a styled list with click handlers only.
 * `UserMenu` (layouts/AppShell) predates this primitive and isn't retrofitted
 * onto it in this pass (no defect to fix — see TBOS_COMPONENT_LIBRARY_REPORT.md).
 */
export function Dropdown({ trigger, items, label, align = 'end' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(containerRef, open, close);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    const currentIndex = buttons.findIndex((b) => b === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      buttons[(currentIndex + 1) % buttons.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      buttons[(currentIndex - 1 + buttons.length) % buttons.length]?.focus();
    }
  }

  return (
    <span className="relative inline-block">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          ref={containerRef}
          role="menu"
          aria-label={label}
          onKeyDown={handleKeyDown}
          className={cn('absolute top-full z-popover mt-2 w-56 rounded-md border border-border bg-bg-surface p-1.5 shadow-2', align === 'start' ? 'start-0' : 'end-0')}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect();
                close();
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-body hover:bg-bg-sunken',
                item.danger ? 'text-text-danger' : 'text-text-primary',
              )}
            >
              {item.icon && <Icon name={item.icon} className="h-4 w-4" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
