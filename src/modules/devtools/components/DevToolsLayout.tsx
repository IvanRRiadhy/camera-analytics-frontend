import React from 'react';
import { Outlet } from 'react-router';
import { Box } from '@mui/material';
import { DevToolsHeader } from './DevToolsHeader';
import { DevToolsSidebar } from './DevToolsSidebar';

export const DevToolsLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#030712', color: '#e2e8f0', overflow: 'hidden' }}>
      <DevToolsHeader />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <DevToolsSidebar />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
