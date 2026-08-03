import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  IconActivity,
  IconWifi,
  IconDatabase,
  IconCpu,
  IconRefresh,
  IconArrowRight,
  IconCheck,
  IconChecklist,
} from '@tabler/icons-react';
import { devToolsService } from '../services/devtools.service';

export const DevToolsDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(() => devToolsService.getDashboardMetrics());
  const [summaries, setSummaries] = useState(() => devToolsService.getStoreSummaries());

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(devToolsService.getDashboardMetrics());
      setSummaries(devToolsService.getStoreSummaries());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Overview Banner */}
      <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#f8fafc', mb: 0.5 }}>
              Runtime Control Panel Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time telemetry, store metrics, and framework diagnostics powered by ADR-011 Store Architecture.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<IconRefresh size={16} />}
            onClick={() => {
              setMetrics(devToolsService.getDashboardMetrics());
              setSummaries(devToolsService.getStoreSummaries());
            }}
            sx={{ color: '#38bdf8', borderColor: '#1e293b', fontWeight: 700 }}
          >
            Refresh Diagnostics
          </Button>
        </Box>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #1e293b' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800 }}>RUNTIME HEALTH</Typography>
                <IconCpu size={20} color="#22c55e" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#22c55e' }}>{metrics.runtimeHealth}</Typography>
              <Typography variant="caption" color="text.secondary">Zero Lock / Monotonic Versioning</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #1e293b' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800 }}>SIGNALR STATUS</Typography>
                <IconWifi size={20} color="#38bdf8" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#38bdf8' }}>{metrics.signalrStatus}</Typography>
              <Typography variant="caption" color="text.secondary">Realtime Hub Pipeline Connected</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #1e293b' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800 }}>MANAGED ENTITIES</Typography>
                <IconDatabase size={20} color="#a855f7" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#a855f7' }}>{metrics.totalEntities.toLocaleString()}</Typography>
              <Typography variant="caption" color="text.secondary">{metrics.totalStores} Registered Domain Stores</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: '#090d16', border: '1px solid #1e293b' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800 }}>THROUGHPUT / MEMORY</Typography>
                <IconActivity size={20} color="#f59e0b" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b' }}>{metrics.memoryEstMb} MB</Typography>
              <Typography variant="caption" color="text.secondary">Est. Memory Footprint</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Store Quick Health Table */}
      <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconChecklist size={20} color="#38bdf8" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>Domain Store Status Summary</Typography>
          </Box>
          <Button
            variant="text"
            endIcon={<IconArrowRight size={16} />}
            onClick={() => navigate('/_devtools/stores')}
            sx={{ color: '#38bdf8', fontWeight: 700 }}
          >
            Open Store Inspector
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#0f172a' }}>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>STORE NAME</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>ENTITIES</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>TOTAL UPDATES</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>DUPLICATES IGNORED</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {summaries.map((s) => (
                <TableRow key={s.name} hover sx={{ '&:hover': { bgcolor: '#0f172a !important' } }}>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>{s.name}</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontWeight: 800 }}>{s.entityCount.toLocaleString()}</TableCell>
                  <TableCell sx={{ color: '#22c55e', fontWeight: 700 }}>{s.statistics.totalStored || 0}</TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{s.statistics.duplicateIgnored || 0}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<IconCheck size={12} color="#22c55e" />}
                      label="ACTIVE"
                      size="small"
                      sx={{ bgcolor: '#0f172a', color: '#22c55e', border: '1px solid #1e293b', fontWeight: 800, fontSize: '10px' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
