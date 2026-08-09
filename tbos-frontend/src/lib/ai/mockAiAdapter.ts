import { simulateLatency } from '@/mocks/api/latency';
import type { AiAuditEvent, AiRequest, AiResponse, AiProviderContract } from './types';

/**
 * Proves the AI architecture end-to-end (master prompt §23: "Mock responses may
 * be used only to prove the architecture") without any real model call or
 * business-feature AI. Every request appends to an in-memory audit log so
 * AICP-02 has something real to render. A future real provider implements the
 * same AiProviderContract — nothing above this file changes.
 */
const auditLog: AiAuditEvent[] = [];

const CANNED_RESPONSES: Record<string, string> = {
  recommendation: 'Based on recent activity, following up with your two SLA-at-risk leads first would have the highest impact today.',
  explanation: 'This is ranked here because it combines lead score, SLA time remaining, and how long it has sat without a response.',
  generation: 'A well-maintained villa in a sought-after district, offering generous living space and easy access to the city centre.',
  summarization: 'Three leads progressed this week; one converted to a contract, one was lost due to budget mismatch.',
  classification: 'This inquiry looks like a qualified buyer lead (confidence: medium) based on message content and stated budget.',
  automation: 'This rule would route new inbound leads to the least-loaded consultant on your team, capacity-aware.',
};

async function request(req: AiRequest): Promise<AiResponse> {
  await simulateLatency(600);

  const response: AiResponse = {
    id: crypto.randomUUID(),
    kind: req.kind,
    text: CANNED_RESPONSES[req.kind] ?? 'AI assistance unavailable right now — continue manually.',
    confidence: 'medium',
    citedSource: 'mock-foundation',
  };

  auditLog.unshift({
    id: response.id,
    timestamp: new Date().toISOString(),
    kind: req.kind,
    screenId: req.context.screenId,
    userId: req.context.userId,
    prompt: req.prompt,
    response: response.text,
    confidence: response.confidence,
    reviewStatus: 'pending',
  });

  return response;
}

export const mockAiAdapter: AiProviderContract = {
  request,
  auditLog: () => auditLog,
};
