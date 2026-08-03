/**
 * Enhanced Immutable Runtime Telemetry Models & Session Metadata (ADR-011 Phase 8C Refinement)
 */

export type TelemetryCategory = 'SIGNALR' | 'DISPATCHER' | 'BOOTSTRAP' | 'STORE' | 'PERFORMANCE' | 'ERROR';
export type TelemetrySeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface RuntimeTelemetryEvent {
  readonly eventId: string;
  readonly correlationId: string;
  readonly category: TelemetryCategory;
  readonly eventName: string;
  readonly source: string;
  readonly severity: TelemetrySeverity;
  readonly tags: readonly string[];
  readonly targetStore?: string;
  readonly payloadSize?: number;
  readonly startedAt: string;
  readonly endedAt: string;
  readonly durationMs: number;
  readonly payload?: unknown;
  readonly status: 'SUCCESS' | 'WARNING' | 'ERROR';
  readonly message?: string;
}

export interface TelemetrySessionMetadata {
  readonly sessionId: string;
  readonly runtimeVersion: string;
  readonly adrVersion: string;
  readonly startedAt: string;
}

export interface TelemetryStatistics {
  readonly totalEvents: number;
  readonly eventsByCategory: Readonly<Record<TelemetryCategory, number>>;
  readonly eventsBySeverity: Readonly<Record<TelemetrySeverity, number>>;
  readonly averageProcessingDurationMs: number;
  readonly lastEventTimestamp: string | null;
}

/** Fixed Capacity Circular Ring Buffer (Immutable Read Views) */
export class RingBuffer<T> {
  private buffer: Array<T | undefined>;
  private capacity: number;
  private head = 0;
  private tail = 0;
  private count = 0;

  constructor(capacity = 500) {
    this.capacity = capacity;
    this.buffer = new Array<T | undefined>(capacity);
  }

  public push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.count < this.capacity) {
      this.count++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  public toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.capacity;
      const item = this.buffer[idx];
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  public clear(): void {
    this.buffer = new Array<T | undefined>(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  public size(): number {
    return this.count;
  }
}
