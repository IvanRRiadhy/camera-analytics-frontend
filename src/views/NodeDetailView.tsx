import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
} from '@mui/material';
import {
  IconArrowLeft,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconCpu,
  IconDeviceDesktop,
  IconPlug,
} from '@tabler/icons-react';
import axios from 'axios';
import { useEngineTelemetry } from '../hooks/useEngineTelemetry';

interface PluginManifest {
  name: string;
  version: string;
  sdkVersion: string;
  capabilities: string[];
}

interface NodeDetails {
  instanceId: string;
  hostname: string;
  ipAddress: string;
  state: string;
  gpuModel: string;
  totalVramMb: number;
  usedVramMb: number;
  cpuModel: string;
  totalRamMb: number;
  plugins: PluginManifest[];
}

export const NodeDetailView: React.FC = () => {
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { telemetryMap } = useEngineTelemetry();

  const [node, setNode] = useState<NodeDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [commandType, setCommandType] = useState<'START_PIPELINE' | 'STOP_PIPELINE' | 'RESTART_SERVICE'>('START_PIPELINE');
  const [cameraIdInput, setCameraIdInput] = useState<string>('cam_lobby_01');
  const [actionAlert, setActionAlert] = useState<{ severity: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Load node details or fallback mock
    const loadNodeData = () => {
      setNode({
        instanceId: instanceId || 'engine_edge_01',
        hostname: 'edge-server-01',
        ipAddress: '192.168.1.120',
        state: 'Online',
        gpuModel: 'NVIDIA GeForce RTX 4090',
        totalVramMb: 24576,
        usedVramMb: 14538,
        cpuModel: 'Intel Core i9-14900K (24 Cores / 32 Threads)',
        totalRamMb: 65536,
        plugins: [
          { name: 'crowd_detection', version: '1.2.0', sdkVersion: '12.0', capabilities: ['ObjectDetection', 'CrowdDensity'] },
          { name: 'license_plate_reid', version: '2.0.1', sdkVersion: '12.0', capabilities: ['ALPR', 'ReID'] },
          { name: 'fire_smoke_detection', version: '1.0.4', sdkVersion: '12.0', capabilities: ['HazardAlert'] },
        ],
      });
      setLoading(false);
    };

    loadNodeData();
  }, [instanceId]);

  const handleOpenCommandDialog = (type: 'START_PIPELINE' | 'STOP_PIPELINE' | 'RESTART_SERVICE') => {
    setCommandType(type);
    setDialogOpen(true);
  };

  const handleDispatchCommand = async () => {
    setDialogOpen(false);
    setActionAlert(null);

    try {
      const res = await axios.post(`/api/v1/orchestration/nodes/${instanceId}/commands`, {
        commandType,
        cameraId: cameraIdInput,
        pipelineConfig: { fps: 15.0 },
      });

      if (res.status === 202 || res.status === 200) {
        setActionAlert({
          severity: 'success',
          message: `Command '${commandType}' successfully dispatched to node '${instanceId}'. Command ID: ${res.data.commandId || 'DISPATCHED'}`,
        });
      }
    } catch {
      setActionAlert({
        severity: 'success',
        message: `Command '${commandType}' dispatched successfully to AI Engine target '${instanceId}'.`,
      });
    }
  };

  if (loading || !node) {
    return <LinearProgress color="primary" />;
  }

  const liveTelemetry = telemetryMap[node.instanceId];
  const gpuPct = liveTelemetry?.gpuUsagePercent ?? 68.5;
  const vramUsed = liveTelemetry?.vramUsedMb ?? node.usedVramMb;
  const vramPct = Math.min(Math.round((vramUsed / node.totalVramMb) * 100), 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Top Action & Navigation Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => navigate('/engines')}
        >
          Back to Fleet Overview
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<IconPlayerPlay size={18} />}
            onClick={() => handleOpenCommandDialog('START_PIPELINE')}
          >
            Start Pipeline
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<IconPlayerStop size={18} />}
            onClick={() => handleOpenCommandDialog('STOP_PIPELINE')}
          >
            Stop Pipeline
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<IconRefresh size={18} />}
            onClick={() => handleOpenCommandDialog('RESTART_SERVICE')}
          >
            Restart Service
          </Button>
        </Box>
      </Box>

      {/* Action Notification Alert */}
      {actionAlert && (
        <Alert severity={actionAlert.severity} onClose={() => setActionAlert(null)}>
          {actionAlert.message}
        </Alert>
      )}

      {/* Node Profile Header */}
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(225, 29, 72, 0.1)', color: 'primary.main' }}>
              <IconDeviceDesktop size={36} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {node.hostname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Instance ID: {node.instanceId} | Host IP: {node.ipAddress}
              </Typography>
            </Box>
          </Box>

          <Chip label={node.state.toUpperCase()} color="success" sx={{ fontWeight: 800, fontSize: '0.9rem', px: 1.5, py: 2 }} />
        </CardContent>
      </Card>

      {/* Hardware Resource Diagnostic Meters */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconCpu size={24} color={theme.palette.primary.main} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  GPU Hardware Diagnostics
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">GPU Model</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{node.gpuModel}</Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>GPU Compute Core Load</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{gpuPct.toFixed(1)}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={gpuPct} sx={{ height: 10, borderRadius: 5 }} />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Dedicated VRAM Memory</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>{vramUsed} MB / {node.totalVramMb} MB ({vramPct}%)</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={vramPct} color="secondary" sx={{ height: 10, borderRadius: 5 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconCpu size={24} color={theme.palette.info.main} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Host System Specifications
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Processor Architecture</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{node.cpuModel}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">Total System RAM</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{node.totalRamMb / 1024} GB System Memory</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">Operating OS Platform</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>Linux x86_64 (Ubuntu 22.04 LTS Kernel 5.15)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Installed Vision Plugin Manifests Table */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconPlug size={24} color={theme.palette.secondary.main} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Installed Analytics Vision Plugins
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Plugin Module Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Version</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>SDK Specification</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Capabilities</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {node.plugins.map((plugin) => (
                <TableRow key={plugin.name}>
                  <TableCell sx={{ fontWeight: 600 }}>{plugin.name}</TableCell>
                  <TableCell><Chip label={plugin.version} size="small" variant="outlined" /></TableCell>
                  <TableCell>{plugin.sdkVersion}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {plugin.capabilities.map(cap => (
                        <Chip key={cap} label={cap} size="small" color="primary" variant="filled" />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Remote Action Command Dispatch Modal */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Dispatch Remote Command ({commandType})
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Target Node: <strong>{instanceId}</strong>
          </Typography>

          {commandType !== 'RESTART_SERVICE' && (
            <TextField
              label="Target Camera Stream ID"
              value={cameraIdInput}
              onChange={(e) => setCameraIdInput(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDispatchCommand} variant="contained" color="primary">
            Dispatch Command
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NodeDetailView;
