/** Mock agent — NO model is called. Returns deterministic placeholder results. */
import type { AgentAdapter } from './types';
import type { AgentResult } from '../../types/agent';

function done<T>(output: T): AgentResult<T> {
  return { taskId: 'mock', status: 'succeeded', output, confidence: 0 };
}

export const mockAgent: AgentAdapter = {
  async classifyInquiry() {
    return done({ category: 'general' });
  },
  async suggestProduct() {
    return done({ slugs: [] as string[] });
  },
  async generateFAQAnswer() {
    return done({ answer: '' });
  },
  async runWebsiteAudit() {
    return done({ findings: [] });
  },
  async checkTranslationQuality() {
    return done({ findings: [] });
  },
};
