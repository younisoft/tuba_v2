import { EntityAvatar } from '@/components/tbos/entity/EntityAvatar';
import { AIConfidence } from './AIConfidence';
import { AISourceTag } from './AISourceTag';
import type { AiConfidence } from '@/lib/ai/types';
import { cn } from '@/lib/cn';

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  confidence?: AiConfidence;
  source?: string;
}

/**
 * TBOS-CMP-AI-006 — AICP-01's conversation surface (design-system/
 * 12_COMPONENT_GUIDELINES.md §5): AI messages carry the Copilot accent, user
 * messages plain. `aria-live="polite"` announces new messages on arrival —
 * streamed as a completed append, never per-character, per
 * design-system/10_MOTION_SYSTEM.md §7.
 */
export function AIConversationThread({ messages }: { messages: AIConversationMessage[] }) {
  return (
    <div aria-live="polite" className="flex flex-col gap-4">
      {messages.map((m) => (
        <div key={m.id} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
          {m.role === 'ai' ? <EntityAvatar kind="record" icon="sparkles" size="sm" /> : <EntityAvatar kind="person" name="You" size="sm" />}
          <div className={cn('max-w-md rounded-lg px-3 py-2 text-body-lg', m.role === 'ai' ? 'bg-bg-ai-subtle text-text-primary' : 'bg-bg-brand-subtle text-text-primary')}>
            <p>{m.text}</p>
            {m.role === 'ai' && (m.confidence || m.source) && (
              <div className="mt-1.5 flex items-center gap-2 border-t border-border pt-1.5">
                {m.confidence && <AIConfidence confidence={m.confidence} />}
                {m.source && <AISourceTag source={m.source} />}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
