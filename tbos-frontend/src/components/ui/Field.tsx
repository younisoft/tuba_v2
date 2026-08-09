import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface FieldProps {
  label: string;
  /** Label is visually and programmatically present by default — placeholder-as-label
   * is a defect per design-system/12_COMPONENT_GUIDELINES.md §3. Set this only for a
   * control whose purpose is already stated by adjacent context (rare). */
  labelHidden?: boolean;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children: (fieldProps: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
}

/**
 * TBOS-CMP-FORM-001 — the one Form Field anatomy every input variant renders
 * inside: label → control → helper/error text (design-system/12_COMPONENT_GUIDELINES.md
 * §3). Takes a render-prop child so it never wraps the control in an extra DOM
 * layer that would break a native input's styling contract.
 */
export function Field({ label, labelHidden, hint, error, required, disabled, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', disabled && 'opacity-disabled')}>
      <label htmlFor={id} className={cn('text-label text-text-primary', labelHidden && 'sr-only')}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-text-danger">
            {' '}
            *
          </span>
        )}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': !!error })}
      {error && (
        <p id={errorId} className="text-caption text-text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-caption text-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
}
