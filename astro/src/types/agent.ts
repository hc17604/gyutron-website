/**
 * Agent (AI task) types — provider-agnostic. The future model provider (Claude / OpenAI /
 * Gemini / local) is selected in `src/config/integrations.ts`; business code only sees
 * these shapes. All implementations are mock today (see `src/lib/agent`).
 */

export type AgentTaskType =
  | 'classify-inquiry'
  | 'suggest-product'
  | 'generate-faq-answer'
  | 'website-audit'
  | 'translation-check'
  | 'score-lead';

/** Lead-priority tier returned by scoreLead. */
export type LeadTier = 'low' | 'medium' | 'high';

export type AgentTaskStatus = 'queued' | 'running' | 'succeeded' | 'failed';

/** A unit of agent work. */
export interface AgentTask<TInput = unknown> {
  id: string;
  type: AgentTaskType;
  input: TInput;
  status: AgentTaskStatus;
  createdAt?: string;
}

/** The result of an agent task. */
export interface AgentResult<TOutput = unknown> {
  taskId: string;
  status: AgentTaskStatus;
  output?: TOutput;
  /** Model confidence 0–1, when applicable. */
  confidence?: number;
  error?: string;
}

/** A single audit/diagnostic finding (used by website-audit / translation-check). */
export interface AgentFinding {
  severity: 'info' | 'warning' | 'error';
  message: string;
  /** Where the finding applies (URL, file, or i18n key). */
  location?: string;
}
