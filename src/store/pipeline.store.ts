/**
 * Framework-Independent Immutable Pipeline Store (ADR-011 Phase 7C)
 * Normalized Store for AI Inference Pipeline Worker Execution States
 */

import { useSyncExternalStore } from 'react';
import { BaseRealtimeStore, type BaseStoreStatistics } from './baseRealtime.store';
import { realtimeStoreRegistry } from './storeRegistry';

export interface PipelineEntity {
  id: string; // Pipeline GUID Primary Key
  cameraId: string;
  engineId: string;
  status: 'Starting' | 'Running' | 'Stopped' | 'Failed' | 'Assigned' | string;
  fps: number;
  latency: number;
  queueLength: number;
  version: number;
  lastUpdated: string;
}

export interface PipelineStoreStatistics extends BaseStoreStatistics {
  totalPipelines: number;
  updates: number;
  duplicates: number;
  stale: number;
  rejected: number;
  lastUpdate: string | null;
}

export interface PipelineStoreState {
  pipelinesById: Record<string, PipelineEntity>;
  pipelinesByCameraId: Record<string, string>;
  allPipelines: PipelineEntity[];
  statistics: PipelineStoreStatistics;
}

class PipelineStore extends BaseRealtimeStore<PipelineStoreState, PipelineStoreStatistics> {
  constructor() {
    super('PipelineStore', {
      pipelinesById: {},
      pipelinesByCameraId: {},
      allPipelines: [],
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalPipelines: 0,
        updates: 0,
        duplicates: 0,
        stale: 0,
        rejected: 0,
        lastUpdate: null,
      },
    });
  }

  public getStatistics(): PipelineStoreStatistics {
    return {
      ...this.state.statistics,
      totalPipelines: this.state.allPipelines.length,
    };
  }

  private isValidPipelinePayload(payload: unknown): payload is Partial<PipelineEntity> {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const id = (p.id as string) || (p.pipelineId as string);
    return typeof id === 'string' && id.length > 0;
  }

  private normalizePipeline(payload: unknown): PipelineEntity | null {
    if (!this.isValidPipelinePayload(payload)) return null;
    const p = payload as Record<string, unknown>;
    const id = (p.id as string) || (p.pipelineId as string);
    const cameraId = (p.cameraId as string) || '';
    const engineId = (p.engineId as string) || (p.instanceId as string) || '';
    const lastUpdated = (p.lastUpdated as string) || (p.lastTickUtc as string) || new Date().toISOString();
    const version = typeof p.version === 'number' ? p.version : Date.now();

    return {
      id,
      cameraId,
      engineId,
      status: (p.status as string) || 'Running',
      fps: typeof p.fps === 'number' ? p.fps : typeof p.pipelineFps === 'number' ? p.pipelineFps : 30,
      latency: typeof p.latency === 'number' ? p.latency : typeof p.latencyMs === 'number' ? p.latencyMs : 15,
      queueLength: typeof p.queueLength === 'number' ? p.queueLength : 0,
      version,
      lastUpdated,
    };
  }

  public hydrate(initialPipelines: unknown[]): void {
    if (!Array.isArray(initialPipelines)) return;

    const mapById: Record<string, PipelineEntity> = {};
    const mapByCam: Record<string, string> = {};

    for (const raw of initialPipelines) {
      const entity = this.normalizePipeline(raw);
      if (entity) {
        mapById[entity.id] = entity;
        if (entity.cameraId) {
          mapByCam[entity.cameraId] = entity.id;
        }
      }
    }

    const allPipelines = Object.values(mapById);
    this.state = {
      ...this.state,
      pipelinesById: mapById,
      pipelinesByCameraId: mapByCam,
      allPipelines,
    };

    this.notify();
  }

  public upsert(rawPayload: unknown): void {
    const stats = { ...this.state.statistics };
    stats.totalReceived++;

    const incoming = this.normalizePipeline(rawPayload);
    if (!incoming) {
      stats.invalidPayloadsRejected++;
      stats.rejected++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    const existing = this.state.pipelinesById[incoming.id];

    if (existing) {
      if (incoming.lastUpdated && existing.lastUpdated) {
        const newTime = new Date(incoming.lastUpdated).getTime();
        const oldTime = new Date(existing.lastUpdated).getTime();
        if (!isNaN(newTime) && !isNaN(oldTime) && newTime < oldTime) {
          stats.outOfOrderIgnored++;
          stats.stale++;
          this.state = { ...this.state, statistics: stats };
          return;
        }
      }

      if (
        existing.status === incoming.status &&
        existing.fps === incoming.fps &&
        existing.latency === incoming.latency &&
        existing.queueLength === incoming.queueLength
      ) {
        stats.duplicateIgnored++;
        stats.duplicates++;
        this.state = { ...this.state, statistics: stats };
        return;
      }
    }

    stats.totalStored++;
    stats.updates++;
    stats.lastTimestamp = incoming.lastUpdated;
    stats.lastUpdate = incoming.lastUpdated;

    const updatedEntity: PipelineEntity = existing
      ? { ...existing, ...incoming, version: existing.version + 1 }
      : incoming;

    const mapById = { ...this.state.pipelinesById, [incoming.id]: updatedEntity };
    const mapByCam = { ...this.state.pipelinesByCameraId };
    if (incoming.cameraId) {
      mapByCam[incoming.cameraId] = incoming.id;
    }
    const allPipelines = Object.values(mapById);

    this.state = {
      ...this.state,
      pipelinesById: mapById,
      pipelinesByCameraId: mapByCam,
      allPipelines,
      statistics: stats,
    };

    this.notify();
  }

  public replace(pipelines: unknown[]): void {
    this.hydrate(pipelines);
  }

  public remove(id: string): void {
    const existing = this.state.pipelinesById[id];
    if (!existing) return;

    const mapById = { ...this.state.pipelinesById };
    delete mapById[id];

    const mapByCam = { ...this.state.pipelinesByCameraId };
    if (existing.cameraId && mapByCam[existing.cameraId] === id) {
      delete mapByCam[existing.cameraId];
    }
    const allPipelines = Object.values(mapById);

    this.state = {
      ...this.state,
      pipelinesById: mapById,
      pipelinesByCameraId: mapByCam,
      allPipelines,
    };

    this.notify();
  }

  public clear(): void {
    this.state = {
      ...this.state,
      pipelinesById: {},
      pipelinesByCameraId: {},
      allPipelines: [],
    };
    this.notify();
  }

  public dispose(): void {
    this.clear();
    this.listeners.clear();
  }
}

// Singleton Store Instance
export const pipelineStore = new PipelineStore();

// Register with global registry
realtimeStoreRegistry.registerStore(pipelineStore);

/** React Sync External Store Subscription Hook */
export function usePipelineStore<T>(selector: (state: PipelineStoreState) => T): T {
  return useSyncExternalStore(
    (onStoreChange) => pipelineStore.subscribe(onStoreChange),
    () => selector(pipelineStore.getState()),
    () => selector(pipelineStore.getState())
  );
}

// Selectors
export const selectAllPipelines = (state: PipelineStoreState): PipelineEntity[] => {
  return state.allPipelines || Object.values(state.pipelinesById);
};

export const selectPipelineById = (
  state: PipelineStoreState,
  id: string
): PipelineEntity | undefined => {
  return state.pipelinesById[id];
};

export const selectPipelineByCameraId = (
  state: PipelineStoreState,
  cameraId: string
): PipelineEntity | undefined => {
  const pId = state.pipelinesByCameraId[cameraId];
  return pId ? state.pipelinesById[pId] : undefined;
};

export const selectRunningPipelineCount = (state: PipelineStoreState): number => {
  return Object.values(state.pipelinesById).filter(
    (p) => p.status.toLowerCase() === 'running' || p.status.toLowerCase() === 'assigned'
  ).length;
};
