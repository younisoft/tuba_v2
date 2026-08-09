import { COMPONENT_REGISTRY } from './componentRegistry';

/**
 * The Screen → Component traceability matrix — master prompt §45, transcribed
 * verbatim from tbos-blueprint/05_COMPONENT_MAPPING.md §2's "Screen → component
 * matrix" (component names exactly as that document names them). This is the
 * machine-readable form of that table: for a given screen ID, which
 * components a future implementation must consume rather than invent.
 *
 * Not every screen in SCREEN_REGISTRY has a row here — 05_COMPONENT_MAPPING.md
 * §2 only enumerates the screens it explicitly maps; Platform Console (PC-01–05)
 * is out of that document's scope this phase (light-spec, see design-system/
 * 17_COMPONENT_CATALOG.md's own note), so it's covered separately below using
 * design-system/17_COMPONENT_CATALOG.md's "Platform Console — light spec" list.
 */
export const SCREEN_COMPONENT_MAP: Record<string, string[]> = {
  'HOME-01': ['Metric Tile', 'Explainability Popover', 'Empty State Block', 'Skeleton Loader'],
  'TODAY-01': ['Recommendation Card', 'Empty State Block', 'Skeleton Loader', 'SLA Timer'],
  'TASK-01': ['Record List', 'Form Field', 'Confirmation Dialog', 'Inline Success Confirmation'],
  'TASK-02': ['Record List', 'Form Field', 'Confirmation Dialog', 'Inline Success Confirmation'],
  'PROP-01': ['Record List', 'Filter/Sort Bar', 'Bulk Action Bar', 'Status Badge', 'Empty State Block'],
  'PROJ-01': ['Record List', 'Filter/Sort Bar', 'Bulk Action Bar', 'Status Badge', 'Empty State Block'],
  'PROP-02': ['Detail Header', 'Tab Group', 'Status Badge', 'Price/Status History Timeline', 'Slide-over Panel', 'AI Suggestion Inline Block', 'Confirmation Dialog'],
  'PROJ-02': ['Detail Header', 'Tab Group', 'Status Badge', 'Price/Status History Timeline', 'Slide-over Panel', 'AI Suggestion Inline Block', 'Confirmation Dialog'],
  'PROP-03': ['Wizard/Stepper', 'Form Field', 'File/Media Uploader', 'AI Suggestion Inline Block', 'Confidence Indicator'],
  'PROJ-03': ['Wizard/Stepper', 'Form Field', 'File/Media Uploader', 'AI Suggestion Inline Block', 'Confidence Indicator'],
  'LEAD-01': ['Kanban Board', 'SLA Timer', 'Status Badge', 'Filter/Sort Bar', 'Bulk Action Bar'],
  'LEAD-02': ['Record List', 'SLA Timer', 'Status Badge'],
  'LEAD-03': ['Detail Header', 'AI Suggestion Inline Block', 'Confidence Indicator', 'SLA Timer', 'Slide-over Panel', 'Confirmation Dialog'],
  'CUST-01': ['Record List', 'Filter/Sort Bar', 'Empty State Block'],
  'OWN-01': ['Record List', 'Filter/Sort Bar', 'Empty State Block'],
  'CUST-02': ['Detail Header', 'Price/Status History Timeline', 'AI Suggestion Inline Block'],
  'OWN-02': ['Detail Header', 'Tab Group', 'Marketing Request Card'],
  'OWN-03': ['Marketing Request Card', 'Status Badge', 'Empty State Block'],
  'CONT-01': ['Record List', 'Status Badge', 'Filter/Sort Bar'],
  'CONT-02': ['Detail Header', 'Compliance Checklist', 'Status Badge', 'AI Suggestion Inline Block', 'Confirmation Dialog'],
  'MKT-01': ['Record List', 'Empty State Block', 'Status Badge'],
  'MKT-02': ['Quota/Balance Meter', 'AI Suggestion Inline Block', 'Confirmation Dialog', 'Empty State Block'],
  'MKT-03': ['Record List', 'Status Badge', 'Empty State Block'],
  'FIN-01': ['Data Table', 'Explainability Popover'],
  'WAL-01': ['Quota/Balance Meter', 'Metric Tile'],
  'WAL-02': ['Form Field', 'Confirmation Dialog', 'Inline Success Confirmation'],
  'ANL-01': ['Metric Tile', 'Data Table', 'Explainability Popover'],
  'RPT-01': ['Data Table', 'Skeleton Loader', 'Error Inline/Banner'],
  'RPT-02': ['Data Table', 'Skeleton Loader', 'Error Inline/Banner'],
  'AUTO-01': ['Toggle Switch', 'Form Field', 'Status Badge'],
  'AUTO-02': ['Toggle Switch', 'Form Field', 'Status Badge'],
  'AICP-01': ['AI Conversation Thread', 'Confidence Indicator'],
  'AICP-02': ['Data Table', 'Explainability Popover'],
  'NOTIF-01': ['Notification List Item', 'Empty State Block'],
  'NOTIF-02': ['Toggle Switch'],
  'KB-01': ['Record List', 'Empty State Block'],
  'KB-02': ['Record List', 'Empty State Block'],
  'SET-01': ['Form Field', 'Inline Success Confirmation'],
  'SET-03': ['Form Field', 'Inline Success Confirmation'],
  'SET-02': ['Permission Scope Selector', 'Confirmation Dialog'],
  'SET-04': ['Compliance Checklist', 'File/Media Uploader', 'AI Suggestion Inline Block'],
  'GS-01': ['Command/Search Bar', 'Record List', 'Empty State Block'],
  'CMD-01': ['Command/Search Bar', 'Record List', 'Empty State Block'],
  'QA-01': [], // bespoke minimal panel — no list/table components needed, per 05_COMPONENT_MAPPING.md §2
  'ONB-01': ['Wizard/Stepper', 'Form Field'],
  // Platform Console — design-system/17_COMPONENT_CATALOG.md "light spec": reuses
  // Record List, Data Table, Form Field, Confirmation Dialog, Status Badge.
  'PC-01': ['Record List', 'Status Badge', 'Confirmation Dialog'],
  'PC-02': ['Record List', 'Form Field'],
  'PC-03': ['Data Table', 'Status Badge'],
  'PC-04': ['Record List', 'Status Badge'],
  'PC-05': ['Form Field', 'Confirmation Dialog'],
};

/** Maps a blueprint component *name* (as written in 05_COMPONENT_MAPPING.md)
 * to this library's registry `name` — many are 1:1, some blueprint names are
 * satisfied by a more specific built component (e.g. "Status Badge" for a
 * Lead screen resolves to LeadStageBadge, which itself wraps StatusBadge). */
const NAME_ALIASES: Record<string, string[]> = {
  'Record List': ['DataTable'],
  'Data Table': ['DataTable'],
  'Filter/Sort Bar': ['FilterBar'],
  'Bulk Action Bar': ['BulkActionBar'],
  'Status Badge': ['StatusBadge', 'LeadStageBadge', 'PropertyStatusBadge', 'ContractStatusBadge', 'ComplianceStatus'],
  'Empty State Block': ['EmptyState'],
  'Skeleton Loader': ['Skeleton'],
  'Metric Tile': ['MetricCard', 'MetricWithExplanation'],
  'Explainability Popover': ['ExplainabilityPopover'],
  'Recommendation Card': ['RecommendationCard'], // built this phase — TBOS_UI_INTEGRATION_AUDIT.md §1.E / §2 item 2
  'SLA Timer': ['SlaTimer'], // built this phase — TBOS_UI_INTEGRATION_AUDIT.md §1.E / §2 item 1
  'Form Field': ['Field'],
  'Confirmation Dialog': ['ConfirmationDialog'],
  'Inline Success Confirmation': ['Alert'], // Alert(tone success) is the closest built primitive; a dedicated toast-with-next-step component is deferred
  'Detail Header': ['EntityDetailHeader'],
  'Tab Group': ['Tabs'],
  'Price/Status History Timeline': ['ActivityTimeline'],
  'Slide-over Panel': ['Drawer'],
  'AI Suggestion Inline Block': ['AISuggestion'],
  'Wizard/Stepper': ['FormWizard', 'StepIndicator'],
  'File/Media Uploader': [], // not yet built — see report "Known Limitations"
  'Confidence Indicator': ['AIConfidence'],
  'Kanban Board': ['KanbanBoard'],
  'Marketing Request Card': [], // not yet built — deferred, EntityCard is the composable substitute
  'Compliance Checklist': ['ComplianceChecklist'],
  'Quota/Balance Meter': ['QuotaBalanceMeter'],
  'Toggle Switch': ['Switch'],
  'AI Conversation Thread': ['AIConversationThread'],
  'Notification List Item': ['NotificationItem'],
  'Permission Scope Selector': [], // not yet built — see report "Known Limitations"
  'Command/Search Bar': ['CommandPalette'],
  'Error Inline/Banner': ['Alert', 'ErrorState'],
};

const REGISTRY_NAMES = new Set(COMPONENT_REGISTRY.map((c) => c.name));

export interface ScreenComponentStatus {
  blueprintName: string;
  resolvedComponentNames: string[];
  implemented: boolean;
}

/** For a screen ID, resolves each required blueprint component name against
 * the actual registry, so the matrix is checkable, not just documentation. */
export function componentStatusForScreen(screenId: string): ScreenComponentStatus[] {
  const required = SCREEN_COMPONENT_MAP[screenId] ?? [];
  return required.map((blueprintName) => {
    const candidates = NAME_ALIASES[blueprintName] ?? [blueprintName];
    const resolved = candidates.filter((name) => REGISTRY_NAMES.has(name));
    return { blueprintName, resolvedComponentNames: resolved, implemented: resolved.length > 0 };
  });
}
