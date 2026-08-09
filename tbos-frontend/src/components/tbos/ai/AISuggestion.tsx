import type { ReactNode } from 'react';
import { AIConfidence } from './AIConfidence';
import type { AiConfidence } from '@/lib/ai/types';

export interface AISuggestionProps {
  children: ReactNode;
  confidence: AiConfidence;
  actions?: ReactNode;
}

/**
 * TBOS-CMP-AI-004 — the AI Suggestion Inline Block (design-system/
 * 12_COMPONENT_GUIDELINES.md §5): `bg.ai-subtle` surface + 4px Copilot-violet
 * left accent + "AI suggested" label + editable content. Renders as an
 * editable suggestion, never silently pre-filled as if human-authored —
 * `aria-describedby` marks the content region explicitly.
 */
export function AISuggestion({ children, confidence, actions }: AISuggestionProps) {
  return (
    <div className="rounded-md border-s-4 border-bg-ai bg-bg-ai-subtle p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-micro font-semibold uppercase tracking-wide text-text-ai">AI suggested</span>
        <AIConfidence confidence={confidence} />
      </div>
      <div className="text-body text-text-primary">{children}</div>
      {actions && <div className="mt-3">{actions}</div>}
    </div>
  );
}
