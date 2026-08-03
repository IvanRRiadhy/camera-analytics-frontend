import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export interface RuntimeDashboardDto {
  timestampUtc: string;
  onlineEngines: number;
  offlineEngines: number;
  runningPipelines: number;
  runningPlugins: number;
  gpuUsagePercent: number;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  averageFps: number;
  averageLatencyMs: number;
  publishedEventsPerSec: number;
  totalPublishedEvents: number;
}

export interface EngineRuntimeDto {
  id: string;
  engineInstanceId: string;
  hostname: string;
  ipAddress: string;
  engineVersion: string;
  cudaVersion: string;
  gpuModel: string;
  gpuDriver: string;
  cpuModel: string;
  ramTotalMb: number;
  ramUsedMb: number;
  vramTotalMb: number;
  vramUsedMb: number;
  cpuUtilization: number;
  gpuUtilization: number;
  diskUsage: number;
  temperatureC: number;
  inferenceFps: number;
  averageLatencyMs: number;
  queueLength: number;
  droppedFrames: number;
  processedFrames: number;
  publishedEvents: number;
  reconnectCount: number;
  status: string;
  lastHeartbeatUtc: string;
}

export interface PluginRuntimeDto {
  id: string;
  pipelineId?: string;
  pluginName: string;
  pluginVersion: string;
  status: 'Running' | 'Paused' | 'Failed';
  currentFps: number;
  averageInferenceTimeMs: number;
  framesProcessed: number;
  eventsGenerated: number;
  errors: number;
  warnings: number;
  droppedFrames: number;
  memoryUsageMb: number;
  gpuUsagePercent: number;
  cpuUsagePercent: number;
  lastEventTimestampUtc?: string;
}

export const runtimeObservabilityService = {
  getDashboard: async (): Promise<RuntimeDashboardDto> => {
    const response = await axios.get<RuntimeDashboardDto>(`${API_URL}/api/v1/runtime/dashboard`);
    return response.data;
  },

  getEngines: async (): Promise<EngineRuntimeDto[]> => {
    const response = await axios.get<EngineRuntimeDto[]>(`${API_URL}/api/v1/runtime/engines`);
    return response.data;
  },

  getPlugins: async (): Promise<PluginRuntimeDto[]> => {
    const response = await axios.get<PluginRuntimeDto[]>(`${API_URL}/api/v1/runtime/plugins`);
    return response.data;
  }
};
