import { Button } from '@/components/ui/Button';

export interface AIActionBarProps {
  onAccept?: () => void;
  onDiscard?: () => void;
  onRegenerate?: () => void;
  /** Required for any action beyond read/answer — tbos-blueprint/
   * 08_AI_INTERACTION_BLUEPRINT.md Agent Copilot: "any action the Copilot
   * proposes requires an explicit confirmation step before executing." */
  acceptLabel?: string;
}

/**
 * TBOS-CMP-AI-003 — the confirm/discard/regenerate row beneath any AI
 * suggestion or proposed action. AI never executes anything beyond read/
 * answer without this bar's explicit accept.
 */
export function AIActionBar({ onAccept, onDiscard, onRegenerate, acceptLabel = 'Accept' }: AIActionBarProps) {
  return (
    <div className="flex items-center gap-2">
      {onAccept && (
        <Button size="sm" variant="primary" onClick={onAccept}>
          {acceptLabel}
        </Button>
      )}
      {onRegenerate && (
        <Button size="sm" variant="secondary" onClick={onRegenerate}>
          Regenerate
        </Button>
      )}
      {onDiscard && (
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      )}
    </div>
  );
}
