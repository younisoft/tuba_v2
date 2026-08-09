import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '@/lib/customers/useCustomers';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatActiveFiltersLabel } from '@/lib/i18n/formatCount';
import { formatRelativeDate, CUSTOMER_STAGE_MEANING, CUSTOMER_STAGE_KEY } from '@/features/customers/customerFormat';
import type { CustomerListItem, Customer } from '@/types/entities';

const STAGE_OPTIONS: Customer['relationshipStage'][] = ['prospective', 'active', 'past'];

/**
 * CUST-01 — Customers List (tbos-blueprint/04_SCREEN_INVENTORY.md: "persistent
 * relationship records, independent of any single listing"). DataTable, same
 * grammar as PROP-01/LEAD-02 — never a card grid for a data-heavy list.
 */
export function CustomersListScreen() {
  const { customers, isLoading, error } = useCustomers();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<Customer['relationshipStage'] | ''>('');

  const activeFilters = stageFilter ? [{ id: 'stage', label: `${t('customers.filter.relationshipStage')}: ${t(CUSTOMER_STAGE_KEY[stageFilter])}` }] : [];

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (stageFilter && c.relationshipStage !== stageFilter) return false;
      if (!search.trim()) return true;
      return c.name.toLowerCase().includes(search.trim().toLowerCase());
    });
  }, [customers, search, stageFilter]);

  const columns: DataTableColumn<CustomerListItem>[] = [
    {
      id: 'customer',
      header: t('customers.table.customer'),
      render: (c) => (
        <div className="flex items-center gap-2">
          <EntityAvatar kind="person" name={c.name} size="sm" />
          <p className="truncate font-semibold text-text-primary">{c.name}</p>
        </div>
      ),
    },
    { id: 'stage', header: t('customers.table.relationshipStage'), render: (c) => <Badge tone={CUSTOMER_STAGE_MEANING[c.relationshipStage]}>{t(CUSTOMER_STAGE_KEY[c.relationshipStage])}</Badge> },
    { id: 'leads', header: t('customers.table.leads'), align: 'end', render: (c) => <span className="tabular-nums">{c.leadCount}</span> },
    {
      id: 'lastActivity',
      header: t('customers.table.lastActivity'),
      render: (c) => <span className="text-text-secondary">{c.lastActivityAt ? formatRelativeDate(c.lastActivityAt, locale) : t('customers.table.noActivity')}</span>,
    },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader title={t('customers.list.title')} subtitle={t('customers.list.subtitle')} />

      <div className="mt-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('customers.search.placeholder')}
          activeFilters={activeFilters}
          onRemoveFilter={() => setStageFilter('')}
          onClearAll={() => setStageFilter('')}
          activeFiltersLabel={(count) => formatActiveFiltersLabel(count, locale)}
          clearAllLabel={t('properties.filter.clearAll')}
          filterControls={
            <Select
              aria-label={t('customers.filter.relationshipStage')}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as Customer['relationshipStage'] | '')}
              options={[{ value: '', label: t('customers.filter.relationshipStage') }, ...STAGE_OPTIONS.map((s) => ({ value: s, label: t(CUSTOMER_STAGE_KEY[s]) }))]}
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
        ) : customers.length === 0 ? (
          <EmptyState title={t('customers.empty.title')} body={t('customers.empty.body')} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(c) => c.id}
            getRowLabel={(c) => `${t('customers.rowLabelPrefix')} ${c.name}`}
            onRowClick={(c) => navigate(`/customers/${c.id}`)}
            emptyState={{ title: t('customers.empty.title'), body: t('customers.empty.body') }}
          />
        )}
      </div>
    </div>
  );
}
