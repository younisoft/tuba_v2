import { cn } from '@/lib/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Hides the visible label but keeps it for screen readers — use when the label
   * is rendered elsewhere (e.g. a table row's leading cell). */
  labelHidden?: boolean;
  disabled?: boolean;
}

/** Real `role="switch"` + `aria-checked`, never a styled `<div>` with a click
 * handler — tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md §3. */
export function Switch({ checked, onChange, label, labelHidden, disabled }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-fast ease-standard',
          'disabled:opacity-disabled disabled:pointer-events-none',
          checked ? 'bg-bg-brand' : 'bg-bg-sunken',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-bg-surface shadow-1 transition-transform duration-fast ease-standard',
            checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5',
          )}
        />
      </button>
      <span className={cn('text-body', labelHidden && 'sr-only')}>{label}</span>
    </label>
  );
}
