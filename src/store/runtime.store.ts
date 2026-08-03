/**
 * Framework-Independent Immutable Runtime Snapshot Store (ADR-011)
 * Phase 4.5: Refactored to inherit from BaseRealtimeStore & register with RealtimeStoreRegistry
 */

import { useSyncExternalStore } from 'react';
import { BaseRealtimeStore, type BaseStoreStatistics } from './baseRealtime.store';
import { realtimeStoreRegistry } from './storeRegistry';

export interface RuntimeSnapshot {
  engineId: string;
  cameraId: string;
  cameraName: string;
  streamUri: string;
  peopleCount: number;
  queueLength: number;
  loiteringCount: number;
  pipelineFps: number;
  latencyMs: number;
  health: 'OK' | 'WARNING' | 'DEGRADED' | 'FAILED' | string;
  timestampUtc: string;
}

export interface RuntimeStoreStatistics extends BaseStoreStatistics {
  totalSnapshotsReceived: number;
  totalSnapshotsStored: number;
  duplicateSnapshotsIgnored: number;
  outOfOrderSnapshotsIgnored: number;
  invalidPayloadsRejected: number;
  lastSnapshotTimestamp: string | null;
}

export interface RuntimeStoreState {
  snapshotsByCameraId: Record<string, RuntimeSnapshot>;
  statistics: RuntimeStoreStatistics;
}

class RuntimeStore extends BaseRealtimeStore<RuntimeStoreState, RuntimeStoreStatistics> {
  constructor() {
    super('RuntimeStore', {
      snapshotsByCameraId: {},
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalSnapshotsReceived: 0,
        totalSnapshotsStored: 0,
        duplicateSnapshotsIgnored: 0,
        outOfOrderSnapshotsIgnored: 0,
        lastSnapshotTimestamp: null,
      },
    });
  }

  public getStatistics(): RuntimeStoreStatistics {
    return this.state.statistics;
  }

  private isValidSnapshot(payload: unknown): payload is RuntimeSnapshot {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return (
      typeof p.cameraId === 'string' &&
      p.cameraId.length > 0 &&
      typeof p.peopleCount === 'number' &&
      !isNaN(p.peopleCount)
    );
  }

  public hydrateFromOverview(overviewData: {
    cameras?: Array<{ id: string; name: string; rtspUrl?: string; status?: string }>;
    counters?: { peopleCount?: number; queueLength?: number; loiteringAvgSeconds?: number };
  }): void {
    if (!overviewData || !Array.isArray(overviewData.cameras)) return;

    const map: Record<string, RuntimeSnapshot> = { ...this.state.snapshotsByCameraId };
    const now = new Date().toISOString();
    const defaultPeople = overviewData.counters?.peopleCount || 0;
    const defaultQueue = overviewData.counters?.queueLength || 0;

    for (const cam of overviewData.cameras) {
      if (!cam.id) continue;
      if (!map[cam.id]) {
        map[cam.id] = {
          engineId: 'engine_edge_01',
          cameraId: cam.id,
          cameraName: cam.name || 'Camera Node',
          streamUri: cam.rtspUrl || '',
          peopleCount: defaultPeople,
          queueLength: defaultQueue,
          loiteringCount: 0,
          pipelineFps: 30.0,
          latencyMs: 15.0,
          health: cam.status === 'online' ? 'OK' : 'DEGRADED',
          timestampUtc: now,
        };
      }
    }

    this.state = {
      ...this.state,
      snapshotsByCameraId: map,
    };

    this.notify();
  }

  public upsertSnapshot(rawPayload: unknown): void {
    const stats = { ...this.state.statistics };
    stats.totalReceived++;
    stats.totalSnapshotsReceived++;

    if (!this.isValidSnapshot(rawPayload)) {
      stats.invalidPayloadsRejected++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    const snapshot = rawPayload as RuntimeSnapshot;
    const existing = this.state.snapshotsByCameraId[snapshot.cameraId];

    if (existing) {
      if (snapshot.timestampUtc && existing.timestampUtc) {
        const newTime = new Date(snapshot.timestampUtc).getTime();
        const oldTime = new Date(existing.timestampUtc).getTime();
        if (!isNaN(newTime) && !isNaN(oldTime) && newTime < oldTime) {
          stats.outOfOrderIgnored++;
          stats.outOfOrderSnapshotsIgnored++;
          this.state = { ...this.state, statistics: stats };
          return;
        }
      }

      if (
        existing.peopleCount === snapshot.peopleCount &&
        existing.queueLength === snapshot.queueLength &&
        existing.loiteringCount === snapshot.loiteringCount &&
        existing.pipelineFps === snapshot.pipelineFps &&
        existing.latencyMs === snapshot.latencyMs &&
        existing.health === snapshot.health
      ) {
        stats.duplicateIgnored++;
        stats.duplicateSnapshotsIgnored++;
        this.state = { ...this.state, statistics: stats };
        return;
      }
    }

    stats.totalStored++;
    stats.totalSnapshotsStored++;
    stats.lastTimestamp = snapshot.timestampUtc || new Date().toISOString();
    stats.lastSnapshotTimestamp = stats.lastTimestamp;

    this.state = {
      ...this.state,
      snapshotsByCameraId: {
        ...this.state.snapshotsByCameraId,
        [snapshot.cameraId]: { ...snapshot },
      },
      statistics: stats,
    };

    this.notify();
  }

  public replaceSnapshots(snapshots: unknown[]): void {
    const map: Record<string, RuntimeSnapshot> = {};
    for (const raw of snapshots) {
      if (this.isValidSnapshot(raw)) {
        map[raw.cameraId] = { ...raw };
      }
    }
    this.state = { ...this.state, snapshotsByCameraId: map };
    this.notify();
  }

  public removeSnapshot(cameraId: string): void {
    if (!this.state.snapshotsByCameraId[cameraId]) return;

    const copy = { ...this.state.snapshotsByCameraId };
    delete copy[cameraId];

    this.state = { ...this.state, snapshotsByCameraId: copy };
    this.notify();
  }

  public clearSnapshots(): void {
    this.state = {
      ...this.state,
      snapshotsByCameraId: {},
    };
    this.notify();
  }
}

// Singleton Store Instance
export const runtimeStore = new RuntimeStore();

// Register with global registry
realtimeStoreRegistry.registerStore(runtimeStore);

// React Sync Subscription Hook
export function useRuntimeStore<T>(selector: (state: RuntimeStoreState) => T): T {
  return useSyncExternalStore(
    (onStoreChange) => runtimeStore.subscribe(onStoreChange),
    () => selector(runtimeStore.getState()),
    () => selector(runtimeStore.getState())
  );
}

// Selectors
export const selectSnapshotByCameraId = (
  state: RuntimeStoreState,
  cameraId: string
): RuntimeSnapshot | undefined => {
  return state.snapshotsByCameraId[cameraId];
};

export const selectAllSnapshots = (
  state: RuntimeStoreState
): RuntimeSnapshot[] => {
  return Object.values(state.snapshotsByCameraId);
};

export const selectTotalPeopleCount = (
  state: RuntimeStoreState
): number => {
  let total = 0;
  for (const key in state.snapshotsByCameraId) {
    total += state.snapshotsByCameraId[key].peopleCount || 0;
  }
  return total;
};

export const selectTotalQueueLength = (
  state: RuntimeStoreState
): number => {
  let total = 0;
  for (const key in state.snapshotsByCameraId) {
    total += state.snapshotsByCameraId[key].queueLength || 0;
  }
  return total;
};

export const selectHealthyCameraCount = (
  state: RuntimeStoreState
): number => {
  let count = 0;
  for (const key in state.snapshotsByCameraId) {
    if (state.snapshotsByCameraId[key].health === 'OK') {
      count++;
    }
  }
  return count;
};

export const selectTotalCameraCount = (
  state: RuntimeStoreState
): number => {
  return Object.keys(state.snapshotsByCameraId).length;
};
