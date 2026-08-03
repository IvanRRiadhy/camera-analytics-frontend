/**
 * Distributed Trace Recorder & Read Service Infrastructure (ADR-011 Phase 8E)
 * Manages 100-item fixed RingBuffer for execution traces with correlation IDs.
 */

import { RingBuffer } from '../telemetry/telemetry.types';
import type {
  RuntimeTrace,
  RuntimeTraceStep,
  TraceStatus,
  TraceStatistics,
} from './trace.types';

/** WRITE-ONLY Trace Recorder */
export class RuntimeTraceRecorder {
  private traceBuffer: RingBuffer<RuntimeTrace>;
  private activeTraces: Map<string, RuntimeTrace> = new Map();
  private totalRecorded = 0;
  private successCount = 0;
  private failedCount = 0;
  private totalDurationMs = 0;
  private subscribers: Set<(trace: RuntimeTrace) => void> = new Set();

  constructor(capacity = 100) {
    this.traceBuffer = new RingBuffer<RuntimeTrace>(capacity);
  }

  public beginTrace(name: string, correlationId: string, category = 'SignalR', tags: string[] = []): string {
    try {
      const traceId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const trace: RuntimeTrace = {
        traceId,
        correlationId,
        name,
        category,
        status: 'RUNNING',
        startedAt: now,
        steps: [],
        tags: ['runtime', 'trace', category.toLowerCase(), ...tags],
      };

      this.activeTraces.set(traceId, trace);
      return traceId;
    } catch {
      return '';
    }
  }

  public beginStep(traceId: string, name: string, source: string, target: string, parentStepId?: string): string {
    try {
      const trace = this.activeTraces.get(traceId);
      if (!trace) return '';

      const stepId = `stp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const step: RuntimeTraceStep = {
        stepId,
        parentStepId,
        name,
        source,
        target,
        startedAt: new Date().toISOString(),
        status: 'RUNNING',
      };

      trace.steps.push(step);
      if (!trace.rootStep) {
        (trace as { rootStep: RuntimeTraceStep }).rootStep = step;
      }

      return stepId;
    } catch {
      return '';
    }
  }

  public endStep(traceId: string, stepId: string, metadata?: Record<string, unknown>): void {
    try {
      const trace = this.activeTraces.get(traceId);
      if (!trace) return;

      const step = trace.steps.find((s) => s.stepId === stepId);
      if (!step) return;

      const now = new Date();
      step.endedAt = now.toISOString();
      step.durationMs = now.getTime() - new Date(step.startedAt).getTime();
      step.status = 'SUCCESS';
      if (metadata) {
        step.metadata = metadata;
      }
    } catch {
      // Swallowed for execution safety
    }
  }

  public failStep(traceId: string, stepId: string, error: unknown): void {
    try {
      const trace = this.activeTraces.get(traceId);
      if (!trace) return;

      const step = trace.steps.find((s) => s.stepId === stepId);
      if (step) {
        step.endedAt = new Date().toISOString();
        step.status = 'FAILED';
        step.metadata = { error: error instanceof Error ? error.message : String(error) };
      }

      trace.status = 'FAILED';
    } catch {
      // Swallowed for execution safety
    }
  }

  public finishTrace(traceId: string, status: TraceStatus = 'SUCCESS'): void {
    try {
      const trace = this.activeTraces.get(traceId);
      if (!trace) return;

      const now = new Date();
      trace.endedAt = now.toISOString();
      trace.durationMs = now.getTime() - new Date(trace.startedAt).getTime();
      trace.status = status;

      // Make completed trace immutable before storing
      const frozenTrace: RuntimeTrace = Object.freeze({
        ...trace,
        steps: [...trace.steps],
      });

      this.traceBuffer.push(frozenTrace);
      this.activeTraces.delete(traceId);

      this.totalRecorded++;
      if (status === 'SUCCESS') this.successCount++;
      if (status === 'FAILED') this.failedCount++;
      this.totalDurationMs += trace.durationMs || 0;

      this.subscribers.forEach((cb) => cb(frozenTrace));
    } catch {
      // Swallowed for execution safety
    }
  }

  public cancelTrace(traceId: string): void {
    this.finishTrace(traceId, 'CANCELLED');
  }

  public getTraceBuffer(): RingBuffer<RuntimeTrace> {
    return this.traceBuffer;
  }

  public getActiveTraces(): Map<string, RuntimeTrace> {
    return this.activeTraces;
  }

  public getRawStatistics() {
    return {
      totalRecorded: this.totalRecorded,
      activeCount: this.activeTraces.size,
      successCount: this.successCount,
      failedCount: this.failedCount,
      totalDurationMs: this.totalDurationMs,
    };
  }

  public subscribe(callback: (trace: RuntimeTrace) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public clear(): void {
    this.traceBuffer.clear();
    this.activeTraces.clear();
    this.totalRecorded = 0;
    this.successCount = 0;
    this.failedCount = 0;
    this.totalDurationMs = 0;
  }
}

export const runtimeTraceRecorder = new RuntimeTraceRecorder(100);

/** READ-ONLY Trace Query Service */
export class RuntimeTraceService {
  public getTrace(traceId: string): RuntimeTrace | undefined {
    return runtimeTraceRecorder.getTraceBuffer().toArray().find((t) => t.traceId === traceId)
      || runtimeTraceRecorder.getActiveTraces().get(traceId);
  }

  public getLatestTraces(limit = 50): RuntimeTrace[] {
    return runtimeTraceRecorder.getTraceBuffer().toArray().reverse().slice(0, limit);
  }

  public getRunningTraces(): RuntimeTrace[] {
    return Array.from(runtimeTraceRecorder.getActiveTraces().values());
  }

  public getFailedTraces(): RuntimeTrace[] {
    return runtimeTraceRecorder.getTraceBuffer().toArray().filter((t) => t.status === 'FAILED').reverse();
  }

  public getStatistics(): TraceStatistics {
    const raw = runtimeTraceRecorder.getRawStatistics();
    const traces = runtimeTraceRecorder.getTraceBuffer().toArray();
    const lastTimestamp = traces.length > 0 ? traces[traces.length - 1].endedAt || null : null;

    return {
      totalTraces: raw.totalRecorded,
      activeTracesCount: raw.activeCount,
      successTracesCount: raw.successCount,
      failedTracesCount: raw.failedCount,
      averageDurationMs: raw.totalRecorded > 0 ? raw.totalDurationMs / raw.totalRecorded : 0,
      lastTraceTimestamp: lastTimestamp,
    };
  }

  public subscribe(callback: (trace: RuntimeTrace) => void): () => void {
    return runtimeTraceRecorder.subscribe(callback);
  }
}

export const runtimeTraceService = new RuntimeTraceService();
