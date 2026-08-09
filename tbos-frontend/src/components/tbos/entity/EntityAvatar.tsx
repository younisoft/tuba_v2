import { Avatar } from '@/components/ui/Avatar';
import { Icon, type IconName } from '@/components/ui/Icon';
import type { AvatarSize } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';

export type EntityAvatarProps =
  | { kind: 'person'; name: string; imageUrl?: string; size?: AvatarSize }
  | { kind: 'record'; icon: IconName; size?: AvatarSize };

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-16 w-16',
};
const ICON_SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-8 w-8',
};

/**
 * TBOS-CMP-ENTITY-001 — a person-entity (Customer/Owner/team member) gets
 * initials via Avatar; a record-entity (Property/Project/Contract/Campaign —
 * anything without a "name" in the human sense) gets a type icon in the same
 * footprint instead, so EntityHeader never has to special-case which kind of
 * record it's heading.
 */
export function EntityAvatar(props: EntityAvatarProps) {
  if (props.kind === 'person') {
    return <Avatar name={props.name} imageUrl={props.imageUrl} size={props.size} />;
  }
  const size = props.size ?? 'md';
  return (
    <span className={cn('inline-flex items-center justify-center rounded-full bg-bg-brand-subtle text-text-brand', SIZE_CLASSES[size])}>
      <Icon name={props.icon} className={ICON_SIZE_CLASSES[size]} />
    </span>
  );
}
