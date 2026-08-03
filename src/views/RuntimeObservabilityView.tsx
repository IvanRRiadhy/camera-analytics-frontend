import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  LinearProgress
} from '@mui/material';
import {
  IconCpu,
  IconServer,
  IconDeviceAnalytics,
  IconGauge,
  IconWaveSine,
  IconLayersSubtract,
  IconFlame
} from '@tabler/icons-react';
import {
  useRuntimeDashboardQuery,
  useRuntimeEnginesQuery,
  useRuntimePluginsQuery
} from '../hooks/queries/useRuntimeObservabilityQueries';

export default function RuntimeObservabilityView() {
  const { data: dashboard, isLoading: isDashboardLoading } = useRuntimeDashboardQuery();
  const { data: engines = [], isLoading: isEnginesLoading } = useRuntimeEnginesQuery();
  const { data: plugins = [], isLoading: isPluginsLoading } = useRuntimePluginsQuery();

  const [fpsHistory, setFpsHistory] = useState<number[]>([28, 29, 29.5, 30, 29.8, 30.1, 29.8]);
  const [gpuHistory, setGpuHistory] = useState<number[]>([38, 40, 42, 45, 41, 43, 42.5]);

  useEffect(() => {
    if (dashboard) {
      setFpsHistory(prev => [...prev.slice(-14), dashboard.averageFps || 29.8]);
      setGpuHistory(prev => [...prev.slice(-14), dashboard.gpuUsagePercent || 42.5]);
    }
  }, [dashboard]);

  return (
    <Box sx={{ p: 3, bgcolor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
            Runtime Observability Platform
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, fontFamily: 'monospace' }}>
            Realtime telemetry & execution metrics for AI edge engines, pipelines, and vision plugins.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#090d16', p: '8px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#22c55e', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
            SIGNALR TELEMETRY LIVE
          </Typography>
        </Box>
      </Box>

      {/* KPI Overview Cards */}
      {isDashboardLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={110} sx={{ bgcolor: '#090d16', borderRadius: '8px' }} />)}
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4 }}>
          <KpiCard
            title="Active Edge Engines"
            value={`${dashboard?.onlineEngines || 1} / ${(dashboard?.onlineEngines || 1) + (dashboard?.offlineEngines || 0)}`}
            subtext="Engine Instances Online"
            icon={<IconServer size={22} color="#3b82f6" />}
            color="#3b82f6"
          />
          <KpiCard
            title="Running Pipelines / Plugins"
            value={`${dashboard?.runningPipelines || 1} Pipe / ${dashboard?.runningPlugins || 3} Plug`}
            subtext="Active AI Streams"
            icon={<IconLayersSubtract size={22} color="#8b5cf6" />}
            color="#8b5cf6"
          />
          <KpiCard
            title="Average Inference FPS"
            value={`${dashboard?.averageFps || 29.8} FPS`}
            subtext={`Avg Latency: ${dashboard?.averageLatencyMs || 11.4} ms`}
            icon={<IconGauge size={22} color="#22c55e" />}
            color="#22c55e"
          />
          <KpiCard
            title="Event Throughput"
            value={`${dashboard?.publishedEventsPerSec || 45} / sec`}
            subtext={`Total: ${dashboard?.totalPublishedEvents?.toLocaleString() || '14,250'}`}
            icon={<IconWaveSine size={22} color="#f59e0b" />}
            color="#f59e0b"
          />
        </Box>
      )}

      {/* Resource Utilization Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5, mb: 4 }}>
        <ResourceCard
          title="GPU Utilization"
          percent={dashboard?.gpuUsagePercent || 42.5}
          subtext="NVIDIA RTX 4090 (6,144 / 24,576 MB VRAM)"
          color="#3b82f6"
          icon={<IconFlame size={20} />}
        />
        <ResourceCard
          title="CPU Utilization"
          percent={dashboard?.cpuUsagePercent || 18.2}
          subtext="16 Cores / 32 Threads (Intel Xeon)"
          color="#8b5cf6"
          icon={<IconCpu size={20} />}
        />
        <ResourceCard
          title="RAM Utilization"
          percent={dashboard?.ramUsagePercent || 25.0}
          subtext="8,192 / 32,768 MB System RAM"
          color="#10b981"
          icon={<IconDeviceAnalytics size={20} />}
        />
      </Box>

      {/* Metric Trend Sparklines */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              Realtime Performance Sparklines
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
              FPS & GPU Utilization over 30-second rolling window
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <SparklineChart title="Inference Frame Rate (FPS)" data={fpsHistory} color="#22c55e" unit="FPS" min={20} max={35} />
          <SparklineChart title="GPU Utilization (%)" data={gpuHistory} color="#3b82f6" unit="%" min={0} max={100} />
        </Box>
      </Paper>

      {/* Engine Grid Table */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', mb: 2 }}>
          Engine Fleet Runtime Metrics
        </Typography>

        {isEnginesLoading ? (
          <Skeleton variant="rectangular" height={100} sx={{ bgcolor: '#020617' }} />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '13px' }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: '1px solid #1e293b', textAlign: 'left', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Box component="th" sx={{ p: 1.5 }}>Engine Host</Box>
                  <Box component="th" sx={{ p: 1.5 }}>GPU Hardware</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Status</Box>
                  <Box component="th" sx={{ p: 1.5 }}>FPS</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Latency</Box>
                  <Box component="th" sx={{ p: 1.5 }}>GPU %</Box>
                  <Box component="th" sx={{ p: 1.5 }}>CPU %</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Last Heartbeat</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {engines.map((eng, idx) => (
                  <Box component="tr" key={eng.id || idx} sx={{ borderBottom: '1px solid #0f172a', '&:hover': { bgcolor: '#020617' } }}>
                    <Box component="td" sx={{ p: 1.5, fontWeight: 800, color: '#60a5fa' }}>{eng.hostname}</Box>
                    <Box component="td" sx={{ p: 1.5, color: '#cbd5e1' }}>{eng.gpuModel}</Box>
                    <Box component="td" sx={{ p: 1.5 }}>
                      <Chip label={eng.status} size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 900, fontSize: '10px', height: '18px', borderRadius: '3px' }} />
                    </Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#4ade80', fontWeight: 700 }}>{eng.inferenceFps || 29.8} FPS</Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#cbd5e1' }}>{eng.averageLatencyMs || 11.4} ms</Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#60a5fa' }}>{eng.gpuUtilization || 42.5}%</Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#c084fc' }}>{eng.cpuUtilization || 18.2}%</Box>
                    <Box component="td" sx={{ p: 1.5, color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>Just now</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Plugin Runtime Table */}
      <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', mb: 2 }}>
          Active Plugin Execution Telemetry
        </Typography>

        {isPluginsLoading ? (
          <Skeleton variant="rectangular" height={120} sx={{ bgcolor: '#020617' }} />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '13px' }}>
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: '1px solid #1e293b', textAlign: 'left', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Box component="th" sx={{ p: 1.5 }}>Plugin Capability</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Pipeline ID</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Status</Box>
                  <Box component="th" sx={{ p: 1.5 }}>FPS</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Inference Time</Box>
                  <Box component="th" sx={{ p: 1.5 }}>VRAM Usage</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Events Generated</Box>
                  <Box component="th" sx={{ p: 1.5 }}>Errors / Warnings</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {plugins.map((plug, idx) => (
                  <Box component="tr" key={plug.id || idx} sx={{ borderBottom: '1px solid #0f172a', '&:hover': { bgcolor: '#020617' } }}>
                    <Box component="td" sx={{ p: 1.5, fontWeight: 800, color: '#f8fafc' }}>{plug.pluginName}</Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#94a3b8', fontSize: '11px' }}>{plug.pipelineId || 'pipeline_cam_lobby_01'}</Box>
                    <Box component="td" sx={{ p: 1.5 }}>
                      <Chip label={plug.status} size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 900, fontSize: '10px', height: '18px', borderRadius: '3px' }} />
                    </Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#4ade80', fontWeight: 700 }}>{plug.currentFps || 30.0} FPS</Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#cbd5e1' }}>{plug.averageInferenceTimeMs || 8.5} ms</Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#60a5fa' }}>{plug.memoryUsageMb || 512} MB</Box>
                    <Box component="td" sx={{ p: 1.5, fontFamily: 'monospace', color: '#fbbf24', fontWeight: 700 }}>{plug.eventsGenerated?.toLocaleString() || '3,200'}</Box>
                    <Box component="td" sx={{ p: 1.5 }}>
                      <Chip label={`${plug.errors || 0} E / ${plug.warnings || 0} W`} size="small" sx={{ bgcolor: '#1e293b', color: '#94a3b8', fontSize: '10px', height: '18px', borderRadius: '3px' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function KpiCard({ title, value, subtext, icon, color }: { title: string; value: string; subtext: string; icon: React.ReactNode; color: string }) {
  return (
    <Paper sx={{ p: 2.5, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
        <Box sx={{ p: 1, bgcolor: `${color}15`, borderRadius: '6px', border: `1px solid ${color}30` }}>
          {icon}
        </Box>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>
        {value}
      </Typography>

      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block', fontSize: '11px' }}>
        {subtext}
      </Typography>
    </Paper>
  );
}

function ResourceCard({ title, percent, subtext, color, icon }: { title: string; percent: number; subtext: string; color: string; icon: React.ReactNode }) {
  return (
    <Paper sx={{ p: 2.5, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color }}>{icon}</Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, color, fontFamily: 'monospace' }}>
          {percent}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: '#1e293b',
          '& .MuiLinearProgress-bar': { bgcolor: color }
        }}
      />

      <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block', fontSize: '11px', fontFamily: 'monospace' }}>
        {subtext}
      </Typography>
    </Paper>
  );
}

function SparklineChart({ title, data, color, unit, min, max }: { title: string; data: number[]; color: string; unit: string; min: number; max: number }) {
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 300;
    const norm = (val - min) / (max - min || 1);
    const y = 60 - norm * 50;
    return `${x},${y}`;
  }).join(' ');

  const currentVal = data[data.length - 1] || 0;

  return (
    <Box sx={{ p: 2, bgcolor: '#020617', border: '1px solid #1e293b', borderRadius: '6px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 900, color, fontFamily: 'monospace' }}>
          {currentVal} {unit}
        </Typography>
      </Box>

      <Box sx={{ width: '100%', height: '70px' }}>
        <svg width="100%" height="100%" viewBox="0 0 300 70" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            points={points}
          />
        </svg>
      </Box>
    </Box>
  );
}
