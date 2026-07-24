import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Divider } from '@mui/material';

interface TechItem {
  name: string;
  version: string;
  description: string;
  readiness: number; // 0 to 100
  color: string; // RGB string format
}

export const StatsShowcase: React.FC = () => {
  const [activeTech, setActiveTech] = useState<string | null>(null);

  const techStack: TechItem[] = [
    {
      name: 'Vite',
      version: 'v6.x',
      description: 'Next-generation build tool focusing on speed. Includes instant dev server start and lightning-fast Hot Module Replacement (HMR).',
      readiness: 100,
      color: '139, 92, 246', // Purple
    },
    {
      name: 'React',
      version: 'v19.x',
      description: 'A component-based UI library. It utilizes the virtual DOM for declarative rendering and high performance.',
      readiness: 95,
      color: '6, 182, 212', // Cyan
    },
    {
      name: 'TypeScript',
      version: 'v5.x',
      description: 'A typed superset of JavaScript that compiles to plain JavaScript. Provides robust compile-time checking and autocomplete.',
      readiness: 98,
      color: '59, 130, 246', // Blue
    },
  ];

  return (
    <Card sx={{ minWidth: 320 }}>
      <CardContent sx={{ p: 3.5, '&:last-child': { pb: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
            Development Environment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status and parameters of active framework libraries
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {techStack.map((tech) => {
            const isActive = activeTech === tech.name;
            const rgbColor = tech.color;

            return (
              <Box
                key={tech.name}
                onClick={() => setActiveTech(isActive ? null : tech.name)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: isActive ? `rgba(${rgbColor}, 0.08)` : 'rgba(99, 102, 241, 0.02)',
                  border: '1px solid',
                  borderColor: isActive ? `rgba(${rgbColor}, 0.3)` : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: `rgb(${rgbColor})`,
                    bgcolor: `rgba(${rgbColor}, 0.04)`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {tech.name}{' '}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 500, ml: 0.5 }}>
                      {tech.version}
                    </Typography>
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontWeight: 700,
                      color: `rgb(${rgbColor})`,
                      px: 0.8,
                      py: 0.2,
                      bgcolor: `rgba(${rgbColor}, 0.1)`,
                      borderRadius: 1,
                    }}
                  >
                    ONLINE
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={tech.readiness} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3, 
                    mt: 1.5,
                    bgcolor: 'divider',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, rgb(${rgbColor}) 0%, rgba(${rgbColor}, 0.5) 100%)`,
                    },
                  }} 
                />

                {isActive && (
                  <Box 
                    sx={{ 
                      mt: 1.5, 
                      animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    }}
                  >
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {tech.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 0.5 }}>
          Click any technology card to view detailed specifications.
        </Typography>
      </CardContent>
    </Card>
  );
};
export default StatsShowcase;
