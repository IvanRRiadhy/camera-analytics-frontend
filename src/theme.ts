import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark' = 'dark'): Theme => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#38bdf8', // Vivid Electric Blue / Sky-400
        light: '#7dd3fc',
        dark: '#0284c7',
      },
      secondary: {
        main: '#06b6d4', // Cyan-500
      },
      background: {
        default: '#030712', // Deep Rich Black
        paper: '#0f172a',   // Dark Navy Charcoal
      },
      text: {
        primary: '#f8fafc',
        secondary: '#94a3b8',
      },
      divider: 'rgba(56, 189, 248, 0.12)',
      success: {
        main: '#22c55e', // Emerald Green
      },
      error: {
        main: '#ef4444', // Vivid Red
      },
      warning: {
        main: '#f59e0b', // Amber Orange
      },
      info: {
        main: '#38bdf8', // Cyan Blue
      },
    },
    typography: {
      fontFamily: [
        'Outfit',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: () => ({
            backgroundImage: 'none',
            backgroundColor: '#0f172a',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              borderColor: 'rgba(56, 189, 248, 0.4)',
              boxShadow: '0 8px 20px -6px rgba(56, 189, 248, 0.2)',
            },
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '6px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: () => ({
            borderColor: 'rgba(56, 189, 248, 0.12)',
          }),
        },
      },
    },
  });
};
