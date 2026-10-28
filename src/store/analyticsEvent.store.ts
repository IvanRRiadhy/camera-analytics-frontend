/**
 * Framework-Independent Immutable Analytics Event Store (ADR-011 Phase 4.5)
 * Refactored to inherit from BaseRealtimeStore & register with RealtimeStoreRegistry
 */

import { useSyncExternalStore } from 'react';
import type { MonitoringEvent } from '../hooks/useMonitoring';
import { BaseRealtimeStore, type BaseStoreStatistics } from './baseRealtime.store';
import { realtimeStoreRegistry } from './storeRegistry';

export interface AnalyticsEventStoreStatistics extends BaseStoreStatistics {
  totalEventsReceived: number;
  totalEventsStored: number;
  duplicateEventsIgnored: number;
  outOfOrderEventsIgnored: number;
  invalidPayloadsRejected: number;
  lastEventTimestamp: string | null;
}

export interface AnalyticsEventStoreState {
  events: MonitoringEvent[];
  eventsById: Record<string, MonitoringEvent>;
  maxHistory: number;
  statistics: AnalyticsEventStoreStatistics;
}

class AnalyticsEventStore extends BaseRealtimeStore<AnalyticsEventStoreState, AnalyticsEventStoreStatistics> {
  constructor() {
    super('AnalyticsEventStore', {
      events: [],
      eventsById: {},
      maxHistory: 500,
      statistics: {
        totalReceived: 0,
        totalStored: 0,
        duplicateIgnored: 0,
        outOfOrderIgnored: 0,
        invalidPayloadsRejected: 0,
        lastTimestamp: null,
        totalEventsReceived: 0,
        totalEventsStored: 0,
        duplicateEventsIgnored: 0,
        outOfOrderEventsIgnored: 0,
        lastEventTimestamp: null,
      },
    });
  }

  public getStatistics(): AnalyticsEventStoreStatistics {
    return this.state.statistics;
  }

  private normalizeEvent(payload: unknown): MonitoringEvent | null {
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as Record<string, unknown>;

    const id = (p.id as string) || (p.eventId as string) || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = (p.timestamp as string) || (p.timestampUtc as string) || new Date().toLocaleTimeString('en-GB', { hour12: false });
    const pluginCode = (p.pluginCode as string) || (p.plugin_code as string) || 'analytics_event';
    const pluginCategory = (p.pluginCategory as string) || (p.category as string) || 'SAFETY_SECURITY';
    const cameraName = (p.cameraName as string) || (p.camera_name as string) || 'Active Camera';
    const zoneName = (p.zoneName as string) || (p.zone_name as string) || 'Active Zone';
    const confidence = typeof p.confidence === 'number' ? p.confidence : 0.95;
    const severity = p.severity === 'CRITICAL' ? 'CRITICAL' : p.severity === 'WARNING' ? 'WARNING' : 'INFO';
    const description = (p.description as string) || (p.message as string) || 'Analytics Detection Event';
    const isIncident = Boolean(p.isIncident || severity === 'CRITICAL');

    return {
      id,
      timestamp,
      pluginCode,
      pluginCategory: pluginCategory as MonitoringEvent['pluginCategory'],
      cameraName,
      zoneName,
      confidence,
      severity,
      description,
      isIncident,
    };
  }

  public hydrateEvents(initialEvents: unknown[]): void {
    if (!Array.isArray(initialEvents)) return;

    const validList: MonitoringEvent[] = [];
    const map: Record<string, MonitoringEvent> = {};

    for (const raw of initialEvents) {
      const evt = this.normalizeEvent(raw);
      if (evt && !map[evt.id]) {
        map[evt.id] = evt;
        validList.push(evt);
      }
    }

    const bounded = validList.slice(0, this.state.maxHistory);

    this.state = {
      ...this.state,
      events: bounded,
      eventsById: map,
    };

    this.notify();
  }

  public appendEvent(rawPayload: unknown): void {
    const stats = { ...this.state.statistics };
    stats.totalReceived++;
    stats.totalEventsReceived++;

    const evt = this.normalizeEvent(rawPayload);
    if (!evt) {
      stats.invalidPayloadsRejected++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    if (this.state.eventsById[evt.id]) {
      stats.duplicateIgnored++;
      stats.duplicateEventsIgnored++;
      this.state = { ...this.state, statistics: stats };
      return;
    }

    stats.totalStored++;
    stats.totalEventsStored++;
    stats.lastTimestamp = evt.timestamp;
    stats.lastEventTimestamp = evt.timestamp;

    const newMap = { [evt.id]: evt, ...this.state.eventsById };
    const newEvents = [evt, ...this.state.events].slice(0, this.state.maxHistory);

    this.state = {
      ...this.state,
      events: newEvents,
      eventsById: newMap,
      statistics: stats,
    };

    this.notify();
  }

  public clearEvents(): void {
    this.state = {
      ...this.state,
      events: [],
      eventsById: {},
    };
    this.notify();
  }
}

// Singleton Store Instance
export const analyticsEventStore = new AnalyticsEventStore();

// Register with global registry
realtimeStoreRegistry.registerStore(analyticsEventStore);

/** React Sync External Store Subscription Hook */
export function useAnalyticsEventStore<T>(selector: (state: AnalyticsEventStoreState) => T): T {
  return useSyncExternalStore(
    (onStoreChange) => analyticsEventStore.subscribe(onStoreChange),
    () => selector(analyticsEventStore.getState()),
    () => selector(analyticsEventStore.getState())
  );
}

// Selectors
export const selectAllEvents = (state: AnalyticsEventStoreState): MonitoringEvent[] => {
  return state.events;
};

const filteredEventsCache = new WeakMap<MonitoringEvent[], Map<string, MonitoringEvent[]>>();

export const selectFilteredEvents = (
  state: AnalyticsEventStoreState,
  categoryFilter: string
): MonitoringEvent[] => {
  if (!categoryFilter || categoryFilter === 'ALL') {
    return state.events;
  }

  let byCategory = filteredEventsCache.get(state.events);
  if (!byCategory) {
    byCategory = new Map();
    filteredEventsCache.set(state.events, byCategory);
  }

  const cached = byCategory.get(categoryFilter);
  if (cached) return cached;

  const filtered = state.events.filter((e) => e.pluginCategory === categoryFilter);
  byCategory.set(categoryFilter, filtered);
  return filtered;
};

export const selectTotalEventCount = (state: AnalyticsEventStoreState): number => {
  return state.events.length;
};
