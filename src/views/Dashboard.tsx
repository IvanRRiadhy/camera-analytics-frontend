import React, { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { IconVideo, IconActivity, IconDatabase, IconAlertCircle } from '@tabler/icons-react';
import Chart from 'react-apexcharts';

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [tabIndex] = useState(2);

  const dailyCategories = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  // Dummy series data for last 7 intervals (AI detections: People, Vehicles)
  const dailySeries = [
    {
      name: 'Person Detections',
      data: [420, 510, 680, 590, 710, 830, 640]
    },
    {
      name: 'Vehicle Detections',
      data: [150, 240, 190, 310, 280, 180, 220]
    }
  ];

  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ];

  const commonOptions: any = useMemo(() => ({
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
          categories: dailyCategories,
        }
      }
    };
  }, [commonOptions, dailyCategories]);

  // Donut chart logic for event distribution (Person, Vehicle, Animal, Unknown)
  const donutSeries = [65, 25, 8, 2];
  const donutLabels = ['Person', 'Vehicle', 'Animal', 'Unknown'];
  const donutColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.text.secondary,
  ];

  const donutOptions: any = useMemo(() => ({
    chart: {
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
    },
    colors: donutColors,
    labels: donutLabels,
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
        radius: 4,
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
  }), [theme, donutColors, donutLabels]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                  Active Cameras
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  14 / 15
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  93.3% <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>online status</Typography>
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
                  AI Detections Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  5,820
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, display: 'block', mt: 0.5 }}>
                  +18.4% vs yesterday
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
                  Storage Usage
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  78.2%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mt: 0.5 }}>
                  7.82 TB / 10.0 TB consumed
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
                  Critical Alerts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  2
                </Typography>
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 700, display: 'block', mt: 0.5 }}>
                  Immediate review required
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
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 3.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    AI Detection Timeline
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Detections grouped by time interval (today)
                  </Typography>
                </Box>
              </Box>

              {/* Chart Render */}
              <Box sx={{ flexGrow: 1, width: '100%', minHeight: 320 }}>
                <Chart 
                  key={`${theme.palette.mode}-${tabIndex}`}
                  options={chartConfig.options}
                  series={dailySeries}
                  type={chartConfig.type}
                  height={320}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Distribution Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 3.5 } }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Classification Share
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Object category classification share percentage
                </Typography>
              </Box>

              {/* Donut Chart Render */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 280 }}>
                <Chart 
                  key={theme.palette.mode}
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  width="100%"
                  height={280}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
