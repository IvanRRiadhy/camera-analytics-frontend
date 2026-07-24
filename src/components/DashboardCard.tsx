import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor?: string; // Expects an RGB value string, e.g. "99, 102, 241" or "6, 182, 212"
  badge?: string;
  children?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  accentColor,
  badge,
  children
}) => {
  const rgbColor = accentColor || "99, 102, 241";

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <CardContent 
        sx={{ 
          p: 3.5, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          '&:last-child': { pb: 3.5 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2.5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.5rem',
              bgcolor: `rgba(${rgbColor}, 0.1)`,
              color: `rgb(${rgbColor})`,
            }}
          >
            {icon}
          </Box>
          {badge && (
            <Chip 
              label={badge} 
              size="small" 
              sx={{ 
                fontSize: '0.725rem', 
                fontWeight: 700, 
                bgcolor: `rgba(${rgbColor}, 0.08)`, 
                color: `rgb(${rgbColor})`,
                border: '1px solid',
                borderColor: 'divider',
              }} 
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {description}
          </Typography>
        </Box>

        {children && (
          <Box sx={{ mt: 1 }}>
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
export default DashboardCard;
