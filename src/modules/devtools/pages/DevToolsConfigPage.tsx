import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { IconSettings, IconClock } from '@tabler/icons-react';

export const DevToolsConfigPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <IconSettings size={24} color="#6366f1" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
            ADR-011 Runtime Contract Configuration
          </Typography>
          <Chip label="Target Phase: 8D" size="small" color="warning" sx={{ fontWeight: 900, borderRadius: '2px' }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Read-only architecture specification contract summary, store count policies, and extension guidelines.
        </Typography>

        <Paper sx={{ p: 2, bgcolor: '#0f172a', border: '1px border-dashed #334155', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconClock size={20} color="#f59e0b" />
          <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>
            STATUS: Placeholder View — ADR-011 Contract Specification Summary & Version Info Will Be Implemented In Phase 8D.
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
};
