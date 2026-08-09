import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentQualityQueue } from '@/lib/marketing/useContentQualityQueue';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { AISuggestion } from '@/components/tbos/ai/AISuggestion';
import { AIActionBar } from '@/components/tbos/ai/AIActionBar';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPriceSar } from '@/features/properties/propertyFormat';
import type { ContentQualityQueueEntry } from '@/mocks/api/db';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

const MISSING_ITEM_KEY: Record<'photos' | 'description' | 'price', TranslationKey> = {
  photos: 'marketingQuality.missing.photos',
  description: 'marketingQuality.missing.description',
  price: 'marketingQuality.missing.price',
};

/**
 * MKT-03 — Content Quality Queue (tbos-blueprint/04_SCREEN_INVENTORY.md:
 * "AI-assisted review queue keeping live inventory content-complete").
 * Reviews the same Property Quality AI rubric tbos-blueprint/
 * 08_AI_INTERACTION_BLUEPRINT.md names for the publish gate (photos present,
 * description length/quality, pricing present) — a transparent completeness
 * check, not a fabricated score (TBOS_MARKETING_UX_AUDIT.md P3-1). Worst-
 * first, per tbos-blueprint/03_USER_JOURNEYS.md Journey 4.
 */
export function ContentQualityQueueScreen() {
  const { queue, isLoading, error, updateDescription } = useContentQualityQueue();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDescription, setDraftDescription] = useState('');

  const startFix = (entry: ContentQualityQueueEntry) => {
    setEditingId(entry.property.id);
    setDraftDescription(entry.property.description ?? '');
  };

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader title={t('marketingQuality.title')} subtitle={t('marketingQuality.subtitle')} />

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : queue.length === 0 ? (
          <EmptyState tone="positive" title={t('marketingQuality.empty.title')} body={t('marketingQuality.empty.body')} />
        ) : (
          <div className="flex flex-col gap-3">
            {queue.map((entry) => (
              <div key={entry.property.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <button
                      type="button"
                      onClick={() => navigate(`/properties/${entry.property.id}`)}
                      className="rounded text-start font-semibold text-text-primary underline-offset-4 hover:underline"
                    >
                      {entry.property.title}
                    </button>
                    <p className="mt-0.5 text-caption text-text-secondary">{formatPriceSar(entry.property.priceSar, locale)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entry.quality.missingItems.map((item) => (
                      <Badge key={item} tone="warning">
                        {t(MISSING_ITEM_KEY[item])}
                      </Badge>
                    ))}
                  </div>
                </div>

                {editingId === entry.property.id ? (
                  <div className="mt-3">
                    <Field label={t('marketingQuality.editDescription.label')} labelHidden>
                      {(field) => <Textarea {...field} rows={3} value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)} />}
                    </Field>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          updateDescription({ propertyId: entry.property.id, description: draftDescription.trim() });
                          setEditingId(null);
                        }}
                      >
                        {t('marketingQuality.action.save')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        {t('marketingQuality.action.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  entry.quality.missingItems.includes('description') && (
                    <div className="mt-3">
                      <AISuggestion confidence="low" actions={<AIActionBar acceptLabel={t('marketingQuality.action.fixDescription')} onAccept={() => startFix(entry)} />}>
                        {t('marketingQuality.suggestion.description')}
                      </AISuggestion>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
