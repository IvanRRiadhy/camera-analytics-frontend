import { useQuery } from '@tanstack/react-query';
import axiosServices from '../utils/axios';

export interface EngineNodeDto {
  instanceId: string;
  hostname: string;
  ipAddress: string;
  state: string;
  gpuModel: string;
  totalVramMb: number;
  usedVramMb: number;
  gpuUsagePercent: number;
  activePipelines: number;
  lastHeartbeatUtc: string;
}

export interface EngineFleetSummaryDto {
  totalNodes: number;
  onlineNodes: number;
  nodes: EngineNodeDto[];
}

export const useEngineRegistry = () => {
  return useQuery<EngineFleetSummaryDto>({
    queryKey: ['engineNodes'],
    queryFn: async () => {
      const res = await axiosServices.get('/api/v1/orchestration/nodes');
      return res.data;
    },
    refetchInterval: 5000,
  });
};
