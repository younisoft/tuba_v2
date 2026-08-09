import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomer } from '@/lib/customers/useCustomer';
import { useCustomerLookups } from '@/lib/customers/useCustomerLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { scopeFor } from '@/lib/permissions/evaluate';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { EntityCard } from '@/components/tbos/entity/EntityCard';
import { LeadStageBadge } from '@/components/tbos/lead/LeadStageBadge';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { EmptyState } from '@/components/feedback/EmptyState';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CUSTOMER_STAGE_MEANING, CUSTOMER_STAGE_KEY } from '@/features/customers/customerFormat';

/**
 * CUST-02 — Customer Detail (tbos-blueprint/04_SCREEN_INVENTORY.md: "unified
 * relationship view — interaction history, linked leads/deals"). No tabs — a
 * single inline chronological relationship timeline
 * (tbos-blueprint/02_NAVIGATION_BLUEPRINT.md: "Inline timeline, not a
 * panel"), unlike PROP-02/OWN-02 which do use tabs.
 */
export function CustomerDetailScreen() {
  const { customerId = '' } = useParams();
  const { customer, isLoading, error, leads, activities, logInteraction } = useCustomer(customerId);
  const { properties } = useCustomerLookups();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [interactionOpen, setInteractionOpen] = useState(false);
  const [interactionText, setInteractionText] = useState('');

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
  if (!customer) return <ErrorState error={{ code: 'not_found', message: 'This customer could not be found.' }} />;

  // Record-level scope check — mirrors LeadDetailScreen/PropertyDetailScreen
  // (TBOS_RELATIONSHIP_UX_AUDIT.md): a Customer has no stored assigneeId, so
  // 'own' scope is derived through whether the viewer is assigned to any of
  // this customer's real Leads. The agency check is a hard boundary
  // independent of scope tier (TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md P0-1 —
  // an agency-wide role is agency-wide within its OWN agency only).
  const sameAgency = customer.agencyId === user?.agencyId;
  const ownScopeOnly = scopeFor(user?.activeRole ?? null, 'customers.view') === 'own';
  const canViewThisCustomer = sameAgency && (!ownScopeOnly || leads.some((l) => l.assigneeId === user?.id));
  if (!canViewThisCustomer) return <NoPermissionState />;

  const propertyTitle = (propertyId: string | null) => (propertyId ? properties.find((p) => p.id === propertyId)?.title : undefined);

  return (
    <div className="mx-auto max-w-content">
      <EntityDetailHeader
        title={customer.name}
        status={<Badge tone={CUSTOMER_STAGE_MEANING[customer.relationshipStage]}>{t(CUSTOMER_STAGE_KEY[customer.relationshipStage])}</Badge>}
        meta={[
          { icon: 'user-check', label: customer.phone },
          { icon: 'users', label: `${leads.length} ${t('customerDetail.linkedLeads')}` },
        ]}
        primaryAction={
          <PermissionGate permission="customers.edit" mode="disable">
            <Button size="sm" onClick={() => setInteractionOpen(true)}>
              {t('customerDetail.action.logInteraction')}
            </Button>
          </PermissionGate>
        }
      />

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-text-primary">{t('customerDetail.section.relationships')}</h2>
        {leads.length === 0 ? (
          <EmptyState title={t('customerDetail.noLeads.title')} body={t('customerDetail.noLeads.body')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
            {leads.map((lead) => (
              <EntityCard
                key={lead.id}
                avatar={{ kind: 'record', icon: 'target' }}
                title={propertyTitle(lead.propertyId) ?? t('leads.noProperty')}
                status={<LeadStageBadge stage={lead.stage} />}
                onClick={() => navigate(`/leads/${lead.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-text-primary">{t('customerDetail.section.activity')}</h2>
        <ActivityTimeline
          items={activities.map((a) => ({
            id: a.id,
            actorKind: a.actorKind,
            actorName: a.actorName,
            action: a.detail,
            timestamp: new Date(a.timestamp).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US'),
          }))}
        />
      </div>

      <Drawer
        open={interactionOpen}
        onClose={() => setInteractionOpen(false)}
        title={t('customerDetail.logInteraction.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              if (!interactionText.trim()) return;
              logInteraction(interactionText.trim());
              setInteractionText('');
              setInteractionOpen(false);
            }}
          >
            {t('customerDetail.logInteraction.save')}
          </Button>
        }
      >
        <Field label={t('customerDetail.logInteraction.title')} labelHidden>
          {(field) => (
            <Textarea {...field} rows={4} placeholder={t('customerDetail.logInteraction.placeholder')} value={interactionText} onChange={(e) => setInteractionText(e.target.value)} />
          )}
        </Field>
      </Drawer>
    </div>
  );
}
