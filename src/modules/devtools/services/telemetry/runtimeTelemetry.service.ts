/**
 * Separated Telemetry Write-Recorder & Read-Service Infrastructure (ADR-011 Phase 8C Refinement)
 */

import {
  RingBuffer,
  type RuntimeTelemetryEvent,
  type TelemetryCategory,
  type TelemetrySeverity,
  type TelemetryStatistics,
  type TelemetrySessionMetadata,
} from './telemetry.types';

// Global Session Metadata
export const telemetrySessionMetadata: TelemetrySessionMetadata = Object.freeze({
  sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  runtimeVersion: 'v1.5.0',
  adrVersion: 'ADR-011',
  startedAt: new Date().toISOString(),
});

/** WRITE-ONLY Telemetry Recorder */
export class TelemetryRecorder {
  private ringBuffer: RingBuffer<RuntimeTelemetryEvent>;
  private categoryCounts: Record<TelemetryCategory, number> = {
    SIGNALR: 0,
    DISPATCHER: 0,
    BOOTSTRAP: 0,
    STORE: 0,
    PERFORMANCE: 0,
    ERROR: 0,
  };
  private severityCounts: Record<TelemetrySeverity, number> = {
    INFO: 0,
    WARNING: 0,
    ERROR: 0,
    CRITICAL: 0,
  };
  private totalRecorded = 0;
  private totalDurationMs = 0;
  private isPaused = false;
  private subscribers: Set<(event: RuntimeTelemetryEvent) => void> = new Set();

  constructor(capacity = 500) {
    this.ringBuffer = new RingBuffer<RuntimeTelemetryEvent>(capacity);
  }

  public record(input: {
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
  }): void {
    if (this.isPaused) return;

    const now = new Date();
    const duration = typeof input.durationMs === 'number' ? input.durationMs : 0;
    const startTime = new Date(now.getTime() - duration);

    const event: RuntimeTelemetryEvent = Object.freeze({
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      correlationId: input.correlationId || `corr_${Date.now()}`,
      category: input.category,
      eventName: input.eventName,
      source: input.source || 'RuntimeFramework',
      severity: input.severity || 'INFO',
      tags: Object.freeze(input.tags || ['runtime', input.category.toLowerCase()]),
      targetStore: input.targetStore,
      payloadSize: input.payloadSize,
      startedAt: startTime.toISOString(),
      endedAt: now.toISOString(),
      durationMs: duration,
      payload: input.payload,
      status: input.status || 'SUCCESS',
      message: input.message,
    });

    this.ringBuffer.push(event);
    this.totalRecorded++;
    this.categoryCounts[event.category] = (this.categoryCounts[event.category] || 0) + 1;
    this.severityCounts[event.severity] = (this.severityCounts[event.severity] || 0) + 1;
    this.totalDurationMs += duration;

    this.subscribers.forEach((cb) => cb(event));
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public subscribe(callback: (event: RuntimeTelemetryEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public clear(): void {
    this.ringBuffer.clear();
    this.totalRecorded = 0;
    this.totalDurationMs = 0;
    this.categoryCounts = {
      SIGNALR: 0,
      DISPATCHER: 0,
      BOOTSTRAP: 0,
      STORE: 0,
      PERFORMANCE: 0,
      ERROR: 0,
    };
    this.severityCounts = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0,
    };
  }

  public getBufferReadView(): RingBuffer<RuntimeTelemetryEvent> {
    return this.ringBuffer;
  }

  public getRawStatistics() {
    return {
      totalEvents: this.totalRecorded,
      eventsByCategory: this.categoryCounts,
      eventsBySeverity: this.severityCounts,
      totalDurationMs: this.totalDurationMs,
    };
  }
}

export const telemetryRecorder = new TelemetryRecorder(500);

/** READ-ONLY Telemetry Query Service */
export class RuntimeTelemetryService {
  public getSessionMetadata(): TelemetrySessionMetadata {
    return telemetrySessionMetadata;
  }

  public getEvents(categoryFilter?: TelemetryCategory, searchTerm?: string): RuntimeTelemetryEvent[] {
    let events = telemetryRecorder.getBufferReadView().toArray().reverse();

    if (categoryFilter) {
      events = events.filter((e) => e.category === categoryFilter);
    }

    if (searchTerm && searchTerm.trim().length > 0) {
      const term = searchTerm.toLowerCase();
      events = events.filter(
        (e) =>
          e.eventName.toLowerCase().includes(term) ||
          (e.targetStore && e.targetStore.toLowerCase().includes(term)) ||
          (e.message && e.message.toLowerCase().includes(term))
      );
    }

    return events;
  }

  public getStatistics(): TelemetryStatistics {
    const raw = telemetryRecorder.getRawStatistics();
    const events = telemetryRecorder.getBufferReadView().toArray();
    const lastEventTimestamp = events.length > 0 ? events[events.length - 1].endedAt : null;

    return {
      totalEvents: raw.totalEvents,
      eventsByCategory: Object.freeze({ ...raw.eventsByCategory }),
      eventsBySeverity: Object.freeze({ ...raw.eventsBySeverity }),
      averageProcessingDurationMs: raw.totalEvents > 0 ? raw.totalDurationMs / raw.totalEvents : 0,
      lastEventTimestamp,
    };
  }

  public getIsPaused(): boolean {
    return telemetryRecorder.getIsPaused();
  }

  public setPaused(paused: boolean): void {
    telemetryRecorder.setPaused(paused);
  }

  public clear(): void {
    telemetryRecorder.clear();
  }

  public subscribe(callback: (event: RuntimeTelemetryEvent) => void): () => void {
    return telemetryRecorder.subscribe(callback);
  }
}

export const runtimeTelemetryService = new RuntimeTelemetryService();
