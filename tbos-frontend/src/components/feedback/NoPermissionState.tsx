import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/useTranslation';

/**
 * Rendered by RouteGuard when the active role lacks the screen's permission —
 * plain-language, never a raw 403 (tbos-blueprint/06_STATE_ARCHITECTURE.md §1
 * "No Permission"). This is a UX affordance; the guard is not the security
 * boundary — see RBAC.md.
 */
export function NoPermissionState() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border px-6 py-16 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-warning-subtle text-text-warning">
        <Icon name="shield" className="h-5 w-5" />
      </span>
      <h1 className="text-h2 text-text-primary">{t('state.noPermission.title')}</h1>
      <p className="max-w-sm text-body text-text-secondary">{t('state.noPermission.body')}</p>
      <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>
        {t('state.noPermission.back')}
      </Button>
    </div>
  );
}
