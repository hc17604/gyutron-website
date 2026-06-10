/**
 * Download-request form — business layer (mirrors lib/forms/contact.ts).
 * Field names match the worker schema (src/platform/schemas.mjs FORMS.download).
 * The worker may return `download` info when the requested file is public/gated
 * and the resource center is active (see src/api/downloads.mjs).
 */
import type { DownloadRequestPayload } from '../../types/inquiry';
import type { ApiResult } from '../../types/api';
import { apiFetch, ENDPOINTS } from '../api';
import { collectSubmissionMeta, fd, compact } from './meta';

export interface DownloadRequestResponse {
  ok: boolean;
  message?: string;
  id?: string;
  /** Present when the file can be delivered immediately (public/gated + R2 active). */
  download?: { status: 'ready' | 'received'; url?: string };
}

export function normalizeDownloadRequestPayload(
  raw: FormData | Record<string, unknown>,
  locale: string,
): DownloadRequestPayload {
  // "other" reveals a free-text field; the typed text becomes the requested file.
  let requestedFile = fd(raw, 'requestedFile');
  if (requestedFile === 'other') requestedFile = fd(raw, 'requestedFileOther');
  return compact({
    name: fd(raw, 'name'),
    company: fd(raw, 'company'),
    email: fd(raw, 'email'),
    country: fd(raw, 'country'),
    requestedFile,
    productModel: fd(raw, 'productModel'),
    website: fd(raw, 'website'), // honeypot
    'cf-turnstile-response': fd(raw, 'cf-turnstile-response'),
    ...collectSubmissionMeta(locale),
  }) as DownloadRequestPayload;
}

export function submitDownloadRequest(payload: DownloadRequestPayload): Promise<ApiResult<DownloadRequestResponse>> {
  return apiFetch(ENDPOINTS.downloadRequest, { method: 'POST', body: payload });
}
