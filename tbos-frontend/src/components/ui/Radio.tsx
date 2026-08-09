import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/** TBOS-CMP-FORM-006 — a real `<input type="radio">` under custom paint. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ className, label, disabled, id, ...rest }, ref) => {
  const generatedId = id ?? `radio-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label htmlFor={generatedId} className={cn('inline-flex min-h-touch-target cursor-pointer items-center gap-2', disabled && 'cursor-not-allowed opacity-disabled', className)}>
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={generatedId}
          type="radio"
          disabled={disabled}
          className="peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none rounded-full border border-border-strong bg-bg-surface checked:border-border-brand disabled:cursor-not-allowed"
          {...rest}
        />
        <span className="pointer-events-none hidden h-2 w-2 rounded-full bg-bg-brand peer-checked:block" />
      </span>
      <span className="text-body text-text-primary">{label}</span>
    </label>
  );
});
Radio.displayName = 'Radio';
