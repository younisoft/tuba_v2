import { Navigate } from 'react-router-dom';

/**
 * Today is the default landing screen for every Broker OS persona
 * (tbos-blueprint/02_NAVIGATION_BLUEPRINT.md §1). This route only ever renders
 * inside BrokerAuthGuard's tree, which has already redirected any platform
 * (ADM) session to /console — so no role branching is needed here anymore;
 * see ConsoleRootRedirect.tsx for the Platform Console's equivalent.
 */
export function RootRedirect() {
  return <Navigate to="/today" replace />;
}
