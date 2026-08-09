import { Icon } from '@/components/ui/Icon';

/** TBOS-CMP-AI-002 — every AI output cites its grounding source (a Knowledge
 * article, a record snapshot, or 'mock-foundation' for this phase's proof
 * responses) — tbos-blueprint/08_AI_INTERACTION_BLUEPRINT.md's audit-trail rule. */
export function AISourceTag({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-caption text-text-muted">
      <Icon name="book-open" className="h-3 w-3" />
      Source: {source}
    </span>
  );
}
