import type { Lead, Task, Customer, Property } from '@/types/entities';
import type { TodayRecommendation } from '@/types/today';
import { computeLeadPriority } from '@/lib/leads/priority';

const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export interface RecommendationInputs {
  leads: Lead[];
  tasks: Task[];
  customers: Customer[];
  properties: Property[];
  currentUserId: string;
}

/**
 * TODAY-01's ranking algorithm, applied to real mock data only — every
 * recommendation traces to an actual Lead or Task record, never fabricated
 * copy (tbos-definition/15_DECISION_SUPPORT_SYSTEM.md ranking: time-sensitivity
 * → business value → actionability → persona relevance; Critical pinned above
 * the normal order per tbos-blueprint/04_SCREEN_INVENTORY.md TODAY-01).
 */
export function computeRecommendations({ leads, tasks, customers, properties, currentUserId }: RecommendationInputs): TodayRecommendation[] {
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? 'Unknown customer';
  const propertyTitle = (id: string | null) => (id ? properties.find((p) => p.id === id)?.title : undefined);

  const recommendations: TodayRecommendation[] = [];

  // Lead triage — open leads approaching or past their SLA window.
  for (const lead of leads) {
    if (lead.stage === 'won' || lead.stage === 'lost') continue;
    if (lead.slaMinutesRemaining === null) continue;
    const priority = computeLeadPriority(lead);
    if (priority !== 'critical' && priority !== 'high') continue;

    const name = customerName(lead.customerId);
    const property = propertyTitle(lead.propertyId);
    recommendations.push({
      id: `rec-lead-${lead.id}`,
      category: 'lead_triage',
      priority,
      what: `Contact ${name}${property ? ` about ${property}` : ''}`,
      why:
        priority === 'critical'
          ? `This lead is within ${lead.slaMinutesRemaining} minutes of an SLA breach.`
          : `This lead is ${lead.slaMinutesRemaining} minutes from its SLA window closing.`,
      impact: 'Cold leads rarely re-engage once an SLA breaches — this opportunity is at risk of going silent.',
      recommendedAction: 'Call or message now, then log the outcome on the lead.',
      deadline: `${lead.slaMinutesRemaining} min remaining`,
      aiRecommendation: `Scored ${lead.score}/100 — ${lead.score >= 70 ? 'high engagement signal, worth prioritizing over lower-scored leads in your queue' : 'moderate signal, still within SLA-priority order'}.`,
      expectedOutcome: 'Higher lead-to-contact conversion; keeps the pipeline SLA-healthy.',
      linkTo: `/leads/${lead.id}`,
      linkLabel: 'Open lead',
    });
  }

  // Response priority — overdue tasks linked to a lead, assigned to this user.
  for (const task of tasks) {
    if (task.status !== 'overdue' || task.assigneeId !== currentUserId) continue;
    const linkedLead = task.linkedRecordId ? leads.find((l) => l.id === task.linkedRecordId) : undefined;
    const isCompliance = /compliance|license|fal|nafath/i.test(task.title);
    recommendations.push({
      id: `rec-task-${task.id}`,
      category: isCompliance ? 'compliance' : 'response_priority',
      priority: 'high',
      what: task.title,
      why: `Overdue since ${task.dueDate}.`,
      impact: isCompliance ? 'An expired compliance document can force a listing dark until resolved.' : 'Overdue follow-ups are the most common reason a warm lead goes cold.',
      recommendedAction: 'Complete this task now, or reschedule it if it is no longer relevant.',
      deadline: `Due ${task.dueDate}`,
      expectedOutcome: isCompliance ? 'Keeps the listing eligible and compliant.' : 'Keeps the relationship active and the pipeline moving.',
      linkTo: linkedLead ? `/leads/${linkedLead.id}` : '/tasks',
      linkLabel: linkedLead ? 'Open lead' : 'Open tasks',
    });
  }

  // Opportunity — high-score leads deep in the pipeline, no SLA pressure, worth a deliberate push.
  for (const lead of leads) {
    if (lead.stage !== 'negotiating' || lead.score < 80) continue;
    const name = customerName(lead.customerId);
    const property = propertyTitle(lead.propertyId);
    recommendations.push({
      id: `rec-opportunity-${lead.id}`,
      category: 'opportunity',
      priority: 'medium',
      what: `Push ${name}'s negotiation toward close`,
      why: `Scored ${lead.score}/100 and already in Negotiating${property ? ` on ${property}` : ''} — one of the strongest open opportunities in the pipeline.`,
      impact: 'High-scoring negotiations that stall lose momentum and are more likely to walk to a competitor.',
      recommendedAction: 'Review the offer terms and schedule a closing call.',
      aiRecommendation: 'High deal-value signal based on score and stage — prioritize over lower-scored, earlier-stage leads.',
      expectedOutcome: 'Improves close rate on the pipeline’s highest-value active deals.',
      linkTo: `/leads/${lead.id}`,
      linkLabel: 'Open lead',
    });
  }

  return recommendations.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}
