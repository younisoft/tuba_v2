import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/lib/leads/useLeads';
import { useLeadLookups } from '@/lib/leads/useLeadLookups';
import { useLeadMutations } from '@/lib/leads/useLeadMutations';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LeadStageBadge } from '@/components/tbos/lead/LeadStageBadge';
import { SlaTimer } from '@/components/tbos/lead/SlaTimer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BulkActionBar } from '@/components/patterns/feedback/BulkActionBar';
import { Dropdown } from '@/components/ui/Dropdown';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { formatSlaLabel, SOURCE_KEY } from '@/features/leads/leadFormat';
import { formatSelectedLabel } from '@/lib/i18n/formatCount';
import type { Lead } from '@/types/entities';

/**
 * LEAD-02 — the Leads Inbox: "same lead data as LEAD-01, presented
 * chronologically... a view mode, not a new destination" (tbos-blueprint/
 * 04_SCREEN_INVENTORY.md). Reuses the exact same useLeads() query as LEAD-01,
 * rendered through DataTable instead of KanbanBoard — and is where this slice
 * puts bulk reassign, since KanbanCard has no multi-select capability today
 * (documented in TBOS_UI_VERTICAL_SLICE_REPORT.md "Known Limitations").
 */
export function LeadsInboxScreen() {
  const { leads, isLoading, error } = useLeads();
  const { customers, properties, teamMembers } = useLeadLookups();
  const { reassign } = useLeadMutations();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? id;
  const propertyTitle = (id: string | null) => (id ? (properties.find((p) => p.id === id)?.title ?? t('leads.noProperty')) : t('leads.noProperty'));
  const assigneeName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;

  const sorted = useMemo(() => [...leads].sort((a, b) => (a.slaMinutesRemaining ?? Infinity) - (b.slaMinutesRemaining ?? Infinity)), [leads]);

  const columns: DataTableColumn<Lead>[] = [
    { id: 'customer', header: t('leads.table.customer'), render: (l) => <span className="font-semibold text-text-primary">{customerName(l.customerId)}</span> },
    { id: 'stage', header: t('leads.table.stage'), render: (l) => <LeadStageBadge stage={l.stage} /> },
    { id: 'source', header: t('leads.table.source'), render: (l) => <Badge tone={l.source === 'owner_originated' ? 'info' : 'neutral'}>{t(SOURCE_KEY[l.source])}</Badge> },
    { id: 'property', header: t('leads.table.property'), render: (l) => <span className="text-text-secondary">{propertyTitle(l.propertyId)}</span> },
    { id: 'score', header: t('leads.table.score'), align: 'end', render: (l) => <span className="tabular-nums">{l.score}</span> },
    { id: 'assignee', header: t('leads.table.assignee'), render: (l) => <span className="text-text-secondary">{assigneeName(l.assigneeId)}</span> },
    {
      id: 'sla',
      header: t('leads.table.sla'),
      render: (l) => (l.slaMinutesRemaining !== null ? <SlaTimer minutesRemaining={l.slaMinutesRemaining} label={formatSlaLabel(l.slaMinutesRemaining, locale)} size="sm" /> : null),
    },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader
        title={t('leads.inbox.title')}
        subtitle={t('leads.pipeline.subtitle')}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
              {t('leads.view.pipeline')}
            </Button>
            <Button variant="secondary" size="sm" disabled>
              {t('leads.view.inbox')}
            </Button>
          </div>
        }
      />

      <PermissionGate permission="leads.assign">
        <div className="mt-4">
          <BulkActionBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            selectedLabel={(count) => formatSelectedLabel(count, locale)}
            clearLabel={t('bulk.clear')}
            actions={
              <Dropdown
                label={t('leadDetail.action.reassign')}
                items={teamMembers.map((m) => ({
                  id: m.id,
                  label: m.name,
                  onSelect: () => {
                    selectedIds.forEach((leadId) => reassign(leadId, m.id, m.name));
                    setSelectedIds(new Set());
                  },
                }))}
                trigger={({ toggle }) => (
                  <Button variant="secondary" size="sm" onClick={toggle}>
                    {t('leadDetail.action.reassign')}
                  </Button>
                )}
              />
            }
          />
        </div>
      </PermissionGate>

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={sorted}
          getRowId={(l) => l.id}
          getRowLabel={(l) => `${t('leads.rowLabelPrefix')} ${customerName(l.customerId)}`}
          state={isLoading ? 'loading' : 'success'}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(l) => navigate(`/leads/${l.id}`)}
          emptyState={{ title: t('leads.empty.title'), body: t('leads.empty.body') }}
        />
      </div>
    </div>
  );
}
