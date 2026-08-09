import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/lib/projects/useProjects';
import { useProjectLookups } from '@/lib/projects/useProjectLookups';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PROPERTY_STATUS_KEY } from '@/features/properties/propertyFormat';
import { formatActiveFiltersLabel } from '@/lib/i18n/formatCount';
import type { Project, PropertyStatus } from '@/types/entities';

const STATUS_OPTIONS: PropertyStatus[] = ['draft', 'pending_compliance', 'active', 'expiring', 'expired', 'rejected', 'sold_rented', 'archived'];

/**
 * PROJ-01 — Projects List (tbos-blueprint/04_SCREEN_INVENTORY.md: "browse/
 * filter developer/multi-unit inventory... structurally separate from
 * Properties"). Same DataTable grammar as PROP-01, minus bulk-archive (no
 * `projects.delete` permission key exists in permissionRegistry.ts — not
 * invented here) and minus a Type filter (Project has no propertyType field;
 * only Unit-level floor plans do, per tbos-definition/16_MODULE_
 * SPECIFICATIONS.md's field-level detail).
 */
export function ProjectsListScreen() {
  const { projects, isLoading, error } = useProjects();
  const { owners, teamMembers } = useProjectLookups();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | ''>('');

  const brokerName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;
  const ownerName = (id: string) => owners.find((o) => o.id === id)?.name ?? id;

  const activeFilters = statusFilter ? [{ id: 'status', label: `${t('projects.filter.status')}: ${t(PROPERTY_STATUS_KEY[statusFilter])}` }] : [];

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return p.title.toLowerCase().includes(q) || p.district.toLowerCase().includes(q);
    });
  }, [projects, search, statusFilter]);

  const columns: DataTableColumn<Project>[] = [
    {
      id: 'project',
      header: t('projects.table.project'),
      render: (p) => (
        <div className="flex items-center gap-2">
          <EntityAvatar kind="record" icon="layers" size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{p.title}</p>
            <p className="truncate text-caption text-text-secondary">{ownerName(p.ownerId)}</p>
          </div>
        </div>
      ),
    },
    { id: 'status', header: t('projects.table.status'), render: (p) => <PropertyStatusBadge status={p.status} /> },
    { id: 'district', header: t('projects.table.district'), render: (p) => <span className="text-text-secondary">{p.district}</span> },
    { id: 'broker', header: t('projects.table.broker'), render: (p) => <span className="text-text-secondary">{brokerName(p.brokerId)}</span> },
    { id: 'leads', header: t('projects.table.leads'), align: 'end', render: (p) => <span className="tabular-nums">{p.linkedLeadCount}</span> },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader
        title={t('projects.list.title')}
        subtitle={t('projects.list.subtitle')}
        actions={
          <PermissionGate permission="projects.create" mode="disable">
            <Button size="sm" onClick={() => navigate('/projects/new')}>
              {t('projects.action.create')}
            </Button>
          </PermissionGate>
        }
      />

      <div className="mt-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('projects.search.placeholder')}
          activeFilters={activeFilters}
          onRemoveFilter={() => setStatusFilter('')}
          onClearAll={() => setStatusFilter('')}
          activeFiltersLabel={(count) => formatActiveFiltersLabel(count, locale)}
          clearAllLabel={t('properties.filter.clearAll')}
          filterControls={
            <Select
              aria-label={t('projects.filter.status')}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | '')}
              options={[{ value: '', label: t('projects.filter.status') }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: t(PROPERTY_STATUS_KEY[s]) }))]}
            />
          }
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <img src="/brand-patterns/modern-home.svg" alt="" aria-hidden="true" className="h-16 w-16 opacity-30 dark:opacity-20 dark:invert" />
            <EmptyState title={t('projects.empty.title')} body={t('projects.empty.body')} primaryAction={{ label: t('projects.action.create'), onClick: () => navigate('/projects/new') }} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowId={(p) => p.id}
            getRowLabel={(p) => `${t('projects.rowLabelPrefix')} ${p.title}`}
            onRowClick={(p) => navigate(`/projects/${p.id}`)}
            emptyState={{ title: t('projects.empty.title'), body: t('projects.empty.body') }}
          />
        )}
      </div>
    </div>
  );
}
