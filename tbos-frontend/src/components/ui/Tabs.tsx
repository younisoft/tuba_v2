import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  /** Shown-but-disabled with a reason, distinct from Rail Nav's hide rule —
   * design-system/12_COMPONENT_GUIDELINES.md §1 Tab Group. */
  disabledReason?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  label: string;
}

/**
 * TBOS-CMP-DISPLAY-004 — the Tab Group anatomy: row of tabs, active-tab
 * underline (`border.brand`, 2px) + `text.brand`. Arrow-key navigation between
 * tabs, content loads per-tab. Used by PROP-02/PROJ-02/CONT-02/SET-02/AICP-02's
 * detail-screen tab sets — see EntityDetailTabs (patterns layer) for the
 * detail-screen-specific composition of this primitive.
 */
export function Tabs({ tabs, defaultTabId, label }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  const enabledTabs = tabs.filter((t) => !t.disabledReason);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = enabledTabs.findIndex((t) => t.id === activeId);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = enabledTabs[(currentIndex + dir + enabledTabs.length) % enabledTabs.length];
      if (next) setActiveId(next.id);
    }
  }

  const active = tabs.find((t) => t.id === activeId);

  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={handleKeyDown} className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const disabled = !!tab.disabledReason;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              disabled={disabled}
              title={tab.disabledReason}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !disabled && setActiveId(tab.id)}
              className={cn(
                'min-h-touch-target border-b-2 px-3 text-body transition-colors duration-fast ease-standard',
                disabled && 'cursor-not-allowed text-text-disabled',
                !disabled && isActive && 'border-border-brand font-semibold text-text-brand',
                !disabled && !isActive && 'border-transparent text-text-secondary hover:text-text-primary',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {active && (
        <div role="tabpanel" id={`tabpanel-${active.id}`} aria-labelledby={`tab-${active.id}`} className="pt-4">
          {active.content}
        </div>
      )}
    </div>
  );
}
