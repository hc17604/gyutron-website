/** Lightweight, dependency-free form validators (pure functions). */
import type { ContactInquiry } from '../../types/inquiry';

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isRequired(v: string | undefined | null): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Returns a field→message map. An empty object means the input is valid. */
export function validateContactInquiry(input: Partial<ContactInquiry>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!isRequired(input.fullName)) errors.fullName = 'Required';
  if (!isRequired(input.company)) errors.company = 'Required';
  if (!isRequired(input.workEmail) || !isEmail(input.workEmail ?? '')) errors.workEmail = 'Valid email required';
  if (!isRequired(input.projectDetails)) errors.projectDetails = 'Required';
  // A filled honeypot means a bot — treat as invalid.
  if (isRequired(input.website)) errors.website = 'Rejected';
  return errors;
}
