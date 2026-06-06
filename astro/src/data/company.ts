/**
 * Language-neutral company facts. Office labels/addresses are i18n keys (`footer.*`),
 * rendered by `CompanyAddresses.astro`. These contact details are currently hardcoded in
 * `Footer.astro`; adopt this constant there to keep a single source.
 */
import type { CompanyInfo } from '../types/site';
import { SITE_NAME } from '../config/site';

export const COMPANY: CompanyInfo = {
  name: SITE_NAME,
  email: 'info@gyutron.com',
  whatsapp: '+852 69509801',
  shopUrl: 'https://shop.gyutron.com',
  offices: [
    { labelKey: 'footer.hqLabel', addrKey: 'footer.hqAddr' },
    { labelKey: 'footer.rdLabel', addrKey: 'footer.rdAddr' },
  ],
  socials: [
    { platform: 'facebook', label: 'Facebook', href: '' },
    { platform: 'youtube', label: 'YouTube', href: '' },
    { platform: 'linkedin', label: 'LinkedIn', href: '' },
    { platform: 'tiktok', label: 'TikTok', href: '' },
  ],
};
