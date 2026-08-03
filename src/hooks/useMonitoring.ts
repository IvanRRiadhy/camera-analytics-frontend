import { useQuery } from '@tanstack/react-query';
import axiosServices from '../utils/axios';

export interface SiteOption {
  id: string;
  name: string;
  code: string;
}

export interface CameraOption {
  id: string;
  name: string;
  rtspUrl: string;
  status: string;
  resolution: string;
  roomId?: string;
}

export interface EngineOption {
  instanceId: string;
  hostname: string;
  gpuModel: string;
  engineVersion: string;
  lastHeartbeatUtc: string;
  installedPluginsJson?: string;
}

export interface PipelineOption {
  id: string;
  pipelineId: string;
  cameraName: string;
  status: string;
  cameraId?: string;
  instanceId?: string;
  rtspUrl?: string;
  analyticsModules?: string[];
}

export interface AnalyticsCounters {
  peopleCount: number;
  queueLength: number;
  loiteringAvgSeconds: number;
  ppeCompliancePercent: number;
}

export interface MonitoringOverview {
  sites: SiteOption[];
  cameras: CameraOption[];
  pipelines: PipelineOption[];
  engines?: EngineOption[];
  counters: AnalyticsCounters;
}

export interface MonitoringEvent {
  id: string;
  timestamp: string;
  pluginCode: string;
  pluginCategory: 'BUSINESS_INTELLIGENCE' | 'SAFETY_SECURITY' | 'TRAFFIC_MOBILITY' | 'OPERATIONAL_COMPLIANCE';
  cameraName: string;
  zoneName: string;
  trackId?: string;
  confidence: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  isIncident: boolean;
}

export interface MonitoringIncident {
  id: string;
  timestamp: string;
  pluginCode: string;
  cameraName: string;
  severity: string;
  status: string;
  description: string;
}

export const useMonitoringOverview = () => {
  return useQuery<MonitoringOverview>({
    queryKey: ['monitoringOverview'],
    queryFn: async () => {
      const res = await axiosServices.get('/api/v1/monitoring/overview');
      return res.data;
    },
    refetchInterval: false,
    staleTime: Infinity,
  });
};

export const useMonitoringEvents = () => {
  return useQuery<MonitoringEvent[]>({
    queryKey: ['monitoringEvents'],
    queryFn: async () => {
      const res = await axiosServices.get('/api/v1/monitoring/events');
      return res.data;
    },
    refetchInterval: false,
    staleTime: Infinity,
  });
};

export const useMonitoringIncidents = () => {
  return useQuery<MonitoringIncident[]>({
    queryKey: ['monitoringIncidents'],
    queryFn: async () => {
      const res = await axiosServices.get('/api/v1/monitoring/incidents');
      return res.data;
    },
    refetchInterval: false,
    staleTime: Infinity,
  });
};
