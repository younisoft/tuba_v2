import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ConsoleNav } from './ConsoleNav';
import { ConsoleTopBar } from './ConsoleTopBar';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * The Platform Console's application shell — structurally distinct from
 * layouts/AppShell/AppShell.tsx, sharing no chrome component with it (no
 * RailNav, no TopBar, no MobileTabBar/CommandPalette/QuickActionsPanel — none
 * of which are Console concepts). This is the concrete rendering of
 * Constitution Article V within a single-SPA foundation: same codebase, but a
 * visitor can never land here via any Broker OS navigation, search result, or
 * link — only ConsoleAuthGuard's boundary and this shell's own nav reach it.
 */
export function ConsoleShell() {
  return (
    <div className="flex h-dvh bg-slate-950">
      <ConsoleNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <ConsoleTopBar />
        <main className="flex-1 overflow-y-auto bg-bg-canvas p-6">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
