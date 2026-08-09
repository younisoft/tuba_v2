import type { DragEvent, ReactNode } from 'react';
import { Dropdown } from '@/components/ui/Dropdown';
import { IconButton } from '@/components/ui/IconButton';

export interface KanbanStageOption {
  id: string;
  label: string;
}

export interface KanbanCardProps {
  id: string;
  children: ReactNode;
  /** The stages this card can move to (excludes its current one) — feeds the
   * keyboard-operable "move to stage" menu. */
  availableStages: KanbanStageOption[];
  onMoveToStage: (stageId: string) => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent) => void;
}

/**
 * TBOS-CMP-DATA-004 — one Kanban card. Drag is never the only mechanism:
 * every card carries a real "move to stage" menu (design-system/
 * 12_COMPONENT_GUIDELINES.md §2 Kanban Board accessibility rule) — this is
 * the binding requirement, not the optional `draggable` HTML5 wiring, which
 * is provided only as a mouse-pointer convenience on top of it.
 */
export function KanbanCard({ children, availableStages, onMoveToStage, draggable, onDragStart }: KanbanCardProps) {
  return (
    <div draggable={draggable} onDragStart={onDragStart} className="rounded-lg border border-border bg-bg-surface p-3 shadow-1">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">{children}</div>
        {availableStages.length > 0 && (
          <Dropdown
            label="Move to stage"
            align="end"
            items={availableStages.map((stage) => ({ id: stage.id, label: stage.label, icon: 'arrow-up' as const, onSelect: () => onMoveToStage(stage.id) }))}
            trigger={({ toggle }) => <IconButton icon="more-horizontal" label="Move to stage" onClick={toggle} />}
          />
        )}
      </div>
    </div>
  );
}
