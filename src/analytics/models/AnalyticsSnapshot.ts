/**
 * Strongly Typed CameraAnalyticsSnapshot Contract (SignalR Payload Model)
 * Matches ASP.NET Core & Python AI Engine CameraAnalyticsSnapshot contract.
 */

export interface PeopleCountingState {
  current?: number;
  entered?: number;
  exited?: number;
  Current?: number;
  Entered?: number;
  Exited?: number;
}

export interface QueueDetectionState {
  queueLength?: number;
  waitingPeople?: number;
  QueueLength?: number;
  WaitingPeople?: number;
}

export interface LoiteringState {
  active?: number;
  trackIds?: number[];
  Active?: number;
  TrackIds?: number[];
}

export interface ZoneOccupancyState {
  occupancyByZone?: Record<string, number>;
  OccupancyByZone?: Record<string, number>;
}

export interface PipelineHealthState {
  fps: number;
  latencyMs: number;
  inferenceTimeMs?: number;
  trackerTimeMs?: number;
  frameCount?: number;
  status: string;
  engineVersion?: string;
  Fps?: number;
  LatencyMs?: number;
  Status?: string;
}

export interface PluginStates {
  peopleCounting?: PeopleCountingState;
  queueDetection?: QueueDetectionState;
  loitering?: LoiteringState;
  zoneOccupancy?: ZoneOccupancyState;
  PeopleCounting?: PeopleCountingState;
  QueueDetection?: QueueDetectionState;
  Loitering?: LoiteringState;
  ZoneOccupancy?: ZoneOccupancyState;
  [key: string]: unknown;
}

export interface CameraAnalyticsSnapshot {
  messageId?: string;
  MessageId?: string;
  schemaVersion?: string;
  SchemaVersion?: string;
  engineId?: string;
  EngineId?: string;
  cameraId: string;
  CameraId?: string;
  pipelineId?: string;
  PipelineId?: string;
  timestamp?: string;
  Timestamp?: string;
  health?: PipelineHealthState;
  Health?: PipelineHealthState;
  plugins?: PluginStates;
  Plugins?: PluginStates;
}
