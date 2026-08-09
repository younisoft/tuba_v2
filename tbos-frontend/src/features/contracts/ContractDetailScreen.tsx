import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useContract } from '@/lib/contracts/useContract';
import { useContractLookups } from '@/lib/contracts/useContractLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { scopeFor } from '@/lib/permissions/evaluate';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { propertiesApi } from '@/lib/api/endpoints/properties';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { ContractStatusBadge } from '@/components/tbos/status/ContractStatusBadge';
import { Alert } from '@/components/ui/Alert';
import { MetricWithExplanation } from '@/components/tbos/data/MetricWithExplanation';
import { ComplianceChecklist, type ComplianceChecklistItem } from '@/components/tbos/compliance/ComplianceChecklist';
import { ComplianceDocument } from '@/components/tbos/compliance/ComplianceDocument';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { Tooltip } from '@/components/ui/Tooltip';
import { EmptyState } from '@/components/feedback/EmptyState';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPriceSar } from '@/features/properties/propertyFormat';
import { CONTRACT_TYPE_KEY } from '@/features/contracts/contractFormat';
import { contractLifecycleMessage } from '@/features/contracts/lifecycle';

/**
 * CONT-02 — Contract Detail (tbos-blueprint/04_SCREEN_INVENTORY.md: "full
 * lifecycle of one contract — negotiation terms, compliance checklist,
 * documents"). No tabs — a single page, per the source's own component
 * mapping (no Tab Group listed for CONT-02, unlike PROP-02/OWN-02) and
 * information architecture (Contracts has no documented sub-structure)
 * — TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md P1-1.
 */
export function ContractDetailScreen() {
  const { contractId = '' } = useParams();
  const { contract, isLoading, error, compliance, documents, activities, startComplianceChecklist, resolveComplianceItem, activate, renew, declineRenewal, cancel } =
    useContract(contractId);
  const { customers, owners, properties, leads } = useContractLookups();
  const { user } = useAuth();
  const { can } = useHasPermission();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const propertyComplianceQuery = useQuery({
    queryKey: ['property', contract?.propertyId, 'compliance'],
    queryFn: async () => {
      if (!contract) return [];
      const res = await propertiesApi.compliance(contract.propertyId);
      if (res.status === 'error') throw res.error;
      return res.data;
    },
    enabled: !!contract,
  });

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
  if (!contract) return <ErrorState error={{ code: 'not_found', message: 'This contract could not be found.' }} />;

  // Record-level scope check — mirrors LeadDetailScreen/PropertyDetailScreen/
  // CustomerDetailScreen/OwnerDetailScreen (TBOS_CONTRACTS_COMPLIANCE_UX_AUDIT.md):
  // a Contract has no stored assigneeId, so 'own' scope is derived through
  // whether the viewer is assigned to the contract's linked Lead. The agency
  // check is a hard boundary independent of scope tier — found via live
  // browser verification (an Agency Owner could open another agency's
  // contract by direct URL, since only the own-vs-agency scope *tier* was
  // checked, never the record's actual agencyId): the same P0 gap turned out
  // to be pre-existing in Property/Customer/Owner Detail too, fixed here for
  // all four in one pass (master prompt §10/§30 — RBAC is P0, regressions
  // across shared architecture must be caught, not just this phase's screen).
  const sameAgency = contract.agencyId === user?.agencyId;
  const ownScopeOnly = scopeFor(user?.activeRole ?? null, 'contracts.view') === 'own';
  const lead = leads.find((l) => l.id === contract.leadId);
  const canViewThisContract = sameAgency && (!ownScopeOnly || lead?.assigneeId === user?.id);
  if (!canViewThisContract) return <NoPermissionState />;

  const customer = customers.find((c) => c.id === contract.customerId);
  const owner = owners.find((o) => o.id === contract.ownerId);
  const property = properties.find((p) => p.id === contract.propertyId);

  const propertyCompliant = (propertyComplianceQuery.data ?? []).length > 0 && (propertyComplianceQuery.data ?? []).every((r) => r.status === 'verified' || r.status === 'expiring');
  const blockedItem = compliance.find((i) => i.status === 'blocked');
  const mismatchDoc = documents.find((d) => d.status === 'mismatch');
  const allItemsComplete = compliance.length > 0 && compliance.every((i) => i.status === 'complete');
  const canActivate = allItemsComplete && !mismatchDoc && propertyCompliant;

  const activationBlockedReason = blockedItem?.blockedReason ?? (mismatchDoc ? t('contractDetail.compliance.mismatchBlocking') : !propertyCompliant ? t('contractDetail.compliance.propertyBlocking') : '');

  const checklistItems: ComplianceChecklistItem[] = [
    {
      id: 'linked-property',
      requirement: t('contractDetail.compliance.linkedProperty'),
      status: propertyComplianceQuery.isLoading ? 'incomplete' : propertyCompliant ? 'complete' : 'blocked',
      blockedReason: !propertyComplianceQuery.isLoading && !propertyCompliant ? t('contractDetail.compliance.propertyBlocking') : undefined,
    },
    ...compliance.map((item) => ({
      ...item,
      action:
        item.status === 'blocked' && contract.status === 'pending_compliance' ? (
          <PermissionGate permission="contracts.approve" mode="disable">
            <Button size="sm" variant="secondary" onClick={() => resolveComplianceItem(item.id)}>
              {t('contractDetail.action.resolve')}
            </Button>
          </PermissionGate>
        ) : undefined,
    })),
  ];

  return (
    <div className="mx-auto max-w-content">
      <EntityDetailHeader
        title={
          customer ? (
            <button type="button" onClick={() => navigate(`/customers/${customer.id}`)} className="rounded text-start underline-offset-4 hover:underline">
              {customer.name}
            </button>
          ) : (
            contract.customerId
          )
        }
        status={<ContractStatusBadge status={contract.status} />}
        meta={[
          { icon: 'file-text', label: t(CONTRACT_TYPE_KEY[contract.type]) },
          property
            ? { icon: 'building', label: property.title, onClick: () => navigate(`/properties/${property.id}`) }
            : { icon: 'building', label: contract.propertyId },
          owner ? { icon: 'user-check', label: owner.name, onClick: () => navigate(`/owners/${owner.id}`) } : { icon: 'user-check', label: contract.ownerId },
          lead ? { icon: 'target', label: t('contractDetail.originatingLead'), onClick: () => navigate(`/leads/${lead.id}`) } : { icon: 'target', label: contract.leadId },
        ]}
        primaryAction={
          contract.status === 'draft' ? (
            <PermissionGate permission="contracts.approve" mode="disable">
              <Button size="sm" onClick={() => startComplianceChecklist()}>
                {t('contractDetail.action.startChecklist')}
              </Button>
            </PermissionGate>
          ) : contract.status === 'pending_compliance' ? (
            can('contracts.approve') ? (
              canActivate ? (
                <Button size="sm" onClick={() => activate()}>
                  {t('contractDetail.action.activate')}
                </Button>
              ) : (
                <Tooltip content={activationBlockedReason}>
                  <Button size="sm" disabled aria-disabled>
                    {t('contractDetail.action.activate')}
                  </Button>
                </Tooltip>
              )
            ) : (
              <Tooltip content={t('permission.disabledHint')}>
                <Button size="sm" disabled aria-disabled>
                  {t('contractDetail.action.activate')}
                </Button>
              </Tooltip>
            )
          ) : contract.status === 'renewal_due' ? (
            <PermissionGate permission="contracts.approve" mode="disable">
              <Button size="sm" onClick={() => renew()}>
                {t('contractDetail.action.renew')}
              </Button>
            </PermissionGate>
          ) : undefined
        }
        secondaryActions={
          <div className="flex flex-wrap items-center gap-2">
            {contract.status === 'renewal_due' && (
              <PermissionGate permission="contracts.approve" mode="disable">
                <Button variant="secondary" size="sm" onClick={() => setDeclineOpen(true)}>
                  {t('contractDetail.action.declineRenewal')}
                </Button>
              </PermissionGate>
            )}
            {(contract.status === 'draft' || contract.status === 'pending_compliance' || contract.status === 'active') && (
              <PermissionGate permission="contracts.approve" mode="disable">
                <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                  {t('contractDetail.action.cancel')}
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      <div className="mt-6">
        <Alert tone={contract.status === 'cancelled' ? 'danger' : contract.status === 'renewal_due' ? 'warning' : contract.status === 'pending_compliance' ? 'info' : 'success'}>
          {contractLifecycleMessage(contract, locale, blockedItem?.requirement ?? blockedItem?.blockedReason)}
        </Alert>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <MetricWithExplanation
          label={t('contracts.table.value')}
          value={formatPriceSar(contract.valueSar, locale)}
          contract={{
            why: 'The contract value captured at terms negotiation.',
            howCalculated: 'Set when terms are captured; not itemized further in this phase.',
            whatChanged: 'Static once the contract is created.',
            recommendedAction: 'Compare against the linked property’s listed price for context.',
            businessImpact: 'The basis Finance uses to derive revenue/commission once this contract closes.',
          }}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-text-primary">{t('contractDetail.section.compliance')}</h2>
        <ComplianceChecklist items={checklistItems} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-text-primary">{t('contractDetail.section.documents')}</h2>
        {documents.length === 0 ? (
          <EmptyState title={t('contractDetail.noDocuments.title')} body={t('contractDetail.noDocuments.body')} />
        ) : (
          <div className="flex flex-col gap-2">
            {documents.map((doc) => (
              <div key={doc.id}>
                <ComplianceDocument fileName={doc.fileName} status={doc.status} />
                {doc.status === 'mismatch' && doc.mismatchDetail && (
                  <p className="mt-1 ps-3 text-caption text-text-danger">
                    {t('contractDetail.compliance.mismatchField')}: {doc.mismatchDetail.field} — {t('contractDetail.compliance.mismatchExpected')} "{doc.mismatchDetail.expected}",{' '}
                    {t('contractDetail.compliance.mismatchExtracted')} "{doc.mismatchDetail.extracted}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-text-primary">{t('contractDetail.section.activity')}</h2>
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
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t('contractDetail.cancel.title')}
        footer={
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!cancelReason.trim()) return;
              cancel(cancelReason.trim());
              setCancelReason('');
              setCancelOpen(false);
            }}
          >
            {t('contractDetail.action.cancel')}
          </Button>
        }
      >
        <Field label={t('contractDetail.cancel.reasonLabel')}>
          {(field) => <Textarea {...field} rows={3} placeholder={t('contractDetail.cancel.reasonPlaceholder')} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />}
        </Field>
      </Drawer>

      <Drawer
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        title={t('contractDetail.declineRenewal.title')}
        footer={
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!declineReason.trim()) return;
              declineRenewal(declineReason.trim());
              setDeclineReason('');
              setDeclineOpen(false);
            }}
          >
            {t('contractDetail.action.declineRenewal')}
          </Button>
        }
      >
        <Field label={t('contractDetail.declineRenewal.reasonLabel')}>
          {(field) => (
            <Textarea {...field} rows={3} placeholder={t('contractDetail.declineRenewal.reasonPlaceholder')} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
          )}
        </Field>
      </Drawer>
    </div>
  );
}
