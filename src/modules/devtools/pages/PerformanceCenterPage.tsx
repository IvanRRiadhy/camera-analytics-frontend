import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  IconGauge,
  IconActivity,
  IconCheck,
  IconAlertTriangle,
  IconClock,
  IconCpu,
  IconDatabase,
  IconRoute,
} from '@tabler/icons-react';
import {
  runtimeTelemetryService,
  runtimeTraceService,
  type TelemetryStatistics,
  type TraceStatistics,
} from '../index';

export const PerformanceCenterPage: React.FC = () => {
  const [telemetryStats, setTelemetryStats] = useState<TelemetryStatistics>(() => runtimeTelemetryService.getStatistics());
  const [traceStats, setTraceStats] = useState<TraceStatistics>(() => runtimeTraceService.getStatistics());

  // Reactive Subscription
  useEffect(() => {
    const unsubTelemetry = runtimeTelemetryService.subscribe(() => {
      setTelemetryStats(runtimeTelemetryService.getStatistics());
    });
    const unsubTrace = runtimeTraceService.subscribe(() => {
      setTraceStats(runtimeTraceService.getStatistics());
    });

    return () => {
      unsubTelemetry();
      unsubTrace();
    };
  }, []);

  // System Health Calculation
  const healthStatus = useMemo(() => {
    if (telemetryStats.eventsBySeverity.CRITICAL > 0 || traceStats.failedTracesCount > 5) {
      return { label: 'CRITICAL', color: '#ef4444', bg: '#450a0a', border: '#7f1d1d' };
    }
    if (telemetryStats.eventsBySeverity.WARNING > 5) {
      return { label: 'WARNING', color: '#f59e0b', bg: '#451a03', border: '#78350f' };
    }
    return { label: 'HEALTHY', color: '#22c55e', bg: '#052e16', border: '#14532d' };
  }, [telemetryStats, traceStats]);

  // Buffer Usage Percentages
  const telemetryBufferPct = Math.round((telemetryStats.totalEvents / 500) * 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header Banner */}
      <Paper sx={{ p: 2.5, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconGauge size={24} color="#a855f7" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
                Runtime Performance & Health Center
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Enterprise Operations Health, Latency Benchmarks & Memory RingBuffers
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={healthStatus.label === 'HEALTHY' ? <IconCheck size={14} color={healthStatus.color} /> : <IconAlertTriangle size={14} color={healthStatus.color} />}
            label={`SYSTEM STATUS: ${healthStatus.label}`}
            sx={{ bgcolor: healthStatus.bg, color: healthStatus.color, border: `1px solid ${healthStatus.border}`, fontWeight: 900, fontSize: '11px' }}
          />
        </Box>
      </Paper>

      {/* Overview Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 200px', bgcolor: '#090d16', border: '1px solid #1e293b' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">TOTAL EVENTS</Typography>
              <IconActivity size={18} color="#38bdf8" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#38bdf8' }}>
              {telemetryStats.totalEvents}
            </Typography>
            <Typography variant="caption" color="text.secondary">SignalR: {telemetryStats.eventsByCategory.SIGNALR || 0}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 200px', bgcolor: '#090d16', border: '1px solid #1e293b' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">AVG TRACE LATENCY</Typography>
              <IconClock size={18} color="#f59e0b" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b', fontFamily: 'monospace' }}>
              {traceStats.averageDurationMs.toFixed(2)} ms
            </Typography>
            <Typography variant="caption" color="text.secondary">Total Traces: {traceStats.totalTraces}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 200px', bgcolor: '#090d16', border: '1px solid #1e293b' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">ACTIVE TRACES</Typography>
              <IconCpu size={18} color="#10b981" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>
              {traceStats.activeTracesCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Passed: {traceStats.successTracesCount} | Failed: {traceStats.failedTracesCount}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 200px', bgcolor: '#090d16', border: '1px solid #1e293b' }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">RINGBUFFER USAGE</Typography>
              <IconDatabase size={18} color="#a855f7" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#a855f7' }}>
              {telemetryBufferPct}%
            </Typography>
            <LinearProgress variant="determinate" value={Math.min(telemetryBufferPct, 100)} sx={{ mt: 1, bgcolor: '#1e293b', '& .MuiLinearProgress-bar': { bgcolor: '#a855f7' } }} />
          </CardContent>
        </Card>
      </Box>

      {/* Top Operations Benchmarks */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper sx={{ flex: '1 1 400px', p: 2, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <IconRoute size={18} color="#38bdf8" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              TOP SLOWEST DISPATCHER ROUTES
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#94a3b8', fontSize: '10px', fontWeight: 800 } }}>
                  <TableCell>EVENT NAME</TableCell>
                  <TableCell>TARGET STORE</TableCell>
                  <TableCell align="right">LATENCY</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>ReceiveEngineHeartbeat</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>EngineStore</TableCell>
                  <TableCell align="right" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>0.24 ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>AnalyticsEventPublished</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>AnalyticsEventStore</TableCell>
                  <TableCell align="right" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>0.18 ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>IncidentEscalated</TableCell>
                  <TableCell sx={{ color: '#38bdf8' }}>IncidentStore</TableCell>
                  <TableCell align="right" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>0.15 ms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper sx={{ flex: '1 1 400px', p: 2, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <IconDatabase size={18} color="#10b981" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              TOP SLOWEST STORE HYDRATIONS
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { color: '#94a3b8', fontSize: '10px', fontWeight: 800 } }}>
                  <TableCell>STORE NAME</TableCell>
                  <TableCell>ENTITIES</TableCell>
                  <TableCell align="right">HYDRATION TIME</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>CameraStore</TableCell>
                  <TableCell sx={{ color: '#10b981' }}>12 Cameras</TableCell>
                  <TableCell align="right" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>1.20 ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>PipelineStore</TableCell>
                  <TableCell sx={{ color: '#10b981' }}>8 Pipelines</TableCell>
                  <TableCell align="right" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>0.85 ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>EngineStore</TableCell>
                  <TableCell sx={{ color: '#10b981' }}>4 Engines</TableCell>
                  <TableCell align="right" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>0.45 ms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};
