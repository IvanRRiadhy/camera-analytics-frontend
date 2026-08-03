import React from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Alert,
} from '@mui/material';
import {
  IconServer,
  IconCpu,
  IconDeviceDesktopAnalytics,
  IconActivity,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react';
import { useEngineHealth } from '../hooks/useEngineHealth';
import { useSignalR } from '../hooks/useSignalR';
import {
  useEngineStore,
  selectAllEngines,
  selectHealthyEngineCount,
  selectTotalEngineCount,
} from '../store/engine.store';
import { useRuntimeBootstrap } from '../hooks/useRuntimeBootstrap';

export const FleetOverview: React.FC = () => {
  const navigate = useNavigate();
  const { connectionState } = useSignalR();
  const { data: fleetData, isLoading } = useEngineHealth();

  // ADR-011 Phase 7A.5: Centralized Runtime Bootstrap Layer
  useRuntimeBootstrap({ engineHealth: fleetData });

  // Read Engine Metrics directly from EngineStore Selectors
  const storeEngines = useEngineStore(selectAllEngines);
  const storeHealthyCount = useEngineStore(selectHealthyEngineCount);
  const storeTotalCount = useEngineStore(selectTotalEngineCount);

  const engines = storeEngines.length > 0 ? storeEngines : (fleetData?.engines ?? []);
  const totalNodes = storeTotalCount || fleetData?.totalEngines || 0;
  const onlineNodes = storeEngines.length > 0 ? storeHealthyCount : (fleetData?.healthyCount || 0);
  const totalPipelines = engines.reduce((acc, n) => acc + n.activePipelinesCount, 0);

  const getStatusChip = (healthState?: string | number | null) => {
    if (!healthState && healthState !== 0) {
      return <Chip label="OFFLINE" color="error" size="small" sx={{ fontWeight: 700 }} />;
    }
    const s = String(healthState).toUpperCase();
    if (s === 'HEALTHY' || s === 'ONLINE' || s === '0') return <Chip label="HEALTHY" color="success" size="small" sx={{ fontWeight: 700 }} />;
    if (s === 'WARNING' || s === 'DEGRADED' || s === '1') return <Chip label="WARNING" color="warning" size="small" sx={{ fontWeight: 700 }} />;
    return <Chip label="OFFLINE" color="error" size="small" sx={{ fontWeight: 700 }} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Real-time Connection Status Indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          AI Engine Cluster Fleet
        </Typography>
        <Chip
          icon={connectionState === 'Connected' ? <IconWifi size={16} /> : <IconWifiOff size={16} />}
          label={`SignalR Live Telemetry: ${connectionState}`}
          color={connectionState === 'Connected' ? 'success' : 'warning'}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Aggregate Metrics Header Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(225, 29, 72, 0.1)', color: 'primary.main' }}>
                <IconServer size={28} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  TOTAL ENGINE NODES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isLoading ? '...' : totalNodes}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', color: 'success.main' }}>
                <IconActivity size={28} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  HEALTHY NODES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isLoading ? '...' : `${onlineNodes} / ${totalNodes}`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: 'info.main' }}>
                <IconDeviceDesktopAnalytics size={28} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ACTIVE PIPELINES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isLoading ? '...' : `${totalPipelines} Streams`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(168, 85, 247, 0.1)', color: 'secondary.main' }}>
                <IconCpu size={28} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  FLEET AVG SCORE
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {isLoading ? '...' : `${Math.round(fleetData?.averageHealthScore ?? 100)} / 100`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cluster Node Grid */}
      <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>
        Registered Cluster Nodes & Health Telemetry
      </Typography>

      {isLoading && <LinearProgress color="primary" />}

      {!isLoading && engines.length === 0 && (
        <Alert severity="info">No AI engine nodes currently registered in cluster.</Alert>
      )}

      <Grid container spacing={3}>
        {engines.map((node) => {
          const vramUsedMb = node.vramUsedMb;
          const vramTotalMb = node.totalVramMb > 0 ? node.totalVramMb : 1;
          const vramPercent = Math.min(100, Math.round((vramUsedMb / vramTotalMb) * 100));

          return (
            <Grid key={node.instanceId} size={{ xs: 12, md: 6 }}>
              <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {node.hostname}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {node.instanceIdString || node.instanceId} | IP: {node.ipAddress}
                      </Typography>
                    </Box>
                    {getStatusChip(node.healthState || node.state)}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Score: <strong>{node.healthScore} / 100</strong> | Pipelines: <strong>{node.activePipelinesCount}</strong>
                  </Typography>

                  {/* VRAM Telemetry Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        VRAM Usage ({vramUsedMb} MB / {node.totalVramMb} MB)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {vramPercent}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={vramPercent}
                      color={vramPercent > 85 ? 'error' : vramPercent > 70 ? 'warning' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* GPU % & CPU % Indicators */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        GPU Utilization
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {node.gpuUsagePercent.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        CPU Utilization
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {node.cpuUsagePercent.toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Last Heartbeat: {new Date(node.lastHeartbeatUtc).toLocaleTimeString()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/nodes/${node.instanceId}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      View Node Detail
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
