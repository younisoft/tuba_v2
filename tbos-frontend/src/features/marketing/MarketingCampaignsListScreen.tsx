import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '@/lib/marketing/useCampaigns';
import { useMarketingLookups } from '@/lib/marketing/useMarketingLookups';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatActiveFiltersLabel } from '@/lib/i18n/formatCount';
import { formatPriceSar, formatDate } from '@/features/properties/propertyFormat';
import { CAMPAIGN_STATUS_KEY, CAMPAIGN_STATUS_MEANING } from '@/features/marketing/marketingFormat';
import type { Campaign, CampaignStatus } from '@/types/entities';

const STATUS_OPTIONS: CampaignStatus[] = ['draft', 'running', 'paused', 'ended'];

/**
 * MKT-01 — Campaigns List (tbos-blueprint/04_SCREEN_INVENTORY.md: "outbound
 * campaign/promotion management — distinct from inbound Marketing Requests
 * (OWN-03)"). Same DataTable grammar as PROP-01/CONT-01 — status is the
 * prioritized second column (the mobile-priority lesson from Phase 6/7/8:
 * status must survive mobile column collapse, never buried behind horizontal
 * scroll).
 */
export function MarketingCampaignsListScreen() {
  const { campaigns, isLoading, error } = useCampaigns();
  const { properties } = useMarketingLookups();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');

  const inventorySummary = (c: Campaign) => {
    if (c.linkedPropertyIds.length === 0) return t('marketing.list.noInventory');
    const first = properties.find((p) => p.id === c.linkedPropertyIds[0]);
    const firstTitle = first?.title ?? c.linkedPropertyIds[0];
    return c.linkedPropertyIds.length === 1 ? firstTitle : `${firstTitle} +${c.linkedPropertyIds.length - 1}`;
  };

  const activeFilters = statusFilter ? [{ id: 'status', label: `${t('marketing.filter.status')}: ${t(CAMPAIGN_STATUS_KEY[statusFilter])}` }] : [];

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (!search.trim()) return true;
      return c.name.toLowerCase().includes(search.trim().toLowerCase());
    });
  }, [campaigns, search, statusFilter]);

  const keyDate = (c: Campaign) => {
    if (c.status === 'ended' && c.endedAt) return `${t('marketing.table.ended')} ${formatDate(c.endedAt, locale)}`;
    if ((c.status === 'running' || c.status === 'paused') && c.launchedAt) return `${t('marketing.table.launched')} ${formatDate(c.launchedAt, locale)}`;
    return '—';
  };

  const columns: DataTableColumn<Campaign>[] = [
    {
      id: 'campaign',
      header: t('marketing.table.campaign'),
      render: (c) => (
        <div className="flex items-center gap-2">
          <EntityAvatar kind="record" icon="megaphone" size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{c.name}</p>
            <p className="truncate text-caption text-text-secondary">{inventorySummary(c)}</p>
          </div>
        </div>
      ),
    },
    { id: 'status', header: t('marketing.table.status'), render: (c) => <Badge tone={CAMPAIGN_STATUS_MEANING[c.status]}>{t(CAMPAIGN_STATUS_KEY[c.status])}</Badge> },
    { id: 'spend', header: t('marketing.table.spend'), align: 'end', render: (c) => <span className="tabular-nums">{formatPriceSar(c.spendSar, locale)}</span> },
    { id: 'keyDate', header: t('marketing.table.keyDate'), render: (c) => <span className="text-text-secondary">{keyDate(c)}</span> },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader
        title={t('marketing.list.title')}
        subtitle={t('marketing.list.subtitle')}
        actions={
          <PermissionGate permission="marketing.manage" mode="disable">
            <Button size="sm" onClick={() => navigate('/marketing/new')}>
              {t('marketing.action.create')}
            </Button>
          </PermissionGate>
        }
      />

      <div className="mt-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('marketing.search.placeholder')}
          activeFilters={activeFilters}
          onRemoveFilter={() => setStatusFilter('')}
          onClearAll={() => setStatusFilter('')}
          activeFiltersLabel={(count) => formatActiveFiltersLabel(count, locale)}
          clearAllLabel={t('properties.filter.clearAll')}
          filterControls={
            <Select
              aria-label={t('marketing.filter.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
              options={[{ value: '', label: t('marketing.filter.status') }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: t(CAMPAIGN_STATUS_KEY[s]) }))]}
            />
          }
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <img src="/brand-patterns/modern-home.svg" alt="" aria-hidden="true" className="h-16 w-16 opacity-30 dark:opacity-20 dark:invert" />
            <EmptyState
              title={t('marketing.empty.title')}
              body={t('marketing.empty.body')}
              primaryAction={{ label: t('marketing.action.create'), onClick: () => navigate('/marketing/new') }}
            />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(c) => c.id}
            getRowLabel={(c) => `${t('marketing.rowLabelPrefix')} ${c.name}`}
            onRowClick={(c) => navigate(`/marketing/new?campaignId=${c.id}`)}
            emptyState={{ title: t('marketing.empty.title'), body: t('marketing.empty.body') }}
          />
        )}
      </div>
    </div>
  );
}
