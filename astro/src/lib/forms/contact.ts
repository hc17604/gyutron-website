/**
 * Contact Sales form — business layer. The page collects fields and calls these helpers;
 * the network / integration logic lives here. This is the single integration seam: future
 * CRM (lib/crm), email, and agent inquiry-classification hooks plug in inside
 * submitContactForm without touching the page.
 */
import type { ContactInquiry } from '../../types/inquiry';
import type { ApiResult } from '../../types/api';
import { apiFetch, ENDPOINTS } from '../api';
import { validateContactInquiry } from './validation';

/** Build a typed ContactInquiry from raw form data (FormData or a plain record). */
export function normalizeContactPayload(raw: FormData | Record<string, unknown>): ContactInquiry {
  const get = (k: string): string => {
    const v = raw instanceof FormData ? raw.get(k) : raw[k];
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  };
  return {
    fullName: get('fullName'),
    company: get('company'),
    workEmail: get('workEmail'),
    phone: get('phone'),
    country: get('country'),
    productInterest: get('productInterest'),
    projectDetails: get('projectDetails'),
    website: get('website'), // honeypot — passed through; the worker silently drops bots
  };
}

/** Field-level validation (field → message; empty object = valid). Reuses the shared validator. */
export function validateContactForm(input: Partial<ContactInquiry>): Record<string, string> {
  return validateContactInquiry(input);
}

/**
 * Submit the contact inquiry to the worker endpoint (/api/contact → Resend). Currently it
 * just POSTs (the page does HTML5 validation; the worker handles the honeypot), preserving
 * the previous behavior. Returns the parsed worker response { ok, message }. Future
 * CRM/email/agent hooks belong here.
 */
export function submitContactForm(input: ContactInquiry): Promise<ApiResult<{ ok: boolean; message?: string }>> {
  return apiFetch<{ ok: boolean; message?: string }>(ENDPOINTS.contact, { method: 'POST', body: input });
}
