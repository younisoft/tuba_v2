import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/state/ui.store';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useHasPermission } from '@/lib/permissions/useHasPermission';
import { search } from '@/lib/search/searchIndex';
import { useCommands } from '@/lib/search/useCommands';
import { useFocusTrap } from '@/lib/a11y/useFocusTrap';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Icon } from '@/components/ui/Icon';

/**
 * GS-01 and CMD-01 are the same surface with two entry modes (plain query =
 * search, `>` prefix = commands), per tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §8.
 * z-command-palette sits above modal/popover/toast per design-system/02_DESIGN_TOKENS.md §4.
 */
export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const close = useUiStore((s) => s.closeCommandPalette);
  const { user } = useAuth();
  const { can } = useHasPermission();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const commands = useCommands();
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, open, close);

  const isCommandMode = query.startsWith('>');
  const commandQuery = query.slice(1).trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (isCommandMode || !user) return [];
    return search(query, { agencyId: user.agencyId, userId: user.id, role: user.activeRole, can });
  }, [query, isCommandMode, user, can]);

  const commandResults = useMemo(() => {
    if (!isCommandMode) return [];
    return commands.filter((c) => (!c.permission || can(c.permission)) && c.label.toLowerCase().includes(commandQuery));
  }, [isCommandMode, commandQuery, commands, can]);

  if (!open) return null;

  const resultCount = isCommandMode ? commandResults.length : searchResults.length;

  return (
    <div className="fixed inset-0 z-command-palette flex items-start justify-center bg-bg-overlay-scrim pt-[15vh]" onMouseDown={close}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-lg border border-border bg-bg-surface shadow-4"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Icon name={isCommandMode ? 'command' : 'search'} className="h-4 w-4 text-icon-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('commandPalette.placeholder')}
            className="w-full bg-transparent text-body text-text-primary outline-none placeholder:text-text-muted"
            aria-label={t('commandPalette.placeholder')}
          />
        </div>

        <div aria-live="polite" className="max-h-80 overflow-y-auto py-2">
          {query.trim().length === 0 && (
            <p className="px-4 py-6 text-center text-body text-text-muted">{t('commandPalette.placeholder')}</p>
          )}

          {query.trim().length > 0 && resultCount === 0 && (
            <p className="px-4 py-6 text-center text-body text-text-muted">{t('commandPalette.noResults')}</p>
          )}

          {!isCommandMode && searchResults.length > 0 && (
            <ul>
              {searchResults.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(r.path);
                      close();
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2 text-start hover:bg-bg-sunken"
                  >
                    <span className="text-body text-text-primary">{r.title}</span>
                    {r.subtitle && <span className="text-caption text-text-muted">{r.subtitle}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isCommandMode && commandResults.length > 0 && (
            <ul>
              {commandResults.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={c.run}
                    className="flex w-full items-center gap-3 px-4 py-2 text-start text-body text-text-primary hover:bg-bg-sunken"
                  >
                    <Icon name="command" className="h-4 w-4 text-icon-muted" />
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
