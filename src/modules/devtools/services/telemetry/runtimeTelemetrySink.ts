/**
 * Single Entry Point Runtime Telemetry Integration Layer (ADR-011 Phase 8D)
 * Safe telemetry sink enriching metadata, correlation IDs, and swallowing exceptions.
 */

import { telemetryRecorder, telemetrySessionMetadata } from './runtimeTelemetry.service';
import { runtimeTraceRecorder } from '../trace/runtimeTrace.service';
import type { TelemetryCategory, TelemetrySeverity } from './telemetry.types';

export interface SinkRecordInput {
  category: TelemetryCategory;
  eventName: string;
  source?: string;
  severity?: TelemetrySeverity;
  tags?: string[];
  targetStore?: string;
  payloadSize?: number;
  durationMs?: number;
  payload?: unknown;
  status?: 'SUCCESS' | 'WARNING' | 'ERROR';
  message?: string;
  correlationId?: string;
}

export class RuntimeTelemetrySink {
  /** Create or reuse correlation ID across downstream execution phases */
  public createCorrelationId(prefix = 'corr'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }

  /** Begin a distributed execution trace */
  public beginTrace(name: string, correlationId?: string, category = 'SignalR'): string {
    const corrId = correlationId || this.createCorrelationId('trace');
    return runtimeTraceRecorder.beginTrace(name, corrId, category);
  }

  /** Begin a trace step */
  public beginStep(traceId: string, name: string, source: string, target: string, parentStepId?: string): string {
    return runtimeTraceRecorder.beginStep(traceId, name, source, target, parentStepId);
  }

  /** End a trace step */
  public endStep(traceId: string, stepId: string, metadata?: Record<string, unknown>): void {
    runtimeTraceRecorder.endStep(traceId, stepId, metadata);
  }

  /** Finish a distributed trace */
  public finishTrace(traceId: string, status: 'SUCCESS' | 'FAILED' | 'CANCELLED' = 'SUCCESS'): void {
    runtimeTraceRecorder.finishTrace(traceId, status);
  }

  /** Safe record entry point shielding runtime from telemetry errors */
  private safeRecord(input: SinkRecordInput): void {
    try {
      const enrichedTags = [
        'runtime',
        input.category.toLowerCase(),
        telemetrySessionMetadata.adrVersion.toLowerCase(),
        ...(input.tags || []),
      ];

      telemetryRecorder.record({
        ...input,
        source: input.source || 'RuntimeFramework',
        severity: input.severity || 'INFO',
        tags: enrichedTags,
        correlationId: input.correlationId || this.createCorrelationId(),
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.debug('[RuntimeTelemetrySink] Telemetry recording swallowed:', err);
      }
    }
  }

  public recordSignalR(eventName: string, payload: unknown, correlationId?: string, durationMs = 0): string {
    const corrId = correlationId || this.createCorrelationId('sig');
    let size = 0;
    try {
      size = new Blob([JSON.stringify(payload || {})]).size;
    } catch {
      size = 0;
    }

    this.safeRecord({
      category: 'SIGNALR',
      eventName,
      correlationId: corrId,
      source: 'SignalRContext',
      payloadSize: size,
      durationMs,
      payload,
      status: 'SUCCESS',
      message: `SignalR Packet Received: ${eventName}`,
    });

    return corrId;
  }

  public recordDispatcher(eventName: string, targetStore: string, durationMs: number, correlationId?: string): void {
    this.safeRecord({
      category: 'DISPATCHER',
      eventName,
      targetStore,
      correlationId,
      source: 'RealtimeDispatcher',
      durationMs,
      status: 'SUCCESS',
      message: `Dispatched ${eventName} -> ${targetStore} (${durationMs.toFixed(2)}ms)`,
    });
  }

  public recordBootstrap(storeName: string, durationMs: number, status: 'SUCCESS' | 'ERROR' = 'SUCCESS', correlationId?: string): void {
    this.safeRecord({
      category: 'BOOTSTRAP',
      eventName: 'Hydrate',
      targetStore: storeName,
      correlationId,
      source: 'RuntimeBootstrap',
      durationMs,
      status,
      message: `Hydrated ${storeName} in ${durationMs.toFixed(2)}ms`,
    });
  }

  public recordStore(storeName: string, action: string, durationMs = 0, correlationId?: string): void {
    this.safeRecord({
      category: 'STORE',
      eventName: action,
      targetStore: storeName,
      correlationId,
      source: storeName,
      durationMs,
      status: 'SUCCESS',
      message: `Store ${storeName}.${action}() executed in ${durationMs.toFixed(2)}ms`,
    });
  }

  public recordPerformance(metricName: string, durationMs: number, details?: unknown): void {
    this.safeRecord({
      category: 'PERFORMANCE',
      eventName: metricName,
      source: 'PerformanceMonitor',
      durationMs,
      payload: details,
      status: 'SUCCESS',
      message: `Performance Benchmark: ${metricName} = ${durationMs.toFixed(2)}ms`,
    });
  }

  public recordError(source: string, error: unknown, correlationId?: string): void {
    const message = error instanceof Error ? error.message : String(error);
    this.safeRecord({
      category: 'ERROR',
      eventName: 'ErrorCaptured',
      source,
      correlationId,
      severity: 'ERROR',
      status: 'ERROR',
      message,
      payload: error,
    });
  }
}

export const runtimeTelemetrySink = new RuntimeTelemetrySink();
