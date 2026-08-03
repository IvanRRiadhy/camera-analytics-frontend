import { useQuery } from '@tanstack/react-query';
import axiosServices from '../utils/axios';

export interface PipelineAssignmentDto {
  id: string;
  pipelineId: string;
  cameraId: string;
  engineInstanceId: string;
  instanceIdString: string;
  hostname: string;
  pipelineName: string;
  priority: number;
  requiredCapabilities: string[];
  analyticsModules: string[];
  status: 'Unknown' | 'Unassigned' | 'Assigned' | 'Starting' | 'Running' | 'Stopping' | 'Stopped' | 'Failed' | 'Recovering';
  assignedAtUtc: string;
  startedAtUtc?: string;
  stoppedAtUtc?: string;
}

export const usePipelineRegistry = (statusFilter?: string) => {
  return useQuery<PipelineAssignmentDto[]>({
    queryKey: ['pipelines', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/api/v1/orchestrator/pipelines?status=${statusFilter}` : '/api/v1/orchestrator/pipelines';
      const res = await axiosServices.get(url);
      return res.data;
    },
    refetchInterval: false,
    staleTime: Infinity,
  });
};

export const usePipelineByCamera = (cameraId: string) => {
  return useQuery<PipelineAssignmentDto>({
    queryKey: ['pipelineByCamera', cameraId],
    queryFn: async () => {
      const res = await axiosServices.get(`/api/v1/orchestrator/cameras/${cameraId}/pipeline`);
      return res.data;
    },
    enabled: Boolean(cameraId),
  });
};
