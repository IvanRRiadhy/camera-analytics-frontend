/**
 * Spatial Zone Aggregate Domain Models
 */

export interface AnalyticsZoneAggregate {
  zoneId: string;
  zoneName?: string;
  occupancyCount: number;
  activeTrackIds?: number[];
  reportingCameras: string[];
  metricsByPlugin: Record<string, Record<string, unknown>>;
  lastUpdatedUtc: string;
}
