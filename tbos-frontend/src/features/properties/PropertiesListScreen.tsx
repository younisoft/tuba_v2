import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties } from '@/lib/properties/useProperties';
import { usePropertyLookups } from '@/lib/properties/usePropertyLookups';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { BulkActionBar } from '@/components/patterns/feedback/BulkActionBar';
import { ConfirmationDialog } from '@/components/patterns/feedback/ConfirmationDialog';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPriceSar, PROPERTY_TYPE_KEY, PROPERTY_STATUS_KEY } from '@/features/properties/propertyFormat';
import { formatActiveFiltersLabel, formatSelectedLabel } from '@/lib/i18n/formatCount';
import { archiveProperty } from '@/mocks/api/db';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import type { Property, PropertyStatus, PropertyType } from '@/types/entities';

const STATUS_OPTIONS: PropertyStatus[] = ['draft', 'pending_compliance', 'active', 'expiring', 'expired', 'rejected', 'sold_rented', 'archived'];
const TYPE_OPTIONS: PropertyType[] = ['apartment', 'villa', 'townhouse', 'land', 'office', 'retail'];

/**
 * PROP-01 — Properties List (tbos-blueprint/04_SCREEN_INVENTORY.md: "browse/
 * filter/search the broker's or agency's property inventory"). DataTable, not
 * a card grid (master prompt §37 "do not overuse cards" / consistency audit's
 * "Properties follows the table/board convention") — same pattern LEAD-02
 * already established.
 */
export function PropertiesListScreen() {
  const { properties, isLoading, error } = useProperties();
  const { owners, teamMembers } = usePropertyLookups();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archiveOpen, setArchiveOpen] = useState(false);

  const brokerName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;
  const ownerName = (id: string) => owners.find((o) => o.id === id)?.name ?? id;

  const activeFilters = [
    ...(statusFilter ? [{ id: 'status', label: `${t('properties.filter.status')}: ${t(PROPERTY_STATUS_KEY[statusFilter])}` }] : []),
    ...(typeFilter ? [{ id: 'type', label: `${t('properties.filter.type')}: ${t(PROPERTY_TYPE_KEY[typeFilter])}` }] : []),
  ];

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (typeFilter && p.propertyType !== typeFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const owner = (owners.find((o) => o.id === p.ownerId)?.name ?? '').toLowerCase();
      return p.title.toLowerCase().includes(q) || p.district.toLowerCase().includes(q) || owner.includes(q);
    });
  }, [properties, search, statusFilter, typeFilter, owners]);

  const columns: DataTableColumn<Property>[] = [
    {
      id: 'property',
      header: t('properties.table.property'),
      render: (p) => (
        <div className="flex items-center gap-2">
          <EntityAvatar kind="record" icon="building" size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{p.title}</p>
            <p className="truncate text-caption text-text-secondary">{ownerName(p.ownerId)}</p>
          </div>
        </div>
      ),
    },
    { id: 'status', header: t('properties.table.status'), render: (p) => <PropertyStatusBadge status={p.status} /> },
    { id: 'type', header: t('properties.table.type'), render: (p) => t(PROPERTY_TYPE_KEY[p.propertyType]) },
    { id: 'district', header: t('properties.table.district'), render: (p) => <span className="text-text-secondary">{p.district}</span> },
    { id: 'price', header: t('properties.table.price'), align: 'end', render: (p) => <span className="tabular-nums">{formatPriceSar(p.priceSar, locale)}</span> },
    { id: 'broker', header: t('properties.table.broker'), render: (p) => <span className="text-text-secondary">{brokerName(p.brokerId)}</span> },
    { id: 'leads', header: t('properties.table.leads'), align: 'end', render: (p) => <span className="tabular-nums">{p.linkedLeadCount}</span> },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader title={t('properties.list.title')} subtitle={t('properties.list.subtitle')} />

      <div className="mt-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('properties.search.placeholder')}
          activeFilters={activeFilters}
          onRemoveFilter={(id) => (id === 'status' ? setStatusFilter('') : setTypeFilter(''))}
          onClearAll={() => {
            setStatusFilter('');
            setTypeFilter('');
          }}
          activeFiltersLabel={(count) => formatActiveFiltersLabel(count, locale)}
          clearAllLabel={t('properties.filter.clearAll')}
          filterControls={
            <>
              <Select
                aria-label={t('properties.filter.status')}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | '')}
                options={[{ value: '', label: t('properties.filter.status') }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: t(PROPERTY_STATUS_KEY[s]) }))]}
              />
              <Select
                aria-label={t('properties.filter.type')}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as PropertyType | '')}
                options={[{ value: '', label: t('properties.filter.type') }, ...TYPE_OPTIONS.map((ty) => ({ value: ty, label: t(PROPERTY_TYPE_KEY[ty]) }))]}
              />
            </>
          }
        />
      </div>

      <PermissionGate permission="properties.delete">
        <div className="mt-4">
          <BulkActionBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            selectedLabel={(count) => formatSelectedLabel(count, locale)}
            clearLabel={t('bulk.clear')}
            actions={
              <Button variant="secondary" size="sm" onClick={() => setArchiveOpen(true)}>
                {t('propertyDetail.action.archive')}
              </Button>
            }
          />
        </div>
      </PermissionGate>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <img src="/brand-patterns/modern-home.svg" alt="" aria-hidden="true" className="h-16 w-16 opacity-30 dark:opacity-20 dark:invert" />
            <EmptyState title={t('properties.empty.title')} body={t('properties.empty.body')} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(p) => p.id}
            getRowLabel={(p) => `${t('properties.rowLabelPrefix')} ${p.title}`}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={(p) => navigate(`/properties/${p.id}`)}
            emptyState={{ title: t('properties.empty.title'), body: t('properties.empty.body') }}
          />
        )}
      </div>

      <ConfirmationDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          selectedIds.forEach((id) => archiveProperty(id, user?.name ?? 'Unknown'));
          setSelectedIds(new Set());
          queryClient.invalidateQueries({ queryKey: ['properties'] });
        }}
        title={t('propertyDetail.archive.title')}
        consequence={t('propertyDetail.archive.consequence')}
        confirmLabel={t('propertyDetail.archive.confirm')}
        cancelLabel={t('propertyDetail.cancel')}
        destructive
      />
    </div>
  );
}
