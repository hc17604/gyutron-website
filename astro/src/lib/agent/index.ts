/**
 * Agent entry point. Selects an adapter by `integrations.agent.provider` (only 'mock'
 * today). Never bind business code to a specific model vendor — extend from here.
 */
import { integrations } from '../../config/integrations';
import { mockAgent } from './mock-agent';
import type { AgentAdapter } from './types';

function getAdapter(): AgentAdapter {
  switch (integrations.agent.provider) {
    // case 'claude': return claudeAgent; // TODO
    default:
      return mockAgent;
  }
}

const agent = getAdapter();

export const classifyInquiry = (text: string) => agent.classifyInquiry(text);
export const suggestProduct = (need: string) => agent.suggestProduct(need);
export const generateFAQAnswer = (question: string) => agent.generateFAQAnswer(question);
export const runWebsiteAudit = () => agent.runWebsiteAudit();
export const checkTranslationQuality = (locale: string) => agent.checkTranslationQuality(locale);
export type { AgentAdapter } from './types';
