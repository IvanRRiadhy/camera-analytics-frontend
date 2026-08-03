import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsPipelineService } from '../../services/analyticsPipelineService';
import { ANALYTICS_PIPELINES_QUERY_KEY } from '../queries/useAnalyticsPipelinesQuery';

export function usePipelineModuleAssignmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pipelineId, moduleIds }: { pipelineId: string; moduleIds: string[] }) =>
      analyticsPipelineService.updatePipelineModules(pipelineId, moduleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_PIPELINES_QUERY_KEY });
    },
  });
}
