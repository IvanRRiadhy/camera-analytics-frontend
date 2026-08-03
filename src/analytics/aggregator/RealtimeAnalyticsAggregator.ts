/**
 * Realtime Analytics Aggregator (Sprint 1 Subsystem)
 * 
 * Sole component receiving CameraAnalyticsSnapshot payloads from SignalR (via RealtimeDispatcher).
 * Responsibilities:
 * - Receives snapshot
 * - Validates snapshot schema & fields
 * - Invokes generic AnalyticsReducer via runtimeAnalyticsStore
 * - Computes derived state
 * 
 * Zero UI logic. Pure enterprise domain business logic layer.
 */

import type { CameraAnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import { runtimeAnalyticsStore } from '../store/runtimeAnalyticsStore';
import { runtimeTelemetrySink } from '../../modules/devtools/services/telemetry/runtimeTelemetrySink';

export class RealtimeAnalyticsAggregator {
  private static instance: RealtimeAnalyticsAggregator | null = null;

  public static getInstance(): RealtimeAnalyticsAggregator {
    if (!RealtimeAnalyticsAggregator.instance) {
      RealtimeAnalyticsAggregator.instance = new RealtimeAnalyticsAggregator();
    }
    return RealtimeAnalyticsAggregator.instance;
  }

  /** Validate incoming raw snapshot structure */
  public validateSnapshot(payload: unknown): payload is CameraAnalyticsSnapshot {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const hasCamId = (typeof p.cameraId === 'string' && p.cameraId.length > 0) || (typeof p.CameraId === 'string' && p.CameraId.length > 0);
    const hasPluginsOrHealth = p.plugins !== undefined || p.Plugins !== undefined || p.health !== undefined || p.Health !== undefined || p.peopleCount !== undefined;
    return hasCamId && hasPluginsOrHealth;
  }

  /** Process incoming raw SignalR snapshot payload */
  public processSnapshot(rawPayload: unknown, correlationId?: string): boolean {
    const t0 = performance.now();

    if (!this.validateSnapshot(rawPayload)) {
      runtimeTelemetrySink.recordDispatcher(
        'AnalyticsSnapshotRejected',
        'RealtimeAnalyticsAggregator',
        performance.now() - t0,
        correlationId
      );
      return false;
    }

    const snapshot = rawPayload as CameraAnalyticsSnapshot;

    // Execute map-reduce aggregation & update store state
    runtimeAnalyticsStore.applySnapshot(snapshot);

    runtimeTelemetrySink.recordDispatcher(
      'AnalyticsSnapshotAggregated',
      'RealtimeAnalyticsAggregator',
      performance.now() - t0,
      correlationId
    );

    return true;
  }
}

export const realtimeAnalyticsAggregator = RealtimeAnalyticsAggregator.getInstance();
