import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Button
} from '@mui/material';
import { 
  IconLayoutDashboard, 
  IconSettings,
  IconCamera,
  IconBuilding,
  IconServer,
  IconActivity,
  IconClock,
  IconBox,
  IconDeviceAnalytics,
  IconWaveSine,
} from '@tabler/icons-react';

export const FullLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));

  // Navigation configuration
  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard Overview', path: '/dashboard', icon: <IconLayoutDashboard size={20} /> },
    { id: 'monitoring', label: 'Monitoring (SOC)', path: '/monitoring', icon: <IconActivity size={20} /> },
    { id: 'runtime', label: 'Runtime Observability', path: '/analytics/runtime', icon: <IconWaveSine size={20} /> },
    { id: 'catalog', label: 'Plugin Catalog', path: '/analytics/catalog', icon: <IconBox size={20} /> },
    { id: 'assignments', label: 'Pipeline Assignment', path: '/analytics/pipelines', icon: <IconDeviceAnalytics size={20} /> },
    { id: 'engines', label: 'Engine Fleet', path: '/engines', icon: <IconServer size={20} /> },
    { id: 'cameras', label: 'Camera Settings', path: '/cameras', icon: <IconCamera size={20} /> },
    { id: 'rooms', label: 'Rooms Settings', path: '/rooms', icon: <IconBuilding size={20} /> },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <IconSettings size={20} /> },
  ] as const;

  const activeTab = navigationTabs.find(tab => location.pathname.startsWith(tab.path)) || navigationTabs[0];
  const isMonitoringPage = location.pathname.startsWith('/monitoring');

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Update 24-hour clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        bgcolor: '#030712', 
        position: 'relative', 
        overflow: 'hidden',
      }}
    >
      {/* ENTERPRISE MINI SIDEBAR (FLOATING OVERLAY ON HOVER) */}
      <Box 
        component="aside"
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: isSidebarHovered ? 260 : 64,
          bgcolor: '#090d16', 
          borderRight: '1px solid #1e293b', 
          zIndex: 1200,
          p: isSidebarHovered ? 2 : 1.25, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3,
          boxShadow: isSidebarHovered ? '8px 0 30px rgba(0,0,0,0.7)' : 'none',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), padding 0.25s ease',
          overflowX: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Logo Heading */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5, py: 1 }}>
          <Box 
            component="img"
            src="/Logo Bionics.png"
            alt="CCTV Analytics Logo"
            sx={{ 
              height: 32, 
              width: 32,
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          {isSidebarHovered && (
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>
              CCTV Analytics
            </Typography>
          )}
        </Box>

        {/* Navigation Links */}
        <Box component="nav" sx={{ flexGrow: 1 }}>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 0 }}>
            {navigationTabs.map((tab) => {
              const isSelected = location.pathname.startsWith(tab.path);
              return (
                <ListItem key={tab.id} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(tab.path)}
                    selected={isSelected}
                    sx={{
                      borderRadius: '4px',
                      px: isSidebarHovered ? 1.5 : 1.25,
                      py: 1.25,
                      color: isSelected ? '#38bdf8' : '#94a3b8',
                      bgcolor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                      '&:hover': {
                        bgcolor: 'rgba(56, 189, 248, 0.08)',
                        color: '#f8fafc',
                      },
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      {tab.icon}
                    </ListItemIcon>
                    {isSidebarHovered && (
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {tab.label}
                          </Typography>
                        } 
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* User Profile & Log Out */}
        {isSidebarHovered && (
          <Box 
            sx={{
              p: 1.5,
              borderRadius: '4px',
              bgcolor: '#0f172a',
              border: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: '10px' }}>
              OPERATOR ACCOUNT
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              Admin Operator
            </Typography>
            <Button 
              variant="outlined" 
              color="error" 
              size="small" 
              fullWidth
              onClick={() => {
                localStorage.clear();
                queryClient.clear();
                navigate('/login');
              }}
              sx={{ fontSize: '11px', py: 0.25 }}
            >
              Log Out
            </Button>
          </Box>
        )}
      </Box>

      {/* Main Content Area (Offset by 64px mini-sidebar width constant) */}
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1, 
          ml: '64px',
          p: isMonitoringPage ? 1.5 : 3, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMonitoringPage ? 1.5 : 3, 
          minHeight: '100vh',
          bgcolor: '#030712',
          overflowY: 'auto',
          zIndex: 5,
        }}
      >
        {/* Top Header - Omitted on Monitoring page or customized */}
        {!isMonitoringPage ? (
          <Box 
            component="header"
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                {activeTab.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentDateFormatted}
              </Typography>
            </Box>
          </Box>
        ) : (
          /* SOC Monitoring Custom Top Bar Header */
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#090d16', p: 1, px: 2, borderRadius: '4px', border: '1px solid #1e293b' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.8px', fontFamily: 'monospace' }}>
                SECURITY OPERATIONS CENTER (SOC) MONITORING
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#94a3b8' }}>
                <IconClock size={16} color="#38bdf8" />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace', fontSize: '12px' }}>
                  {currentDateFormatted} | {localTime}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Page Subroute */}
        <Box sx={{ animation: 'fadeIn 0.4s ease' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default FullLayout;
