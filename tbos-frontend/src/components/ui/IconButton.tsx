import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Icon, type IconName } from './Icon';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required — an icon-only control is never legible to a screen reader without one
   * (tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md §6). */
  label: string;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({ icon, label, active, className, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex min-h-touch-target min-w-touch-target items-center justify-center rounded-md text-icon',
      'hover:bg-bg-sunken transition-colors duration-fast ease-standard',
      active && 'bg-bg-brand-subtle text-text-brand',
      className,
    )}
    {...rest}
  >
    <Icon name={icon} className="h-5 w-5" />
  </button>
));
IconButton.displayName = 'IconButton';
