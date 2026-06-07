/** CRM adapter contract. Real providers (HubSpot, Notion, Airtable…) implement this. */
import type { AnyInquiry } from '../../types/inquiry';

export interface CrmLead {
  id: string;
  inquiry: AnyInquiry;
  /** ISO timestamp. */
  createdAt: string;
  /** Freeform tags applied via tagInquiry (mock lead enrichment / routing). */
  tags: string[];
}

export interface CrmAdapter {
  createInquiry(inquiry: AnyInquiry): Promise<CrmLead>;
  listInquiries(): Promise<CrmLead[]>;
  getInquiryById(id: string): Promise<CrmLead | null>;
  /** Attach a tag to a stored lead; returns the updated lead, or null if unknown. */
  tagInquiry(id: string, tag: string): Promise<CrmLead | null>;
}
