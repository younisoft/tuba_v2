import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

/** TBOS-CMP-FORM-003 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, disabled, rows = 4, ...rest }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    disabled={disabled}
    className={cn(
      'w-full resize-y rounded-sm border bg-bg-surface px-3 py-2 text-body text-text-primary placeholder:text-text-muted',
      'focus-visible:outline-none focus-visible:border-border-focus',
      error ? 'border-border-danger' : 'border-border',
      disabled && 'cursor-not-allowed opacity-disabled',
      className,
    )}
    {...rest}
  />
));
Textarea.displayName = 'Textarea';
