import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertiesListSummary } from '@/lib/properties/usePropertiesListSummary';
import { usePropertyLookups } from '@/lib/properties/usePropertyLookups';
import { useMediaQuery } from '@/lib/ui/useMediaQuery';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { useToastStore } from '@/state/toast.store';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { BulkActionBar } from '@/components/patterns/feedback/BulkActionBar';
import { ConfirmationDialog } from '@/components/patterns/feedback/ConfirmationDialog';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { EntityMeta } from '@/components/tbos/entity/EntityMeta';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { AdvertisementStatusBadge } from '@/components/tbos/status/AdvertisementStatusBadge';
import { PromotionBadge } from '@/components/tbos/status/PromotionBadge';
import { PropertyPerformanceSummary } from '@/components/tbos/data/PropertyPerformanceSummary';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';
import { Dropdown, type DropdownItem } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPriceSar, PROPERTY_TYPE_KEY, PROPERTY_STATUS_KEY } from '@/features/properties/propertyFormat';
import { formatActiveFiltersLabel, formatSelectedLabel, formatPropertyCountLabel } from '@/lib/i18n/formatCount';
import { archiveProperty } from '@/mocks/api/db';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';
import type { Property, PropertyListSummary, PropertyStatus, PropertyType } from '@/types/entities';

const STATUS_OPTIONS: PropertyStatus[] = ['draft', 'pending_compliance', 'active', 'expiring', 'expired', 'rejected', 'sold_rented', 'archived'];
const TYPE_OPTIONS: PropertyType[] = ['apartment', 'villa', 'townhouse', 'land', 'office', 'retail'];

/**
 * PROP-01 — My Properties (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md — the
 * informed redesign of the same screen ID/route/permission this codebase
 * already built, not a new screen). Desktop keeps the DataTable pattern every
 * other *-01 list uses; tablet/mobile switches to a card list instead of
 * the table's default horizontal-scroll fallback, per the architecture
 * doc's explicit "do not simply shrink the desktop table" requirement (§10).
 * Property Status / Advertisement Status / Promotion are three distinct
 * badges (Part 05) — never merged. Reach/Views render an honest "not
 * tracked yet" state (see PropertyPerformanceSummary) rather than a
 * fabricated number; only Leads (real, Lead-linkage-computed) is a live
 * figure. Promotion/Service actions open a "coming soon" toast, not the
 * real drawers — those are out of scope for this phase (C1 brief Part 26).
 */
export function PropertiesListScreen() {
  const { summaries, isLoading, error } = usePropertiesListSummary();
  const { owners, teamMembers } = usePropertyLookups();
  const { user } = useAuth();
  const { can } = useHasPermission();
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** null = closed; a non-empty array drives the confirm dialog for both the
   * bulk toolbar and a single row's overflow "Delete" — one dialog, one copy. */
  const [archiveTarget, setArchiveTarget] = useState<string[] | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const brokerName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;

  const activeFilters = [
    ...(statusFilter ? [{ id: 'status', label: `${t('properties.filter.status')}: ${t(PROPERTY_STATUS_KEY[statusFilter])}` }] : []),
    ...(typeFilter ? [{ id: 'type', label: `${t('properties.filter.type')}: ${t(PROPERTY_TYPE_KEY[typeFilter])}` }] : []),
  ];

  const filtered = useMemo(() => {
    return summaries.filter(({ property: p }) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (typeFilter && p.propertyType !== typeFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const owner = (owners.find((o) => o.id === p.ownerId)?.name ?? '').toLowerCase();
      return p.title.toLowerCase().includes(q) || p.district.toLowerCase().includes(q) || owner.includes(q);
    });
  }, [summaries, search, statusFilter, typeFilter, owners]);

  function clearFilters() {
    setStatusFilter('');
    setTypeFilter('');
    setSearch('');
  }

  function propertyMeta(p: Property) {
    return [
      { icon: 'globe' as const, label: `${p.district}, ${p.city}` },
      { icon: 'layers' as const, label: t(PROPERTY_TYPE_KEY[p.propertyType]) },
      { icon: 'users' as const, label: brokerName(p.brokerId) },
    ];
  }

  function rowActionItems(summary: PropertyListSummary): DropdownItem[] {
    const { property } = summary;
    const items: DropdownItem[] = [];
    if (can('properties.edit')) {
      items.push({ id: 'edit', label: t('properties.action.edit'), onSelect: () => navigate(`/properties/new?propertyId=${property.id}`) });
    }
    if (can('properties.promote')) {
      items.push({ id: 'promote', label: t('properties.action.promote'), icon: 'zap', onSelect: () => pushToast({ tone: 'info', message: t('properties.toast.promoteComingSoon') }) });
    }
    if (can('properties.services.request')) {
      items.push({ id: 'service', label: t('properties.action.requestService'), onSelect: () => pushToast({ tone: 'info', message: t('properties.toast.serviceComingSoon') }) });
    }
    if (can('properties.delete')) {
      items.push({ id: 'delete', label: t('properties.action.delete'), danger: true, onSelect: () => setArchiveTarget([property.id]) });
    }
    return items;
  }

  function RowActionsMenu({ summary }: { summary: PropertyListSummary }) {
    const items = rowActionItems(summary);
    if (items.length === 0) return null;
    return (
      <span onClick={(e) => e.stopPropagation()}>
        <Dropdown
          label={`${t('properties.action.moreActions')} ${summary.property.title}`}
          items={items}
          trigger={({ toggle, open }) => <IconButton icon="more-horizontal" label={`${t('properties.action.moreActions')} ${summary.property.title}`} onClick={toggle} active={open} />}
        />
      </span>
    );
  }

  if (error) return <ErrorState error={error} />;

  const columns: DataTableColumn<PropertyListSummary>[] = [
    {
      id: 'property',
      header: t('properties.table.property'),
      render: ({ property: p }) => (
        <div className="flex items-center gap-2">
          <EntityAvatar kind="record" icon="building" size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{p.title}</p>
            <EntityMeta items={propertyMeta(p)} />
          </div>
        </div>
      ),
    },
    { id: 'status', header: t('properties.table.status'), render: ({ property: p }) => <PropertyStatusBadge status={p.status} /> },
    {
      id: 'advertisement',
      header: t('properties.table.advertisement'),
      render: (s) => (
        <div className="flex flex-col items-start gap-1">
          <AdvertisementStatusBadge status={s.advertisementStatus} />
          <PromotionBadge tier={s.property.promotionTier} />
        </div>
      ),
    },
    { id: 'performance', header: t('properties.table.performance'), render: (s) => <PropertyPerformanceSummary leadsGenerated={s.leadsGenerated} /> },
    { id: 'price', header: t('properties.table.price'), align: 'end', render: (s) => <span className="tabular-nums">{formatPriceSar(s.property.priceSar, locale)}</span> },
    { id: 'actions', header: t('properties.table.actions'), align: 'end', render: (s) => <RowActionsMenu summary={s} /> },
  ];

  return (
    <div className="mx-auto max-w-content">
      <PageHeader
        title={t('properties.list.title')}
        subtitle={t('properties.list.subtitle')}
        actions={
          <PermissionGate permission="properties.create">
            <Button variant="primary" onClick={() => navigate('/properties/new')}>
              <Icon name="plus" className="h-4 w-4" />
              {t('properties.action.add')}
            </Button>
          </PermissionGate>
        }
      />

      {!isLoading && summaries.length > 0 && (
        <p className="mt-1 text-caption text-text-secondary">{formatPropertyCountLabel(summaries.length, locale)}</p>
      )}

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
              <Button variant="secondary" size="sm" onClick={() => setArchiveTarget(Array.from(selectedIds))}>
                {t('propertyDetail.action.archive')}
              </Button>
            }
          />
        </div>
      </PermissionGate>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : summaries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <img src="/brand-patterns/modern-home.svg" alt="" aria-hidden="true" className="h-16 w-16 opacity-30 dark:opacity-20 dark:invert" />
            <EmptyState
              title={t('properties.empty.title')}
              body={t('properties.empty.body')}
              primaryAction={
                can('properties.create')
                  ? { label: t('properties.action.add'), onClick: () => navigate('/properties/new') }
                  : undefined
              }
            />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title={t('properties.emptyFiltered.title')} body={t('properties.emptyFiltered.body')} primaryAction={{ label: t('properties.filter.clearAll'), onClick: clearFilters }} />
        ) : isDesktop ? (
          // Desktop only — the shared DataTable pattern every *-01 list uses.
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(s) => s.property.id}
            getRowLabel={(s) => `${t('properties.rowLabelPrefix')} ${s.property.title}`}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={(s) => navigate(`/properties/${s.property.id}`)}
          />
        ) : (
          // Tablet/mobile — cards, not a shrunk table (TBOS_MY_PROPERTIES_UX_ARCHITECTURE.md
          // §10): a 2-column grid at tablet width, 1 column on mobile, via CSS
          // alone (safe — only one representation of each property ever
          // mounts; the table branch above is already excluded by `isDesktop`).
          <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
            {filtered.map((s) => (
                <li key={s.property.id} className="rounded-lg border border-border bg-bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <EntityAvatar kind="record" icon="building" size="sm" />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/properties/${s.property.id}`)}
                          className="truncate text-start text-body font-semibold text-text-primary underline-offset-2 hover:underline"
                        >
                          {s.property.title}
                        </button>
                        <div className="mt-0.5">
                          <EntityMeta items={propertyMeta(s.property)} />
                        </div>
                      </div>
                    </div>
                    <RowActionsMenu summary={s} />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PropertyStatusBadge status={s.property.status} />
                    <AdvertisementStatusBadge status={s.advertisementStatus} />
                    <PromotionBadge tier={s.property.promotionTier} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <PropertyPerformanceSummary leadsGenerated={s.leadsGenerated} />
                    <span className="tabular-nums font-semibold text-text-primary">{formatPriceSar(s.property.priceSar, locale)}</span>
                  </div>
                </li>
              ))}
            </ul>
        )}
      </div>

      <ConfirmationDialog
        open={archiveTarget !== null}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => {
          (archiveTarget ?? []).forEach((id) => archiveProperty(id, user?.name ?? 'Unknown'));
          setArchiveTarget(null);
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
