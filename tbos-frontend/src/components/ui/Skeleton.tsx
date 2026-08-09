import { cn } from '@/lib/cn';

/** Shape-matched loading placeholder — design-system/12_COMPONENT_GUIDELINES.md §4.
 * Never shown for <~300ms in practice (callers debounce), and respects
 * prefers-reduced-motion via the `.skeleton-pulse` utility (styles/globals.css). */
export function Skeleton({ className }: { className?: string }) {
  return <div role="presentation" className={cn('skeleton-pulse rounded-md bg-bg-sunken', className)} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}
