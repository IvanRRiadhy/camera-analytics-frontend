import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Skeleton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  IconWifi,
  IconWifiOff,
  IconRefresh,
  IconVideo,
  IconClock,
  IconUsers,
  IconFlame,
  IconShield,
  IconBuildingStore,
  IconCar,
  IconBuilding,
  IconLayersIntersect,
  IconChevronDown,
  IconChevronRight,
  IconMapPin,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useSignalR } from '../hooks/useSignalR';
import {
  useMonitoringOverview,
  useMonitoringEvents,
  useMonitoringIncidents,
  type MonitoringEvent,
} from '../hooks/useMonitoring';
import {
  useBuildingsQuery,
  useFloorsQuery,
  useRoomsQuery,
  useCamerasQuery,
} from '../hooks/queries/useSpatialQueries';
import UniversalVideoPlayer from '../components/UniversalVideoPlayer';
import {
  useRuntimeAnalyticsStore,
  selectPlugin,
  selectStatistics,
  ActiveAnalyticsModulesPanel,
} from '../analytics';
import {
  analyticsEventStore,
  useAnalyticsEventStore,
  selectAllEvents,
} from '../store/analyticsEvent.store';
import {
  useIncidentStore,
  selectAllIncidents,
} from '../store/incident.store';
import { useRuntimeBootstrap } from '../hooks/useRuntimeBootstrap';

export interface BoundingBoxOverlay {
  trackId: string;
  label: string;
  confidence: number;
  color: string;
  x: string;
  y: string;
  width: string;
  height: string;
  zoneName?: string;
}

export const Monitoring: React.FC = () => {
  const { connectionState, lastEvent } = useSignalR();

  // Backend Single Source of Truth Queries
  const { data: overview, refetch: refetchOverview } = useMonitoringOverview();
  const { data: backendEvents, isLoading: eventsLoading, refetch: refetchEvents } = useMonitoringEvents();
  const { data: backendIncidents, isLoading: incidentsLoading, refetch: refetchIncidents } = useMonitoringIncidents();

  // Spatial Hierarchy Queries for Dynamic Camera Tree View
  const { data: buildings = [] } = useBuildingsQuery();
  const { data: floors = [] } = useFloorsQuery();
  const { data: rooms = [] } = useRoomsQuery();
  const { data: cameras = [] } = useCamerasQuery();

  // Selection & Context State
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedCameraName, setSelectedCameraName] = useState<string>('');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [selectedPluginFilter, setSelectedPluginFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState<MonitoringEvent | null>(null);
  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));

  // Sprint 2: Pure Presentation KPI Selectors from RuntimeAnalyticsStore
  const peoplePlugin = useRuntimeAnalyticsStore((state) => selectPlugin(state, 'peopleCounting'));
  const queuePlugin = useRuntimeAnalyticsStore((state) => selectPlugin(state, 'queueDetection'));
  const analyticsStats = useRuntimeAnalyticsStore(selectStatistics);

  const realtimePeopleCount = peoplePlugin?.metrics.current ?? peoplePlugin?.metrics.entered ?? 0;
  const realtimeQueueLength = queuePlugin?.metrics.queueLength ?? queuePlugin?.metrics.waitingPeople ?? 0;
  const realtimeHealthyCameras = analyticsStats.activeCamerasCount;
  const realtimeTotalCameras = cameras.length || overview?.cameras.length || realtimeHealthyCameras;
  const activeStreamsCount = analyticsStats.activeCamerasCount || overview?.pipelines.length || 0;

  // Tree View Expand/Collapse State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Realtime Bounding Box Overlays (Populated exclusively from SignalR)
  const [overlayBoxes, setOverlayBoxes] = useState<BoundingBoxOverlay[]>([]);

  // ADR-011 Phase 7A.5: Centralized Runtime Bootstrap Layer
  useRuntimeBootstrap({
    overview,
    events: backendEvents,
    incidents: backendIncidents,
  });

  // Synchronize initial selections from live backend overview
  useEffect(() => {
    if (overview) {
      if (!selectedSite && overview.sites.length > 0) {
        setSelectedSite(overview.sites[0].code || overview.sites[0].id);
      }
      if (overview.cameras.length > 0 && !selectedCameraId) {
        setSelectedCameraId(overview.cameras[0].id);
        setSelectedCameraName(overview.cameras[0].name);
        const pipeline = overview.pipelines.find(p => (p as any).cameraId === overview.cameras[0].id || p.cameraName === overview.cameras[0].name);
        if (pipeline) setSelectedPipelineId(pipeline.pipelineId);
      }
    } else if (cameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(cameras[0].id);
      setSelectedCameraName(cameras[0].name);
    }
  }, [overview, cameras, selectedSite, selectedCameraId]);

  // ADR-011 Realtime Stores Subscriptions
  const storeAnalyticsEvents = useAnalyticsEventStore(selectAllEvents);
  const storeIncidents = useIncidentStore(selectAllIncidents);

  // 24-hour clock timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setLocalTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Process incoming SignalR events
  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.eventName === 'SnapshotUpdated') {
        const payload = lastEvent.payload as { overlayMetadata?: string };
        if (payload?.overlayMetadata) {
          try {
            const boxes = JSON.parse(payload.overlayMetadata);
            if (Array.isArray(boxes)) {
              setOverlayBoxes(boxes);
            }
          } catch { /* ignore parse error */ }
        }
      } else if (lastEvent.eventName === 'AnalyticsEventPublished') {
        const payload = lastEvent.payload as any;
        const newEvt: MonitoringEvent = {
          id: `evt_${Date.now()}`,
          timestamp: lastEvent.timestamp,
          pluginCode: payload?.pluginCode || payload?.plugin_code || 'analytics_event',
          pluginCategory: payload?.pluginCategory || 'SAFETY_SECURITY',
          cameraName: payload?.cameraName || selectedCameraName || 'Active Camera',
          zoneName: payload?.zoneName || 'Zone_01',
          trackId: payload?.trackId,
          confidence: payload?.confidence || 0.95,
          severity: payload?.severity === 'CRITICAL' ? 'CRITICAL' : payload?.severity === 'WARNING' ? 'WARNING' : 'INFO',
          description: payload?.description || 'Analytics Detection Event',
          isIncident: payload?.severity === 'CRITICAL',
        };
        analyticsEventStore.appendEvent(newEvt);
      } else if (lastEvent.eventName === 'IncidentEscalated') {
        const payload = lastEvent.payload as any;
        const newEvt: MonitoringEvent = {
          id: `evt_${Date.now()}`,
          timestamp: lastEvent.timestamp,
          pluginCode: payload?.pluginCode || 'incident_alert',
          pluginCategory: 'SAFETY_SECURITY',
          cameraName: payload?.cameraName || selectedCameraName || 'Active Camera',
          zoneName: payload?.zoneName || 'Critical Zone',
          confidence: 0.99,
          severity: 'CRITICAL',
          description: payload?.description || 'Critical Incident Escalated',
          isIncident: true,
        };
        analyticsEventStore.appendEvent(newEvt);
      }
    }
  }, [lastEvent, selectedCameraName]);

  // Dynamic Camera Hierarchy Mapping
  const siteHierarchy = useMemo(() => {
    const siteList = overview?.sites || [];
    return siteList.map((site) => {
      const siteBuildings = buildings.filter((b) => !b.siteId || b.siteId === site.id || b.siteId === site.code);
      return {
        ...site,
        buildings: siteBuildings.map((bldg) => {
          const bldgFloors = floors.filter((f) => f.buildingId === bldg.id);
          return {
            ...bldg,
            floors: bldgFloors.map((flr) => {
              const flrRooms = rooms.filter((r) => r.floorId === flr.id);
              const flrCameras = cameras.filter((c) => c.roomId === flr.id || flrRooms.some((r) => r.id === c.roomId));
              return {
                ...flr,
                rooms: flrRooms,
                cameras: flrCameras,
              };
            }),
          };
        }),
      };
    });
  }, [overview, buildings, floors, rooms, cameras]);

  // Selected Camera Metadata Resolution from Backend Models
  const selectedCameraMeta = useMemo(() => {
    const activeCam = cameras.find((c) => c.id === selectedCameraId || c.name === selectedCameraName) 
      || overview?.cameras.find((c) => c.id === selectedCameraId || c.name === selectedCameraName);
    
    const activePipeline = overview?.pipelines.find((p) => (p as any).cameraId === selectedCameraId || p.cameraName === selectedCameraName || p.pipelineId === selectedPipelineId);
    const enginesList = (overview as any)?.engines || [];
    const activeEngine = enginesList.find((e: any) => e.instanceId === (activePipeline as any)?.instanceId);

    const camRoomId = (activeCam as any)?.roomId;
    const room = rooms.find((r) => r.id === camRoomId);
    const floor = floors.find((f) => f.id === room?.floorId);
    const building = buildings.find((b) => b.id === floor?.buildingId);

    return {
      id: activeCam?.id || selectedCameraId || '—',
      name: activeCam?.name || selectedCameraName || 'Select a Camera',
      rtspUrl: activeCam?.rtspUrl || (activePipeline as any)?.rtspUrl || '',
      status: activeCam?.status || (activePipeline ? 'online' : 'offline'),
      area: room?.name || '—',
      floor: floor?.name || '—',
      building: building?.name || '—',
      site: overview?.sites.find((s) => s.code === selectedSite || s.id === selectedSite)?.name || '—',
      engine: activeEngine ? `${activeEngine.hostname} (${activeEngine.gpuModel})` : (enginesList[0]?.hostname || 'No Engine Assigned'),
      engineVersion: activeEngine?.engineVersion || '—',
      pipeline: activePipeline?.pipelineId || selectedPipelineId || '—',
      pipelineStatus: activePipeline?.status || '—',
      plugins: activeEngine?.installedPluginsJson ? JSON.parse(activeEngine.installedPluginsJson) : ((activePipeline as any)?.analyticsModules || []),
      lastHeartbeat: activeEngine?.lastHeartbeatUtc ? new Date(activeEngine.lastHeartbeatUtc).toLocaleTimeString() : '—',
    };
  }, [cameras, overview, rooms, floors, buildings, selectedCameraId, selectedCameraName, selectedPipelineId, selectedSite]);

  // Filtered stream based on category dropdown (ADR-011 Phase 4A)
  const filteredAnalyticsStream = useMemo(() => {
    let stream = storeAnalyticsEvents;
    if (selectedPluginFilter !== 'ALL') {
      stream = stream.filter((e) => e.pluginCategory === selectedPluginFilter);
    }
    return stream;
  }, [storeAnalyticsEvents, selectedPluginFilter]);

  // Incidents list from IncidentStore (ADR-011 Phase 6: Zero REST Refetches)
  const incidents = useMemo(() => {
    if (storeIncidents.length > 0) return storeIncidents;
    return storeAnalyticsEvents.filter((e) => e.isIncident).map((e) => ({
      id: e.id,
      timestamp: e.timestamp,
      pluginCode: e.pluginCode,
      cameraName: e.cameraName,
      severity: e.severity,
      status: 'OPEN',
      description: e.description,
    }));
  }, [storeIncidents, storeAnalyticsEvents]);

  // Sprint 4.3.8: SignalR 1Hz Telemetry Validation Pipeline Subscriber
  useEffect(() => {
    if (connectionState === 'Connected') {
      console.log('[SignalR RuntimeTick] Telemetry Pipeline Connected. Listening for 1Hz RuntimeSnapshots...');
    }
  }, [connectionState]);

  const handleManualRefresh = () => {
    refetchOverview();
    refetchEvents();
    refetchIncidents();
  };

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleSelectCamera = (camId: string, camName: string) => {
    setSelectedCameraId(camId);
    setSelectedCameraName(camName);
    const matchedPipeline = overview?.pipelines.find((p) => p.cameraId === camId || p.cameraName === camName);
    if (matchedPipeline) setSelectedPipelineId(matchedPipeline.pipelineId);
  };

  const getPluginIcon = (pluginCode: string) => {
    if (pluginCode.includes('people') || pluginCode.includes('occupancy')) return <IconUsers size={15} color="#6366f1" />;
    if (pluginCode.includes('queue')) return <IconBuildingStore size={15} color="#8b5cf6" />;
    if (pluginCode.includes('fire') || pluginCode.includes('smoke')) return <IconFlame size={15} color="#ef4444" />;
    if (pluginCode.includes('vehicle') || pluginCode.includes('anpr')) return <IconCar size={15} color="#06b6d4" />;
    return <IconShield size={15} color="#f59e0b" />;
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'CRITICAL') return <Chip label="CRITICAL" color="error" size="small" sx={{ fontWeight: 900, borderRadius: '2px', fontSize: '9px', height: '18px' }} />;
    if (sev === 'WARNING') return <Chip label="WARNING" color="warning" size="small" sx={{ fontWeight: 900, borderRadius: '2px', fontSize: '9px', height: '18px' }} />;
    return <Chip label="ANALYTICS" color="primary" size="small" sx={{ fontWeight: 900, borderRadius: '2px', fontSize: '9px', height: '18px' }} />;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#030712', minHeight: '90vh', color: '#e2e8f0' }}>
      
      {/* 8. HEADER FILTERS */}
      <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ color: '#94a3b8', fontSize: '11px' }}>Site Location</InputLabel>
            <Select value={selectedSite} label="Site Location" onChange={(e) => setSelectedSite(e.target.value)} sx={{ color: '#fff', fontSize: '12px', bgcolor: '#0f172a' }}>
              {overview?.sites.map((s) => (
                <MenuItem key={s.id} value={s.code || s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: '#94a3b8', fontSize: '11px' }}>Analytics Plugin Category</InputLabel>
            <Select value={selectedPluginFilter} label="Analytics Plugin Category" onChange={(e) => setSelectedPluginFilter(e.target.value)} sx={{ color: '#fff', fontSize: '12px', bgcolor: '#0f172a' }}>
              <MenuItem value="ALL">All Analytics Plugins</MenuItem>
              <MenuItem value="BUSINESS_INTELLIGENCE">Business Intelligence</MenuItem>
              <MenuItem value="SAFETY_SECURITY">Safety & Security</MenuItem>
              <MenuItem value="OPERATIONAL_COMPLIANCE">Compliance & PPE</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip icon={<IconClock size={14} color="#38bdf8" />} label={`LOCAL TIME: ${localTime}`} size="small" sx={{ fontWeight: 900, borderRadius: '2px', fontSize: '10px', bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }} />
          <Chip icon={connectionState === 'Connected' ? <IconWifi size={14} color="#22c55e" /> : <IconWifiOff size={14} color="#f59e0b" />} label={`SIGNALR: ${connectionState.toUpperCase()}`} color={connectionState === 'Connected' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 900, borderRadius: '2px', fontSize: '10px' }} />
          <IconButton size="small" onClick={handleManualRefresh} sx={{ color: '#94a3b8' }}>
            <IconRefresh size={18} />
          </IconButton>
        </Box>
      </Paper>

      {/* OVERVIEW SUMMARY CARDS (ADR-011 Phase 3A: Direct RuntimeStore Selector Consumers) */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '2px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <IconUsers size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '9.5px', textTransform: 'uppercase' }}>
                TOTAL PEOPLE COUNT
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#6366f1', fontFamily: 'monospace', lineHeight: 1.1 }}>
                {realtimePeopleCount}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '2px', bgcolor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <IconBuildingStore size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '9.5px', textTransform: 'uppercase' }}>
                ACTIVE QUEUE LENGTH
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#8b5cf6', fontFamily: 'monospace', lineHeight: 1.1 }}>
                {realtimeQueueLength}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '2px', bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
              <IconVideo size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '9.5px', textTransform: 'uppercase' }}>
                HEALTHY CAMERA NODES
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#22c55e', fontFamily: 'monospace', lineHeight: 1.1 }}>
                {realtimeHealthyCameras} / {realtimeTotalCameras || cameras.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '2px', bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
              <IconLayersIntersect size={22} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '9.5px', textTransform: 'uppercase' }}>
                ACTIVE REALTIME STREAMS
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', lineHeight: 1.1 }}>
                {activeStreamsCount} Pipelines
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* TACTICAL WORKSPACE GRID */}
      <Grid container spacing={1.5}>

        {/* 5. LEFT PANEL: DYNAMIC CAMERA EXPLORER TREE VIEW */}
        <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
          <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', height: '540px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 1, borderBottom: '1px solid #1e293b' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.5px' }}>
                Camera Explorer
              </Typography>
              <Chip label={`${cameras.length || overview?.cameras.length || 0} Cameras`} size="small" sx={{ bgcolor: '#1e293b', color: '#94a3b8', fontSize: '9px', height: '18px', borderRadius: '2px' }} />
            </Box>

            {/* Dynamic Hierarchical Tree View Generated Exclusively From Backend */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
              <List disablePadding sx={{ fontSize: '12px' }}>
                {siteHierarchy.map((siteNode) => {
                  const isSiteExpanded = expandedNodes[siteNode.id] ?? true;
                  return (
                    <Box key={siteNode.id}>
                      <ListItemButton onClick={() => toggleNodeExpand(siteNode.id)} sx={{ py: 0.5, px: 0.5, borderRadius: '2px' }}>
                        <ListItemIcon sx={{ minWidth: 22, color: '#38bdf8' }}>
                          {isSiteExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 24, color: '#38bdf8' }}>
                          <IconMapPin size={16} />
                        </ListItemIcon>
                        <ListItemText primary={<Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>{siteNode.name}</Typography>} />
                      </ListItemButton>

                      <Collapse in={isSiteExpanded} timeout="auto" unmountOnExit>
                        <List disablePadding sx={{ pl: 1.5 }}>
                          {siteNode.buildings.map((bldgNode) => {
                            const isBldgExpanded = expandedNodes[bldgNode.id] ?? true;
                            return (
                              <Box key={bldgNode.id}>
                                <ListItemButton onClick={() => toggleNodeExpand(bldgNode.id)} sx={{ py: 0.5, px: 0.5, borderRadius: '2px' }}>
                                  <ListItemIcon sx={{ minWidth: 22, color: '#818cf8' }}>
                                    {isBldgExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                                  </ListItemIcon>
                                  <ListItemIcon sx={{ minWidth: 24, color: '#818cf8' }}>
                                    <IconBuilding size={15} />
                                  </ListItemIcon>
                                  <ListItemText primary={<Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1' }}>{bldgNode.name}</Typography>} />
                                </ListItemButton>

                                <Collapse in={isBldgExpanded} timeout="auto" unmountOnExit>
                                  <List disablePadding sx={{ pl: 1.5 }}>
                                    {bldgNode.floors.map((flrNode) => {
                                      const isFlrExpanded = expandedNodes[flrNode.id] ?? true;
                                      return (
                                        <Box key={flrNode.id}>
                                          <ListItemButton onClick={() => toggleNodeExpand(flrNode.id)} sx={{ py: 0.5, px: 0.5, borderRadius: '2px' }}>
                                            <ListItemIcon sx={{ minWidth: 22, color: '#94a3b8' }}>
                                              {isFlrExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                                            </ListItemIcon>
                                            <ListItemIcon sx={{ minWidth: 24, color: '#94a3b8' }}>
                                              <IconLayersIntersect size={15} />
                                            </ListItemIcon>
                                            <ListItemText primary={<Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>{flrNode.name}</Typography>} />
                                          </ListItemButton>

                                          <Collapse in={isFlrExpanded} timeout="auto" unmountOnExit>
                                            <List disablePadding sx={{ pl: 1.5 }}>
                                              {flrNode.cameras.map((cam) => {
                                                const isSelected = selectedCameraId === cam.id || selectedCameraName === cam.name;
                                                return (
                                                  <ListItemButton
                                                    key={cam.id}
                                                    onClick={() => handleSelectCamera(cam.id, cam.name)}
                                                    selected={isSelected}
                                                    sx={{
                                                      py: 0.5,
                                                      px: 1,
                                                      my: 0.25,
                                                      borderRadius: '2px',
                                                      bgcolor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                                                      borderLeft: isSelected ? '3px solid #38bdf8' : '3px solid transparent',
                                                      '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.08)' },
                                                    }}
                                                  >
                                                    <ListItemIcon sx={{ minWidth: 22, color: isSelected ? '#38bdf8' : cam.status === 'online' ? '#22c55e' : '#64748b' }}>
                                                      <IconVideo size={14} />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                      primary={
                                                        <Typography sx={{ fontSize: '11px', fontWeight: isSelected ? 800 : 500, color: isSelected ? '#38bdf8' : '#e2e8f0', fontFamily: 'monospace' }}>
                                                          {cam.name}
                                                        </Typography>
                                                      }
                                                    />
                                                  </ListItemButton>
                                                );
                                              })}
                                            </List>
                                          </Collapse>
                                        </Box>
                                      );
                                    })}
                                  </List>
                                </Collapse>
                              </Box>
                            );
                          })}
                        </List>
                      </Collapse>
                    </Box>
                  );
                })}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* 6. CENTER PANEL: LIVE VIDEO CANVAS CONSUMING REUSED UniversalVideoPlayer */}
        <Grid size={{ xs: 12, md: 6, lg: 6.5 }}>
          <Paper sx={{ bgcolor: '#000', border: '1px solid #1e293b', borderRadius: '4px', overflow: 'hidden', height: '540px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ p: 1, bgcolor: '#090d16', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconVideo size={16} color={selectedCameraMeta.status === 'online' ? '#22c55e' : '#f59e0b'} />
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#f8fafc', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
                  Live Feed: {selectedCameraMeta.name}
                </Typography>
              </Box>
              <Chip label={selectedCameraMeta.status === 'online' ? 'LIVE RTSP STREAM' : 'STREAM DISCONNECTED'} color={selectedCameraMeta.status === 'online' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 900, borderRadius: '2px', fontSize: '9px', height: '18px' }} />
            </Box>

            {/* Reused UniversalVideoPlayer Component from /FrontEnd/Example/UniversalPlayer.tsx */}
            <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: '#020617' }}>
              {selectedCameraMeta.rtspUrl ? (
                <UniversalVideoPlayer
                  streamUrl={selectedCameraMeta.rtspUrl}
                  engineWsUrl="ws://192.168.1.166:8282"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: 1 }}>
                  <IconInfoCircle size={32} />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>No RTSP Stream Endpoint Configured for Selected Camera</Typography>
                </Box>
              )}

              {/* Dynamic SVG Bounding Box Overlays (Populated Exclusively via SignalR) */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {overlayBoxes.map((box, idx) => (
                  <g key={idx}>
                    <rect x={box.x} y={box.y} width={box.width} height={box.height} fill="rgba(34, 197, 94, 0.12)" stroke={box.color || '#22c55e'} strokeWidth="2" />
                    <rect x={box.x} y={box.y} width={box.width} height="16px" fill={box.color || '#22c55e'} />
                    <text x={box.x} y={box.y} dx="4" dy="12" fill="#000" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      {box.trackId} | {box.label} ({Math.round((box.confidence || 0.95) * 100)}%)
                    </text>
                  </g>
                ))}
              </svg>
            </Box>
          </Paper>
        </Grid>

        {/* 7. RIGHT PANEL: ACTIVE ANALYTICS MODULES ACCORDION PANEL (Sprint 3) */}
        <Grid size={{ xs: 12, md: 3, lg: 3 }}>
          <ActiveAnalyticsModulesPanel />
        </Grid>
      </Grid>

      {/* 9. BOTTOM PANEL: ACTIVE ANALYTICS EVENTS & INCIDENTS (EXCLUSIVELY BACKEND REST + SIGNALR) */}
      <Grid container spacing={1.5}>
        
        {/* BOTTOM LEFT: REALTIME ANALYTICS STREAM */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', height: '220px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 0.5, borderBottom: '1px solid #1e293b' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.5px' }}>
                Active Analytics Event Stream
              </Typography>
              <Chip label={`${filteredAnalyticsStream.length} Events`} size="small" sx={{ bgcolor: '#1e293b', color: '#94a3b8', fontSize: '9px', height: '18px', borderRadius: '2px' }} />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75, pr: 0.5 }}>
              {eventsLoading && <Skeleton variant="rectangular" height={150} sx={{ bgcolor: '#0f172a' }} />}

              {!eventsLoading && filteredAnalyticsStream.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                  <Typography variant="caption">No Active Analytics Events for Selected Filter</Typography>
                </Box>
              )}

              {filteredAnalyticsStream.map((evt) => (
                <Paper
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  sx={{
                    p: 0.75,
                    px: 1.25,
                    bgcolor: selectedEvent?.id === evt.id ? '#1e293b' : '#0f172a',
                    borderLeft: `3px solid ${evt.severity === 'CRITICAL' ? '#ef4444' : evt.severity === 'WARNING' ? '#f59e0b' : '#6366f1'}`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    '&:hover': { bgcolor: '#1e293b' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {getPluginIcon(evt.pluginCode)}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace' }}>
                        {evt.pluginCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '9.5px', color: '#94a3b8' }}>
                        {evt.cameraName} | {evt.description.slice(0, 60)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {evt.trackId && (
                      <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '9.5px', fontWeight: 700, fontFamily: 'monospace' }}>
                        {evt.trackId} ({Math.round(evt.confidence * 100)}%)
                      </Typography>
                    )}
                    {getSeverityBadge(evt.severity)}
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '9.5px', fontFamily: 'monospace' }}>
                      {evt.timestamp}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* BOTTOM RIGHT: INCIDENT ESCALATION LOG */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 1.25, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '4px', height: '220px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pb: 0.5, borderBottom: '1px solid #1e293b' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#ef4444', letterSpacing: '0.5px' }}>
                Incident Escalation Log
              </Typography>
              <Chip label={`${incidents.length} Critical`} color="error" size="small" sx={{ fontWeight: 900, fontSize: '9px', height: '18px', borderRadius: '2px' }} />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75, pr: 0.5 }}>
              {incidentsLoading && <Skeleton variant="rectangular" height={150} sx={{ bgcolor: '#0f172a' }} />}

              {!incidentsLoading && incidents.length === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                  <Typography variant="caption">No Incidents Escalated</Typography>
                </Box>
              )}

              {incidents.map((inc) => (
                <Paper key={inc.id} sx={{ p: 0.75, px: 1, bgcolor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#fca5a5', fontFamily: 'monospace', fontSize: '10px' }}>
                      [{inc.pluginCode}] {inc.cameraName}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#f8fafc', fontSize: '9.5px' }}>
                      {inc.description}
                    </Typography>
                  </Box>
                  <Button size="small" variant="contained" color="error" sx={{ textTransform: 'none', fontSize: '9px', py: 0.25, px: 1, borderRadius: '2px' }}>
                    Inspect
                  </Button>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};
