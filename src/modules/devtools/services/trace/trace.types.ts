/**
 * Distributed Runtime Trace & Step Models (ADR-011 Phase 8E)
 * Immutable trace representations powering DevTools timeline & observability platforms.
 */

export type TraceStatus = 'CREATED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type StepStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface RuntimeTraceStep {
  readonly stepId: string;
  readonly parentStepId?: string;
  readonly name: string;
  readonly source: string;
  readonly target: string;
  readonly startedAt: string;
  endedAt?: string;
  durationMs?: number;
  status: StepStatus;
  metadata?: Record<string, unknown>;
}

export interface RuntimeTrace {
  readonly traceId: string;
  readonly correlationId: string;
  readonly name: string;
  readonly category: string;
  status: TraceStatus;
  readonly startedAt: string;
  endedAt?: string;
  durationMs?: number;
  rootStep?: RuntimeTraceStep;
  steps: RuntimeTraceStep[];
  metadata?: Record<string, unknown>;
  tags: string[];
}

export interface TraceStatistics {
  readonly totalTraces: number;
  readonly activeTracesCount: number;
  readonly successTracesCount: number;
  readonly failedTracesCount: number;
  readonly averageDurationMs: number;
  readonly lastTraceTimestamp: string | null;
}
