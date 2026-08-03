/**
 * Strongly Typed Realtime Event Dispatcher (ADR-011 Phase 5)
 * Decouples SignalR WebSockets transport from State Store handlers.
 */

import { runtimeStore } from '../store/runtime.store';
import { analyticsEventStore } from '../store/analyticsEvent.store';
import { incidentStore } from '../store/incident.store';
import { engineStore } from '../store/engine.store';
import { pipelineStore } from '../store/pipeline.store';
import { runtimeTelemetrySink } from '../modules/devtools/services/telemetry/runtimeTelemetrySink';
import { realtimeAnalyticsAggregator } from '../analytics';

export type RealtimeEventHandler<T = unknown> = (payload: T, correlationId?: string) => void;

export interface DispatcherStatistics {
  totalDispatched: number;
  handledEvents: number;
  unhandledEvents: number;
  handlerCountsByEvent: Record<string, number>;
}

export class RealtimeDispatcher {
  private handlers: Map<string, Set<RealtimeEventHandler<unknown>>> = new Map();
  private totalDispatched = 0;
  private handledEvents = 0;
  private unhandledEvents = 0;

  constructor() {
    this.registerDefaultHandlers();
  }

  /** Register default domain store subscribers */
  private registerDefaultHandlers(): void {
    this.register('SnapshotUpdated', (payload, corrId) => {
      const t0 = performance.now();
      runtimeStore.upsertSnapshot(payload);
      realtimeAnalyticsAggregator.processSnapshot(payload, corrId);
      runtimeTelemetrySink.recordDispatcher('SnapshotUpdated', 'RuntimeStore+AnalyticsAggregator', performance.now() - t0, corrId);
    });

    this.register('AnalyticsSnapshotPublished', (payload, corrId) => {
      const t0 = performance.now();
      runtimeStore.upsertSnapshot(payload);
      realtimeAnalyticsAggregator.processSnapshot(payload, corrId);
      runtimeTelemetrySink.recordDispatcher('AnalyticsSnapshotPublished', 'RuntimeStore+AnalyticsAggregator', performance.now() - t0, corrId);
    });

    this.register('AnalyticsEventPublished', (payload, corrId) => {
      const t0 = performance.now();
      analyticsEventStore.appendEvent(payload);
      runtimeTelemetrySink.recordDispatcher('AnalyticsEventPublished', 'AnalyticsEventStore', performance.now() - t0, corrId);
    });

    this.register('IncidentEscalated', (payload, corrId) => {
      const t0 = performance.now();
      incidentStore.upsertIncident(payload);
      runtimeTelemetrySink.recordDispatcher('IncidentEscalated', 'IncidentStore', performance.now() - t0, corrId);
    });

    this.register('ReceiveEngineHeartbeat', (payload, corrId) => {
      const t0 = performance.now();
      engineStore.upsert(payload);
      runtimeTelemetrySink.recordDispatcher('ReceiveEngineHeartbeat', 'EngineStore', performance.now() - t0, corrId);
    });

    this.register('EngineOffline', (payload, corrId) => {
      const t0 = performance.now();
      const p = payload as { instanceId?: string; id?: string };
      const id = p?.instanceId || p?.id;
      if (id) engineStore.upsert({ id, status: 'OFFLINE' });
      runtimeTelemetrySink.recordDispatcher('EngineOffline', 'EngineStore', performance.now() - t0, corrId);
    });

    this.register('EngineRecovered', (payload, corrId) => {
      const t0 = performance.now();
      const p = payload as { instanceId?: string; id?: string };
      const id = p?.instanceId || p?.id;
      if (id) engineStore.upsert({ id, status: 'ONLINE' });
      runtimeTelemetrySink.recordDispatcher('EngineRecovered', 'EngineStore', performance.now() - t0, corrId);
    });

    this.register('PipelineAssigned', (payload, corrId) => {
      const t0 = performance.now();
      pipelineStore.upsert(payload);
      runtimeTelemetrySink.recordDispatcher('PipelineAssigned', 'PipelineStore', performance.now() - t0, corrId);
    });

    this.register('PipelineStarted', (payload, corrId) => {
      const t0 = performance.now();
      const p = payload as { pipelineId?: string; id?: string };
      const id = p?.pipelineId || p?.id;
      if (id) pipelineStore.upsert({ id, status: 'Running' });
      runtimeTelemetrySink.recordDispatcher('PipelineStarted', 'PipelineStore', performance.now() - t0, corrId);
    });

    this.register('PipelineStopped', (payload, corrId) => {
      const t0 = performance.now();
      const p = payload as { pipelineId?: string; id?: string };
      const id = p?.pipelineId || p?.id;
      if (id) pipelineStore.upsert({ id, status: 'Stopped' });
      runtimeTelemetrySink.recordDispatcher('PipelineStopped', 'PipelineStore', performance.now() - t0, corrId);
    });

    this.register('PipelineFailed', (payload, corrId) => {
      const t0 = performance.now();
      const p = payload as { pipelineId?: string; id?: string };
      const id = p?.pipelineId || p?.id;
      if (id) pipelineStore.upsert({ id, status: 'Failed' });
      runtimeTelemetrySink.recordDispatcher('PipelineFailed', 'PipelineStore', performance.now() - t0, corrId);
    });

    this.register('PipelineMoved', (payload, corrId) => {
      const t0 = performance.now();
      pipelineStore.upsert(payload);
      runtimeTelemetrySink.recordDispatcher('PipelineMoved', 'PipelineStore', performance.now() - t0, corrId);
    });
  }

  /** Register an event handler for a specific SignalR event */
  public register(eventName: string, handler: (payload: unknown, correlationId?: string) => void): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler as RealtimeEventHandler<unknown>);
  }

  /** Unregister an event handler */
  public unregister(eventName: string, handler: RealtimeEventHandler<unknown>): void {
    const set = this.handlers.get(eventName);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this.handlers.delete(eventName);
      }
    }
  }

  /** Dispatch an incoming SignalR payload to all registered handlers */
  public dispatch<T = unknown>(eventName: string, payload: T, correlationId?: string): void {
    this.totalDispatched++;
    const set = this.handlers.get(eventName);

    if (set && set.size > 0) {
      this.handledEvents++;
      set.forEach((handler) => {
        try {
          handler(payload, correlationId);
        } catch (err) {
          console.error(`[RealtimeDispatcher Error] Handler failed for event '${eventName}':`, err);
        }
      });
    } else {
      this.unhandledEvents++;
    }
  }

  /** Get telemetry statistics */
  public getStatistics(): DispatcherStatistics {
    const handlerCounts: Record<string, number> = {};
    this.handlers.forEach((set, key) => {
      handlerCounts[key] = set.size;
    });

    return {
      totalDispatched: this.totalDispatched,
      handledEvents: this.handledEvents,
      unhandledEvents: this.unhandledEvents,
      handlerCountsByEvent: handlerCounts,
    };
  }
}

export const realtimeDispatcher = new RealtimeDispatcher();

// Expose dispatcher to global window for developer debugging
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__realtimeDispatcher = realtimeDispatcher;
}
