import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { mockAiAdapter } from './mockAiAdapter';
import type { AiActionKind, AiAuditEvent, AiResponse } from './types';

interface AiContextValue {
  ask: (kind: AiActionKind, prompt: string, screenId: string) => Promise<AiResponse>;
  auditLog: AiAuditEvent[];
}

const AiContext = createContext<AiContextValue | null>(null);

export function AiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const value = useMemo<AiContextValue>(
    () => ({
      ask: (kind, prompt, screenId) => {
        if (!user) return Promise.reject(new Error('AI Copilot requires an authenticated user.'));
        return mockAiAdapter.request({ kind, prompt, context: { screenId, userId: user.id, agencyId: user.agencyId } });
      },
      auditLog: user ? mockAiAdapter.auditLog(user.agencyId) : [],
    }),
    [user],
  );

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- see AuthProvider.tsx
export function useAi(): AiContextValue {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error('useAi must be used within <AiProvider>');
  return ctx;
}
