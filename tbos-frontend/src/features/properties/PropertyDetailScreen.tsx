import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProperty } from '@/lib/properties/useProperty';
import { usePropertyLookups } from '@/lib/properties/usePropertyLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { scopeFor } from '@/lib/permissions/evaluate';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { PropertyStatusBadge } from '@/components/tbos/status/PropertyStatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Drawer } from '@/components/ui/Drawer';
import { ConfirmationDialog } from '@/components/patterns/feedback/ConfirmationDialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { MetricWithExplanation } from '@/components/tbos/data/MetricWithExplanation';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { Tooltip } from '@/components/ui/Tooltip';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPriceSar, formatDate, PROPERTY_TYPE_KEY } from '@/features/properties/propertyFormat';
import { lifecycleMessage } from '@/features/properties/lifecycle';
import type { ComplianceRequirementStatus, PropertyMediaStatus } from '@/types/entities';
import type { StatusMeaning } from '@/types/status';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

const COMPLIANCE_MEANING: Record<ComplianceRequirementStatus, StatusMeaning> = {
  missing: 'neutral',
  pending_verification: 'info',
  verified: 'success',
  expiring: 'warning',
  expired: 'danger',
};
const COMPLIANCE_KEY: Record<ComplianceRequirementStatus, TranslationKey> = {
  missing: 'propertyDetail.compliance.requirement.missing',
  pending_verification: 'propertyDetail.compliance.requirement.pending_verification',
  verified: 'propertyDetail.compliance.requirement.verified',
  expiring: 'propertyDetail.compliance.requirement.expiring',
  expired: 'propertyDetail.compliance.requirement.expired',
};
const MEDIA_MEANING: Record<PropertyMediaStatus, StatusMeaning> = {
  missing: 'neutral',
  uploading: 'info',
  uploaded: 'info',
  processing: 'info',
  approved: 'success',
  rejected: 'danger',
};
const MEDIA_KEY: Record<PropertyMediaStatus, TranslationKey> = {
  missing: 'propertyDetail.media.status.missing',
  uploading: 'propertyDetail.media.status.uploading',
  uploaded: 'propertyDetail.media.status.uploaded',
  processing: 'propertyDetail.media.status.processing',
  approved: 'propertyDetail.media.status.approved',
  rejected: 'propertyDetail.media.status.rejected',
};

/**
 * PROP-02 — Property Detail (tbos-definition/07_INFORMATION_ARCHITECTURE.md:
 * "Overview / Media / Compliance / Performance / History (tabs, not sub-pages)").
 * Tab-level RBAC: Compliance edits require properties.compliance.edit even
 * for the property's own broker (research finding — OM has this specific
 * write scope despite being read-only on content generally).
 */
export function PropertyDetailScreen() {
  const { propertyId = '' } = useParams();
  const {
    property,
    isLoading,
    error,
    compliance,
    media,
    activities,
    performance,
    changePrice,
    publish,
    archive,
    markSoldRented,
    renewCompliance,
    resubmit,
    reassign,
    resolveComplianceRequirement,
  } = useProperty(propertyId);
  const { owners, teamMembers } = usePropertyLookups();
  const { user } = useAuth();
  const { can } = useHasPermission();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [priceOpen, setPriceOpen] = useState(false);
  const [priceValue, setPriceValue] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState<string | null>(null);
  const [resolveRef, setResolveRef] = useState('');

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
  if (!property) return <ErrorState error={{ code: 'not_found', message: 'This property could not be found.' }} />;

  // Record-level scope check — mirrors LeadDetailScreen's exact pattern
  // (TBOS_UI_INTEGRATION_AUDIT.md §1.J): route permission alone only answers
  // "can this role ever view a property," not "can this user view *this* one."
  // The agency check is a hard boundary independent of scope tier — an
  // agency-wide role (AO/OM/MM) is agency-wide within its OWN agency only;
  // without this check, direct URL navigation let any agency-wide role view
  // another agency's record entirely (TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md
  // P0-1 — found via live browser verification, not a test gap).
  const sameAgency = property.agencyId === user?.agencyId;
  const ownScopeOnly = scopeFor(user?.activeRole ?? null, 'properties.view') === 'own';
  const canViewThisProperty = sameAgency && (!ownScopeOnly || property.brokerId === user?.id);
  if (!canViewThisProperty) return <NoPermissionState />;

  const owner = owners.find((o) => o.id === property.ownerId);
  const broker = teamMembers.find((m) => m.id === property.brokerId);
  const message = lifecycleMessage(property, locale);

  const overviewTab = (
    <div className="flex flex-col gap-4">
      {(property.status === 'pending_compliance' || property.status === 'rejected' || property.status === 'expired') && (
        <Alert tone={property.status === 'rejected' || property.status === 'expired' ? 'danger' : 'warning'}>{message}</Alert>
      )}
      {(property.status === 'active' || property.status === 'expiring' || property.status === 'draft' || property.status === 'sold_rented' || property.status === 'archived') && message && (
        <Alert tone={property.status === 'expiring' ? 'warning' : 'neutral'}>{message}</Alert>
      )}
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <MetricWithExplanation
          label={t('properties.table.price')}
          value={formatPriceSar(property.priceSar, locale)}
          contract={{
            why: 'The current asking price for this listing.',
            howCalculated: 'Set by the broker; changes are logged to the History tab.',
            whatChanged: 'Updated whenever "Change price" is used.',
            recommendedAction: 'Compare against similar active listings in this district before adjusting.',
            businessImpact: 'A price that drifts far from district norms measurably extends time-on-market (per Today\'s district-comparison recommendations).',
          }}
        />
      </div>
    </div>
  );

  const complianceTab = (
    <div className="flex flex-col gap-3">
      {compliance.every((r) => r.status === 'verified') ? (
        <Alert tone="success">{t('propertyDetail.compliance.allVerified')}</Alert>
      ) : (
        (property.status === 'pending_compliance' || property.status === 'rejected') && <Alert tone="warning">{t('propertyDetail.compliance.blockedTitle')}</Alert>
      )}
      <ul className="flex flex-col gap-2">
        {compliance.map((req) => (
          <li key={req.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
            <div>
              <p className="font-semibold text-text-primary">{req.name}</p>
              {req.referenceNumber && <p className="text-caption text-text-secondary">{req.referenceNumber}</p>}
              {req.expiryDate && <p className="text-caption text-text-muted">{formatDate(req.expiryDate, locale)}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={COMPLIANCE_MEANING[req.status]}>{t(COMPLIANCE_KEY[req.status])}</Badge>
              {req.status !== 'verified' && (
                <PermissionGate permission="properties.compliance.edit" mode="disable">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setResolveOpen(req.id);
                      setResolveRef('');
                    }}
                  >
                    {t('propertyDetail.action.viewCompliance')}
                  </Button>
                </PermissionGate>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const mediaTab = (
    <div>
      {media.length === 0 ? (
        <p className="text-body text-text-muted">{t('propertyDetail.media.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="flex h-20 items-center justify-center rounded-sm bg-bg-sunken">
                <Icon name="building" className="h-8 w-8 text-icon-muted" />
              </div>
              <Badge tone={MEDIA_MEANING[item.status]}>{t(MEDIA_KEY[item.status])}</Badge>
              <p className="truncate text-caption text-text-secondary">{item.caption}</p>
              {item.issue && <p className="text-caption text-text-danger">{item.issue}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const performanceTab = (
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
      <MetricWithExplanation
        label={t('propertyDetail.performance.leadsGenerated')}
        value={String(performance?.leadsGenerated ?? 0)}
        contract={{
          why: 'How many leads have been linked to this specific listing.',
          howCalculated: 'A direct count of leads whose source property is this listing — never estimated.',
          whatChanged: 'Increases automatically whenever a new lead references this property.',
          recommendedAction: performance && performance.leadsGenerated === 0 ? 'Consider reviewing photos/pricing — zero leads on a live listing is worth investigating.' : 'Keep responding quickly to leads from this listing.',
          businessImpact: 'Leads generated is the clearest signal this listing is doing its job.',
        }}
      />
      {performance?.daysOnMarket !== null && performance?.daysOnMarket !== undefined ? (
        <MetricWithExplanation
          label={t('propertyDetail.performance.daysOnMarket')}
          value={String(performance.daysOnMarket)}
          contract={{
            why: 'How many days this listing has been live.',
            howCalculated: `Days since ${property.listedDate ? formatDate(property.listedDate, locale) : 'its listed date'}.`,
            whatChanged: 'Increases by one each day the listing stays active.',
            recommendedAction: 'A listing extended well beyond comparable district norms may signal overpricing.',
            businessImpact: 'Extended time-on-market measurably reduces buyer interest over time.',
          }}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-body font-semibold text-text-primary">{t('propertyDetail.performance.notEnoughData')}</p>
          <p className="mt-1 text-caption text-text-secondary">{t('propertyDetail.performance.notEnoughDataBody')}</p>
        </div>
      )}
    </div>
  );

  const historyTab = (
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

  const canReassign = can('properties.delete');

  return (
    <div className="mx-auto max-w-content">
      <EntityDetailHeader
        title={property.title}
        status={<PropertyStatusBadge status={property.status} />}
        meta={[
          { icon: 'building', label: t(PROPERTY_TYPE_KEY[property.propertyType]) },
          owner
            ? { icon: 'user-check', label: owner.name, onClick: () => navigate(`/owners/${owner.id}`) }
            : { icon: 'user-check', label: property.ownerId },
          { icon: 'user-check', label: broker?.name ?? property.brokerId },
          { icon: 'sparkles', label: `${property.district}, ${property.city}` },
        ]}
        primaryAction={
          property.status === 'draft' || property.status === 'pending_compliance' ? (
            <PermissionGate permission="properties.edit" mode="disable">
              <Button size="sm" onClick={() => publish()}>
                {t('propertyDetail.action.publish')}
              </Button>
            </PermissionGate>
          ) : property.status === 'rejected' ? (
            <PermissionGate permission="properties.edit" mode="disable">
              <Button size="sm" onClick={() => resubmit()}>
                {t('propertyDetail.action.resubmit')}
              </Button>
            </PermissionGate>
          ) : property.status === 'expiring' || property.status === 'expired' ? (
            <PermissionGate permission="properties.compliance.edit" mode="disable">
              <Button size="sm" onClick={() => renewCompliance()}>
                {t('propertyDetail.action.renew')}
              </Button>
            </PermissionGate>
          ) : property.status === 'active' ? (
            <PermissionGate permission="properties.edit" mode="disable">
              <Button
                size="sm"
                onClick={() => {
                  setPriceValue(String(property.priceSar));
                  setPriceOpen(true);
                }}
              >
                {t('propertyDetail.action.changePrice')}
              </Button>
            </PermissionGate>
          ) : undefined
        }
        secondaryActions={
          <div className="flex flex-wrap items-center gap-2">
            {property.status === 'active' && (
              <PermissionGate permission="properties.edit" mode="disable">
                <Button variant="secondary" size="sm" onClick={() => markSoldRented()}>
                  {t('propertyDetail.action.markSoldRented')}
                </Button>
              </PermissionGate>
            )}
            {canReassign ? (
              <Dropdown
                label={t('propertyDetail.action.reassign')}
                items={teamMembers
                  .filter((m) => m.id !== property.brokerId)
                  .map((m) => ({ id: m.id, label: m.name, onSelect: () => reassign({ toBrokerId: m.id, toBrokerName: m.name }) }))}
                trigger={({ toggle }) => (
                  <Button variant="secondary" size="sm" onClick={toggle}>
                    {t('propertyDetail.action.reassign')}
                  </Button>
                )}
              />
            ) : (
              <Tooltip content={t('permission.disabledHint')}>
                <Button variant="secondary" size="sm" disabled aria-disabled>
                  {t('propertyDetail.action.reassign')}
                </Button>
              </Tooltip>
            )}
            {property.status !== 'archived' && (
              <PermissionGate permission="properties.delete" mode="disable">
                <Button variant="danger" size="sm" onClick={() => setArchiveOpen(true)}>
                  {t('propertyDetail.action.archive')}
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      <div className="mt-6">
        <Tabs
          label={t('properties.list.title')}
          tabs={[
            { id: 'overview', label: t('propertyDetail.tab.overview'), content: overviewTab },
            { id: 'media', label: t('propertyDetail.tab.media'), content: mediaTab },
            { id: 'compliance', label: t('propertyDetail.tab.compliance'), content: complianceTab },
            { id: 'performance', label: t('propertyDetail.tab.performance'), content: performanceTab },
            { id: 'history', label: t('propertyDetail.tab.history'), content: historyTab },
          ]}
        />
      </div>

      <Drawer
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        title={t('propertyDetail.changePrice.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              const value = Number(priceValue);
              if (!value || value <= 0) return;
              changePrice(value);
              setPriceOpen(false);
            }}
          >
            {t('propertyDetail.changePrice.save')}
          </Button>
        }
      >
        <Field label={t('propertyDetail.changePrice.label')}>{(field) => <Input {...field} type="number" value={priceValue} onChange={(e) => setPriceValue(e.target.value)} />}</Field>
      </Drawer>

      <Drawer
        open={!!resolveOpen}
        onClose={() => setResolveOpen(null)}
        title={t('propertyDetail.resolve.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              if (!resolveOpen) return;
              resolveComplianceRequirement({ requirementId: resolveOpen, referenceNumber: resolveRef.trim() });
              setResolveOpen(null);
            }}
          >
            {t('propertyDetail.resolve.save')}
          </Button>
        }
      >
        <Field label={t('propertyDetail.resolve.label')}>{(field) => <Input {...field} value={resolveRef} onChange={(e) => setResolveRef(e.target.value)} />}</Field>
      </Drawer>

      <ConfirmationDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          archive();
          navigate('/properties');
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
