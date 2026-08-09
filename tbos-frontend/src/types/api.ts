/**
 * Mock API contract — see lib/api/client.ts and mocks/api/. Screens consume this
 * shape regardless of whether lib/api is backed by the mock adapter or a future
 * real adapter (tbos-frontend/MOCK_API.md documents the swap path).
 */

export type ApiErrorCode =
  | 'validation'
  | 'unauthenticated'
  | 'unauthorized'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server_error'
  | 'network_error'
  | 'unknown';

export interface ApiError {
  code: ApiErrorCode;
  /** Plain-language, user-facing message — never a raw stack trace or gateway string. */
  message: string;
  /** Suggested recovery affordance, e.g. "retry" | "go-to-wallet" | "contact-support". */
  recoveryAction?: string;
  /** Field-level messages for validation errors, keyed by field name. */
  fieldErrors?: Record<string, string>;
  /** Non-sensitive detail for engineering diagnostics — never PII/tokens. */
  debugDetail?: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: Record<string, string | number | boolean | undefined>;
  search?: string;
}

export type ApiResponse<T> = { status: 'success'; data: T; pagination?: Pagination } | { status: 'error'; error: ApiError };

export interface MutationResult<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
}
