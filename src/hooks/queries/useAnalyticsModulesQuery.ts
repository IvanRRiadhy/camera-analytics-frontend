import { useQuery } from '@tanstack/react-query';
import { analyticsModuleService } from '../../services/analyticsModuleService';
import type { AnalyticsModuleDto } from '../../services/analyticsModuleService';

export const ANALYTICS_MODULES_QUERY_KEY = ['analytics-modules'];

export function useAnalyticsModulesQuery() {
  return useQuery<AnalyticsModuleDto[]>({
    queryKey: ANALYTICS_MODULES_QUERY_KEY,
    queryFn: () => analyticsModuleService.getModules(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
 