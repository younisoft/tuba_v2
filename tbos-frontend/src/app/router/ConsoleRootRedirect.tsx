import { Navigate } from 'react-router-dom';

/** PC-01 (Moderation Queue) is the Console's landing screen. */
export function ConsoleRootRedirect() {
  return <Navigate to="/console/moderation" replace />;
}
