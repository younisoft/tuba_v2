import { useState } from 'react';
import { ScreenPlaceholder } from '@/components/screens/ScreenPlaceholder';
import { SCREEN_MAP } from '@/registry/screens/screenRegistry';
import { useAi } from '@/lib/ai/AiProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ExplainabilityPopover } from '@/components/ai/ExplainabilityPopover';
import type { AiResponse } from '@/lib/ai/types';

/**
 * AICP-01 gets one deliberate exception to the placeholder-only rule: the master
 * prompt explicitly asks the AI foundation to *work*, with mock responses
 * sanctioned "only to prove the architecture" (§23). Everything below is
 * infrastructure proof, not a real Copilot feature — no business logic, no
 * persisted conversation, no other screen gets this treatment.
 */
export function AiCopilotScreen() {
  const { ask } = useAi();
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    setLoading(true);
    try {
      const res = await ask('recommendation', 'What should I focus on today?', 'AICP-01');
      setResponse(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <ScreenPlaceholder screen={SCREEN_MAP['AICP-01']} />

      <div className="mx-auto max-w-2xl rounded-lg border border-border bg-bg-surface p-4">
        <h2 className="mb-1 text-h3 text-text-primary">AI foundation proof</h2>
        <p className="mb-4 text-caption text-text-secondary">
          Demonstrates the AiProvider → mock adapter → AICP-02 audit log path end-to-end with a canned response.
        </p>
        <Button size="sm" onClick={handleAsk} disabled={loading}>
          {loading ? <Spinner className="h-4 w-4 border-text-on-brand" /> : 'Ask: "What should I focus on today?"'}
        </Button>

        {response && (
          <div className="mt-4 rounded-md bg-bg-ai-subtle p-3">
            <div className="mb-1 flex items-center gap-2">
              <Badge tone="ai">AI-suggested</Badge>
              <Badge tone="neutral">confidence: {response.confidence}</Badge>
              <ExplainabilityPopover
                triggerLabel="Why this recommendation?"
                contract={{
                  why: 'This is a mock-foundation recommendation demonstrating the Explainability contract, not a real ranking.',
                  howCalculated: 'A canned response returned by the mock AI adapter — no real inputs were scored.',
                  whatChanged: 'N/A — this is the foundation phase; no historical comparison exists yet.',
                  recommendedAction: 'None required — this is an architecture proof, not a real recommendation to act on.',
                  businessImpact: 'None yet — real business impact will be stated once this surface carries real data.',
                }}
              />
            </div>
            <p className="text-body text-text-primary">{response.text}</p>
            <p className="mt-1 text-caption text-text-muted">Source: {response.citedSource}</p>
          </div>
        )}
      </div>
    </div>
  );
}
