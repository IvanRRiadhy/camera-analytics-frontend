/**
 * Framework-Independent Immutable Camera Store (ADR-011 Phase 7B)
 * Normalized Store for Camera Metadata, Stream Endpoints & Spatial Location
 */

import { useSyncExternalStore } from 'react';
import { BaseRealtimeStore, type BaseStoreStatistics } from './baseRealtime.store';
import { realtimeStoreRegistry } from './storeRegistry';

export interface CameraEntity {
  id: string; // GUID Primary Key
  name: string;
  rtspUrl: string;
  status: 'online' | 'offline' | 'degraded' | string;
  resolution: string;
  fps: number;
  siteId?: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  version: number;
  lastUpdated: string;
}

export interface CameraStoreStatistics extends BaseStoreStatistics {
  totalCameras: number;
  updates: number;
  duplicates: number;
  stale: number;
  rejected: number;
  lastUpdate: string | null;
}

export interface CameraStoreState {
  camerasById: Record<string, CameraEntity>;
  allCameras: CameraEntity[];
  statistics: CameraStoreStatistics;
}

class CameraStore extends BaseRealtimeStore<CameraStoreState, CameraStoreStatistics> {
  constructor() {
    super('CameraStore', {
      camerasById: {},
      allCameras: [],
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalCameras: 0,
        updates: 0,
        duplicates: 0,
        stale: 0,
        rejected: 0,
        lastUpdate: null,
      },
    });
  }

  public getStatistics(): CameraStoreStatistics {
    return {
      ...this.state.statistics,
      totalCameras: this.state.allCameras.length,
    };
  }

  private isValidCameraPayload(payload: unknown): payload is Partial<CameraEntity> {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const id = (p.id as string) || (p.cameraId as string);
    return typeof id === 'string' && id.length > 0;
  }

  private normalizeCamera(payload: unknown): CameraEntity | null {
    if (!this.isValidCameraPayload(payload)) return null;
    const p = payload as Record<string, unknown>;
    const id = (p.id as string) || (p.cameraId as string);
    const lastUpdated = (p.lastUpdated as string) || new Date().toISOString();
    const version = typeof p.version === 'number' ? p.version : Date.now();

    return {
      id,
      name: (p.name as string) || (p.cameraName as string) || 'Camera Node',
      rtspUrl: (p.rtspUrl as string) || (p.streamUri as string) || '',
      status: (p.status as string) || 'online',
      resolution: (p.resolution as string) || '1920x1080',
      fps: typeof p.fps === 'number' ? p.fps : 30,
      siteId: p.siteId as string | undefined,
      buildingId: p.buildingId as string | undefined,
      floorId: p.floorId as string | undefined,
      roomId: p.roomId as string | undefined,
      version,
      lastUpdated,
    };
  }

  public hydrate(initialCameras: unknown[]): void {
    if (!Array.isArray(initialCameras)) return;

    const map: Record<string, CameraEntity> = {};
    for (const raw of initialCameras) {
      const entity = this.normalizeCamera(raw);
      if (entity) {
        map[entity.id] = entity;
      }
    }

    const allCameras = Object.values(map);
    this.state = {
      ...this.state,
      camerasById: map,
      allCameras,
    };

    this.notify();
  }

  public upsert(rawPayload: unknown): void {
    const stats = { ...this.state.statistics };
    stats.totalReceived++;

    const incoming = this.normalizeCamera(rawPayload);
    if (!incoming) {
      stats.invalidPayloadsRejected++;
      stats.rejected++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    const existing = this.state.camerasById[incoming.id];

    if (existing) {
      if (
        existing.status === incoming.status &&
        existing.name === incoming.name &&
        existing.rtspUrl === incoming.rtspUrl
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

    const updatedEntity: CameraEntity = existing
      ? { ...existing, ...incoming, version: existing.version + 1 }
      : incoming;

    const map = { ...this.state.camerasById, [incoming.id]: updatedEntity };
    const allCameras = Object.values(map);

    this.state = {
      ...this.state,
      camerasById: map,
      allCameras,
      statistics: stats,
    };

    this.notify();
  }

  public replace(cameras: unknown[]): void {
    this.hydrate(cameras);
  }

  public remove(id: string): void {
    if (!this.state.camerasById[id]) return;

    const map = { ...this.state.camerasById };
    delete map[id];
    const allCameras = Object.values(map);

    this.state = {
      ...this.state,
      camerasById: map,
      allCameras,
    };
    this.notify();
  }

  public clear(): void {
    this.state = {
      ...this.state,
      camerasById: {},
      allCameras: [],
    };
    this.notify();
  }

  public dispose(): void {
    this.clear();
    this.listeners.clear();
  }
}

// Singleton Store Instance
export const cameraStore = new CameraStore();

// Register with global registry
realtimeStoreRegistry.registerStore(cameraStore);

/** React Sync External Store Subscription Hook */
export function useCameraStore<T>(selector: (state: CameraStoreState) => T): T {
  return useSyncExternalStore(
    (onStoreChange) => cameraStore.subscribe(onStoreChange),
    () => selector(cameraStore.getState()),
    () => selector(cameraStore.getState())
  );
}

// Selectors
export const selectAllCameras = (state: CameraStoreState): CameraEntity[] => {
  return state.allCameras || Object.values(state.camerasById);
};

export const selectCameraById = (
  state: CameraStoreState,
  id: string
): CameraEntity | undefined => {
  return state.camerasById[id];
};

export const selectOnlineCameraCount = (state: CameraStoreState): number => {
  return Object.values(state.camerasById).filter(
    (c) => c.status.toLowerCase() === 'online'
  ).length;
};

export const selectTotalCameraCount = (state: CameraStoreState): number => {
  return Object.keys(state.camerasById).length;
};
