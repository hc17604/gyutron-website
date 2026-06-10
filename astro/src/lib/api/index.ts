/** Public API surface. Endpoints served by the Cloudflare worker (`src/worker.mjs`). */
export * from './types';
export { apiFetch } from './client';

export const ENDPOINTS = {
  /** Live: contact form handler → Resend email + D1 lead capture. */
  contact: '/api/contact',
  /** Request-quote form → D1 `rfqs` + `rfq.created` event. */
  rfq: '/api/rfq',
  /** Support form → D1 `support_requests` + `support.created` event. */
  support: '/api/support',
  /** Download-request form → D1 `download_requests` + `download.requested` event. */
  downloadRequest: '/api/download-request',
} as const;
