/**
 * Framework-Independent Immutable Incident Store (ADR-011 Phase 6)
 * Normalized Store for Realtime Critical Incidents & Escalations
 */

import { useSyncExternalStore } from 'react';
import type { MonitoringIncident } from '../hooks/useMonitoring';
import { BaseRealtimeStore, type BaseStoreStatistics } from './baseRealtime.store';
import { realtimeStoreRegistry } from './storeRegistry';

export interface IncidentStoreStatistics extends BaseStoreStatistics {
  totalIncidentsReceived: number;
  totalIncidentsStored: number;
  duplicateIncidentsIgnored: number;
  outOfOrderIncidentsIgnored: number;
  invalidPayloadsRejected: number;
  lastIncidentTimestamp: string | null;
}

export interface IncidentStoreState {
  incidents: MonitoringIncident[];
  incidentsById: Record<string, MonitoringIncident>;
  statistics: IncidentStoreStatistics;
}

class IncidentStore extends BaseRealtimeStore<IncidentStoreState, IncidentStoreStatistics> {
  constructor() {
    super('IncidentStore', {
      incidents: [],
      incidentsById: {},
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalIncidentsReceived: 0,
        totalIncidentsStored: 0,
        duplicateIncidentsIgnored: 0,
        outOfOrderIncidentsIgnored: 0,
        lastIncidentTimestamp: null,
      },
    });
  }

  public getStatistics(): IncidentStoreStatistics {
    return this.state.statistics;
  }

  private normalizeIncident(payload: unknown): MonitoringIncident | null {
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as Record<string, unknown>;

    const id = (p.id as string) || (p.incidentId as string) || `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = (p.timestamp as string) || (p.timestampUtc as string) || new Date().toLocaleTimeString('en-GB', { hour12: false });
    const pluginCode = (p.pluginCode as string) || (p.plugin_code as string) || 'incident_alert';
    const cameraName = (p.cameraName as string) || (p.camera_name as string) || 'Active Camera';
    const severity = (p.severity as string) || 'CRITICAL';
    const status = (p.status as string) || 'OPEN';
    const description = (p.description as string) || (p.message as string) || 'Critical Security Incident Escalated';

    return {
      id,
      timestamp,
      pluginCode,
      cameraName,
      severity,
      status,
      description,
    };
  }

  public hydrateIncidents(initialIncidents: unknown[]): void {
    if (!Array.isArray(initialIncidents)) return;

    const validList: MonitoringIncident[] = [];
    const map: Record<string, MonitoringIncident> = {};

    for (const raw of initialIncidents) {
      const inc = this.normalizeIncident(raw);
      if (inc && !map[inc.id]) {
        map[inc.id] = inc;
        validList.push(inc);
      }
    }

    this.state = {
      ...this.state,
      incidents: validList,
      incidentsById: map,
    };

    this.notify();
  }

  public upsertIncident(rawPayload: unknown): void {
    const stats = { ...this.state.statistics };
    stats.totalReceived++;
    stats.totalIncidentsReceived++;

    const inc = this.normalizeIncident(rawPayload);
    if (!inc) {
      stats.invalidPayloadsRejected++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    const existing = this.state.incidentsById[inc.id];
    if (existing && existing.status === inc.status && existing.description === inc.description) {
      stats.duplicateIgnored++;
      stats.duplicateIncidentsIgnored++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    stats.totalStored++;
    stats.totalIncidentsStored++;
    stats.lastTimestamp = inc.timestamp;
    stats.lastIncidentTimestamp = inc.timestamp;

    const newMap = { ...this.state.incidentsById, [inc.id]: inc };
    const filteredExisting = this.state.incidents.filter((i) => i.id !== inc.id);
    const newIncidents = [inc, ...filteredExisting];

    this.state = {
      ...this.state,
      incidents: newIncidents,
      incidentsById: newMap,
      statistics: stats,
    };

    this.notify();
  }

  public removeIncident(id: string): void {
    if (!this.state.incidentsById[id]) return;

    const map = { ...this.state.incidentsById };
    delete map[id];

    const list = this.state.incidents.filter((i) => i.id !== id);

    this.state = {
      ...this.state,
      incidents: list,
      incidentsById: map,
    };

    this.notify();
  }

  public clearIncidents(): void {
    this.state = {
      ...this.state,
      incidents: [],
      incidentsById: {},
    };
    this.notify();
  }
}

// Singleton Store Instance
export const incidentStore = new IncidentStore();

// Register with global registry
realtimeStoreRegistry.registerStore(incidentStore);

/** React Sync External Store Subscription Hook */
export function useIncidentStore<T>(selector: (state: IncidentStoreState) => T): T {
  return useSyncExternalStore(
    (onStoreChange) => incidentStore.subscribe(onStoreChange),
    () => selector(incidentStore.getState()),
    () => selector(incidentStore.getState())
  );
}

// Selectors
export const selectAllIncidents = (state: IncidentStoreState): MonitoringIncident[] => {
  return state.incidents;
};

export const selectOpenIncidentCount = (state: IncidentStoreState): number => {
  return state.incidents.filter((i) => i.status === 'OPEN' || i.severity === 'CRITICAL').length;
};
