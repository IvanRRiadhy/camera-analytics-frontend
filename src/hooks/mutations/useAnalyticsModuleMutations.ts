import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsModuleService } from '../../services/analyticsModuleService';
import type { CreateAnalyticsModulePayload } from '../../services/analyticsModuleService';
import { ANALYTICS_MODULES_QUERY_KEY } from '../queries/useAnalyticsModulesQuery';

export function useAnalyticsModuleMutations() {
  const queryClient = useQueryClient();

  const createModule = useMutation({
    mutationFn: (payload: CreateAnalyticsModulePayload) => analyticsModuleService.createModule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_MODULES_QUERY_KEY });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      analyticsModuleService.toggleModuleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_MODULES_QUERY_KEY });
    },
  });

  const deleteModule = useMutation({
    mutationFn: (id: string) => analyticsModuleService.deleteModule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_MODULES_QUERY_KEY });
    },
  });

  return {
    createModule,
    toggleStatus,
    deleteModule,
  };
}
