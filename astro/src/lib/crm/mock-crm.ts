/** In-memory mock CRM. No external service, no persistence beyond the process. */
import type { AnyInquiry } from '../../types/inquiry';
import type { CrmAdapter, CrmLead } from './types';

const store: CrmLead[] = [];
let seq = 0;

export const mockCrm: CrmAdapter = {
  async createInquiry(inquiry: AnyInquiry): Promise<CrmLead> {
    const lead: CrmLead = { id: `lead_${++seq}`, inquiry, createdAt: new Date().toISOString() };
    store.push(lead);
    return lead;
  },
  async listInquiries(): Promise<CrmLead[]> {
    return [...store];
  },
  async getInquiryById(id: string): Promise<CrmLead | null> {
    return store.find((l) => l.id === id) ?? null;
  },
};
