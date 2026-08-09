import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/state/ui.store';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Icon, type IconName } from '@/components/ui/Icon';

interface QuickAction {
  labelKey: 'quickActions.addLead' | 'quickActions.addProperty' | 'quickActions.logFollowUp' | 'quickActions.submitCompliance';
  icon: IconName;
  path: string;
  allowed: boolean;
}

/**
 * QA-01 — exactly the top-4 JTBD-ranked actions (tbos-definition/08_NAVIGATION_SYSTEM.md),
 * 2-tap capture. A persona missing a permission sees 3 actions, never a disabled
 * 4th (tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §7). Foundation phase: each
 * action navigates to its target screen's placeholder rather than opening a real
 * capture form — the capture flow itself is business-feature work.
 */
export function QuickActionsPanel() {
  const open = useUiStore((s) => s.quickActionsOpen);
  const setOpen = useUiStore((s) => s.setQuickActionsOpen);
  const { can } = useHasPermission();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  useFocusTrap(containerRef, open, close);

  if (!open) return null;

  const allActions: QuickAction[] = [
    { labelKey: 'quickActions.addLead', icon: 'target', path: '/leads', allowed: can('leads.view') },
    { labelKey: 'quickActions.addProperty', icon: 'building', path: '/properties/new', allowed: can('properties.create') },
    { labelKey: 'quickActions.logFollowUp', icon: 'check-square', path: '/tasks', allowed: can('tasks.create') },
    {
      labelKey: 'quickActions.submitCompliance',
      icon: 'shield',
      path: '/settings/compliance',
      allowed: can('settings.compliance.manage') || can('settings.compliance.manage.own'),
    },
  ];
  const actions = allActions.filter((a) => a.allowed);

  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center bg-bg-overlay-scrim tablet:items-center" onMouseDown={close}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('quickActions.title')}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-xl border border-border bg-bg-surface p-4 shadow-4 tablet:rounded-xl"
      >
        <h2 className="mb-3 text-h3 text-text-primary">{t('quickActions.title')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <button
              key={action.labelKey}
              type="button"
              onClick={() => {
                navigate(action.path);
                close();
              }}
              className="flex min-h-touch-target flex-col items-center justify-center gap-2 rounded-lg border border-border p-4 text-center hover:bg-bg-sunken"
            >
              <Icon name={action.icon} className="h-6 w-6 text-text-brand" />
              <span className="text-label text-text-primary">{t(action.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
