import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { IconWifi, IconClock } from '@tabler/icons-react';

export const DevToolsSignalRPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <IconWifi size={24} color="#22c55e" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
            SignalR Live Packet Monitor
          </Typography>
          <Chip label="Target Phase: 8C" size="small" color="secondary" sx={{ fontWeight: 900, borderRadius: '2px' }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Real-time packet sniffer capturing incoming SignalR events with pause/resume stream controls, category filtering, and payload inspection.
        </Typography>

        <Paper sx={{ p: 2, bgcolor: '#0f172a', border: '1px border-dashed #334155', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconClock size={20} color="#f59e0b" />
          <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>
            STATUS: Placeholder View — Live WebSocket Packet Sniffer & Stream Filter Controls Will Be Implemented In Phase 8C.
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
};
