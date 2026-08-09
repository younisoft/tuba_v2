import type { LeadPriority } from './entities';

/**
 * Today (TODAY-01) renders exactly this shape — the five-question-adjacent
 * contract tbos-blueprint/07_DECISION_SUPPORT_SYSTEM.md's "the rule" requires
 * of every widget: "What / Why / Impact / Recommended Action / Priority /
 * Deadline / AI Recommendation / Expected Business Outcome." Categories are
 * trimmed to the ones this slice can honestly back with real data (Pricing
 * and Team Performance still need modules this build doesn't reach — master
 * prompt §56). 'content_quality' is one of the seven canonical categories in
 * tbos-definition/15_DECISION_SUPPORT_SYSTEM.md — added now that Marketing
 * (MKT-03) exists to honestly back it (TBOS_MARKETING_UX_AUDIT.md §12).
 */
export type TodayRecommendationCategory = 'lead_triage' | 'response_priority' | 'compliance' | 'opportunity' | 'relationship' | 'content_quality';

export interface TodayRecommendation {
  id: string;
  category: TodayRecommendationCategory;
  priority: LeadPriority;
  /** Q1 — what is this. */
  what: string;
  /** Q2 — why it's here. */
  why: string;
  /** Q3 — what happens if ignored. */
  impact: string;
  /** Q4 — the one-click-or-close next step. */
  recommendedAction: string;
  /** Q5 — a stated deadline, when one exists (SLA window, task due date). */
  deadline?: string;
  /** Q6 — only present when AI actually produced this entry (Lead Scoring),
   * never fabricated for entries that are plain rule-based triage. */
  aiRecommendation?: string;
  /** Q7 — why resolving this matters to deal flow/revenue. */
  expectedOutcome: string;
  linkTo: string;
  linkLabel: string;
}
