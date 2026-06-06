/**
 * Generic API envelope types shared by the (currently mock) lib adapters.
 * Keep these provider-agnostic — no vendor-specific shapes leak into business code.
 */

export interface ApiError {
  /** Machine-readable code, e.g. "validation_error" | "network_error". */
  code: string;
  message: string;
  /** Optional per-field errors for forms. */
  fields?: Record<string, string>;
}

/** Discriminated result: either `{ ok: true, data }` or `{ ok: false, error }`. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

/** Options accepted by the thin API client. */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function err(code: string, message: string, fields?: Record<string, string>): ApiResult<never> {
  return { ok: false, error: { code, message, fields } };
}
