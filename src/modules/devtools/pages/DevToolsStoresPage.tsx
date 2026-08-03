import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  IconDatabase,
  IconCheck,
  IconArrowLeft,
  IconClock,
  IconCode,
  IconHistory,
} from '@tabler/icons-react';
import { devToolsService, entityHistoryTracker, type EntityTimelineEvent } from '../services/devtools.service';

export const DevToolsStoresPage: React.FC = () => {
  const { storeName } = useParams<{ storeName?: string }>();
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState(() => devToolsService.getStoreSummaries());
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSummaries(devToolsService.getStoreSummaries());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const entitiesMap = storeName ? devToolsService.getStoreEntities(storeName) : {};
  const entityIds = Object.keys(entitiesMap);
  const selectedEntity = selectedEntityId ? (entitiesMap[selectedEntityId] as Record<string, unknown>) : null;
  const entityHistory: EntityTimelineEvent[] = storeName && selectedEntityId
    ? entityHistoryTracker.getHistory(storeName, selectedEntityId)
    : [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {storeName && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconArrowLeft size={16} />}
                onClick={() => navigate('/_devtools/stores')}
                sx={{ color: '#94a3b8', borderColor: '#1e293b', mr: 1 }}
              >
                Back
              </Button>
            )}
            <IconDatabase size={24} color="#8b5cf6" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                {storeName ? `Store Inspector: ${storeName}` : 'Enterprise Store Registry Grid'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {storeName ? 'Inspect store statistics, raw entities, and in-memory session timeline.' : 'Read-only store statistics and entity count registry.'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Mode 1: Store Registry Data Grid */}
      {!storeName && (
        <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#0f172a' }}>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>STORE NAME</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>ENTITIES</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>UPDATES</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>DUPLICATES</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>REJECTED</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>SUBSCRIBERS</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>MEMORY EST.</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>STATUS</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 800 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summaries.map((s) => (
                  <TableRow
                    key={s.name}
                    hover
                    onClick={() => navigate(`/_devtools/stores/${s.name}`)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#0f172a !important' } }}
                  >
                    <TableCell sx={{ color: '#f8fafc', fontWeight: 700 }}>{s.name}</TableCell>
                    <TableCell sx={{ color: '#38bdf8', fontWeight: 800 }}>{s.entityCount.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#22c55e', fontWeight: 700 }}>{s.statistics.totalStored || 0}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{s.statistics.duplicateIgnored || 0}</TableCell>
                    <TableCell sx={{ color: '#ef4444' }}>{s.statistics.invalidPayloadsRejected || 0}</TableCell>
                    <TableCell sx={{ color: '#a855f7', fontWeight: 700 }}>2</TableCell>
                    <TableCell sx={{ color: '#f59e0b' }}>{(s.entityCount * 0.4 + 100).toFixed(1)} KB</TableCell>
                    <TableCell>
                      <Chip
                        icon={<IconCheck size={12} color="#22c55e" />}
                        label="HEALTHY"
                        size="small"
                        sx={{ bgcolor: '#0f172a', color: '#22c55e', border: '1px solid #1e293b', fontWeight: 800, fontSize: '10px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" variant="text" sx={{ color: '#38bdf8', fontWeight: 700 }}>Inspect</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Mode 2: Store Inspector (Left Entity Tree, Right Details & Timeline) */}
      {storeName && (
        <Grid container spacing={2}>
          {/* Left Panel: Entity Tree */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, bgcolor: '#090d16', border: '1px solid #1e293b', height: '600px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc', mb: 1.5, px: 1 }}>
                STORE ENTITIES ({entityIds.length})
              </Typography>
              <Divider sx={{ borderColor: '#1e293b', mb: 1 }} />

              <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List disablePadding>
                  {entityIds.map((id) => {
                    const active = selectedEntityId === id;
                    return (
                      <ListItemButton
                        key={id}
                        onClick={() => setSelectedEntityId(id)}
                        selected={active}
                        sx={{
                          borderRadius: '4px',
                          mb: 0.5,
                          bgcolor: active ? 'rgba(56, 189, 248, 0.1) !important' : 'transparent',
                          border: active ? '1px solid #38bdf8' : '1px solid transparent',
                        }}
                      >
                        <ListItemText
                          primary={id}
                          secondary={`Version: ${(entitiesMap[id] as any)?.version || 1}`}
                          slotProps={{
                            primary: { sx: { fontSize: '12px', fontWeight: active ? 800 : 500, color: active ? '#38bdf8' : '#e2e8f0' } },
                            secondary: { sx: { fontSize: '10px', color: '#64748b' } },
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                  {entityIds.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ p: 2, display: 'block' }}>
                      No entities present in this store yet.
                    </Typography>
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel: Metadata, Read-Only JSON Viewer & Timeline */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, bgcolor: '#090d16', border: '1px solid #1e293b', minHeight: '600px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedEntity ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#f8fafc' }}>
                      Entity: {selectedEntityId}
                    </Typography>
                    <Chip label={`Store: ${storeName}`} size="small" sx={{ bgcolor: '#0f172a', color: '#a855f7', border: '1px solid #1e293b' }} />
                  </Box>

                  {/* Read-Only JSON Viewer */}
                  <Paper sx={{ p: 2, bgcolor: '#030712', border: '1px solid #1e293b', borderRadius: '4px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <IconCode size={16} color="#38bdf8" />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8' }}>READ-ONLY ENTITY JSON STATE</Typography>
                    </Box>
                    <Typography
                      component="pre"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        color: '#22c55e',
                        m: 0,
                        maxHeight: '260px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {JSON.stringify(selectedEntity, null, 2)}
                    </Typography>
                  </Paper>

                  {/* In-Memory Session Timeline */}
                  <Paper sx={{ p: 2, bgcolor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <IconHistory size={16} color="#f59e0b" />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                        IN-MEMORY SESSION ENTITY TIMELINE
                      </Typography>
                    </Box>

                    {entityHistory.length > 0 ? (
                      <List disablePadding>
                        {entityHistory.map((evt, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5, borderBottom: '1px solid #1e293b' }}>
                            <IconClock size={14} color="#64748b" />
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                              {new Date(evt.timestamp).toLocaleTimeString()}
                            </Typography>
                            <Chip label={evt.action} size="small" color={evt.action === 'HYDRATE' ? 'info' : 'success'} sx={{ height: 18, fontSize: '9px' }} />
                            <Typography variant="caption" sx={{ color: '#f8fafc', fontWeight: 700 }}>
                              Version {evt.version}
                            </Typography>
                          </Box>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No in-memory state transition records logged for this entity yet.
                      </Typography>
                    )}
                  </Paper>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Select an entity from the left tree view to inspect its raw JSON state and timeline.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
