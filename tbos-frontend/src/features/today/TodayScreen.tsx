import { useNavigate } from 'react-router-dom';
import { useToday } from '@/lib/today/useToday';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { RecommendationCard } from '@/components/tbos/ai/RecommendationCard';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TodayRecommendationCategory } from '@/types/today';
import { PRIORITY_KEY } from '@/features/leads/leadFormat';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

const CATEGORY_KEY: Record<TodayRecommendationCategory, TranslationKey> = {
  lead_triage: 'today.category.lead_triage',
  response_priority: 'today.category.response_priority',
  compliance: 'today.category.compliance',
  opportunity: 'today.category.opportunity',
  relationship: 'today.category.relationship',
  content_quality: 'today.category.content_quality',
};

/**
 * TODAY-01 — the broker's operational command center (tbos-blueprint/
 * 04_SCREEN_INVENTORY.md: "prioritized, cross-module, continuously-refreshed
 * worklist — the primary rendering surface of the Decision Support System").
 * Deliberately not a KPI dashboard (master prompt §9): every block here is a
 * Recommendation Card that leads to an action, never a bare number.
 */
export function TodayScreen() {
  const { recommendations, isLoading, error, dismiss } = useToday();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('today.title')} subtitle={t('today.subtitle')} />

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        )}

        {!isLoading && error && <ErrorState error={error} />}

        {!isLoading && !error && recommendations.length === 0 && (
          <EmptyState tone="positive" title={t('notifications.empty')} body={t('today.empty.body')} />
        )}

        {!isLoading &&
          !error &&
          recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              priorityLabel={t(PRIORITY_KEY[rec.priority])}
              categoryLabel={t(CATEGORY_KEY[rec.category])}
              onOpen={() => navigate(rec.linkTo)}
              onDismiss={() => dismiss(rec.id)}
              dismissLabel={t('today.dismiss')}
              explainTriggerLabel={t('today.explainTrigger')}
              whatChangedText={t('today.whatChanged')}
            />
          ))}
      </div>
    </div>
  );
}
