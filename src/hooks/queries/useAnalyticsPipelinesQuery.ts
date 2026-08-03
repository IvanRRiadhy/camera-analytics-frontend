import { useQuery } from '@tanstack/react-query';
import { analyticsPipelineService } from '../../services/analyticsPipelineService';
import type { PipelineAssignmentDto } from '../../services/analyticsPipelineService';

export const ANALYTICS_PIPELINES_QUERY_KEY = ['analytics-pipelines'];

export function useAnalyticsPipelinesQuery() {
  return useQuery<PipelineAssignmentDto[]>({
    queryKey: ANALYTICS_PIPELINES_QUERY_KEY,
    queryFn: () => analyticsPipelineService.getPipelines(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
