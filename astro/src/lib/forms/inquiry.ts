/**
 * Placeholder business functions for future product-inquiry and support-request forms.
 * These do NOT send anything yet — they resolve successfully so callers can be wired up
 * ahead of the real endpoint/CRM. TODO: route to a dedicated endpoint or `lib/crm`.
 */
import type { ProductInquiry, SupportRequest } from '../../types/inquiry';
import type { ApiResult } from '../../types/api';
import { ok } from '../../types/api';

export async function submitProductInquiry(_input: ProductInquiry): Promise<ApiResult<{ queued: boolean }>> {
  return ok({ queued: false }); // placeholder — not yet delivered anywhere
}

export async function submitSupportRequest(_input: SupportRequest): Promise<ApiResult<{ queued: boolean }>> {
  return ok({ queued: false }); // placeholder — not yet delivered anywhere
}
