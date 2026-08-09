import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { ThemeProvider } from './ThemeProvider';
import { LocaleProvider } from './LocaleProvider';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { PermissionProvider } from '@/lib/permissions/PermissionProvider';
import { AiProvider } from '@/lib/ai/AiProvider';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

/**
 * Composition order matters: ErrorBoundary outermost so it catches failures in
 * any provider below it; QueryClient/Theme/Locale before Auth since they don't
 * depend on the signed-in user; Auth before Permission/AI since both read the
 * current user. See ARCHITECTURE.md "Provider composition".
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LocaleProvider>
            <BrowserRouter>
              <AuthProvider>
                <PermissionProvider>
                  <AiProvider>{children}</AiProvider>
                </PermissionProvider>
              </AuthProvider>
            </BrowserRouter>
          </LocaleProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
