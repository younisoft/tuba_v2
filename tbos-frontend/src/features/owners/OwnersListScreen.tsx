import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwners } from '@/lib/owners/useOwners';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatActiveFiltersLabel } from '@/lib/i18n/formatCount';
import type { OwnerListItem } from '@/types/entities';

/**
 * OWN-01 — Owners List (tbos-blueprint/04_SCREEN_INVENTORY.md: "supply-side
 * counterpart to Customers — property owners and their relationship to the
 * agency"). Same DataTable grammar as CUST-01/PROP-01.
 */
export function OwnersListScreen() {
  const { owners, isLoading, error } = useOwners();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [openRequestsOnly, setOpenRequestsOnly] = useState(false);

  const filtered = useMemo(() => {
    return owners.filter((o) => {
      if (openRequestsOnly && o.openMarketingRequestCount === 0) return false;
      if (!search.trim()) return true;
      return o.name.toLowerCase().includes(search.trim().toLowerCase());
    });
  }, [owners, search, openRequestsOnly]);

  const columns: DataTableColumn<OwnerListItem>[] = [
    {
      id: 'owner',
      header: t('owners.table.owner'),
      render: (o) => (
        <div className="flex items-center gap-2">
          <EntityAvatar kind="person" name={o.name} size="sm" />
          <p className="truncate font-semibold text-text-primary">{o.name}</p>
        </div>
      ),
    },
    { id: 'properties', header: t('owners.table.properties'), align: 'end', render: (o) => <span className="tabular-nums">{o.propertyCount}</span> },
    {
      id: 'openRequests',
      header: t('owners.table.openRequests'),
      render: (o) => (o.openMarketingRequestCount > 0 ? <Badge tone="info">{o.openMarketingRequestCount}</Badge> : <span className="text-text-muted">{t('owners.table.none')}</span>),
    },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader title={t('owners.list.title')} subtitle={t('owners.list.subtitle')} />

      <div className="mt-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('owners.search.placeholder')}
          activeFilters={openRequestsOnly ? [{ id: 'openRequests', label: t('owners.filter.openRequests') }] : []}
          onRemoveFilter={() => setOpenRequestsOnly(false)}
          onClearAll={() => setOpenRequestsOnly(false)}
          activeFiltersLabel={(count) => formatActiveFiltersLabel(count, locale)}
          clearAllLabel={t('properties.filter.clearAll')}
          filterControls={<Checkbox label={t('owners.filter.openRequests')} checked={openRequestsOnly} onChange={(e) => setOpenRequestsOnly(e.target.checked)} />}
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : owners.length === 0 ? (
          <EmptyState title={t('owners.empty.title')} body={t('owners.empty.body')} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(o) => o.id}
            getRowLabel={(o) => `${t('owners.rowLabelPrefix')} ${o.name}`}
            onRowClick={(o) => navigate(`/owners/${o.id}`)}
            emptyState={{ title: t('owners.empty.title'), body: t('owners.empty.body') }}
          />
        )}
      </div>
    </div>
  );
}
