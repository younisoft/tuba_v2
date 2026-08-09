import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCampaign } from '@/lib/marketing/useCampaign';
import { useMarketingLookups } from '@/lib/marketing/useMarketingLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { scopeFor } from '@/lib/permissions/evaluate';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { ConfirmationDialog } from '@/components/patterns/feedback/ConfirmationDialog';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { MetricWithExplanation } from '@/components/tbos/data/MetricWithExplanation';
import { QuotaBalanceMeter } from '@/components/tbos/data/QuotaBalanceMeter';
import { AISuggestion } from '@/components/tbos/ai/AISuggestion';
import { AIActionBar } from '@/components/tbos/ai/AIActionBar';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatPriceSar } from '@/features/properties/propertyFormat';
import {
  CAMPAIGN_STATUS_KEY,
  CAMPAIGN_STATUS_MEANING,
  formatInventoryCount,
  formatQuotaUnits,
  formatShortfall,
  launchConsequenceMessage,
} from '@/features/marketing/marketingFormat';
import type { CampaignLaunchBlockedReason } from '@/mocks/api/db';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

const COPY_VARIATIONS = [
  'Discover exceptional homes with standout value — priced to move and ready for viewing this week.',
  'A rare opportunity to secure a well-located property before it comes off the market.',
  'Handpicked listings, competitively priced, in some of the most sought-after districts.',
];

const BLOCKED_REASON_KEY: Record<CampaignLaunchBlockedReason, TranslationKey> = {
  no_inventory_selected: 'marketingDetail.blocked.noInventory',
  inventory_no_longer_eligible: 'marketingDetail.blocked.noLongerEligible',
  insufficient_balance: 'marketingDetail.blocked.insufficientBalance',
};

/**
 * MKT-02 — Campaign Create/Detail (tbos-blueprint/04_SCREEN_INVENTORY.md:
 * "single flow for creating and later managing a campaign — eligibility
 * checked before inventory-selection UI even renders"). The registered route
 * (`/marketing/new`, no dynamic segment) is implemented literally: an
 * optional `?campaignId=` query param distinguishes create (absent) from
 * manage (present) on the same screen — TBOS_MARKETING_UX_AUDIT.md's
 * resolution of the single-flow architecture.
 */
export function CampaignDetailScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId') ?? undefined;
  const navigate = useNavigate();

  const { campaign, isLoading, error, activities, eligibleProperties, eligiblePropertiesLoading, createCampaign, selectInventory, launch, lastLaunchResult, pause, end } =
    useCampaign(campaignId);
  const { properties, wallet } = useMarketingLookups();
  const { user } = useAuth();
  const { t, locale } = useTranslation();

  const [newName, setNewName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copyIndex, setCopyIndex] = useState(0);
  const [copyAccepted, setCopyAccepted] = useState(false);
  const [launchConfirmOpen, setLaunchConfirmOpen] = useState(false);

  // ---- Create mode: no campaignId yet ----
  if (!campaignId) {
    return (
      <div className="mx-auto max-w-content">
        <h1 className="text-h1 text-text-primary">{t('marketingDetail.create.title')}</h1>
        <p className="mt-1 text-body-lg text-text-secondary">{t('marketingDetail.create.subtitle')}</p>
        <div className="mt-6 max-w-sm">
          <Field label={t('marketingDetail.create.nameLabel')}>{(field) => <Input {...field} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t('marketingDetail.create.namePlaceholder')} />}</Field>
          <PermissionGate permission="marketing.manage" mode="disable">
            <Button
              className="mt-4"
              size="sm"
              onClick={async () => {
                if (!newName.trim()) return;
                const created = await createCampaign(newName.trim());
                setSearchParams({ campaignId: created.id }, { replace: true });
              }}
            >
              {t('marketing.action.create')}
            </Button>
          </PermissionGate>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} />;
  if (!campaign) return <ErrorState error={{ code: 'not_found', message: 'This campaign could not be found.' }} />;

  // Record-level scope check — same pattern as every other Detail screen
  // since the Phase 8 P0 cross-agency finding: the agency check is a hard
  // boundary independent of the own-vs-agency scope tier.
  const sameAgency = campaign.agencyId === user?.agencyId;
  const ownScopeOnly = scopeFor(user?.activeRole ?? null, 'marketing.view') === 'own';
  const canViewThisCampaign = sameAgency && (!ownScopeOnly || campaign.createdByUserId === user?.id);
  if (!canViewThisCampaign) return <NoPermissionState />;

  const inventory = campaign.linkedPropertyIds.map((id) => properties.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);
  const remainingQuota = wallet ? wallet.quotaTotal - wallet.quotaUsed : 0;

  const currentSelection = selectedIds.length > 0 ? selectedIds : campaign.linkedPropertyIds;

  const doLaunch = async () => {
    if (campaign.status === 'draft') await selectInventory(currentSelection);
    await launch();
  };

  return (
    <div className="mx-auto max-w-content">
      <EntityDetailHeader
        title={campaign.name}
        status={<Badge tone={CAMPAIGN_STATUS_MEANING[campaign.status]}>{t(CAMPAIGN_STATUS_KEY[campaign.status])}</Badge>}
        meta={[
          { icon: 'building', label: formatInventoryCount(campaign.linkedPropertyIds.length, locale) },
          { icon: 'wallet', label: formatQuotaUnits(campaign.quotaCost, locale) },
        ]}
        primaryAction={
          campaign.status === 'draft' && eligibleProperties.length > 0 && currentSelection.length === 0 ? (
            <Tooltip content={t('marketingDetail.blocked.noInventory')}>
              <Button size="sm" disabled aria-disabled>
                {t('marketingDetail.action.launch')}
              </Button>
            </Tooltip>
          ) : campaign.status === 'draft' || campaign.status === 'paused' ? (
            <PermissionGate permission="marketing.manage" mode="disable">
              <Button size="sm" onClick={() => setLaunchConfirmOpen(true)}>
                {campaign.status === 'paused' ? t('marketingDetail.action.resume') : t('marketingDetail.action.launch')}
              </Button>
            </PermissionGate>
          ) : campaign.status === 'running' ? (
            <PermissionGate permission="marketing.manage" mode="disable">
              <Button size="sm" variant="secondary" onClick={() => pause()}>
                {t('marketingDetail.action.pause')}
              </Button>
            </PermissionGate>
          ) : undefined
        }
        secondaryActions={
          (campaign.status === 'running' || campaign.status === 'paused') && (
            <PermissionGate permission="marketing.manage" mode="disable">
              <Button size="sm" variant="danger" onClick={() => end()}>
                {t('marketingDetail.action.end')}
              </Button>
            </PermissionGate>
          )
        }
      />

      {lastLaunchResult?.blockedReason && (
        <div className="mt-4">
          <Alert tone="warning">
            {t(BLOCKED_REASON_KEY[lastLaunchResult.blockedReason])}
            {lastLaunchResult.blockedReason === 'insufficient_balance' && lastLaunchResult.shortfall ? ` (${formatShortfall(lastLaunchResult.shortfall, locale)})` : ''}
          </Alert>
        </div>
      )}

      {campaign.status === 'ended' && (
        <div className="mt-4">
          <Alert tone="success">{t('marketingDetail.lifecycle.ended')}</Alert>
        </div>
      )}
      {campaign.status === 'paused' && !lastLaunchResult?.blockedReason && (
        <div className="mt-4">
          <Alert tone="warning">{t('marketingDetail.lifecycle.paused')}</Alert>
        </div>
      )}
      {campaign.status === 'running' && (
        <div className="mt-4">
          <Alert tone="success">{t('marketingDetail.lifecycle.running')}</Alert>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <MetricWithExplanation
          label={t('marketing.table.spend')}
          value={formatPriceSar(campaign.spendSar, locale)}
          contract={{
            why: 'What this campaign has spent from the agency Wallet so far.',
            howCalculated: 'A fixed demo cost per launch — the real spend/quota formula is an unresolved pricing decision (tbos-blueprint/18_OPEN_QUESTIONS.md).',
            whatChanged: 'Increases only when the campaign is launched or resumed.',
            recommendedAction: 'Compare against remaining Wallet quota before launching another campaign.',
            businessImpact: 'Draws down the agency’s promotional budget for the billing cycle.',
          }}
        />
        {wallet && <QuotaBalanceMeter label={t('marketingDetail.quotaLabel')} used={wallet.quotaUsed} total={wallet.quotaTotal} />}
      </div>

      {campaign.status === 'draft' && (
        <div className="mt-6">
          <h2 className="mb-3 text-h3 text-text-primary">{t('marketingDetail.section.inventory')}</h2>
          {eligiblePropertiesLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : eligibleProperties.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <img src="/brand-patterns/modern-home.svg" alt="" aria-hidden="true" className="h-16 w-16 opacity-30 dark:opacity-20 dark:invert" />
              <EmptyState
                title={t('marketingDetail.zeroEligible.title')}
                body={t('marketingDetail.zeroEligible.body')}
                secondaryAction={{ label: t('marketingDetail.zeroEligible.action'), onClick: () => navigate('/properties') }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded-md border border-border p-3">
              {eligibleProperties.map((p) => (
                <Checkbox
                  key={p.id}
                  label={`${p.title} — ${formatPriceSar(p.priceSar, locale)}`}
                  checked={currentSelection.includes(p.id)}
                  onChange={(e) => {
                    setSelectedIds(e.target.checked ? [...currentSelection, p.id] : currentSelection.filter((id) => id !== p.id));
                  }}
                />
              ))}
            </div>
          )}

          {eligibleProperties.length > 0 && (
            <div className="mt-4">
              {!copyAccepted ? (
                <AISuggestion
                  confidence="medium"
                  actions={
                    <AIActionBar
                      acceptLabel={t('marketingDetail.ai.accept')}
                      onAccept={() => setCopyAccepted(true)}
                      onRegenerate={() => setCopyIndex((i) => (i + 1) % COPY_VARIATIONS.length)}
                      onDiscard={() => setCopyAccepted(true)}
                    />
                  }
                >
                  {COPY_VARIATIONS[copyIndex]}
                </AISuggestion>
              ) : (
                <p className="rounded-md border border-border bg-bg-sunken p-3 text-body text-text-secondary">{COPY_VARIATIONS[copyIndex]}</p>
              )}
            </div>
          )}
        </div>
      )}

      {inventory.length > 0 && campaign.status !== 'draft' && (
        <div className="mt-6">
          <h2 className="mb-3 text-h3 text-text-primary">{t('marketingDetail.section.inventory')}</h2>
          <ul className="flex flex-col gap-2">
            {inventory.map((p) => (
              <li key={p.id} className="rounded-md border border-border p-3 text-body text-text-primary">
                {p.title} — {formatPriceSar(p.priceSar, locale)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-text-primary">{t('marketingDetail.section.activity')}</h2>
        <ActivityTimeline
          items={activities.map((a) => ({
            id: a.id,
            actorKind: a.actorKind,
            actorName: a.actorName,
            action: a.detail,
            timestamp: new Date(a.timestamp).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US'),
          }))}
        />
      </div>

      <ConfirmationDialog
        open={launchConfirmOpen}
        onClose={() => setLaunchConfirmOpen(false)}
        onConfirm={doLaunch}
        title={campaign.status === 'paused' ? t('marketingDetail.action.resume') : t('marketingDetail.action.launch')}
        consequence={launchConsequenceMessage(currentSelection.length, campaign.quotaCost, remainingQuota, locale)}
        confirmLabel={campaign.status === 'paused' ? t('marketingDetail.action.resume') : t('marketingDetail.action.launch')}
      />
    </div>
  );
}
