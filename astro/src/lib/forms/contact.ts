/**
 * Business function for the Contact Sales form. Validates, then POSTs to the existing
 * worker endpoint (`/api/contact` → Resend). This is the ONE real integration path; the
 * contact page can adopt this instead of inlining its own `fetch`.
 */
import type { ContactInquiry } from '../../types/inquiry';
import type { ApiResult } from '../../types/api';
import { err } from '../../types/api';
import { apiFetch, ENDPOINTS } from '../api';

export async function submitContactForm(input: ContactInquiry): Promise<ApiResult<{ ok: boolean }>> {
  const { validateContactInquiry } = await import('./validation');
  const errors = validateContactInquiry(input);
  if (Object.keys(errors).length > 0) {
    return err('validation_error', 'Please review the highlighted fields.', errors);
  }
  return apiFetch<{ ok: boolean }>(ENDPOINTS.contact, { method: 'POST', body: input });
}
