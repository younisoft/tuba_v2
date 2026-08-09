/**
 * AI foundation types — tbos-definition/10_AI_STRATEGY.md's capability list
 * (recommendation/explanation/generation/summarization/classification/automation)
 * all flow through this one shape so AICP-02's audit log can cover every AI
 * surface platform-wide, not just the Copilot conversation screen.
 */
export type AiConfidence = 'high' | 'medium' | 'low';

export type AiActionKind = 'recommendation' | 'explanation' | 'generation' | 'summarization' | 'classification' | 'automation';

/** Alias matching the master prompt's exact naming ("AiAction") — AiActionKind
 * is the descriptive name used internally; this exists purely for that literal
 * name to resolve, e.g. `import type { AiAction } from '@/lib/ai/types'`. */
export type AiAction = AiActionKind;

export interface AiContext {
  screenId: string;
  /** RBAC-scoped grounding — Copilot never answers with data the user couldn't
   * otherwise see (tbos-blueprint/04_SCREEN_INVENTORY.md AICP-01). */
  userId: string;
  agencyId: string;
}

export interface AiRequest {
  kind: AiActionKind;
  prompt: string;
  context: AiContext;
}

export interface AiResponse {
  id: string;
  kind: AiActionKind;
  text: string;
  confidence: AiConfidence;
  /** Every response cites its grounding source (tbos-blueprint/04_SCREEN_INVENTORY.md
   * AICP-01 Success state) — Knowledge article ID, record ID, or 'mock-foundation'
   * for this phase's proof-of-architecture responses. */
  citedSource: string;
}

export interface AiAuditEvent {
  id: string;
  timestamp: string;
  kind: AiActionKind;
  screenId: string;
  userId: string;
  prompt: string;
  response: string;
  confidence: AiConfidence;
  /** 'pending' until a human accepts/edits/flags it — Generated/Accepted states
   * from tbos-blueprint/06_STATE_ARCHITECTURE.md §2 "AI action states". */
  reviewStatus: 'pending' | 'accepted' | 'edited' | 'flagged';
}

export interface AiProviderContract {
  request: (req: AiRequest) => Promise<AiResponse>;
  auditLog: (agencyId: string) => AiAuditEvent[];
}
