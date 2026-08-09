import { NavLink } from 'react-router-dom';
import { SCREEN_REGISTRY } from '@/registry/screens/screenRegistry';
import { Icon, type IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

const CONSOLE_ICONS: Record<string, IconName> = {
  'PC-01': 'shield',
  'PC-02': 'book-open',
  'PC-03': 'clipboard-list',
  'PC-04': 'info',
  'PC-05': 'settings',
};

/**
 * The Platform Console's own nav — deliberately not RailNav (Broker OS chrome).
 * A flat list, not grouped: PC-01–05 have no Orientation/Operating/Intelligence
 * layering (that three-group model is a Broker OS IA decision, tbos-definition/
 * 07_INFORMATION_ARCHITECTURE.md, not restated for the Console, which
 * `tbos-blueprint/18_OPEN_QUESTIONS.md` names as scoped lightly this phase).
 */
export function ConsoleNav() {
  const screens = SCREEN_REGISTRY.filter((s) => s.navGroup === 'platform-console');

  return (
    <nav aria-label="Platform Console" className="flex h-full w-72 shrink-0 flex-col border-e border-slate-800 bg-slate-950 px-2 py-4">
      <div className="mb-4 px-2">
        <span className="text-h3 text-slate-50">Platform Console</span>
      </div>
      <ul>
        {screens.map((screen) => (
          <li key={screen.id}>
            <NavLink
              to={screen.path}
              title={screen.name}
              className={({ isActive }) =>
                cn(
                  'flex min-h-touch-target items-center gap-3 rounded-md px-2 text-body transition-colors duration-fast ease-standard',
                  isActive ? 'bg-slate-800 font-semibold text-slate-50' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
                )
              }
            >
              <Icon name={CONSOLE_ICONS[screen.id] ?? 'shield'} className="h-5 w-5 shrink-0" />
              <span className="truncate">{screen.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
