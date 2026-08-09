import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import { PermissionProvider } from '@/lib/permissions/PermissionProvider';
import { AiProvider } from '@/lib/ai/AiProvider';

/**
 * Everything AppProviders composes except ErrorBoundary/ThemeProvider/
 * LocaleProvider (irrelevant to most component tests) and BrowserRouter
 * (swapped for MemoryRouter so tests control the starting URL).
 */
export function TestProviders({ children, initialEntries = ['/'] }: { children: ReactNode; initialEntries?: string[] }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <PermissionProvider>
            <AiProvider>{children}</AiProvider>
          </PermissionProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}
