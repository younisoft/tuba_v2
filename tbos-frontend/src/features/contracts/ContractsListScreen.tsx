import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '@/lib/contracts/useContracts';
import { useContractLookups } from '@/lib/contracts/useContractLookups';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { ContractStatusBadge } from '@/components/tbos/status/ContractStatusBadge';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatActiveFiltersLabel } from '@/lib/i18n/formatCount';
import { formatPriceSar, formatDate } from '@/features/properties/propertyFormat';
import { CONTRACT_STATUS_KEY, CONTRACT_TYPE_KEY } from '@/features/contracts/contractFormat';
import type { Contract, ContractStatus } from '@/types/entities';

const STATUS_OPTIONS: ContractStatus[] = ['draft', 'pending_compliance', 'active', 'renewal_due', 'closed', 'cancelled'];

/**
 * CONT-01 — Contracts List (tbos-blueprint/04_SCREEN_INVENTORY.md: "every
 * deal as a documented, auditable transaction record"). Same DataTable
 * grammar as PROP-01/CUST-01/OWN-01 — status is the prioritized second
 * column (the mobile-priority lesson from Phase 6/7: status must survive
 * mobile column collapse, never buried behind horizontal scroll).
 */
export function ContractsListScreen() {
  const { contracts, isLoading, error } = useContracts();
  const { customers, properties } = useContractLookups();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id;
  const propertyTitle = (id: string) => properties.find((p) => p.id === id)?.title ?? id;

  const activeFilters = statusFilter ? [{ id: 'status', label: `${t('contracts.filter.status')}: ${t(CONTRACT_STATUS_KEY[statusFilter])}` }] : [];

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return customerName(c.customerId).toLowerCase().includes(q) || propertyTitle(c.propertyId).toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- customerName/propertyTitle are derived from customers/properties, already deps
  }, [contracts, search, statusFilter, customers, properties]);

  const keyDate = (c: Contract) => {
    if (c.status === 'renewal_due' && c.renewalDueDate) return `${t('contracts.table.renews')} ${formatDate(c.renewalDueDate, locale)}`;
    if (c.status === 'active' && c.renewalDueDate) return `${t('contracts.table.renews')} ${formatDate(c.renewalDueDate, locale)}`;
    if (c.status === 'closed' && c.closedDate) return `${t('contracts.table.closed')} ${formatDate(c.closedDate, locale)}`;
    if (c.status === 'cancelled' && c.cancelledDate) return `${t('contracts.table.cancelled')} ${formatDate(c.cancelledDate, locale)}`;
    return '—';
  };

  const columns: DataTableColumn<Contract>[] = [
    {
      id: 'contract',
      header: t('contracts.table.contract'),
      render: (c) => (
        <div className="flex items-center gap-2">
          <EntityAvatar kind="record" icon="file-text" size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{customerName(c.customerId)}</p>
            <p className="truncate text-caption text-text-secondary">{propertyTitle(c.propertyId)}</p>
          </div>
        </div>
      ),
    },
    { id: 'status', header: t('contracts.table.status'), render: (c) => <ContractStatusBadge status={c.status} /> },
    { id: 'type', header: t('contracts.table.type'), render: (c) => t(CONTRACT_TYPE_KEY[c.type]) },
    { id: 'value', header: t('contracts.table.value'), align: 'end', render: (c) => <span className="tabular-nums">{formatPriceSar(c.valueSar, locale)}</span> },
    { id: 'keyDate', header: t('contracts.table.keyDate'), render: (c) => <span className="text-text-secondary">{keyDate(c)}</span> },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader title={t('contracts.list.title')} subtitle={t('contracts.list.subtitle')} />

      <div className="mt-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('contracts.search.placeholder')}
          activeFilters={activeFilters}
          onRemoveFilter={() => setStatusFilter('')}
          onClearAll={() => setStatusFilter('')}
          activeFiltersLabel={(count) => formatActiveFiltersLabel(count, locale)}
          clearAllLabel={t('properties.filter.clearAll')}
          filterControls={
            <Select
              aria-label={t('contracts.filter.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContractStatus | '')}
              options={[{ value: '', label: t('contracts.filter.status') }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: t(CONTRACT_STATUS_KEY[s]) }))]}
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
        ) : contracts.length === 0 ? (
          <EmptyState title={t('contracts.empty.title')} body={t('contracts.empty.body')} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(c) => c.id}
            getRowLabel={(c) => `${t('contracts.rowLabelPrefix')} ${customerName(c.customerId)}`}
            onRowClick={(c) => navigate(`/contracts/${c.id}`)}
            emptyState={{ title: t('contracts.empty.title'), body: t('contracts.empty.body') }}
          />
        )}
      </div>
    </div>
  );
}
