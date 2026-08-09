/**
 * The five-question contract every metric, score, status, and AI output must
 * satisfy before shipping — tbos-definition/14_EXPLAINABILITY_SYSTEM.md.
 * "A metric that cannot answer all five is not ready to ship." This is
 * reusable infrastructure only; no screen populates it with real content in
 * this foundation phase (no business features), but every future metric/score/
 * recommendation surface consumes the same shape via ExplainabilityPopover.
 */
export interface ExplainabilityContract {
  /** Question 1 — what does this number/status mean in plain language? */
  why: string;
  /** Question 2 — what inputs produced it, stated simply? */
  howCalculated: string;
  /** Question 3 — how does this compare to last time / a baseline / "normal"? */
  whatChanged: string;
  /** Question 4 — what should the broker do about it, if anything? */
  recommendedAction: string;
  /** Question 5 — why does this matter to their deal flow/revenue? */
  businessImpact: string;
  /** Optional deep link into the Knowledge module for a broker who wants more
   * than the inline answer (design-system/14_EXPLAINABILITY_SYSTEM.md
   * "Explainability and the Knowledge module"). */
  knowledgeArticleId?: string;
}
