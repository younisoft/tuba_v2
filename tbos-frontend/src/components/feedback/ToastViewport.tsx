import { useEffect } from 'react';
import { useToastStore } from '@/state/toast.store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

const TONE_CLASSES = {
  success: 'bg-bg-success-subtle text-text-success',
  info: 'bg-bg-info-subtle text-text-info',
  danger: 'bg-bg-danger-subtle text-text-danger',
} as const;

function ToastRow({ id, tone, message }: { id: string; tone: keyof typeof TONE_CLASSES; message: string }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <div className={cn('flex items-center gap-2 rounded-md px-4 py-2.5 shadow-3 text-body', TONE_CLASSES[tone])}>
      <Icon name={tone === 'danger' ? 'alert-triangle' : 'check'} className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Fixed viewport, `aria-live="polite"` region — inline success confirmations
 * (form submits, toggle saves, Quick Action completion) announce here without
 * stealing focus, per tbos-blueprint/11_ACCESSIBILITY_BLUEPRINT.md §3. */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed end-4 bottom-4 z-toast flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastRow {...toast} />
        </div>
      ))}
    </div>
  );
}
