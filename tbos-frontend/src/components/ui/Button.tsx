import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-action-primary-bg text-text-on-brand hover:bg-action-primary-bg-hover active:bg-action-primary-bg-active',
  secondary: 'bg-action-secondary-bg text-text-primary border border-action-secondary-border hover:bg-action-secondary-bg-hover',
  danger: 'bg-action-danger-bg text-text-on-brand hover:bg-action-danger-bg-hover',
  ghost: 'bg-transparent text-text-primary hover:bg-bg-sunken',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-body gap-1.5',
  md: 'min-h-touch-target px-4 text-body gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-fast ease-standard',
        'disabled:opacity-disabled disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    />
  ),
);
Button.displayName = 'Button';
