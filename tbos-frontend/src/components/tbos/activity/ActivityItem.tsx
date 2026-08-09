import { Icon, type IconName } from '@/components/ui/Icon';

export type ActivityActorKind = 'human' | 'system' | 'ai';

const ACTOR_ICON: Record<ActivityActorKind, IconName> = {
  human: 'user-check',
  system: 'workflow',
  ai: 'sparkles',
};

export interface ActivityItemProps {
  actorKind: ActivityActorKind;
  actorName: string;
  action: string;
  timestamp: string;
}

/**
 * TBOS-CMP-ACTIVITY-001 — one timeline node. Human/System/AI activity stay
 * semantically distinguishable by icon (never by color alone, and AI activity
 * additionally uses Copilot-violet per design-system/03_COLOR_SYSTEM.md §5)
 * — master prompt §22's explicit requirement.
 */
export function ActivityItem({ actorKind, actorName, action, timestamp }: ActivityItemProps) {
  return (
    <li className="flex gap-3">
      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${actorKind === 'ai' ? 'bg-bg-ai-subtle text-text-ai' : 'bg-bg-sunken text-icon-default'}`}>
        <Icon name={ACTOR_ICON[actorKind]} className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1 pb-3">
        <p className="text-body text-text-primary">
          <span className="font-semibold">{actorName}</span> {action}
        </p>
        <p className="text-caption text-text-muted">{timestamp}</p>
      </div>
    </li>
  );
}
