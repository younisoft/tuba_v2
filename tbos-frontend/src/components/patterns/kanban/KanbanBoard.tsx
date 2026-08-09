import type { DragEvent, ReactNode } from 'react';
import { KanbanCard } from './KanbanCard';
import { StatusBadge } from '@/components/tbos/status/StatusBadge';
import type { StatusMeaning } from '@/types/status';

export interface KanbanColumnDef<T> {
  id: string;
  title: string;
  meaning: StatusMeaning;
  cards: T[];
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumnDef<T>[];
  getCardId: (card: T) => string;
  renderCard: (card: T) => ReactNode;
  onMoveCard: (cardId: string, toColumnId: string) => void;
  /** Overrides the default "No {title} leads" empty-column copy — needed by
   * any caller rendering in a locale other than English. Defaults to the
   * original string so existing callers/tests are unaffected. */
  emptyStateLabel?: (column: KanbanColumnDef<T>) => string;
}

/**
 * TBOS-PAT-DATA-004 — the Kanban Board pattern (design-system/
 * 12_COMPONENT_GUIDELINES.md §2), LEAD-01's stage-view. Columns = lifecycle
 * stages (Status Badge as column header) → stacked cards, each with a
 * keyboard-operable stage-move menu (KanbanCard) as the accessible
 * alternative to the pointer-only drag wiring below.
 */
export function KanbanBoard<T>({ columns, getCardId, renderCard, onMoveCard, emptyStateLabel }: KanbanBoardProps<T>) {
  function handleDrop(e: DragEvent, toColumnId: string) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) onMoveCard(cardId, toColumnId);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((column) => (
        <div
          key={column.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, column.id)}
          className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-bg-sunken p-2"
        >
          <div className="flex items-center justify-between px-1 py-1">
            <StatusBadge label={column.title} meaning={column.meaning} size="sm" />
            <span className="text-caption text-text-muted">{column.cards.length}</span>
          </div>

          {column.cards.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-3 text-center text-caption text-text-muted">
              {emptyStateLabel ? emptyStateLabel(column) : `No ${column.title.toLowerCase()} leads`}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {column.cards.map((card) => {
                const cardId = getCardId(card);
                return (
                  <KanbanCard
                    key={cardId}
                    id={cardId}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', cardId)}
                    availableStages={columns.filter((c) => c.id !== column.id).map((c) => ({ id: c.id, label: c.title }))}
                    onMoveToStage={(stageId) => onMoveCard(cardId, stageId)}
                  >
                    {renderCard(card)}
                  </KanbanCard>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
