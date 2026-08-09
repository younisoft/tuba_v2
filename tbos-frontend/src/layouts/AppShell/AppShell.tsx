import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { RailNav } from './RailNav';
import { TopBar } from './TopBar';
import { MobileTabBar } from './MobileTabBar';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { QuickActionsPanel } from '@/components/navigation/QuickActionsPanel';
import { ToastViewport } from '@/components/feedback/ToastViewport';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Desktop: persistent rail + top bar. Tablet: rail collapses to icon-only
 * (RailNav handles this internally via state/ui.store's railCollapsed). Mobile:
 * rail hides entirely in favor of the bottom tab bar — tbos-blueprint/02_NAVIGATION_BLUEPRINT.md.
 * `main` gets bottom padding on mobile so content never sits under the fixed tab bar.
 */
export function AppShell() {
  return (
    <div className="flex h-dvh flex-col tablet:flex-row">
      <div className="hidden tablet:block">
        <RailNav />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 tablet:pb-6 desktop:px-8 wide:mx-auto wide:w-full wide:max-w-content">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <MobileTabBar />
      <CommandPalette />
      <QuickActionsPanel />
      <ToastViewport />
    </div>
  );
}
