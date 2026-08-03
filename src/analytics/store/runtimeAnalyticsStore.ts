/**
 * Framework-Independent Runtime Analytics Store (Sprint 1 Realtime Subsystem)
 * Inherits from BaseRealtimeStore & registers with realtimeStoreRegistry.
 * Stores derived state: Plugins -> Zones -> Aggregated Values.
 */

import { useSyncExternalStore } from 'react';
import { BaseRealtimeStore, type BaseStoreStatistics } from '../../store/baseRealtime.store';
import { realtimeStoreRegistry } from '../../store/storeRegistry';
import type { AggregatePluginSummary } from '../models/AnalyticsModule';
import type { AnalyticsZoneAggregate } from '../models/AnalyticsZone';
import type { CameraAnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import { reduceAnalyticsSnapshot } from '../aggregator/AnalyticsReducer';

export interface RuntimeAnalyticsStoreStatistics extends BaseStoreStatistics {
  totalSnapshotsProcessed: number;
  validSnapshotsReceived: number;
  invalidSnapshotsRejected: number;
  activeCamerasCount: number;
  activePluginsCount: number;
  activeZonesCount: number;
  lastUpdatedUtc: string | null;
}

export interface RuntimeAnalyticsState {
  plugins: Record<string, AggregatePluginSummary>;
  zones: Record<string, AnalyticsZoneAggregate>;
  statistics: RuntimeAnalyticsStoreStatistics;
  lastSnapshotTimestamp: string | null;
}

class RuntimeAnalyticsStore extends BaseRealtimeStore<RuntimeAnalyticsState, RuntimeAnalyticsStoreStatistics> {
  constructor() {
    super('RuntimeAnalyticsStore', {
      plugins: {},
      zones: {},
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalSnapshotsProcessed: 0,
        validSnapshotsReceived: 0,
        invalidSnapshotsRejected: 0,
        activeCamerasCount: 0,
        activePluginsCount: 0,
        activeZonesCount: 0,
        lastUpdatedUtc: null,
      },
      lastSnapshotTimestamp: null,
    });
  }

  public getStatistics(): RuntimeAnalyticsStoreStatistics {
    return this.state.statistics;
  }

  /** Apply incoming snapshot via generic AnalyticsReducer */
  public applySnapshot(snapshot: CameraAnalyticsSnapshot): void {
    const stats = { ...this.state.statistics };
    stats.totalReceived++;

    if (!snapshot || typeof snapshot !== 'object') {
      stats.invalidPayloadsRejected++;
      stats.invalidSnapshotsRejected++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    const nextState = reduceAnalyticsSnapshot(this.state, snapshot);
    nextState.statistics.totalReceived = stats.totalReceived;
    nextState.statistics.totalStored = nextState.statistics.validSnapshotsReceived;
    nextState.statistics.lastTimestamp = nextState.lastSnapshotTimestamp;

    this.state = nextState;
    this.notify();
  }

  /** Reset store state */
  public reset(): void {
    this.state = {
      plugins: {},
      zones: {},
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalSnapshotsProcessed: 0,
        validSnapshotsReceived: 0,
        invalidSnapshotsRejected: 0,
        activeCamerasCount: 0,
        activePluginsCount: 0,
        activeZonesCount: 0,
        lastUpdatedUtc: null,
      },
      lastSnapshotTimestamp: null,
    };
    this.notify();
  }
}

export const runtimeAnalyticsStore = new RuntimeAnalyticsStore();

// Register with central RealtimeStoreRegistry for developer diagnostics & devtools
try {
  realtimeStoreRegistry.registerStore(runtimeAnalyticsStore);
} catch {
  /* Store registration safe fallback */
}

/** React hook for subscribing to runtimeAnalyticsStore derived state slices */
export function useRuntimeAnalyticsStore<T>(selector: (state: RuntimeAnalyticsState) => T): T {
  return useSyncExternalStore(
    (listener) => runtimeAnalyticsStore.subscribe(listener),
    () => selector(runtimeAnalyticsStore.getState()),
    () => selector(runtimeAnalyticsStore.getState())
  );
}
