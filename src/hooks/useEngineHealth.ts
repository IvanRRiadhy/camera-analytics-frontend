import { useQuery } from '@tanstack/react-query';
import axiosServices from '../utils/axios';

export interface EngineHealthSummary {
  instanceId: string;
  instanceIdString: string;
  hostname: string;
  ipAddress: string;
  state: string;
  healthScore: number;
  healthState: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  cpuUsagePercent: number;
  gpuUsagePercent: number;
  vramUsedMb: number;
  totalVramMb: number;
  gpuTemperatureC: number;
  inferenceFps: number;
  frameDropCount: number;
  activePipelinesCount: number;
  lastHeartbeatUtc: string;
}

export interface EngineFleetHealthOverview {
  totalEngines: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  offlineCount: number;
  averageHealthScore: number;
  engines: EngineHealthSummary[];
}

export const useEngineHealth = () => {
  return useQuery<EngineFleetHealthOverview>({
    queryKey: ['engineHealth'],
    queryFn: async () => {
      const res = await axiosServices.get('/api/v1/orchestrator/health/engines');
      return res.data;
    },
    refetchInterval: false,
    staleTime: Infinity,
  });
};

export const useEngineHealthDetail = (engineInstanceId: string) => {
  return useQuery<EngineHealthSummary>({
    queryKey: ['engineHealthDetail', engineInstanceId],
    queryFn: async () => {
      const res = await axiosServices.get(`/api/v1/orchestrator/health/engines/${engineInstanceId}`);
      return res.data;
    },
    enabled: Boolean(engineInstanceId),
    refetchInterval: 5000,
  });
};
