import { useQuery } from '@tanstack/react-query';
import axiosServices from '../utils/axios';

export interface EngineHealthHistoryPoint {
  id: string;
  engineInstanceId: string;
  cpuUsagePercent: number;
  gpuUsagePercent: number;
  vramUsedMb: number;
  totalVramMb: number;
  gpuTemperatureC: number;
  inferenceFps: number;
  frameDropCount: number;
  activePipelinesCount: number;
  healthScore: number;
  healthState: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  timestampUtc: string;
}

export const useTelemetryHistory = (engineInstanceId: string, take: number = 50) => {
  return useQuery<EngineHealthHistoryPoint[]>({
    queryKey: ['telemetryHistory', engineInstanceId, take],
    queryFn: async () => {
      const res = await axiosServices.get(`/api/v1/orchestrator/health/history/${engineInstanceId}?take=${take}`);
      return res.data;
    },
    enabled: Boolean(engineInstanceId),
    refetchInterval: 5000,
  });
};
