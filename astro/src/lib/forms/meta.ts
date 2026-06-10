/**
 * Shared submission meta — collected client-side at submit time. Runtime-only
 * (reads window.location); never call during the static build.
 */
import type { SubmissionMeta } from '../../types/inquiry';

/** sourcePage / locale / utm_* read from the current URL. */
export function collectSubmissionMeta(locale: string): SubmissionMeta {
  const meta: SubmissionMeta = { locale };
  try {
    meta.sourcePage = window.location.pathname;
    const q = new URLSearchParams(window.location.search);
    const utmSource = q.get('utm_source');
    const utmMedium = q.get('utm_medium');
    const utmCampaign = q.get('utm_campaign');
    if (utmSource) meta.utmSource = utmSource;
    if (utmMedium) meta.utmMedium = utmMedium;
    if (utmCampaign) meta.utmCampaign = utmCampaign;
  } catch {
    /* non-browser context — leave meta minimal */
  }
  return meta;
}

/** Read a value from FormData/record as a trimmed string ('' when absent). */
export function fd(raw: FormData | Record<string, unknown>, key: string): string {
  const v = raw instanceof FormData ? raw.get(key) : raw[key];
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();
}

/** Drop empty-string optional fields so the payload stays compact. */
export function compact<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v !== undefined && v !== null) out[k] = v;
  }
  return out as T;
}
