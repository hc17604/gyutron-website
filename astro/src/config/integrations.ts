/**
 * Integration provider switches. Everything defaults to mock/local/none so the static
 * site builds with NO environment configured. Real provider keys live in Cloudflare env
 * or a local `.env` (never committed) — see `.env.example` and docs/FUTURE_INTEGRATIONS.md.
 *
 * Business code should read `integrations.<x>.provider` and pick an adapter; it must never
 * branch on a vendor name directly.
 */
const env = import.meta.env as unknown as Record<string, string | undefined>;

export interface ProviderConfig {
  provider: string;
  /** True once a non-default (real) provider is configured. */
  enabled: boolean;
}

export interface IntegrationsConfig {
  crm: ProviderConfig;
  cms: ProviderConfig;
  analytics: ProviderConfig;
  agent: ProviderConfig;
}

const CRM = env['CRM_PROVIDER'] ?? 'mock';
const CMS = env['CMS_PROVIDER'] ?? 'local';
const ANALYTICS = env['ANALYTICS_PROVIDER'] ?? '';
const AGENT = env['AGENT_PROVIDER'] ?? 'mock';

export const integrations: IntegrationsConfig = {
  crm: { provider: CRM, enabled: CRM !== 'mock' },
  cms: { provider: CMS, enabled: CMS !== 'local' },
  analytics: { provider: ANALYTICS, enabled: ANALYTICS !== '' },
  agent: { provider: AGENT, enabled: AGENT !== 'mock' },
};
