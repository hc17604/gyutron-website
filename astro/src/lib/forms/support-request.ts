/**
 * Support form — business layer (mirrors lib/forms/contact.ts).
 * Field names match the worker schema (src/platform/schemas.mjs FORMS.support).
 */
import type { SupportPayload } from '../../types/inquiry';
import type { ApiResult } from '../../types/api';
import { apiFetch, ENDPOINTS } from '../api';
import { collectSubmissionMeta, fd, compact } from './meta';

export function normalizeSupportPayload(raw: FormData | Record<string, unknown>, locale: string): SupportPayload {
  return compact({
    name: fd(raw, 'name'),
    company: fd(raw, 'company'),
    email: fd(raw, 'email'),
    productModel: fd(raw, 'productModel'),
    serialNumber: fd(raw, 'serialNumber'),
    issueType: fd(raw, 'issueType'),
    message: fd(raw, 'message'),
    website: fd(raw, 'website'), // honeypot
    'cf-turnstile-response': fd(raw, 'cf-turnstile-response'),
    ...collectSubmissionMeta(locale),
  }) as SupportPayload;
}

export function submitSupportRequest(payload: SupportPayload): Promise<ApiResult<{ ok: boolean; message?: string; id?: string }>> {
  return apiFetch(ENDPOINTS.support, { method: 'POST', body: payload });
}
