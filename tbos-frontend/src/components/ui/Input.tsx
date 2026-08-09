import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  /** Distinct from `disabled` — a permanently non-editable value (RBAC/lifecycle
   * restricted) renders as plain text on a subtle surface, never grayed-out
   * disabled chrome that implies a temporary state. design-system/12_COMPONENT_GUIDELINES.md §3. */
  readOnly?: boolean;
}

/** TBOS-CMP-FORM-002 — meant to be used inside <Field>, but usable standalone
 * (e.g. an inline table-cell edit) since it doesn't assume a Field wrapper exists. */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, readOnly, disabled, ...rest }, ref) => (
  <input
    ref={ref}
    readOnly={readOnly}
    disabled={disabled}
    className={cn(
      'min-h-touch-target w-full rounded-sm border bg-bg-surface px-3 text-body text-text-primary placeholder:text-text-muted',
      'focus-visible:outline-none focus-visible:border-border-focus',
      error ? 'border-border-danger' : 'border-border',
      disabled && 'cursor-not-allowed opacity-disabled',
      readOnly && 'cursor-default border-transparent bg-bg-sunken',
      className,
    )}
    {...rest}
  />
));
Input.displayName = 'Input';
