import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLead } from '@/lib/leads/useLead';
import { useLeadLookups } from '@/lib/leads/useLeadLookups';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { EntityDetailHeader } from '@/components/patterns/entity-detail/EntityDetailHeader';
import { LeadStageBadge } from '@/components/tbos/lead/LeadStageBadge';
import { MetricWithExplanation } from '@/components/tbos/data/MetricWithExplanation';
import { ActivityTimeline } from '@/components/tbos/activity/ActivityTimeline';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Drawer } from '@/components/ui/Drawer';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PermissionGate } from '@/components/tbos/permissions/PermissionGate';
import { Tooltip } from '@/components/ui/Tooltip';
import { NoPermissionState } from '@/components/feedback/NoPermissionState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatSlaLabel, SOURCE_KEY, LOST_REASONS } from '@/features/leads/leadFormat';
import type { LeadStage, LeadLostReason } from '@/types/entities';
import type { TranslationKey } from '@/lib/i18n/dictionaries';

const STAGE_OPTIONS: { id: LeadStage; key: TranslationKey }[] = [
  { id: 'new', key: 'leads.stage.new' },
  { id: 'assigned', key: 'leads.stage.assigned' },
  { id: 'contacted', key: 'leads.stage.contacted' },
  { id: 'qualified', key: 'leads.stage.qualified' },
  { id: 'negotiating', key: 'leads.stage.negotiating' },
  { id: 'won', key: 'leads.stage.won' },
];

/**
 * LEAD-03 — Lead Detail (tbos-blueprint/04_SCREEN_INVENTORY.md): identity +
 * context + timeline + status + actions + permissions + next step, all on one
 * screen. Primary actions: respond, change stage, reassign, convert to
 * Contract. Secondary: mark Lost (required reason), log outside response.
 */
export function LeadDetailScreen() {
  const { leadId = '' } = useParams();
  const { lead, isLoading, error, activities, changeStage, reassign, markLost, reopen, addNote, logOutsideResponse, scheduleFollowUp } = useLead(leadId);
  const { customers, properties, teamMembers } = useLeadLookups();
  const { user } = useAuth();
  const { can } = useHasPermission();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [logResponseOpen, setLogResponseOpen] = useState(false);
  const [logResponseText, setLogResponseText] = useState('');
  const [markLostOpen, setMarkLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState<LeadLostReason>('price');
  const [lostNote, setLostNote] = useState('');

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
  if (!lead) return <ErrorState error={{ code: 'not_found', message: 'This lead could not be found.' }} />;

  // Record-level scope check — RouteGuard only checks "can this role ever view
  // a lead" (no record context); LEAD-03's actual rule ("assignee has full
  // read/write; SM/AO can reassign; others have no access unless explicitly
  // shared" — tbos-blueprint/04_SCREEN_INVENTORY.md) is record-scoped and must
  // be enforced here (TBOS_UI_INTEGRATION_AUDIT.md §1.J). The agency check is
  // a hard boundary independent of scope tier — `can('leads.view.team')` only
  // says the role has team/agency-wide visibility *somewhere*, never that
  // this specific lead is in the viewer's own agency (TBOS_CONTRACTS_
  // COMPLIANCE_UX_AUDIT.md P0-1, found via live browser verification: an
  // Agency Owner could open another agency's lead by direct URL).
  const sameAgency = lead.agencyId === user?.agencyId;
  const canViewThisLead = sameAgency && (can('leads.view.team') || lead.assigneeId === user?.id);
  if (!canViewThisLead) return <NoPermissionState />;

  const customer = customers.find((c) => c.id === lead.customerId);
  const property = properties.find((p) => p.id === lead.propertyId);
  const assignee = teamMembers.find((m) => m.id === lead.assigneeId);

  const isLost = lead.stage === 'lost';
  const isWon = lead.stage === 'won';

  return (
    <div className="mx-auto max-w-content">
      <EntityDetailHeader
        title={
          customer ? (
            <button
              type="button"
              onClick={() => navigate(`/customers/${customer.id}`)}
              className="rounded text-start underline-offset-4 hover:underline"
            >
              {customer.name}
            </button>
          ) : (
            lead.customerId
          )
        }
        status={<LeadStageBadge stage={lead.stage} />}
        meta={[
          { icon: 'user-check', label: `${t('leads.assignedTo')}: ${assignee?.name ?? lead.assigneeId}` },
          property
            ? { icon: 'building', label: property.title, onClick: () => navigate(`/properties/${property.id}`) }
            : { icon: 'building', label: t('leads.noProperty') },
          { icon: 'sparkles', label: t(SOURCE_KEY[lead.source]) },
          ...(lead.slaMinutesRemaining !== null ? [{ icon: 'clock' as const, label: formatSlaLabel(lead.slaMinutesRemaining, locale) }] : []),
        ]}
        primaryAction={
          !isLost && !isWon ? (
            <PermissionGate permission="leads.respond" mode="disable">
              <Button size="sm" onClick={() => setLogResponseOpen(true)}>
                {t('leadDetail.action.respond')}
              </Button>
            </PermissionGate>
          ) : undefined
        }
        secondaryActions={
          <div className="flex flex-wrap items-center gap-2">
            {!isLost && !isWon && (can('leads.respond') ? (
              <Dropdown
                label={t('leadDetail.action.changeStage')}
                items={STAGE_OPTIONS.filter((s) => s.id !== lead.stage).map((s) => ({ id: s.id, label: t(s.key), onSelect: () => changeStage(s.id) }))}
                trigger={({ toggle }) => (
                  <Button variant="secondary" size="sm" onClick={toggle}>
                    {t('leadDetail.action.changeStage')}
                  </Button>
                )}
              />
            ) : (
              <Tooltip content={t('permission.disabledHint')}>
                <Button variant="secondary" size="sm" disabled aria-disabled>
                  {t('leadDetail.action.changeStage')}
                </Button>
              </Tooltip>
            ))}
            {can('leads.assign') ? (
              <Dropdown
                label={t('leadDetail.action.reassign')}
                items={teamMembers
                  .filter((m) => m.id !== lead.assigneeId)
                  .map((m) => ({ id: m.id, label: m.name, onSelect: () => reassign({ toAssigneeId: m.id, toAssigneeName: m.name }) }))}
                trigger={({ toggle }) => (
                  <Button variant="secondary" size="sm" onClick={toggle}>
                    {t('leadDetail.action.reassign')}
                  </Button>
                )}
              />
            ) : (
              <Tooltip content={t('permission.disabledHint')}>
                <Button variant="secondary" size="sm" disabled aria-disabled>
                  {t('leadDetail.action.reassign')}
                </Button>
              </Tooltip>
            )}
            {isLost ? (
              <PermissionGate permission="leads.respond" mode="disable">
                <Button variant="secondary" size="sm" onClick={() => reopen()}>
                  {t('leadDetail.action.reopen')}
                </Button>
              </PermissionGate>
            ) : (
              !isWon && (
                <PermissionGate permission="leads.respond" mode="disable">
                  <Button variant="danger" size="sm" onClick={() => setMarkLostOpen(true)}>
                    {t('leadDetail.action.markLost')}
                  </Button>
                </PermissionGate>
              )
            )}
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 tablet:grid-cols-3">
        <MetricWithExplanation
          label={t('leadDetail.score')}
          value={`${lead.score}/100`}
          contract={{
            why: `A higher score means stronger buying signal — this lead scored ${lead.score} out of 100.`,
            howCalculated: 'Deterministic scoring formula combining stated budget, response speed, and engagement history.',
            whatChanged: 'Recomputed at intake and after each meaningful interaction.',
            recommendedAction: lead.score >= 70 ? 'Prioritize this lead over lower-scored open leads in the pipeline.' : 'Keep in the normal follow-up rotation.',
            businessImpact: 'Higher-scored leads convert at a meaningfully higher rate — routing attention here first improves close rate.',
          }}
        />
      </div>

      {!isLost && !isWon && (
        <div className="mt-4 flex flex-wrap gap-2">
          <PermissionGate permission="leads.respond" mode="disable">
            <Button variant="secondary" size="sm" onClick={() => setNoteOpen(true)}>
              {t('leadDetail.action.addNote')}
            </Button>
          </PermissionGate>
          <PermissionGate permission="leads.respond" mode="disable">
            <Button variant="secondary" size="sm" onClick={() => setFollowUpOpen(true)}>
              {t('leadDetail.action.scheduleFollowUp')}
            </Button>
          </PermissionGate>
        </div>
      )}

      {isLost && lead.lostReason && (
        <div className="mt-4 rounded-md border border-border-danger bg-bg-danger-subtle p-3 text-body text-text-danger">
          {t('leadDetail.markLost.reasonLabel')}: {t(LOST_REASONS.find((r) => r.id === lead.lostReason)?.key ?? 'leadDetail.lostReason.other')}
          {lead.lostReasonNote && ` — ${lead.lostReasonNote}`}
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-h3 text-text-primary">{t('leadDetail.section.activity')}</h2>
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
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title={t('leadDetail.note.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              if (!noteText.trim()) return;
              addNote(noteText.trim());
              setNoteText('');
              setNoteOpen(false);
            }}
          >
            {t('leadDetail.note.save')}
          </Button>
        }
      >
        <Field label={t('leadDetail.note.title')} labelHidden>
          {(field) => <Textarea {...field} rows={4} placeholder={t('leadDetail.note.placeholder')} value={noteText} onChange={(e) => setNoteText(e.target.value)} />}
        </Field>
      </Drawer>

      <Drawer
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        title={t('leadDetail.followUp.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              if (!followUpDate || !followUpTitle.trim()) return;
              scheduleFollowUp({ dueDate: followUpDate, title: followUpTitle.trim() });
              setFollowUpDate('');
              setFollowUpTitle('');
              setFollowUpOpen(false);
            }}
          >
            {t('leadDetail.followUp.save')}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label={t('leadDetail.followUp.titleLabel')}>{(field) => <Input {...field} value={followUpTitle} onChange={(e) => setFollowUpTitle(e.target.value)} />}</Field>
          <Field label={t('leadDetail.followUp.dateLabel')}>{(field) => <Input {...field} type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />}</Field>
        </div>
      </Drawer>

      <Drawer
        open={logResponseOpen}
        onClose={() => setLogResponseOpen(false)}
        title={t('leadDetail.logResponse.title')}
        footer={
          <Button
            size="sm"
            onClick={() => {
              if (!logResponseText.trim()) return;
              logOutsideResponse(logResponseText.trim());
              setLogResponseText('');
              setLogResponseOpen(false);
            }}
          >
            {t('leadDetail.logResponse.save')}
          </Button>
        }
      >
        <Field label={t('leadDetail.logResponse.title')} labelHidden>
          {(field) => <Textarea {...field} rows={4} placeholder={t('leadDetail.logResponse.placeholder')} value={logResponseText} onChange={(e) => setLogResponseText(e.target.value)} />}
        </Field>
      </Drawer>

      <Drawer
        open={markLostOpen}
        onClose={() => setMarkLostOpen(false)}
        title={t('leadDetail.markLost.title')}
        footer={
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              markLost({ reason: lostReason, note: lostNote.trim() || undefined });
              setLostNote('');
              setMarkLostOpen(false);
              navigate('/leads');
            }}
          >
            {t('leadDetail.markLost.confirm')}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body text-text-primary">{t('leadDetail.markLost.consequence')}</p>
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
          <Field label={t('leadDetail.markLost.notePlaceholder')} labelHidden>
            {(field) => <Textarea {...field} rows={3} placeholder={t('leadDetail.markLost.notePlaceholder')} value={lostNote} onChange={(e) => setLostNote(e.target.value)} />}
          </Field>
        </div>
      </Drawer>
    </div>
  );
}
