/**
 * Request-quote form — business layer (mirrors lib/forms/contact.ts).
 * Field names match the worker schema (src/platform/schemas.mjs FORMS.rfq).
 */
import type { RfqPayload } from '../../types/inquiry';
import type { ApiResult } from '../../types/api';
import { apiFetch, ENDPOINTS } from '../api';
import { collectSubmissionMeta, fd, compact } from './meta';

export function normalizeRfqPayload(raw: FormData | Record<string, unknown>, locale: string): RfqPayload {
  return compact({
    name: fd(raw, 'name'),
    company: fd(raw, 'company'),
    email: fd(raw, 'email'),
    phone: fd(raw, 'phone'),
    country: fd(raw, 'country'),
    productCategory: fd(raw, 'productCategory'),
    productModel: fd(raw, 'productModel'),
    industry: fd(raw, 'industry'),
    quantity: fd(raw, 'quantity'),
    applicationDescription: fd(raw, 'applicationDescription'),
    timeline: fd(raw, 'timeline'),
    website: fd(raw, 'website'), // honeypot — worker silently drops bots
    'cf-turnstile-response': fd(raw, 'cf-turnstile-response'),
    ...collectSubmissionMeta(locale),
  }) as RfqPayload;
}

export function submitRfq(payload: RfqPayload): Promise<ApiResult<{ ok: boolean; message?: string; id?: string }>> {
  return apiFetch(ENDPOINTS.rfq, { method: 'POST', body: payload });
}
