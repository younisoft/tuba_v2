import { QueryClient } from '@tanstack/react-query';

/** Server-state cache (master prompt §28) — the mock API's simulated latency
 * makes a short staleTime meaningful even in development. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
