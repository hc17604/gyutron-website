/** Public API surface. Endpoints served by the Cloudflare worker (`src/worker.mjs`). */
export * from './types';
export { apiFetch } from './client';

export const ENDPOINTS = {
  /** Live: contact form handler → Resend email. */
  contact: '/api/contact',
} as const;
