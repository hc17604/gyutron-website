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
    const data = (text ? JSON.parse(text) : undefined) as T;
    if (!res.ok) return err('http_error', `Request failed (${res.status})`);
    return ok(data);
  } catch (e) {
    return err('network_error', e instanceof Error ? e.message : 'Network error');
  }
}
