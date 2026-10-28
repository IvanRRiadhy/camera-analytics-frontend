/**
 * Pure Selector Functions for Runtime Analytics Store
 * Facilitates zero-calculation presentation consumption in UI components.
 */

import type { RuntimeAnalyticsState } from '../store/runtimeAnalyticsStore';
import type { AggregatePluginSummary, CameraModuleContribution, ZonePluginContribution } from '../models/AnalyticsModule';
import type { AnalyticsZoneAggregate } from '../models/AnalyticsZone';

const EMPTY_PLUGINS: AggregatePluginSummary[] = [];
const EMPTY_PLUGIN_ZONES: ZonePluginContribution[] = [];
const EMPTY_ZONES: AnalyticsZoneAggregate[] = [];
const EMPTY_CAMERA_PLUGINS: Record<string, CameraModuleContribution> = {};

const allPluginsCache = new WeakMap<Record<string, AggregatePluginSummary>, AggregatePluginSummary[]>();
const pluginZonesCache = new WeakMap<Record<string, ZonePluginContribution>, ZonePluginContribution[]>();
const allZonesCache = new WeakMap<Record<string, AnalyticsZoneAggregate>, AnalyticsZoneAggregate[]>();
const cameraPluginsCache = new WeakMap<
  Record<string, AggregatePluginSummary>,
  Map<string, Record<string, CameraModuleContribution>>
>();

/** Select all active aggregated plugin summaries (referentially stable for useSyncExternalStore) */
export function selectAllPlugins(state: RuntimeAnalyticsState): AggregatePluginSummary[] {
  const pluginsMap = state.plugins;
  if (!pluginsMap) return EMPTY_PLUGINS;

  const cached = allPluginsCache.get(pluginsMap);
  if (cached) return cached;

  const list = Object.values(pluginsMap);
  const result = list.length === 0 ? EMPTY_PLUGINS : list;
  allPluginsCache.set(pluginsMap, result);
  return result;
}

/** Select a specific aggregated plugin by its code (e.g. 'peopleCounting', 'queueDetection') */
export function selectPlugin(state: RuntimeAnalyticsState, pluginCode: string): AggregatePluginSummary | null {
  if (!pluginCode) return null;
  const key = pluginCode.charAt(0).toLowerCase() + pluginCode.slice(1);
  return state.plugins[key] || state.plugins[pluginCode] || null;
}

/** Select a specific plugin by human-readable display name (e.g. 'People Counting') */
export function selectPluginByName(state: RuntimeAnalyticsState, displayName: string): AggregatePluginSummary | null {
  if (!displayName) return null;
  const target = displayName.toLowerCase();
  for (const plugin of selectAllPlugins(state)) {
    if (plugin.displayName.toLowerCase() === target || plugin.pluginCode.toLowerCase() === target) {
      return plugin;
    }
  }
  return null;
}

/** Select zones belonging to a specific plugin, sorted alphabetically (referentially stable) */
export function selectPluginZones(state: RuntimeAnalyticsState, pluginCode: string): ZonePluginContribution[] {
  const plugin = selectPlugin(state, pluginCode);
  if (!plugin || !plugin.byZone) return EMPTY_PLUGIN_ZONES;

  const cached = pluginZonesCache.get(plugin.byZone);
  if (cached) return cached;

  const values = Object.values(plugin.byZone);
  if (values.length === 0) {
    pluginZonesCache.set(plugin.byZone, EMPTY_PLUGIN_ZONES);
    return EMPTY_PLUGIN_ZONES;
  }

  const sorted = values.sort((a, b) => {
    const nameA = a.zoneName || a.zoneId;
    const nameB = b.zoneName || b.zoneId;
    return nameA.localeCompare(nameB);
  });
  pluginZonesCache.set(plugin.byZone, sorted);
  return sorted;
}

/** Select formatted primary header metric string for accordion summary (e.g. "Current: 18", "Queue: 4") */
export function selectPluginHeaderSummary(plugin: AggregatePluginSummary | null): string {
  if (!plugin) return 'Status: Active';

  const code = plugin.pluginCode.toLowerCase();
  const metrics = plugin.metrics;

  if (code.includes('people') && metrics.current !== undefined) return `Current : ${metrics.current}`;
  if (code.includes('queue') && (metrics.queueLength !== undefined || metrics.waitingPeople !== undefined)) {
    return `Queue : ${metrics.queueLength ?? metrics.waitingPeople}`;
  }
  if (code.includes('loitering') && metrics.active !== undefined) return `Active : ${metrics.active}`;
  if (code.includes('occupancy') && (metrics.occupancyCount !== undefined || metrics.count !== undefined)) {
    return `Total Occupancy : ${metrics.occupancyCount ?? metrics.count}`;
  }

  // Generic fallback: pick first available numeric metric
  for (const [mKey, mVal] of Object.entries(metrics)) {
    if (typeof mVal === 'number') {
      const formattedKey = mKey.charAt(0).toUpperCase() + mKey.slice(1);
      return `${formattedKey} : ${mVal}`;
    }
  }

  return `Active (${plugin.totalCamerasReporting} Cams)`;
}

/** Select all spatial zone aggregates (referentially stable) */
export function selectAllZones(state: RuntimeAnalyticsState): AnalyticsZoneAggregate[] {
  const zonesMap = state.zones;
  if (!zonesMap) return EMPTY_ZONES;

  const cached = allZonesCache.get(zonesMap);
  if (cached) return cached;

  const list = Object.values(zonesMap);
  const result = list.length === 0 ? EMPTY_ZONES : list;
  allZonesCache.set(zonesMap, result);
  return result;
}

/** Select a specific spatial zone by zone ID */
export function selectZone(state: RuntimeAnalyticsState, zoneId: string): AnalyticsZoneAggregate | null {
  if (!zoneId) return null;
  return state.zones[zoneId] || null;
}

/** Select overall system analytics statistics */
export function selectStatistics(state: RuntimeAnalyticsState) {
  return state.statistics;
}

/** Select analytics contributions for a specific camera across all active plugins (referentially stable) */
export function selectCamera(state: RuntimeAnalyticsState, cameraId: string): Record<string, CameraModuleContribution> {
  if (!cameraId || !state.plugins) return EMPTY_CAMERA_PLUGINS;

  let byCameraMap = cameraPluginsCache.get(state.plugins);
  if (!byCameraMap) {
    byCameraMap = new Map();
    cameraPluginsCache.set(state.plugins, byCameraMap);
  }

  const cached = byCameraMap.get(cameraId);
  if (cached) return cached;

  const cameraPlugins: Record<string, CameraModuleContribution> = {};
  let hasEntries = false;

  for (const [pluginCode, pluginSummary] of Object.entries(state.plugins)) {
    if (pluginSummary.byCamera[cameraId]) {
      cameraPlugins[pluginCode] = pluginSummary.byCamera[cameraId];
      hasEntries = true;
    }
  }

  const result = hasEntries ? cameraPlugins : EMPTY_CAMERA_PLUGINS;
  byCameraMap.set(cameraId, result);
  return result;
}
