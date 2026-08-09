import { useNavigate } from 'react-router-dom';
import { useMarketingRequestsQueue } from '@/lib/owners/useMarketingRequestsQueue';
import { useOwnerLookups } from '@/lib/owners/useOwnerLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table/DataTable';
import { PageHeader } from '@/components/patterns/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { MARKETING_REQUEST_STATUS_KEY, MARKETING_REQUEST_STATUS_MEANING } from '@/features/owners/ownerFormat';
import { useQuery } from '@tanstack/react-query';
import { lookupsApi } from '@/lib/api/endpoints/lookups';
import type { MarketingRequest } from '@/types/entities';

/**
 * OWN-03 — Marketing Requests Queue (tbos-blueprint/04_SCREEN_INVENTORY.md:
 * "not a separate destination" — embedded tab in OWN-02, plus this agency-wide
 * queue reached from there, never a rail item of its own — matching
 * LEAD-01/LEAD-02's "same query, two presentations" precedent, never a second
 * data source). Permissions: "MM sees agency-wide queue; PC/SB see only
 * requests matched/assigned to them" (enforced in marketingRequestsForUser()).
 */
export function MarketingRequestsQueueScreen() {
  const { marketingRequests, isLoading, error } = useMarketingRequestsQueue();
  const { teamMembers } = useOwnerLookups();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ownersQuery = useQuery({
    queryKey: ['lookups', 'owners', user?.agencyId],
    queryFn: async () => {
      if (!user) return [];
      const res = await lookupsApi.owners(user.agencyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!user,
  });
  const owners = ownersQuery.data ?? [];

  const ownerName = (id: string) => owners.find((o) => o.id === id)?.name ?? id;
  const brokerName = (id: string | null) => (id ? (teamMembers.find((m) => m.id === id)?.name ?? id) : t('owners.table.none'));

  const columns: DataTableColumn<MarketingRequest>[] = [
    { id: 'owner', header: t('marketingRequests.table.owner'), render: (m) => <span className="font-semibold text-text-primary">{ownerName(m.ownerId)}</span> },
    { id: 'context', header: t('marketingRequests.table.context'), render: (m) => <span className="text-text-secondary">{m.propertyContext}</span> },
    { id: 'status', header: t('marketingRequests.table.status'), render: (m) => <Badge tone={MARKETING_REQUEST_STATUS_MEANING[m.status]}>{t(MARKETING_REQUEST_STATUS_KEY[m.status])}</Badge> },
    { id: 'broker', header: t('marketingRequests.table.broker'), render: (m) => <span className="text-text-secondary">{brokerName(m.matchedBrokerId)}</span> },
  ];

  if (error) return <ErrorState error={error} />;

  return (
    <div className="mx-auto max-w-content">
      <PageHeader title={t('marketingRequests.list.title')} subtitle={t('marketingRequests.list.subtitle')} />

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : marketingRequests.length === 0 ? (
          <EmptyState title={t('marketingRequests.empty.title')} body={t('marketingRequests.empty.body')} />
        ) : (
          <DataTable
            columns={columns}
            rows={marketingRequests}
            getRowId={(m) => m.id}
            getRowLabel={(m) => `${t('marketingRequests.rowLabelPrefix')} ${ownerName(m.ownerId)}`}
            onRowClick={(m) => navigate(`/owners/${m.ownerId}`)}
            emptyState={{ title: t('marketingRequests.empty.title'), body: t('marketingRequests.empty.body') }}
          />
        )}
      </div>
    </div>
  );
}
