import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  error?: boolean;
  placeholder?: string;
}

/**
 * TBOS-CMP-FORM-004 — a native `<select>`, deliberately not a custom listbox.
 * Native selects get correct keyboard/screen-reader/mobile behavior for free
 * across every platform; a custom implementation would have to re-earn all of
 * that for no functional gain at this component's complexity level.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, disabled, options, placeholder, ...rest }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      disabled={disabled}
      className={cn(
        'min-h-touch-target w-full appearance-none rounded-sm border bg-bg-surface ps-3 pe-9 text-body text-text-primary',
        'focus-visible:outline-none focus-visible:border-border-focus',
        error ? 'border-border-danger' : 'border-border',
        disabled && 'cursor-not-allowed opacity-disabled',
        className,
      )}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <Icon name="chevron-down" className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
  </div>
));
Select.displayName = 'Select';
