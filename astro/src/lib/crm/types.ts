/** CRM adapter contract. Real providers (HubSpot, Notion, Airtable…) implement this. */
import type { AnyInquiry } from '../../types/inquiry';

export interface CrmLead {
  id: string;
  inquiry: AnyInquiry;
  /** ISO timestamp. */
  createdAt: string;
}

export interface CrmAdapter {
  createInquiry(inquiry: AnyInquiry): Promise<CrmLead>;
  listInquiries(): Promise<CrmLead[]>;
  getInquiryById(id: string): Promise<CrmLead | null>;
}
