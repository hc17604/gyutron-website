/**
 * Minimal fetch wrapper that normalizes every call to `ApiResult<T>`. Runtime-only — do
 * not call during the static build. This is the single network entry point; business code
 * goes through `lib/forms`, `lib/crm`, etc., never `fetch` directly.
 */
import type { ApiRequestOptions, ApiResult } from '../../types/api';
import { ok, err } from '../../types/api';

export async function apiFetch<T>(url: string, opts: ApiRequestOptions = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: opts.signal,
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = undefined;
    }
    if (!res.ok) {
      const msg =
        data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string'
          ? (data as { message: string }).message
          : `Request failed (${res.status})`;
      return err('http_error', msg);
    }
    return ok(data as T);
  } catch (e) {
    return err('network_error', e instanceof Error ? e.message : 'Network error');
  }
}
