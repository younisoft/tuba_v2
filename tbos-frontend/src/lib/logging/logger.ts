import { env } from '@/app/config/env';

export type LogLevel = 'error' | 'warning' | 'info' | 'performance' | 'user_action' | 'ai_event';

export interface LogEvent {
  level: LogLevel;
  message: string;
  /** Never put passwords, tokens, or unnecessary PII here (master prompt §30). */
  data?: Record<string, unknown>;
}

/**
 * The one seam for frontend logging/observability. Today it writes to the
 * console in development and drops silently in production; a real deployment
 * wires this file to its observability provider (Sentry, Datadog, etc.) without
 * touching any call site — see DEVELOPMENT.md.
 */
function log(event: LogEvent) {
  if (!env.isDev) return;
  const method = event.level === 'error' ? 'error' : event.level === 'warning' ? 'warn' : 'log';
  // eslint-disable-next-line no-console
  console[method](`[TBOS:${event.level}]`, event.message, event.data ?? '');
}

export const logger = {
  error: (message: string, data?: Record<string, unknown>) => log({ level: 'error', message, data }),
  warning: (message: string, data?: Record<string, unknown>) => log({ level: 'warning', message, data }),
  info: (message: string, data?: Record<string, unknown>) => log({ level: 'info', message, data }),
  performance: (message: string, data?: Record<string, unknown>) => log({ level: 'performance', message, data }),
  userAction: (message: string, data?: Record<string, unknown>) => log({ level: 'user_action', message, data }),
  aiEvent: (message: string, data?: Record<string, unknown>) => log({ level: 'ai_event', message, data }),
};
