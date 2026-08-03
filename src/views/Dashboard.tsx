import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, useTheme } from '@mui/material';
import { IconVideo, IconActivity, IconDatabase, IconAlertCircle, IconWifi, IconWifiOff } from '@tabler/icons-react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useEngineHealth } from '../hooks/useEngineHealth';
import { usePipelineRegistry } from '../hooks/usePipelineRegistry';
import { useSignalR } from '../hooks/useSignalR';

const DAILY_CATEGORIES = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const DONUT_LABELS = ['Person', 'Vehicle', 'Animal', 'Unknown'];

export const Dashboard: React.FC = () => {
  const theme = useTheme();

  const { connectionState } = useSignalR();
  const { data: healthData, isLoading: healthLoading } = useEngineHealth();
  const { data: pipelinesData, isLoading: pipelinesLoading } = usePipelineRegistry();

  const totalEngines = healthData?.totalEngines ?? 0;
  const healthyCount = healthData?.healthyCount ?? 0;
  const warningCount = healthData?.warningCount ?? 0;
  const offlineCount = healthData?.offlineCount ?? 0;
  const avgHealthScore = healthData ? Math.round(healthData.averageHealthScore) : 100;
  const activePipelinesCount = pipelinesData ? pipelinesData.filter(p => p.status === 'Running' || p.status === 'Assigned').length : 0;

  // Dummy series data for last 7 intervals (AI detections: People, Vehicles)
  const dailySeries = useMemo(() => [
    {
      name: 'Person Detections',
      data: [420, 510, 680, 590, 710, 830, 640]
    },
    {
      name: 'Vehicle Detections',
      data: [150, 240, 190, 310, 280, 180, 220]
    }
  ], []);

  const chartColors = useMemo(() => [
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ], [theme.palette.primary.main, theme.palette.secondary.main]);

  const commonOptions: ApexOptions = useMemo(() => ({
    chart: {
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: chartColors,
    theme: {
      mode: theme.palette.mode,
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => `${val} events`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: [theme.palette.text.primary],
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: Array(7).fill(theme.palette.text.secondary),
          fontSize: '11px',
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: [theme.palette.text.secondary],
          fontSize: '11px',
        }
      }
    }
  }), [theme, chartColors]);

  const chartConfig = useMemo(() => {
    return {
      type: 'line' as const,
      options: {
        ...commonOptions,
        stroke: {
          curve: 'smooth' as const,
          width: 3,
        },
        xaxis: {
          ...commonOptions.xaxis,
          categories: DAILY_CATEGORIES,
        }
      }
    };
  }, [commonOptions]);

  // Donut chart logic for event distribution
  const donutSeries = useMemo(() => [65, 25, 8, 2], []);
  const donutColors = useMemo(() => [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.text.secondary,
  ], [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.text.secondary]);

  const donutOptions: ApexOptions = useMemo(() => ({
    chart: {
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
    },
    colors: donutColors,
    labels: DONUT_LABELS,
    stroke: {
      colors: [theme.palette.background.paper],
      width: 2,
    },
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
      labels: {
        colors: [theme.palette.text.primary],
      },
      markers: {
        size: 4,
      }
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '13px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 800,
              color: theme.palette.text.primary,
              offsetY: 5,
              formatter: (val: string) => `${val}%`,
            },
            total: {
              show: true,
              label: 'Total AI',
              color: theme.palette.text.secondary,
              formatter: () => '100%',
            }
          }
        }
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => `${val}%`
      }
    }
  }), [theme, donutColors]);

  const getConnChip = () => {
    if (connectionState === 'Connected') {
      return <Chip icon={<IconWifi size={16} />} label="LIVE SIGNALR CONNECTED" color="success" size="small" sx={{ fontWeight: 700 }} />;
    }
    if (connectionState === 'Reconnecting') {
      return <Chip icon={<IconWifiOff size={16} />} label="SIGNALR RECONNECTING..." color="warning" size="small" sx={{ fontWeight: 700 }} />;
    }
    return <Chip icon={<IconWifiOff size={16} />} label="SIGNALR DISCONNECTED" color="error" size="small" sx={{ fontWeight: 700 }} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Realtime Connection Status Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Enterprise Analytics Dashboard
        </Typography>
        {getConnChip()}
      </Box>

      {/* Top Cards Statistics Summary */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 3 } }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(129, 140, 248, 0.12)',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconVideo size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Pipelines
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {pipelinesLoading ? '...' : activePipelinesCount}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {pipelinesData?.length ?? 0} Total Registered
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 3 } }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(6, 182, 212, 0.12)',
                  color: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconActivity size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  AI Fleet Health Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {healthLoading ? '...' : `${avgHealthScore} / 100`}
                </Typography>
                <Typography variant="caption" color={avgHealthScore >= 80 ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700, display: 'block', mt: 0.5 }}>
                  {healthyCount} Healthy Engine Nodes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 3 } }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(74, 222, 128, 0.12)',
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconDatabase size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Engine Nodes Cluster
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {healthLoading ? '...' : totalEngines} Nodes
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mt: 0.5 }}>
                  {healthyCount} Online / {offlineCount} Offline
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 3 } }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(198, 40, 40, 0.08)' : 'rgba(239, 83, 80, 0.12)',
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconAlertCircle size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Warnings & Offline
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {warningCount + offlineCount}
                </Typography>
                <Typography variant="caption" color={warningCount + offlineCount > 0 ? 'error.main' : 'success.main'} sx={{ fontWeight: 700, display: 'block', mt: 0.5 }}>
                  {warningCount} Warning | {offlineCount} Offline
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Analytics Grid */}
      <Grid container spacing={3}>
        {/* Daily Analytics Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Vision Detection Telemetry
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Aggregated AI detection events across active camera streams
                  </Typography>
                </Box>
              </Box>

              <Chart
                options={chartConfig.options}
                series={dailySeries}
                type={chartConfig.type}
                height={320}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Object Class Distribution Donut Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Object Class Distribution
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                Multi-class detection breakdown
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Chart
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  height={300}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
