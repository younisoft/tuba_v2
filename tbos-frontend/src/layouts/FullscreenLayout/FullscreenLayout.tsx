import { Outlet } from 'react-router-dom';

/** No rail/top bar — used for full-bleed surfaces (404, onboarding) that
 * intentionally opt out of the AppShell chrome. */
export function FullscreenLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-canvas">
      <Outlet />
    </div>
  );
}
