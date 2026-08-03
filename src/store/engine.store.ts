/**
 * Framework-Independent Immutable Engine Store (ADR-011 Phase 7A)
 * Normalized Store for AI Engine Edge Node Lifecycle & Heartbeat Metrics
 */

import { useSyncExternalStore } from 'react';
import { BaseRealtimeStore, type BaseStoreStatistics } from './baseRealtime.store';
import { realtimeStoreRegistry } from './storeRegistry';

export interface EngineEntity {
  id: string; // Instance ID / GUID Primary Key
  instanceId: string;
  instanceIdString?: string;
  engineId: string;
  hostname: string;
  ipAddress: string;
  port: number;
  engineVersion: string;
  osPlatform: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | string;
  state?: string;
  healthState?: string;
  healthScore?: number;
  cpuUsagePct: number;
  cpuUsagePercent: number;
  totalRamMb: number;
  gpuDeviceId?: string;
  gpuModel?: string;
  gpuUsagePct: number;
  gpuUsagePercent: number;
  vramUsedMb: number;
  vramTotalMb: number;
  totalVramMb: number;
  activePipelinesCount: number;
  installedPlugins: string[];
  lastHeartbeatUtc: string;
  version: number;
  lastUpdated: string;
}

export interface EngineStoreStatistics extends BaseStoreStatistics {
  totalEntities: number;
  updates: number;
  duplicates: number;
  stale: number;
  rejected: number;
  lastUpdate: string | null;
}

export interface EngineStoreState {
  enginesById: Record<string, EngineEntity>;
  allEngines: EngineEntity[];
  statistics: EngineStoreStatistics;
}

class EngineStore extends BaseRealtimeStore<EngineStoreState, EngineStoreStatistics> {
  constructor() {
    super('EngineStore', {
      enginesById: {},
      allEngines: [],
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalEntities: 0,
        updates: 0,
        duplicates: 0,
        stale: 0,
        rejected: 0,
        lastUpdate: null,
      },
    });
  }

  public getStatistics(): EngineStoreStatistics {
    return {
      ...this.state.statistics,
      totalEntities: this.state.allEngines.length,
    };
  }

  private isValidEnginePayload(payload: unknown): payload is Partial<EngineEntity> {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const id = (p.id as string) || (p.instanceId as string) || (p.engineId as string);
    return typeof id === 'string' && id.length > 0;
  }

  private normalizeEngine(payload: unknown): EngineEntity | null {
    if (!this.isValidEnginePayload(payload)) return null;
    const p = payload as Record<string, unknown>;
    const id = (p.id as string) || (p.instanceId as string) || (p.engineId as string);
    const lastUpdated = (p.lastUpdated as string) || (p.lastHeartbeatUtc as string) || (p.timestampUtc as string) || new Date().toISOString();
    const version = typeof p.version === 'number' ? p.version : Date.now();
    const cpu = typeof p.cpuUsagePct === 'number' ? p.cpuUsagePct : typeof p.cpuUsagePercent === 'number' ? p.cpuUsagePercent : 15;
    const gpu = typeof p.gpuUsagePct === 'number' ? p.gpuUsagePct : typeof p.gpuUsagePercent === 'number' ? p.gpuUsagePercent : 25;
    const totalVram = typeof p.totalVramMb === 'number' ? p.totalVramMb : typeof p.vramTotalMb === 'number' ? p.vramTotalMb : 24576;

    return {
      id,
      instanceId: id,
      instanceIdString: id,
      engineId: (p.engineId as string) || id,
      hostname: (p.hostname as string) || 'engine_host',
      ipAddress: (p.ipAddress as string) || '127.0.0.1',
      port: typeof p.port === 'number' ? p.port : 5000,
      engineVersion: (p.engineVersion as string) || 'v1.5.0',
      osPlatform: (p.osPlatform as string) || 'win32',
      status: (p.status as string) || (p.state as string) || (p.healthState as string) || 'ONLINE',
      state: (p.state as string) || (p.status as string) || 'ONLINE',
      healthState: (p.healthState as string) || (p.status as string) || 'HEALTHY',
      healthScore: typeof p.healthScore === 'number' ? p.healthScore : 100,
      cpuUsagePct: cpu,
      cpuUsagePercent: cpu,
      totalRamMb: typeof p.totalRamMb === 'number' ? p.totalRamMb : 16384,
      gpuDeviceId: p.gpuDeviceId as string | undefined,
      gpuModel: (p.gpuModel as string) || 'NVIDIA RTX 4090',
      gpuUsagePct: gpu,
      gpuUsagePercent: gpu,
      vramUsedMb: typeof p.vramUsedMb === 'number' ? p.vramUsedMb : 2048,
      vramTotalMb: totalVram,
      totalVramMb: totalVram,
      activePipelinesCount: typeof p.activePipelinesCount === 'number' ? p.activePipelinesCount : 1,
      installedPlugins: Array.isArray(p.installedPlugins) ? p.installedPlugins : [],
      lastHeartbeatUtc: lastUpdated,
      version,
      lastUpdated,
    };
  }

  public hydrate(initialEngines: unknown[]): void {
    if (!Array.isArray(initialEngines)) return;

    const map: Record<string, EngineEntity> = {};
    for (const raw of initialEngines) {
      const entity = this.normalizeEngine(raw);
      if (entity) {
        map[entity.id] = entity;
      }
    }

    const allEngines = Object.values(map);
    this.state = {
      ...this.state,
      enginesById: map,
      allEngines,
    };

    this.notify();
  }

  public upsert(rawPayload: unknown): void {
    const stats = { ...this.state.statistics };
    stats.totalReceived++;

    const incoming = this.normalizeEngine(rawPayload);
    if (!incoming) {
      stats.invalidPayloadsRejected++;
      stats.rejected++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    const existing = this.state.enginesById[incoming.id];

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
        existing.cpuUsagePct === incoming.cpuUsagePct &&
        existing.gpuUsagePct === incoming.gpuUsagePct &&
        existing.activePipelinesCount === incoming.activePipelinesCount
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

    const updatedEntity: EngineEntity = existing
      ? { ...existing, ...incoming, version: existing.version + 1 }
      : incoming;

    const copy = { ...this.state.enginesById, [incoming.id]: updatedEntity };
    const allEngines = Object.values(copy);

    this.state = {
      ...this.state,
      enginesById: copy,
      allEngines,
      statistics: stats,
    };
    this.notify();
  }

  public replace(engines: unknown[]): void {
    this.hydrate(engines);
  }

  public remove(id: string): void {
    if (!this.state.enginesById[id]) return;

    const copy = { ...this.state.enginesById };
    delete copy[id];

    this.state = { 
      ...this.state, 
      enginesById: copy,
      allEngines: Object.values(copy),
    };
    this.notify();
  }

  public clear(): void {
    this.state = {
      ...this.state,
      enginesById: {},
      allEngines: [],
    };
    this.notify();
  }

  public dispose(): void {
    this.clear();
    this.listeners.clear();
  }
}

// Singleton Store Instance
export const engineStore = new EngineStore();

// Register with global registry
realtimeStoreRegistry.registerStore(engineStore);

/** React Sync External Store Subscription Hook */
export function useEngineStore<T>(selector: (state: EngineStoreState) => T): T {
  return useSyncExternalStore(
    (onStoreChange) => engineStore.subscribe(onStoreChange),
    () => selector(engineStore.getState()),
    () => selector(engineStore.getState())
  );
}

// Selectors
export const selectAllEngines = (state: EngineStoreState): EngineEntity[] => {
  return state.allEngines || Object.values(state.enginesById);
};

export const selectHealthyEngineCount = (state: EngineStoreState): number => {
  return Object.values(state.enginesById).filter((e) => {
    const s = String(e.status || e.state || e.healthState || '').toUpperCase();
    return s === 'ONLINE' || s === 'HEALTHY' || s === '0';
  }).length;
};

export const selectTotalEngineCount = (state: EngineStoreState): number => {
  return Object.keys(state.enginesById).length;
};

export const selectEngineById = (
  state: EngineStoreState,
  instanceId: string
): EngineEntity | undefined => {
  return state.enginesById[instanceId];
};
