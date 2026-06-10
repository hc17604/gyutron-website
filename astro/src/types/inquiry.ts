/**
 * Inquiry / lead types. These mirror the existing contact form fields
 * (`ContactSales.astro` → `POST /api/contact`). No order/payment/cart fields — those
 * belong to the storefront, not the brand site.
 */
import type { Locale } from '../i18n';

/** Metadata attached to every inquiry for routing / lead-source tracking. */
export interface InquiryMeta {
  /** Locale the form was submitted in. */
  locale?: Locale;
  /** Page or product the inquiry originated from (lead source). */
  source?: string;
  /** ISO timestamp set by the receiver. */
  submittedAt?: string;
}

/** The main "Contact Sales" inquiry (matches the live form fields). */
export interface ContactInquiry extends InquiryMeta {
  fullName: string;
  company: string;
  workEmail: string;
  phone?: string;
  country?: string;
  /** Selected product interest (a product/category label). */
  productInterest?: string;
  projectDetails: string;
  /** Honeypot anti-spam field — must be empty. */
  website?: string;
  /** Turnstile token (present only when the widget is configured). */
  'cf-turnstile-response'?: string;
}

/** A product-specific inquiry (e.g. "request a quote" from a product page). */
export interface ProductInquiry extends InquiryMeta {
  fullName: string;
  workEmail: string;
  company?: string;
  /** Product category slug or model name. */
  product: string;
  quantity?: string;
  message?: string;
}

/** A support request (future support-center form). */
export interface SupportRequest extends InquiryMeta {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  /** Optional order/RMA reference (support context only — not commerce). */
  reference?: string;
}

/* ---------------------------------------------------------------------------
 * Phase-2 form payloads. Field names mirror the worker's single source of truth
 * (`src/platform/schemas.mjs` FORMS) — camelCase here maps to snake_case columns
 * server-side. All include the shared meta (sourcePage/locale/utm) + honeypot.
 * ------------------------------------------------------------------------- */

/** Meta attached by the client at submit time (see lib/forms/meta.ts). */
export interface SubmissionMeta {
  sourcePage?: string;
  locale?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** Honeypot — must stay empty. */
  website?: string;
  /** Turnstile token (present only when the widget is configured). */
  'cf-turnstile-response'?: string;
}

/** POST /api/rfq */
export interface RfqPayload extends SubmissionMeta {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  country?: string;
  productCategory?: string;
  productModel?: string;
  industry?: string;
  quantity?: string;
  applicationDescription: string;
  timeline?: string;
}

/** POST /api/support */
export interface SupportPayload extends SubmissionMeta {
  name: string;
  company?: string;
  email: string;
  productModel?: string;
  serialNumber?: string;
  issueType?: string;
  message: string;
}

/** POST /api/download-request */
export interface DownloadRequestPayload extends SubmissionMeta {
  name: string;
  company?: string;
  email: string;
  country?: string;
  requestedFile: string;
  productModel?: string;
}

export type AnyInquiry = ContactInquiry | ProductInquiry | SupportRequest;
