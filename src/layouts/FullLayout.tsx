import React from 'react';
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
  useTheme,
  Button
} from '@mui/material';
import { 
  IconLayoutDashboard, 
  IconSettings,
  IconCamera,
  IconBuilding,
} from '@tabler/icons-react';

export const FullLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Load current logged in user details
  const [currentUser] = React.useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : { username: 'Admin Developer' };
    } catch {
      return { username: 'Admin Developer' };
    }
  });

  // Navigation configuration
  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <IconLayoutDashboard size={20} /> },
    { id: 'cameras', label: 'Camera Settings', path: '/cameras', icon: <IconCamera size={20} /> },
    { id: 'rooms', label: 'Rooms Settings', path: '/rooms', icon: <IconBuilding size={20} /> },
    { id: 'settings', label: 'Settings', path: '/settings', icon: <IconSettings size={20} /> },
  ] as const;

  // Resolve current page title
  const activeTab = navigationTabs.find(tab => location.pathname.startsWith(tab.path)) || navigationTabs[0];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: '100vh', 
        bgcolor: 'background.default', 
        position: 'relative', 
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Decorative Blur Orbs */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -150, 
          right: -150, 
          width: '40vw', 
          height: '40vw', 
          maxWidth: 500, 
          borderRadius: '50%', 
          filter: 'blur(120px)', 
          pointerEvents: 'none', 
          zIndex: 0, 
          opacity: 0.25, 
          animation: 'pulseGlow 10s ease-in-out infinite alternate',
          background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
        }}
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: -150, 
          left: -150, 
          width: '40vw', 
          height: '40vw', 
          maxWidth: 500, 
          borderRadius: '50%', 
          filter: 'blur(120px)', 
          pointerEvents: 'none', 
          zIndex: 0, 
          opacity: 0.25, 
          animation: 'pulseGlow 10s ease-in-out infinite alternate',
          background: `radial-gradient(circle, ${theme.palette.secondary.main} 0%, transparent 70%)`,
        }}
      />

      {/* Sidebar Nav */}
      <Box 
        component="aside"
        sx={{ 
          width: { xs: '100%', md: 280 },
          borderRight: { xs: 0, md: 1 },
          borderBottom: { xs: 1, md: 0 },
          borderColor: 'divider', 
          bgcolor: 'background.paper', 
          backdropFilter: 'blur(16px)', 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4, 
          zIndex: 10,
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Logo Heading */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box 
            component="img"
            src="/logoOnlyBio.png"
            alt="CCTV Analytics Logo"
            sx={{ 
              width: 32, 
              height: 32, 
              objectFit: 'contain',
            }}
          />
          <Typography variant="h6" component="span" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
            CCTV Analytics
          </Typography>
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
                      borderRadius: 2.5,
                      px: 2,
                      py: 1.25,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      bgcolor: isSelected 
                        ? 'rgba(225, 29, 72, 0.08)'
                        : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(225, 29, 72, 0.04)',
                        color: 'text.primary',
                      },
                      '&.Mui-selected': {
                        bgcolor: isSelected 
                          ? 'rgba(225, 29, 72, 0.08)'
                          : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(225, 29, 72, 0.12)',
                        },
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      {tab.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography sx={{ fontWeight: 600, fontSize: '0.925rem' }}>
                          {tab.label}
                        </Typography>
                      } 
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* User Profile & Log Out */}
        <Box 
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              LOGGED IN AS
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {currentUser.username}
            </Typography>
          </Box>
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
          >
            Log Out
          </Button>
        </Box>
      </Box>

      {/* Main Panel Content */}
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 3, md: 5 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 4, 
          maxHeight: { xs: 'none', md: '100vh' },
          overflowY: 'auto',
          zIndex: 5,
        }}
      >
        {/* Header */}
        <Box 
          component="header"
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 30%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {activeTab.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {currentDate}
            </Typography>
          </Box>
        </Box>

        {/* Render Page Subroutes */}
        <Box sx={{ animation: 'fadeIn 0.6s ease' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default FullLayout;
