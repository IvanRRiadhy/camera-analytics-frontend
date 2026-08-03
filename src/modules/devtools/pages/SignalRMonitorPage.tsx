import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  IconWifi,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconSearch,
  IconX,
  IconCopy,
  IconCheck,
  IconArrowDownLeft,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertCircle,
} from '@tabler/icons-react';
import {
  runtimeTelemetryService,
  type RuntimeTelemetryEvent,
  type TelemetryCategory,
  type TelemetrySeverity,
} from '../index';

export const SignalRMonitorPage: React.FC = () => {
  const [packets, setPackets] = useState<RuntimeTelemetryEvent[]>(() =>
    runtimeTelemetryService.getEvents('SIGNALR')
  );
  const [isPaused, setIsPaused] = useState<boolean>(() => runtimeTelemetryService.getIsPaused());
  const [selectedPacket, setSelectedPacket] = useState<RuntimeTelemetryEvent | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('SIGNALR');

  // Live Subscription to Telemetry Stream
  useEffect(() => {
    const unsubscribe = runtimeTelemetryService.subscribe(() => {
      if (!isPaused) {
        setPackets(runtimeTelemetryService.getEvents(categoryFilter === 'ALL' ? undefined : (categoryFilter as TelemetryCategory)));
      }
    });
    return () => unsubscribe();
  }, [isPaused, categoryFilter]);

  // Filtered Packets
  const filteredPackets = useMemo(() => {
    return packets.filter((p) => {
      const matchSearch =
        !searchTerm ||
        p.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.correlationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.targetStore && p.targetStore.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSeverity = severityFilter === 'ALL' || p.severity === severityFilter;

      return matchSearch && matchSeverity;
    });
  }, [packets, searchTerm, severityFilter]);

  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    runtimeTelemetryService.setPaused(next);
    if (!next) {
      setPackets(runtimeTelemetryService.getEvents(categoryFilter === 'ALL' ? undefined : (categoryFilter as TelemetryCategory)));
    }
  };

  const handleClear = () => {
    runtimeTelemetryService.clear();
    setPackets([]);
    setSelectedPacket(null);
  };

  const handleCopyJson = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityChip = (severity: TelemetrySeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <Chip icon={<IconAlertCircle size={12} color="#f87171" />} label="CRITICAL" size="small" sx={{ bgcolor: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d', fontWeight: 800, fontSize: '10px' }} />;
      case 'ERROR':
        return <Chip icon={<IconAlertCircle size={12} color="#ef4444" />} label="ERROR" size="small" sx={{ bgcolor: '#270707', color: '#ef4444', border: '1px solid #991b1b', fontWeight: 800, fontSize: '10px' }} />;
      case 'WARNING':
        return <Chip icon={<IconAlertTriangle size={12} color="#f59e0b" />} label="WARNING" size="small" sx={{ bgcolor: '#451a03', color: '#f59e0b', border: '1px solid #78350f', fontWeight: 800, fontSize: '10px' }} />;
      default:
        return <Chip icon={<IconInfoCircle size={12} color="#38bdf8" />} label="INFO" size="small" sx={{ bgcolor: '#0c4a6e', color: '#38bdf8', border: '1px solid #0369a1', fontWeight: 800, fontSize: '10px' }} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top Toolbar */}
      <Paper sx={{ p: 2.5, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconWifi size={24} color="#38bdf8" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
                Realtime SignalR Packet Sniffer
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live SOC Telemetry Packet Stream — Powered by RuntimeTelemetryService
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant={isPaused ? 'contained' : 'outlined'}
              color={isPaused ? 'warning' : 'primary'}
              startIcon={isPaused ? <IconPlayerPlay size={16} /> : <IconPlayerPause size={16} />}
              onClick={handleTogglePause}
              sx={{ fontWeight: 800 }}
            >
              {isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<IconTrash size={16} />}
              onClick={handleClear}
              sx={{ fontWeight: 800 }}
            >
              CLEAR
            </Button>
          </Box>
        </Box>

        {/* Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search Event, Correlation ID, Store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} color="#64748b" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flexGrow: 1, bgcolor: '#0f172a', borderRadius: '4px' }}
          />

          <FormControl size="small" sx={{ minWidth: 150, bgcolor: '#0f172a' }}>
            <InputLabel sx={{ color: '#94a3b8' }}>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ color: '#f8fafc' }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="SIGNALR">SignalR</MenuItem>
              <MenuItem value="DISPATCHER">Dispatcher</MenuItem>
              <MenuItem value="BOOTSTRAP">Bootstrap</MenuItem>
              <MenuItem value="STORE">Store</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140, bgcolor: '#0f172a' }}>
            <InputLabel sx={{ color: '#94a3b8' }}>Severity</InputLabel>
            <Select
              value={severityFilter}
              label="Severity"
              onChange={(e) => setSeverityFilter(e.target.value)}
              sx={{ color: '#f8fafc' }}
            >
              <MenuItem value="ALL">All Severities</MenuItem>
              <MenuItem value="INFO">INFO</MenuItem>
              <MenuItem value="WARNING">WARNING</MenuItem>
              <MenuItem value="ERROR">ERROR</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Main Packet Table */}
      <Paper sx={{ bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '640px' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#0f172a', color: '#94a3b8', fontWeight: 800, fontSize: '11px' } }}>
                <TableCell>TIMESTAMP</TableCell>
                <TableCell>DIR</TableCell>
                <TableCell>EVENT NAME</TableCell>
                <TableCell>CORRELATION ID</TableCell>
                <TableCell>SEVERITY</TableCell>
                <TableCell>PAYLOAD SIZE</TableCell>
                <TableCell>DURATION</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="right">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPackets.map((p) => (
                <TableRow
                  key={p.eventId}
                  hover
                  onClick={() => setSelectedPacket(p)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedPacket?.eventId === p.eventId ? 'rgba(56, 189, 248, 0.1) !important' : 'transparent',
                    '&:hover': { bgcolor: '#0f172a !important' },
                  }}
                >
                  <TableCell sx={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}>
                    {new Date(p.startedAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Incoming WebSocket Packet">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', color: '#22c55e' }}>
                        <IconArrowDownLeft size={16} />
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '12px' }}>
                    {p.eventName}
                  </TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px' }}>
                    {p.correlationId}
                  </TableCell>
                  <TableCell>{getSeverityChip(p.severity)}</TableCell>
                  <TableCell sx={{ color: '#a855f7', fontWeight: 700, fontSize: '11px' }}>
                    {p.payloadSize ? `${(p.payloadSize / 1024).toFixed(2)} KB` : '< 0.1 KB'}
                  </TableCell>
                  <TableCell sx={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '11px' }}>
                    {p.durationMs ? `${p.durationMs.toFixed(2)} ms` : '0.10 ms'}
                  </TableCell>
                  <TableCell>
                    <Chip label={p.status} size="small" color="success" sx={{ height: 18, fontSize: '9px', fontWeight: 900 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="text" sx={{ color: '#38bdf8', fontWeight: 700, fontSize: '11px' }}>
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPackets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: '#64748b' }}>
                    No SignalR packets recorded matching current filter parameters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Packet Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedPacket)}
        onClose={() => setSelectedPacket(null)}
        slotProps={{
          paper: {
            sx: { width: 500, bgcolor: '#090d16', color: '#f8fafc', borderLeft: '1px solid #1e293b', p: 3 },
          },
        }}
      >
        {selectedPacket && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
            {/* Drawer Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconWifi size={20} color="#38bdf8" />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Packet Inspector
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedPacket(null)} sx={{ color: '#94a3b8' }}>
                <IconX size={18} />
              </IconButton>
            </Box>

            <Divider sx={{ borderColor: '#1e293b' }} />

            {/* Metadata Fields */}
            <Paper sx={{ p: 2, bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>EVENT NAME</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#38bdf8' }}>{selectedPacket.eventName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>SEVERITY</Typography>
                    {getSeverityChip(selectedPacket.severity)}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>CORRELATION ID</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#a855f7', fontWeight: 700 }}>
                    {selectedPacket.correlationId}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>SOURCE</Typography>
                    <Typography variant="caption" sx={{ color: '#f8fafc' }}>{selectedPacket.source}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>DURATION</Typography>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>
                      {selectedPacket.durationMs ? `${selectedPacket.durationMs.toFixed(2)} ms` : '0.10 ms'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Raw JSON Viewer */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                  RAW PAYLOAD JSON
                </Typography>
                <Button
                  size="small"
                  startIcon={copied ? <IconCheck size={14} color="#22c55e" /> : <IconCopy size={14} />}
                  onClick={() => handleCopyJson(selectedPacket.payload)}
                  sx={{ color: copied ? '#22c55e' : '#94a3b8', fontSize: '11px' }}
                >
                  {copied ? 'COPIED' : 'COPY JSON'}
                </Button>
              </Box>

              <Paper sx={{ p: 2, bgcolor: '#030712', border: '1px solid #1e293b', flexGrow: 1, overflowY: 'auto' }}>
                <Typography
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#22c55e',
                    m: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(selectedPacket.payload || {}, null, 2)}
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
