/**
 * CRM entry point. Selects an adapter by `integrations.crm.provider` (only 'mock' today).
 * To go live: add a real adapter implementing CrmAdapter and a case below.
 */
import type { AnyInquiry } from '../../types/inquiry';
import { integrations } from '../../config/integrations';
import { mockCrm } from './mock-crm';
import type { CrmAdapter } from './types';

function getAdapter(): CrmAdapter {
  switch (integrations.crm.provider) {
    // case 'hubspot': return hubspotCrm; // TODO
    default:
      return mockCrm;
  }
}

const crm = getAdapter();

export const createInquiry = (inquiry: AnyInquiry) => crm.createInquiry(inquiry);
export const listInquiries = () => crm.listInquiries();
export const getInquiryById = (id: string) => crm.getInquiryById(id);
export const tagInquiry = (id: string, tag: string) => crm.tagInquiry(id, tag);
export type { CrmLead, CrmAdapter } from './types';
