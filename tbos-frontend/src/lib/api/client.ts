import type { ApiError, ApiResponse } from '@/types/api';
import { simulateLatency } from '@/mocks/api/latency';

/**
 * The one seam every screen's data access goes through. Today `request()` always
 * resolves against the in-memory mock db (mocks/api/db.ts) after a simulated
 * network delay; swapping to a real backend means changing this file's
 * implementation only — see MOCK_API.md for the exact swap contract. No feature
 * code should import mocks/ directly.
 */
export interface RequestOptions {
  latencyMs?: number;
  /** Force an error path — used by tests and by the Error-state demo. */
  simulateError?: ApiError['code'];
}

async function request<T>(resolver: () => T | null | undefined, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  await simulateLatency(options.latencyMs ?? 150);

  if (options.simulateError) {
    return { status: 'error', error: mockError(options.simulateError) };
  }

  try {
    const data = resolver();
    if (data === null || data === undefined) {
      return {
        status: 'error',
        error: { code: 'not_found', message: 'This record could not be found.', recoveryAction: 'go-back' },
      };
    }
    return { status: 'success', data };
  } catch (err) {
    return {
      status: 'error',
      error: {
        code: 'server_error',
        message: 'Something went wrong on our end. Please try again.',
        recoveryAction: 'retry',
        debugDetail: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

function mockError(code: ApiError['code']): ApiError {
  const messages: Record<ApiError['code'], string> = {
    validation: 'Some fields need attention before this can be saved.',
    unauthenticated: 'Your session has ended. Please sign in again.',
    unauthorized: "You don't have permission to do that.",
    not_found: 'This record could not be found.',
    conflict: 'This record changed since you loaded it.',
    rate_limited: "You're doing that a bit too fast — try again shortly.",
    server_error: 'Something went wrong on our end. Please try again.',
    network_error: "You're offline — showing the last data we had.",
    unknown: 'Something unexpected happened.',
  };
  const recovery: Partial<Record<ApiError['code'], string>> = {
    unauthenticated: 're-authenticate',
    unauthorized: 'go-back',
    not_found: 'go-back',
    conflict: 'reload',
    rate_limited: 'retry',
    server_error: 'retry',
    network_error: 'retry',
  };
  return { code, message: messages[code], recoveryAction: recovery[code] };
}

export const apiClient = { request };
