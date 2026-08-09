import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './Icon';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  labelHidden?: boolean;
}

/** TBOS-CMP-FORM-005 — a real `<input type="checkbox">` under custom paint,
 * never a styled `<div>` (design-system/12_COMPONENT_GUIDELINES.md's binding
 * rule against ARIA-as-a-replacement-for-semantic-HTML). */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, label, labelHidden, disabled, id, ...rest }, ref) => {
  const generatedId = id ?? `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label htmlFor={generatedId} className={cn('inline-flex min-h-touch-target cursor-pointer items-center gap-2', disabled && 'cursor-not-allowed opacity-disabled', className)}>
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input ref={ref} id={generatedId} type="checkbox" disabled={disabled} className="peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none rounded-xs border border-border-strong bg-bg-surface checked:border-border-brand checked:bg-bg-brand disabled:cursor-not-allowed" {...rest} />
        <Icon name="check" className="pointer-events-none hidden h-3 w-3 text-icon-on-brand peer-checked:block" />
      </span>
      <span className={cn('text-body text-text-primary', labelHidden && 'sr-only')}>{label}</span>
    </label>
  );
});
Checkbox.displayName = 'Checkbox';
