import type { ReactNode } from 'react';
import { EntityAvatar, type EntityAvatarProps } from './EntityAvatar';
import { EntityMeta, type EntityMetaItem } from './EntityMeta';
import { cn } from '@/lib/cn';

export interface EntityCardProps {
  avatar: EntityAvatarProps;
  title: string;
  subtitle?: string;
  meta?: EntityMetaItem[];
  status?: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * TBOS-CMP-ENTITY-003 — one composable card for every entity type (Property,
 * Lead, Customer, Owner, Contract, Campaign), not a bespoke PropertyCard/
 * LeadCard/CustomerCard per module. Master prompt §16: "Do not create separate
 * visual systems for every entity. Use composable entity primitives." A
 * per-entity component (e.g. a PropertyCard with a photo strip) is deferred
 * until a screen with real field requirements needs it — see
 * TBOS_COMPONENT_LIBRARY_REPORT.md "Known Limitations."
 */
export function EntityCard({ avatar, title, subtitle, meta, status, onClick, className }: EntityCardProps) {
  const interactive = !!onClick;
  const Wrapper = interactive ? 'button' : 'div';

  return (
    <Wrapper
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-border bg-bg-surface p-4 text-start',
        interactive && 'hover:border-border-strong hover:bg-bg-sunken',
        className,
      )}
    >
      <EntityAvatar {...avatar} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-body font-semibold text-text-primary">{title}</span>
          {status}
        </div>
        {subtitle && <p className="truncate text-caption text-text-secondary">{subtitle}</p>}
        {meta && (
          <div className="mt-1.5">
            <EntityMeta items={meta} />
          </div>
        )}
      </div>
    </Wrapper>
  );
}
