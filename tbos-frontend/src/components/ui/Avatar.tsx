import { cn } from '@/lib/cn';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-micro',
  md: 'h-8 w-8 text-label',
  lg: 'h-10 w-10 text-body',
  xl: 'h-16 w-16 text-h3',
};

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
  className?: string;
}

/** TBOS-CMP-DISPLAY-001 — initials-based by default (no photo pipeline exists
 * in this foundation); swaps to `imageUrl` when a real one is available. Never
 * mirrors in RTL (a face/initial has no directionality) — sizing.avatar tokens. */
export function Avatar({ name, imageUrl, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={cn('rounded-full object-cover', SIZE_CLASSES[size], className)} />;
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn('inline-flex items-center justify-center rounded-full bg-bg-brand-subtle font-semibold text-text-brand', SIZE_CLASSES[size], className)}
    >
      {initials}
    </span>
  );
}
