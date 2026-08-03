/**
 * Active Analytics Modules Accordion Panel (Sprint 3)
 * Pure Presentation Component reading RuntimeAnalyticsStore via selectors.
 * 
 * Concept:
 * Plugins -> Zones -> Aggregated Metrics
 * Zero UI business logic or manual array aggregations inside render scope.
 */

import React, { useState, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  IconChevronDown,
  IconUsers,
  IconBuildingStore,
  IconClock,
  IconFlame,
  IconCar,
  IconShield,
  IconLayersIntersect,
  IconCheck,
} from '@tabler/icons-react';
import {
  useRuntimeAnalyticsStore,
  selectAllPlugins,
  selectPluginZones,
  selectPluginHeaderSummary,
} from '../index';
import type { AggregatePluginSummary } from '../models/AnalyticsModule';

/** Map plugin code to styled Tabler Icon */
function getPluginIcon(pluginCode: string) {
  const code = pluginCode.toLowerCase();
  if (code.includes('people') || code.includes('occupancy')) return <IconUsers size={16} color="#38bdf8" />;
  if (code.includes('queue')) return <IconBuildingStore size={16} color="#8b5cf6" />;
  if (code.includes('loitering') || code.includes('dwell')) return <IconClock size={16} color="#f59e0b" />;
  if (code.includes('fire') || code.includes('smoke')) return <IconFlame size={16} color="#ef4444" />;
  if (code.includes('vehicle') || code.includes('anpr')) return <IconCar size={16} color="#06b6d4" />;
  return <IconShield size={16} color="#6366f1" />;
}

interface PluginAccordionItemProps {
  plugin: AggregatePluginSummary;
  isExpanded: boolean;
  onToggle: (pluginCode: string) => void;
}

const PluginAccordionItem: React.FC<PluginAccordionItemProps> = React.memo(({ plugin, isExpanded, onToggle }) => {
  const pluginZones = useRuntimeAnalyticsStore((state) => selectPluginZones(state, plugin.pluginCode));
  const headerSummary = selectPluginHeaderSummary(plugin);

  const handleAccordionChange = (_event: React.SyntheticEvent, expanded: boolean) => {
    if (expanded) {
      onToggle(plugin.pluginCode);
    } else {
      onToggle('');
    }
  };

  return (
    <Accordion
      expanded={isExpanded}
      onChange={handleAccordionChange}
      disableGutters
      elevation={0}
      sx={{
        bgcolor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '2px !important',
        mb: 1,
        '&:before': { display: 'none' },
        '&.Mui-expanded': { border: '1px solid #38bdf8' },
      }}
    >
      <AccordionSummary
        expandIcon={<IconChevronDown size={16} color="#94a3b8" />}
        sx={{
          py: 0.5,
          px: 1.25,
          minHeight: 44,
          '& .MuiAccordionSummary-content': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            my: 0.5,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ p: 0.5, borderRadius: '2px', bgcolor: 'rgba(56, 189, 248, 0.1)', display: 'flex' }}>
            {getPluginIcon(plugin.pluginCode)}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace', lineHeight: 1.1 }}>
              {plugin.displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, fontSize: '9.5px', fontFamily: 'monospace' }}>
              {headerSummary}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
          <Chip
            icon={<IconCheck size={10} color="#22c55e" />}
            label="ACTIVE"
            size="small"
            sx={{ fontWeight: 900, borderRadius: '2px', fontSize: '8.5px', height: '16px', bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 1.25, pt: 0, bgcolor: '#090d16', borderTop: '1px solid #1e293b' }}>
        {pluginZones.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {pluginZones.map((zone) => (
              <Paper key={zone.zoneId} sx={{ p: 1, bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: '2px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '10.5px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconLayersIntersect size={12} color="#38bdf8" />
                    {zone.zoneName || zone.zoneId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px', fontFamily: 'monospace' }}>
                    {zone.reportingCameras.length} Cam(s)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                  {Object.entries(zone.metrics).map(([mKey, mVal]) => (
                    <Box key={mKey} sx={{ bgcolor: '#1e293b', px: 0.75, py: 0.25, borderRadius: '2px', display: 'flex', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '9px', textTransform: 'capitalize' }}>
                        {mKey}:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8', fontSize: '9px', fontFamily: 'monospace' }}>
                        {Array.isArray(mVal) ? mVal.join(', ') : String(mVal)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 1.5, textAlign: 'center' }}>
            <Chip label="No Zone Data" size="small" sx={{ bgcolor: '#1e293b', color: '#94a3b8', fontSize: '9px', height: '18px', borderRadius: '2px' }} />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
});

PluginAccordionItem.displayName = 'PluginAccordionItem';

export const ActiveAnalyticsModulesPanel: React.FC = React.memo(() => {
  const activePlugins = useRuntimeAnalyticsStore(selectAllPlugins);
  const [expandedPlugin, setExpandedPlugin] = useState<string>('');

  const handleToggle = useCallback((pluginCode: string) => {
    setExpandedPlugin((prev) => (prev === pluginCode ? '' : pluginCode));
  }, []);

  return (
    <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', height: '540px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 1, borderBottom: '1px solid #1e293b' }}>
        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.5px' }}>
          Active Analytics Modules
        </Typography>
        <Chip label={`${activePlugins.length} Active`} size="small" sx={{ bgcolor: '#1e293b', color: '#38bdf8', fontSize: '9px', height: '18px', borderRadius: '2px', fontWeight: 800 }} />
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        {activePlugins.length > 0 ? (
          activePlugins.map((plugin) => (
            <PluginAccordionItem
              key={plugin.pluginCode}
              plugin={plugin}
              isExpanded={expandedPlugin === plugin.pluginCode}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: 1 }}>
            <IconShield size={32} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>No Active Analytics Plugins Reporting</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
});

ActiveAnalyticsModulesPanel.displayName = 'ActiveAnalyticsModulesPanel';
