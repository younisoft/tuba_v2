import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOwner } from '@/lib/owners/useOwner';
import { useOwnerLookups } from '@/lib/owners/useOwnerLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { scopeFor } from '@/lib/permissions/evaluate';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { EntityCard } from '@/components/tbos/entity/EntityCard';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { LOST_REASONS } from '@/features/leads/leadFormat';
import { MARKETING_REQUEST_STATUS_KEY, MARKETING_REQUEST_STATUS_MEANING } from '@/features/owners/ownerFormat';
import { PROPERTY_TYPE_KEY } from '@/features/properties/propertyFormat';
import type { LeadLostReason } from '@/types/entities';

/**
 * OWN-02 — Owner Detail (tbos-blueprint/04_SCREEN_INVENTORY.md: "single
 * canonical record per owner interaction"). Tabs, same pattern as PROP-02
 * (research: "Accessibility: tab pattern same as PROP-02"; "Marketing
 * Requests (OWN-03 content embedded here as a tab)").
 */
export function OwnerDetailScreen() {
  const { ownerId = '' } = useParams();
  const { owner, isLoading, error, properties, marketingRequests, activities, respondToRequest, markRequestWon, markRequestLost } = useOwner(ownerId);
  const { teamMembers } = useOwnerLookups();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [lostOpen, setLostOpen] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState<LeadLostReason>('price');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-content space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} />;
  if (!owner) return <ErrorState error={{ code: 'not_found', message: 'This owner could not be found.' }} />;

  // Record-level scope check — mirrors LeadDetailScreen/PropertyDetailScreen/
  // CustomerDetailScreen (TBOS_RELATIONSHIP_UX_AUDIT.md): an Owner has no
  // stored brokerId, so 'own' scope is derived through whether the viewer
  // brokers any of this owner's real Properties. The agency check is a hard
  // boundary independent of scope tier (TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md
  // P0-1 — an agency-wide role is agency-wide within its OWN agency only).
  const sameAgency = owner.agencyId === user?.agencyId;
  const ownScopeOnly = scopeFor(user?.activeRole ?? null, 'owners.view') === 'own';
  const canViewThisOwner = sameAgency && (!ownScopeOnly || properties.some((p) => p.brokerId === user?.id));
  if (!canViewThisOwner) return <NoPermissionState />;

  const brokerName = (id: string) => teamMembers.find((m) => m.id === id)?.name ?? id;
  const openRequest = marketingRequests.find((m) => m.status === 'open');

  const overviewTab = (
    <div>
      {properties.length === 0 ? (
        <EmptyState title={t('ownerDetail.noProperties.title')} body={t('ownerDetail.noProperties.body')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {properties.map((p) => (
            <EntityCard
              key={p.id}
              avatar={{ kind: 'record', icon: 'building' }}
              title={p.title}
              subtitle={`${t(PROPERTY_TYPE_KEY[p.propertyType])} · ${brokerName(p.brokerId)}`}
              status={<PropertyStatusBadge status={p.status} />}
              onClick={() => navigate(`/properties/${p.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const marketingRequestsTab = (
    <div>
      {marketingRequests.length === 0 ? (
        <EmptyState title={t('ownerDetail.noRequests.title')} body={t('ownerDetail.noRequests.body')} />
      ) : (
        <ul className="space-y-3">
          {marketingRequests.map((request) => (
            <li key={request.id} className="rounded-lg border border-border bg-bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-primary">{request.propertyContext}</p>
                  <Badge tone={MARKETING_REQUEST_STATUS_MEANING[request.status]}>{t(MARKETING_REQUEST_STATUS_KEY[request.status])}</Badge>
                  {request.status === 'lost' && request.lostReason && (
                    <p className="mt-1 text-caption text-text-danger">
                      {t('ownerDetail.lostReasonLabel')}: {t(LOST_REASONS.find((r) => r.id === request.lostReason)?.key ?? 'leadDetail.lostReason.other')}
                    </p>
                  )}
                </div>
                {request.status !== 'won' && request.status !== 'lost' && (
                  <div className="flex flex-wrap gap-2">
                    {request.status === 'open' && (
                      <PermissionGate permission="marketing_requests.respond" mode="disable">
                        <Button size="sm" onClick={() => respondToRequest(request.id)}>
                          {t('ownerDetail.action.respond')}
                        </Button>
                      </PermissionGate>
                    )}
                    {request.status === 'in_progress' && (
                      <PermissionGate permission="marketing_requests.respond" mode="disable">
                        <Button size="sm" onClick={() => markRequestWon(request.id)}>
                          {t('ownerDetail.action.markWon')}
                        </Button>
                      </PermissionGate>
                    )}
                    <PermissionGate permission="marketing_requests.respond" mode="disable">
                      <Button variant="secondary" size="sm" onClick={() => setLostOpen(request.id)}>
                        {t('ownerDetail.action.markLost')}
                      </Button>
                    </PermissionGate>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const activityTab = (
    <ActivityTimeline
      items={activities.map((a) => ({
        id: a.id,
        actorKind: a.actorKind,
        actorName: a.actorName,
        action: a.detail,
        timestamp: new Date(a.timestamp).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US'),
      }))}
    />
  );

  return (
    <div className="mx-auto max-w-content">
      <EntityDetailHeader
        title={owner.name}
        meta={[
          { icon: 'user-check', label: owner.phone },
          { icon: 'building', label: `${properties.length} ${t('ownerDetail.linkedProperties')}` },
        ]}
        primaryAction={
          openRequest ? (
            <PermissionGate permission="marketing_requests.respond" mode="disable">
              <Button size="sm" onClick={() => respondToRequest(openRequest.id)}>
                {t('ownerDetail.action.respond')}
              </Button>
            </PermissionGate>
          ) : undefined
        }
      />

      <div className="mt-6">
        <Tabs
          label={t('owners.list.title')}
          tabs={[
            { id: 'overview', label: t('ownerDetail.tab.overview'), content: overviewTab },
            { id: 'marketingRequests', label: t('ownerDetail.tab.marketingRequests'), content: marketingRequestsTab },
            { id: 'activity', label: t('ownerDetail.tab.activity'), content: activityTab },
          ]}
        />
      </div>

      <Drawer
        open={!!lostOpen}
        onClose={() => setLostOpen(null)}
        title={t('ownerDetail.markLost.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              if (!lostOpen) return;
              markRequestLost({ requestId: lostOpen, reason: lostReason });
              setLostOpen(null);
            }}
          >
            {t('ownerDetail.action.markLost')}
          </Button>
        }
      >
        <Field label={t('leadDetail.markLost.reasonLabel')}>
          {(field) => (
            <Select
              {...field}
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value as LeadLostReason)}
              options={LOST_REASONS.map((r) => ({ value: r.id, label: t(r.key) }))}
            />
          )}
        </Field>
      </Drawer>
    </div>
  );
}
