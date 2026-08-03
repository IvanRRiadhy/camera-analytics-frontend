/**
 * Generic Analytics Plugin & Module Domain Models
 * Enables dynamic handling of any existing or future AI plugin without schema changes.
 * 
 * Concept: Plugins -> Zones -> Aggregated Values
 */

export interface CameraModuleContribution {
  cameraId: string;
  cameraName?: string;
  metrics: Record<string, number | string | boolean | number[]>;
  timestampUtc: string;
}

export interface ZonePluginContribution {
  zoneId: string;
  zoneName?: string;
  metrics: Record<string, number | string | boolean | number[]>;
  reportingCameras: string[];
  lastUpdatedUtc: string;
}

export interface AggregatePluginSummary {
  pluginCode: string;
  displayName: string;
  activeCount: number;
  totalCamerasReporting: number;
  totalZonesReporting: number;
  metrics: Record<string, number>;
  byCamera: Record<string, CameraModuleContribution>;
  byZone: Record<string, ZonePluginContribution>;
  lastUpdatedUtc: string;
}
