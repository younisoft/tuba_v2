import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/lib/leads/useLeads';
import { useLeadLookups } from '@/lib/leads/useLeadLookups';
import { useLeadMutations } from '@/lib/leads/useLeadMutations';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { KanbanBoard, type KanbanColumnDef } from '@/components/patterns/kanban/KanbanBoard';
import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { SlaTimer } from '@/components/tbos/lead/SlaTimer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FilterBar } from '@/components/patterns/filters/FilterBar';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatSlaLabel, SOURCE_KEY } from '@/features/leads/leadFormat';
import { formatActiveFiltersLabel } from '@/lib/i18n/formatCount';
import type { Lead, LeadStage } from '@/types/entities';

const STAGES: { id: LeadStage; titleKey: 'leads.stage.new' | 'leads.stage.assigned' | 'leads.stage.contacted' | 'leads.stage.qualified' | 'leads.stage.negotiating' | 'leads.stage.won' | 'leads.stage.lost'; meaning: 'info' | 'warning' | 'success' | 'danger' }[] = [
  { id: 'new', titleKey: 'leads.stage.new', meaning: 'info' },
  { id: 'assigned', titleKey: 'leads.stage.assigned', meaning: 'info' },
  { id: 'contacted', titleKey: 'leads.stage.contacted', meaning: 'info' },
  { id: 'qualified', titleKey: 'leads.stage.qualified', meaning: 'warning' },
  { id: 'negotiating', titleKey: 'leads.stage.negotiating', meaning: 'warning' },
  { id: 'won', titleKey: 'leads.stage.won', meaning: 'success' },
  { id: 'lost', titleKey: 'leads.stage.lost', meaning: 'danger' },
];

/**
 * LEAD-01 — the Unified Lead Pipeline (tbos-blueprint/04_SCREEN_INVENTORY.md:
 * "kanban-style stage view of every lead, buyer-inbound + owner-originated, in
 * one scored, SLA-timed system"). One pipeline, one KanbanBoard — source is a
 * card-level Badge, never a second, disconnected list (master prompt §11).
 */
export function LeadsPipelineScreen() {
  const { leads, isLoading, error } = useLeads();
  const { customers, properties } = useLeadLookups();
  const { changeStage } = useLeadMutations();
  const { t, locale } = useTranslation();
  const { can } = useHasPermission();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [slaRiskOnly, setSlaRiskOnly] = useState(false);

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id;
  const propertyTitle = (id: string | null) => (id ? properties.find((p) => p.id === id)?.title : undefined);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (slaRiskOnly && (lead.slaMinutesRemaining === null || lead.slaMinutesRemaining > 60)) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const name = (customers.find((c) => c.id === lead.customerId)?.name ?? lead.customerId).toLowerCase();
      const property = (properties.find((p) => p.id === lead.propertyId)?.title ?? '').toLowerCase();
      return name.includes(q) || property.includes(q);
    });
  }, [leads, search, slaRiskOnly, customers, properties]);

  const columns: KanbanColumnDef<Lead>[] = STAGES.map((stage) => ({
    id: stage.id,
    title: t(stage.titleKey),
    meaning: stage.meaning,
    cards: filtered.filter((l) => l.stage === stage.id),
  }));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader
        title={t('leads.pipeline.title')}
        subtitle={t('leads.pipeline.subtitle')}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled>
              {t('leads.view.pipeline')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads/inbox')}>
              {t('leads.view.inbox')}
            </Button>
          </div>
        }
      />

      <div className="mt-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('leads.search.placeholder')}
          activeFilters={slaRiskOnly ? [{ id: 'sla', label: t('leads.filter.slaRisk') }] : []}
          onRemoveFilter={() => setSlaRiskOnly(false)}
          onClearAll={() => setSlaRiskOnly(false)}
          activeFiltersLabel={(count) => formatActiveFiltersLabel(count, locale)}
          clearAllLabel={t('leads.filter.clearAll')}
          filterControls={
            <Button variant={slaRiskOnly ? 'primary' : 'secondary'} size="sm" onClick={() => setSlaRiskOnly((v) => !v)}>
              {t('leads.filter.slaRisk')}
            </Button>
          }
        />
      </div>

      {leads.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t('leads.empty.title')} body={t('leads.empty.body')} />
        </div>
      ) : (
        <div className="mt-6">
          <KanbanBoard
            columns={columns}
            getCardId={(lead) => lead.id}
            emptyStateLabel={(column) => `${t('leads.column.emptyPrefix')} ${column.title}`}
            onMoveCard={(leadId, toColumnId) => {
              if (!can('leads.respond')) return;
              changeStage(leadId, toColumnId as LeadStage);
            }}
            renderCard={(lead) => (
              <button type="button" onClick={() => navigate(`/leads/${lead.id}`)} className="w-full text-start">
                <div className="flex items-start gap-2">
                  <EntityAvatar kind="person" name={customerName(lead.customerId)} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-text-primary">{customerName(lead.customerId)}</p>
                    <p className="truncate text-caption text-text-secondary">{propertyTitle(lead.propertyId) ?? t('leads.noProperty')}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral">
                    {t('leads.score')}: {lead.score}
                  </Badge>
                  <Badge tone={lead.source === 'owner_originated' ? 'info' : 'neutral'}>{t(SOURCE_KEY[lead.source])}</Badge>
                  {lead.slaMinutesRemaining !== null && <SlaTimer minutesRemaining={lead.slaMinutesRemaining} label={formatSlaLabel(lead.slaMinutesRemaining, locale)} size="sm" />}
                </div>
              </button>
            )}
          />
        </div>
      )}
    </div>
  );
}
