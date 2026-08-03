import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  IconButton,
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
  IconTerminal2,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconSearch,
  IconX,
  IconCopy,
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
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

export const RuntimeLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<RuntimeTelemetryEvent[]>(() => runtimeTelemetryService.getEvents());
  const [isPaused, setIsPaused] = useState<boolean>(() => runtimeTelemetryService.getIsPaused());
  const [selectedLog, setSelectedLog] = useState<RuntimeTelemetryEvent | null>(null);
  const [copied, setCopied] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  // Stream Subscription
  useEffect(() => {
    const unsubscribe = runtimeTelemetryService.subscribe(() => {
      if (!isPaused) {
        setLogs(runtimeTelemetryService.getEvents(categoryFilter === 'ALL' ? undefined : (categoryFilter as TelemetryCategory)));
      }
    });
    return () => unsubscribe();
  }, [isPaused, categoryFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        !searchTerm ||
        l.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.correlationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.targetStore && l.targetStore.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.message && l.message.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = categoryFilter === 'ALL' || l.category === categoryFilter;
      const matchSeverity = severityFilter === 'ALL' || l.severity === severityFilter;

      return matchSearch && matchCategory && matchSeverity;
    });
  }, [logs, searchTerm, categoryFilter, severityFilter]);

  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    runtimeTelemetryService.setPaused(next);
    if (!next) {
      setLogs(runtimeTelemetryService.getEvents(categoryFilter === 'ALL' ? undefined : (categoryFilter as TelemetryCategory)));
    }
  };

  const handleClear = () => {
    runtimeTelemetryService.clear();
    setLogs([]);
    setSelectedLog(null);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runtime_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = ['EventID', 'Timestamp', 'Severity', 'Category', 'Source', 'EventName', 'CorrelationID', 'DurationMs', 'Status', 'Message'];
    const rows = filteredLogs.map((l) => [
      l.eventId,
      l.startedAt,
      l.severity,
      l.category,
      l.source,
      l.eventName,
      l.correlationId,
      l.durationMs,
      l.status,
      `"${(l.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runtime_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      {/* Header & Controls Toolbar */}
      <Paper sx={{ p: 2.5, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconTerminal2 size={24} color="#10b981" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
                Runtime Centralized Logs Center
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Unified System Telemetry Stream & Auditing Console — Powered by RuntimeTelemetryService
              </Typography>
            </Box>
          </Box>

          {/* Action Toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconDownload size={14} />}
              onClick={handleExportJson}
              sx={{ color: '#38bdf8', borderColor: '#1e293b', fontWeight: 700 }}
            >
              JSON
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconFileSpreadsheet size={14} />}
              onClick={handleExportCsv}
              sx={{ color: '#10b981', borderColor: '#1e293b', fontWeight: 700 }}
            >
              CSV
            </Button>
            <Button
              variant={isPaused ? 'contained' : 'outlined'}
              color={isPaused ? 'warning' : 'primary'}
              size="small"
              startIcon={isPaused ? <IconPlayerPlay size={14} /> : <IconPlayerPause size={14} />}
              onClick={handleTogglePause}
              sx={{ fontWeight: 800 }}
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<IconTrash size={14} />}
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
            placeholder="Search Logs by Event, Correlation ID, Message..."
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

          <FormControl size="small" sx={{ minWidth: 140, bgcolor: '#0f172a' }}>
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

          <FormControl size="small" sx={{ minWidth: 130, bgcolor: '#0f172a' }}>
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
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Main Log Table */}
      <Paper sx={{ bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '640px' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#0f172a', color: '#94a3b8', fontWeight: 800, fontSize: '11px' } }}>
                <TableCell>TIMESTAMP</TableCell>
                <TableCell>SEVERITY</TableCell>
                <TableCell>CATEGORY</TableCell>
                <TableCell>SOURCE</TableCell>
                <TableCell>EVENT NAME</TableCell>
                <TableCell>CORRELATION ID</TableCell>
                <TableCell>DURATION</TableCell>
                <TableCell align="right">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((l) => (
                <TableRow
                  key={l.eventId}
                  hover
                  onClick={() => setSelectedLog(l)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedLog?.eventId === l.eventId ? 'rgba(16, 185, 129, 0.1) !important' : 'transparent',
                    '&:hover': { bgcolor: '#0f172a !important' },
                  }}
                >
                  <TableCell sx={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px' }}>
                    {new Date(l.startedAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{getSeverityChip(l.severity)}</TableCell>
                  <TableCell sx={{ color: '#a855f7', fontWeight: 700, fontSize: '11px' }}>
                    {l.category}
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '11px' }}>
                    {l.source}
                  </TableCell>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '12px' }}>
                    {l.eventName}
                  </TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px' }}>
                    {l.correlationId}
                  </TableCell>
                  <TableCell sx={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: '11px' }}>
                    {l.durationMs ? `${l.durationMs.toFixed(2)} ms` : '0.00 ms'}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="text" sx={{ color: '#10b981', fontWeight: 700, fontSize: '11px' }}>
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748b' }}>
                    No system log entries recorded matching current filter parameters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Log Detail Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        slotProps={{
          paper: {
            sx: { width: 520, bgcolor: '#090d16', color: '#f8fafc', borderLeft: '1px solid #1e293b', p: 3 },
          },
        }}
      >
        {selectedLog && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
            {/* Drawer Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconTerminal2 size={20} color="#10b981" />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Log Record Inspector
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedLog(null)} sx={{ color: '#94a3b8' }}>
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
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>{selectedLog.eventName}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>SEVERITY</Typography>
                    {getSeverityChip(selectedLog.severity)}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>CORRELATION ID</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#a855f7', fontWeight: 700 }}>
                    {selectedLog.correlationId}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>CATEGORY</Typography>
                    <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700 }}>{selectedLog.category}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>DURATION</Typography>
                    <Typography variant="caption" sx={{ color: '#f59e0b', fontFamily: 'monospace' }}>
                      {selectedLog.durationMs ? `${selectedLog.durationMs.toFixed(2)} ms` : '0.00 ms'}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>MESSAGE</Typography>
                  <Typography variant="caption" sx={{ color: '#f8fafc' }}>
                    {selectedLog.message || 'No explicit log message text recorded.'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Raw JSON Viewer */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#10b981' }}>
                  RAW TELEMETRY EVENT JSON
                </Typography>
                <Button
                  size="small"
                  startIcon={copied ? <IconCheck size={14} color="#22c55e" /> : <IconCopy size={14} />}
                  onClick={() => handleCopyJson(selectedLog)}
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
                  {JSON.stringify(selectedLog, null, 2)}
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
