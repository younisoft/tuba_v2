import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/lib/logging/logger';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

/**
 * The page/incident-level error boundary — catches render errors anywhere
 * beneath it and shows a plain-language fallback instead of a blank white
 * screen, per tbos-blueprint/06_STATE_ARCHITECTURE.md §1 Error. Wraps the whole
 * app in App.tsx; screen-local errors (a failed fetch) use ErrorState instead.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('Unhandled render error', { message: error.message, componentStack: info.componentStack });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg-canvas text-center">
          <Icon name="alert-triangle" className="h-8 w-8 text-text-danger" />
          <h1 className="text-h1 text-text-primary">Something went wrong</h1>
          <p className="max-w-sm text-body text-text-secondary">We've logged the issue. Reloading usually fixes it.</p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
