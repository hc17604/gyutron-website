/**
 * Agent adapter contract. The future model provider (Claude / OpenAI / Gemini / local) is
 * selected in config; business code only sees these shapes. Mock today.
 */
import type { AgentResult, AgentFinding, LeadTier } from '../../types/agent';
import type { AnyInquiry } from '../../types/inquiry';

export interface AgentAdapter {
  classifyInquiry(text: string): Promise<AgentResult<{ category: string }>>;
  suggestProduct(need: string): Promise<AgentResult<{ slugs: string[] }>>;
  generateFAQAnswer(question: string): Promise<AgentResult<{ answer: string }>>;
  runWebsiteAudit(): Promise<AgentResult<{ findings: AgentFinding[] }>>;
  checkTranslationQuality(locale: string): Promise<AgentResult<{ findings: AgentFinding[] }>>;
  /** Score a lead 0–100 and bucket it into a priority tier. */
  scoreLead(inquiry: AnyInquiry): Promise<AgentResult<{ score: number; tier: LeadTier }>>;
}
