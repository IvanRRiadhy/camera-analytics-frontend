import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { IconCpu, IconWifi, IconCheck } from '@tabler/icons-react';

export const DevToolsHeader: React.FC = () => {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#090d16',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <IconCpu size={24} color="#38bdf8" />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
            RUNTIME DEVTOOLS PLATFORM
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
            ADR-011 Architecture Specification — Frozen Engine Core v1.5.0
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          icon={<IconCheck size={14} color="#22c55e" />}
          label="CONTRACT: ADR-011 VALIDATED"
          size="small"
          sx={{ bgcolor: '#0f172a', color: '#22c55e', border: '1px solid #1e293b', fontWeight: 800, fontSize: '10px' }}
        />
        <Chip
          icon={<IconWifi size={14} color="#38bdf8" />}
          label="SIGNALR: CONNECTED"
          size="small"
          sx={{ bgcolor: '#0f172a', color: '#38bdf8', border: '1px solid #1e293b', fontWeight: 800, fontSize: '10px' }}
        />
      </Box>
    </Box>
  );
};
