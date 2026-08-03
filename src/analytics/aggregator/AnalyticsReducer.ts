/**
 * Generic Analytics Reducer (Sprint 3 Enterprise Aggregation)
 * Merges CameraAnalyticsSnapshot payloads into an enterprise data structure:
 * Plugins -> Zones -> Aggregated Values.
 * 
 * Open-Closed Principle: Handles arbitrary new AI plugins dynamically without code modifications.
 */

import type { CameraAnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import type { AggregatePluginSummary, CameraModuleContribution } from '../models/AnalyticsModule';
import type { RuntimeAnalyticsState } from '../store/runtimeAnalyticsStore';

/** Format camelCase/pascalCase plugin keys into clean human-readable display names */
function formatDisplayName(key: string): string {
  const camelCase = key.charAt(0).toLowerCase() + key.slice(1);
  return camelCase.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

/** Flatten plugin state object into numeric/primitive key-value dictionary */
function extractPrimitiveMetrics(obj: unknown): Record<string, number | string | boolean | number[]> {
  if (!obj || typeof obj !== 'object') return {};
  const metrics: Record<string, number | string | boolean | number[]> = {};

  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean') {
      metrics[key] = val;
    } else if (Array.isArray(val) && val.every((item) => typeof item === 'number')) {
      metrics[key] = val;
    }
  }
  return metrics;
}

export function reduceAnalyticsSnapshot(
  state: RuntimeAnalyticsState,
  snapshot: CameraAnalyticsSnapshot
): RuntimeAnalyticsState {
  const rawCamId = snapshot.cameraId || snapshot.CameraId;
  if (!rawCamId) return state;

  const timestamp = snapshot.timestamp || snapshot.Timestamp || new Date().toISOString();
  const pluginsPayload = snapshot.plugins || snapshot.Plugins || {};

  const updatedPlugins = { ...state.plugins };
  const updatedZones = { ...state.zones };

  // Iterate over all plugin states dynamically (Generic for any existing & future AI plugins)
  for (const [rawPluginKey, pluginValue] of Object.entries(pluginsPayload)) {
    if (!pluginValue || typeof pluginValue !== 'object') continue;

    // Normalize plugin key to lowerCamelCase (e.g. PeopleCounting -> peopleCounting)
    const pluginCode = rawPluginKey.charAt(0).toLowerCase() + rawPluginKey.slice(1);
    const displayName = formatDisplayName(rawPluginKey);
    const metrics = extractPrimitiveMetrics(pluginValue);

    const camContribution: CameraModuleContribution = {
      cameraId: rawCamId,
      metrics,
      timestampUtc: timestamp,
    };

    const existingPluginSummary: AggregatePluginSummary = updatedPlugins[pluginCode] || {
      pluginCode,
      displayName,
      activeCount: 0,
      totalCamerasReporting: 0,
      totalZonesReporting: 0,
      metrics: {},
      byCamera: {},
      byZone: {},
      lastUpdatedUtc: timestamp,
    };

    const nextByCamera = {
      ...existingPluginSummary.byCamera,
      [rawCamId]: camContribution,
    };

    const nextByZone = { ...existingPluginSummary.byZone };

    // Extract Zone-level metrics from plugin payload if present
    const pObj = pluginValue as Record<string, unknown>;
    const zoneMapCandidates = [
      pObj.occupancyByZone,
      pObj.OccupancyByZone,
      pObj.byZone,
      pObj.ByZone,
      pObj.zones,
      pObj.Zones,
      pObj.zoneMetrics,
      pObj.ZoneMetrics,
    ];

    for (const zMap of zoneMapCandidates) {
      if (zMap && typeof zMap === 'object') {
        for (const [zId, zVal] of Object.entries(zMap as Record<string, unknown>)) {
          const zMetrics = typeof zVal === 'number' ? { count: zVal } : extractPrimitiveMetrics(zVal);
          const existingZoneContrib = nextByZone[zId] || {
            zoneId: zId,
            zoneName: zId.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
            metrics: {},
            reportingCameras: [],
            lastUpdatedUtc: timestamp,
          };

          const camSet = new Set(existingZoneContrib.reportingCameras);
          camSet.add(rawCamId);

          nextByZone[zId] = {
            ...existingZoneContrib,
            metrics: { ...existingZoneContrib.metrics, ...zMetrics },
            reportingCameras: Array.from(camSet),
            lastUpdatedUtc: timestamp,
          };

          // Also update global zones map
          const globalZone = updatedZones[zId] || {
            zoneId: zId,
            zoneName: existingZoneContrib.zoneName,
            occupancyCount: 0,
            reportingCameras: [],
            metricsByPlugin: {},
            lastUpdatedUtc: timestamp,
          };

          const occVal = typeof zVal === 'number' ? zVal : typeof (zVal as any)?.count === 'number' ? (zVal as any).count : 0;
          const globalCamSet = new Set(globalZone.reportingCameras);
          globalCamSet.add(rawCamId);

          updatedZones[zId] = {
            ...globalZone,
            occupancyCount: Math.max(globalZone.occupancyCount, occVal),
            reportingCameras: Array.from(globalCamSet),
            metricsByPlugin: {
              ...globalZone.metricsByPlugin,
              [pluginCode]: zMetrics,
            },
            lastUpdatedUtc: timestamp,
          };
        }
      }
    }

    // Aggregate metrics across all cameras for this plugin
    const aggregatedMetrics: Record<string, number> = {};
    let activeSum = 0;

    for (const contrib of Object.values(nextByCamera)) {
      for (const [mKey, mVal] of Object.entries(contrib.metrics)) {
        if (typeof mVal === 'number' && !isNaN(mVal)) {
          aggregatedMetrics[mKey] = (aggregatedMetrics[mKey] || 0) + mVal;
          if (
            mKey.toLowerCase().includes('count') ||
            mKey.toLowerCase().includes('current') ||
            mKey.toLowerCase().includes('active') ||
            mKey.toLowerCase().includes('length')
          ) {
            activeSum += mVal;
          }
        }
      }
    }

    updatedPlugins[pluginCode] = {
      ...existingPluginSummary,
      activeCount: activeSum,
      totalCamerasReporting: Object.keys(nextByCamera).length,
      totalZonesReporting: Object.keys(nextByZone).length,
      metrics: aggregatedMetrics,
      byCamera: nextByCamera,
      byZone: nextByZone,
      lastUpdatedUtc: timestamp,
    };
  }

  // Update Statistics
  const stats = { ...state.statistics };
  stats.totalSnapshotsProcessed++;
  stats.validSnapshotsReceived++;
  stats.activePluginsCount = Object.keys(updatedPlugins).length;
  stats.activeZonesCount = Object.keys(updatedZones).length;
  stats.lastUpdatedUtc = timestamp;

  // Track unique active reporting cameras across all plugins
  const allReportingCams = new Set<string>();
  for (const pSummary of Object.values(updatedPlugins)) {
    for (const cId of Object.keys(pSummary.byCamera)) {
      allReportingCams.add(cId);
    }
  }
  stats.activeCamerasCount = allReportingCams.size;

  return {
    plugins: updatedPlugins,
    zones: updatedZones,
    statistics: stats,
    lastSnapshotTimestamp: timestamp,
  };
}
