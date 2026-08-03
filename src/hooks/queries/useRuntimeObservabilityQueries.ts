import { useQuery } from '@tanstack/react-query';
import { runtimeObservabilityService } from '../../services/runtimeObservabilityService';
import type { RuntimeDashboardDto, EngineRuntimeDto, PluginRuntimeDto } from '../../services/runtimeObservabilityService';

export const RUNTIME_DASHBOARD_QUERY_KEY = ['runtime-dashboard'];
export const RUNTIME_ENGINES_QUERY_KEY = ['runtime-engines'];
export const RUNTIME_PLUGINS_QUERY_KEY = ['runtime-plugins'];

export function useRuntimeDashboardQuery() {
  return useQuery<RuntimeDashboardDto>({
    queryKey: RUNTIME_DASHBOARD_QUERY_KEY,
    queryFn: () => runtimeObservabilityService.getDashboard(),
    refetchInterval: 3000,
  });
}

export function useRuntimeEnginesQuery() {
  return useQuery<EngineRuntimeDto[]>({
    queryKey: RUNTIME_ENGINES_QUERY_KEY,
    queryFn: () => runtimeObservabilityService.getEngines(),
    refetchInterval: 3000,
  });
}

export function useRuntimePluginsQuery() {
  return useQuery<PluginRuntimeDto[]>({
    queryKey: RUNTIME_PLUGINS_QUERY_KEY,
    queryFn: () => runtimeObservabilityService.getPlugins(),
    refetchInterval: 3000,
  });
}
