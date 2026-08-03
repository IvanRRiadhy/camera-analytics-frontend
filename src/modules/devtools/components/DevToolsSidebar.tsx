import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  IconDashboard,
  IconDatabase,
  IconWifi,
  IconRoute,
  IconPlayerPlay,
  IconActivity,
  IconTerminal2,
  IconSettings,
} from '@tabler/icons-react';

const NAV_ITEMS = [
  { path: '/_devtools', label: 'Dashboard', icon: <IconDashboard size={18} /> },
  { path: '/_devtools/stores', label: 'Store Registry', icon: <IconDatabase size={18} /> },
  { path: '/_devtools/signalr', label: 'SignalR Monitor', icon: <IconWifi size={18} /> },
  { path: '/_devtools/dispatcher', label: 'Dispatcher Timeline', icon: <IconRoute size={18} /> },
  { path: '/_devtools/bootstrap', label: 'Bootstrap Inspector', icon: <IconPlayerPlay size={18} /> },
  { path: '/_devtools/performance', label: 'Performance', icon: <IconActivity size={18} /> },
  { path: '/_devtools/logs', label: 'Logs', icon: <IconTerminal2 size={18} /> },
  { path: '/_devtools/config', label: 'Configuration', icon: <IconSettings size={18} /> },
];

export const DevToolsSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ width: 240, bgcolor: '#090d16', borderRight: '1px solid #1e293b', p: 1.5, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', px: 1, mb: 1 }}>
        DevTools Navigation
      </Typography>

      <List disablePadding>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path || (item.path !== '/_devtools' && location.pathname.startsWith(item.path));

          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={active}
              sx={{
                borderRadius: '4px',
                mb: 0.5,
                color: active ? '#38bdf8' : '#94a3b8',
                bgcolor: active ? 'rgba(56, 189, 248, 0.1) !important' : 'transparent',
                '&:hover': { bgcolor: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: active ? '#38bdf8' : '#64748b' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: '12px', fontWeight: active ? 800 : 500 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};
