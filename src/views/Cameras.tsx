import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  Chip, 
  IconButton, 
  Tooltip,
  Switch,
  FormControlLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  IconVideo, 
  IconPlus, 
  IconSearch, 
  IconPencil, 
  IconTrash, 
  IconLink,
  IconMapPin,
  IconAlertCircle,
  IconEye,
  IconX,
  IconCheck
} from '@tabler/icons-react';
import { useCameras, type Camera } from '../hooks/useCameras';
import { useRooms } from '../hooks/useRooms';
import { useZones } from '../hooks/useZones';

export const Cameras: React.FC = () => {
  const { cameras, loading, addCamera, updateCamera, deleteCamera } = useCameras();
  const { rooms, floors, buildings } = useRooms();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

  // Zone Integration State
  const { zones, addZone, deleteZone, saveCameraConfigToZone, removeCameraConfigFromZone } = useZones();
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewCamera, setPreviewCamera] = useState<Camera | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [selectedZoneType, setSelectedZoneType] = useState<'existing' | 'new'>('new');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [newZoneName, setNewZoneName] = useState('');
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRtspUrl, setFormRtspUrl] = useState('');
  const [formRoomId, setFormRoomId] = useState('');
  const [formStatus, setFormStatus] = useState<'online' | 'offline'>('online');
  const [formError, setFormError] = useState<string | null>(null);

  // Resolve room path string, e.g., "HQ > 1st Floor > Reception"
  const getRoomPath = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return 'Unknown Room';

    const floor = floors.find((f) => f.id === room.floorId);
    if (!floor) return room.name;

    const building = buildings.find((b) => b.id === floor.buildingId);
    if (!building) return `${floor.name} > ${room.name}`;

    return `${building.name} > ${floor.name} > ${room.name}`;
  };

  // Filtered cameras list
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const matchesSearch = cam.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cam.rtspUrl.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || cam.status === statusFilter;
      const matchesRoom = roomFilter === 'all' || cam.roomId === roomFilter;

      return matchesSearch && matchesStatus && matchesRoom;
    });
  }, [cameras, searchTerm, statusFilter, roomFilter]);

  // Open Dialog for Registering
  const handleOpenRegister = () => {
    setEditingCamera(null);
    setFormName('');
    setFormDescription('');
    setFormRtspUrl('rtsp://');
    setFormRoomId(rooms[0]?.id || '');
    setFormStatus('online');
    setFormError(null);
    setDialogOpen(true);
  };

  // Open Dialog for Editing
  const handleOpenEdit = (camera: Camera) => {
    setEditingCamera(camera);
    setFormName(camera.name);
    setFormDescription(camera.description);
    setFormRtspUrl(camera.rtspUrl);
    setFormRoomId(camera.roomId);
    setFormStatus(camera.status);
    setFormError(null);
    setDialogOpen(true);
  };

  // Submit Form (Register/Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formRtspUrl.trim() || !formRoomId) {
      setFormError('Please fill in all required fields (Name, RTSP URL, and Room).');
      return;
    }

    const cameraPayload = {
      name: formName.trim(),
      description: formDescription.trim(),
      rtspUrl: formRtspUrl.trim(),
      roomId: formRoomId,
      status: formStatus,
    };

    if (editingCamera) {
      await updateCamera(editingCamera.id, cameraPayload);
    } else {
      await addCamera(cameraPayload);
    }

    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      await deleteCamera(id);
    }
  };

  const openPreviewWindow = (camera: Camera) => {
    setPreviewCamera(camera);
    setCurrentPoints([]);
    setIsDrawing(false);
    setNewZoneName('');
    setSelectedZoneType('new');
    setSelectedZoneId('');
    setPreviewDialogOpen(true);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setCurrentPoints((prev) => [...prev, [x, y]]);
  };

  // Filtered zones for the camera preview dialog
  const roomZones = useMemo(() => {
    if (!previewCamera) return [];
    return zones.filter((z) => z.roomId === previewCamera.roomId);
  }, [zones, previewCamera]);

  const cameraZones = useMemo(() => {
    if (!previewCamera) return [];
    return zones.filter((z) =>
      z.cameraConfigs.some((config) => config.cameraId === previewCamera.id)
    );
  }, [zones, previewCamera]);

  const unmappedRoomZones = useMemo(() => {
    if (!previewCamera) return [];
    return roomZones.filter(
      (z) => !z.cameraConfigs.some((config) => config.cameraId === previewCamera.id)
    );
  }, [roomZones, previewCamera]);

  const handleSaveZone = async () => {
    if (!previewCamera || currentPoints.length < 3) return;

    if (selectedZoneType === 'new') {
      if (!newZoneName.trim()) {
        alert('Please enter a name for the new zone.');
        return;
      }
      await addZone({
        name: newZoneName.trim(),
        roomId: previewCamera.roomId,
        cameraConfigs: [
          {
            cameraId: previewCamera.id,
            polygon: currentPoints,
          },
        ],
      });
      setNewZoneName('');
    } else {
      if (!selectedZoneId) {
        alert('Please select an existing zone.');
        return;
      }
      await saveCameraConfigToZone(selectedZoneId, {
        cameraId: previewCamera.id,
        polygon: currentPoints,
      });
    }

    setCurrentPoints([]);
    setIsDrawing(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Top Search, Filter, and Action Bar */}
      <Card sx={{ p: 3 }}>
        <Grid container spacing={2.5} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search cameras by name, description, RTSP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="room-filter-label">Room</InputLabel>
              <Select
                labelId="room-filter-label"
                value={roomFilter}
                label="Room"
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <MenuItem value="all">All Rooms</MenuItem>
                {rooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {getRoomPath(room.id)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={handleOpenRegister}
              fullWidth
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                py: 1
              }}
            >
              Register Camera
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Cameras Grid */}
      {filteredCameras.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <IconAlertCircle size={48} style={{ color: 'var(--mui-palette-text-secondary)', marginBottom: '16px' }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
            No Cameras Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {cameras.length === 0 
              ? 'Get started by clicking "Register Camera" to add your first camera.'
              : 'Try adjusting your search query or filter options.'}
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredCameras.map((camera) => {
            const isOnline = camera.status === 'online';
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={camera.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 2.5, '&:last-child': { pb: 3 } }}>
                    {/* Header: Title + Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: 2.5,
                            bgcolor: isOnline ? 'rgba(46, 125, 50, 0.08)' : 'rgba(198, 40, 40, 0.08)',
                            color: isOnline ? 'success.main' : 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconVideo size={22} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>
                            {camera.name}
                          </Typography>
                          <Chip 
                            size="small"
                            label={isOnline ? 'Online' : 'Offline'}
                            color={isOnline ? 'success' : 'error'}
                            sx={{
                              height: 20,
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              mt: 0.5,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Preview Camera">
                          <IconButton size="small" color="primary" onClick={() => openPreviewWindow(camera)}>
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Camera">
                          <IconButton size="small" onClick={() => handleOpenEdit(camera)}>
                            <IconPencil size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Camera">
                          <IconButton size="small" color="error" onClick={() => handleDelete(camera.id)}>
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Body: Description */}
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, minHeight: 40, fontSize: '0.875rem' }}>
                      {camera.description || 'No description provided.'}
                    </Typography>

                    {/* Footer: RTSP details + Room Tag */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      {/* RTSP Stream */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <IconLink size={16} />
                        <Typography 
                          variant="caption" 
                          component="code" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.75rem', 
                            bgcolor: 'action.hover', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%'
                          }}
                        >
                          {camera.rtspUrl}
                        </Typography>
                      </Box>

                      {/* Room path */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <IconMapPin size={16} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                          {getRoomPath(camera.roomId)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog for Register/Edit */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: 'background.paper',
              backdropFilter: 'blur(16px)',
            }
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            {editingCamera ? `Edit Camera: ${editingCamera.name}` : 'Register New Camera'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            {formError && (
              <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
                {formError}
              </Typography>
            )}

            <TextField
              label="Camera Name"
              required
              fullWidth
              variant="outlined"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <TextField
              label="RTSP URL / Stream Source"
              required
              fullWidth
              variant="outlined"
              placeholder="rtsp://192.168.1.100/stream"
              value={formRtspUrl}
              onChange={(e) => setFormRtspUrl(e.target.value)}
              helperText="The RTSP URL or IP address of the camera stream."
            />

            <FormControl fullWidth required>
              <InputLabel id="dialog-room-label">Associated Room</InputLabel>
              <Select
                labelId="dialog-room-label"
                value={formRoomId}
                label="Associated Room"
                onChange={(e) => setFormRoomId(e.target.value)}
              >
                {rooms.length === 0 ? (
                  <MenuItem disabled value="">
                    No rooms available. Please create a room in Rooms Settings.
                  </MenuItem>
                ) : (
                  rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {getRoomPath(room.id)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="e.g., Covers the engineering open tables"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formStatus === 'online'}
                  onChange={(e) => setFormStatus(e.target.checked ? 'online' : 'offline')}
                  color="success"
                />
              }
              label={
                <Typography sx={{ fontWeight: 600 }}>
                  Set Camera Status to {formStatus === 'online' ? 'Online' : 'Offline'}
                </Typography>
              }
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1.5 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              sx={{ color: 'white' }}
            >
              {editingCamera ? 'Save Changes' : 'Register'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Interactive Camera Preview & Zone Management Dialog */}
      {previewCamera && (
        <Dialog
          open={previewDialogOpen}
          onClose={() => {
            setPreviewDialogOpen(false);
            setPreviewCamera(null);
          }}
          maxWidth="lg"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: 4,
                bgcolor: 'background.paper',
                backdropFilter: 'blur(20px)',
                p: 1
              }
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Live Feed & Zone Settings</Typography>
              <Typography variant="caption" color="text.secondary">
                Camera: {previewCamera.name} | Room: {getRoomPath(previewCamera.roomId)}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => {
                setPreviewDialogOpen(false);
                setPreviewCamera(null);
              }}
              size="small"
            >
              <IconX size={20} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Left Column: Live Feed and Canvas */}
              <Grid size={{ xs: 12, md: 7.5 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '56.25%', // 16:9 Aspect Ratio
                    bgcolor: '#020617',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: isDrawing ? 'crosshair' : 'default',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.24)'
                  }}
                  onClick={handleCanvasClick}
                >
                  {/* Absolute positioning wrapper for content */}
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    {previewCamera.rtspUrl.startsWith('rtsp://') ? (
                      <Box 
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative'
                        }}
                      >
                        {/* Scanline pattern */}
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0, 
                            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                            backgroundSize: '100% 4px, 6px 100%',
                            pointerEvents: 'none',
                            zIndex: 1
                          }}
                        />
                        <IconVideo size={48} style={{ color: 'var(--mui-palette-text-secondary)', marginBottom: '16px', opacity: 0.3 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, opacity: 0.7 }}>
                          Simulated RTSP Stream
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontFamily: 'monospace', opacity: 0.5 }}>
                          {previewCamera.rtspUrl}
                        </Typography>
                      </Box>
                    ) : (
                      <Box 
                        component="img"
                        src={previewCamera.rtspUrl}
                        alt="Live Camera Feed"
                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                          // Show loading error message
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const errorEl = document.createElement('div');
                            errorEl.innerHTML = '<p style="color:#ef4444;font-weight:600">Camera Feed Load Error</p><p style="font-size:12px;color:#94a3b8">Please verify the IP stream URL is reachable</p>';
                            errorEl.style.display = 'flex';
                            errorEl.style.flexDirection = 'column';
                            errorEl.style.alignItems = 'center';
                            errorEl.style.justifyContent = 'center';
                            errorEl.style.height = '100%';
                            parent.appendChild(errorEl);
                          }
                        }}
                      />
                    )}
                  </Box>

                  {/* SVG Overlays for Polygons */}
                  <svg 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
                  >
                    {/* Render saved camera zones */}
                    {cameraZones.map((z) => {
                      const config = z.cameraConfigs.find((c) => c.cameraId === previewCamera.id);
                      if (!config) return null;
                      
                      const isHovered = hoveredZoneId === z.id;
                      const pointsStr = config.polygon.map(([px, py]) => `${px},${py}`).join(' ');

                      return (
                        <polygon
                          key={z.id}
                          points={pointsStr}
                          fill={isHovered ? 'rgba(225, 29, 72, 0.4)' : 'rgba(225, 29, 72, 0.15)'}
                          stroke="#e11d48"
                          strokeWidth={isHovered ? '2' : '1.5'}
                          style={{ transition: 'all 0.2s ease' }}
                        />
                      );
                    })}

                    {/* Render active drawing polygon */}
                    {isDrawing && currentPoints.length > 0 && (
                      <polygon
                        points={currentPoints.map(([px, py]) => `${px},${py}`).join(' ')}
                        fill="rgba(56, 189, 248, 0.35)"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                      />
                    )}
                  </svg>

                  {/* Draw dot markers on top */}
                  {isDrawing && currentPoints.map(([px, py], idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: 'absolute',
                        left: `${px}%`,
                        top: `${py}%`,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#0284c7',
                        border: '2px solid #fff',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 3
                      }}
                    />
                  ))}
                  
                  {/* Floating Drawing Controller overlay */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 12, 
                      right: 12, 
                      display: 'flex', 
                      gap: 1, 
                      zIndex: 4 
                    }}
                  >
                    {isDrawing ? (
                      <>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="error" 
                          onClick={() => {
                            setIsDrawing(false);
                            setCurrentPoints([]);
                          }}
                          startIcon={<IconX size={14} />}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="warning" 
                          onClick={() => setCurrentPoints([])}
                          disabled={currentPoints.length === 0}
                        >
                          Reset Points
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="primary" 
                        onClick={() => {
                          setIsDrawing(true);
                          setCurrentPoints([]);
                        }}
                        startIcon={<IconPlus size={14} />}
                        sx={{ color: 'white' }}
                      >
                        Draw Zone Overlay
                      </Button>
                    )}
                  </Box>

                  {/* Drawing info hint */}
                  {isDrawing && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: 12, 
                        left: 12, 
                        bgcolor: 'rgba(15, 23, 42, 0.75)', 
                        backdropFilter: 'blur(4px)',
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 1,
                        color: 'white',
                        pointerEvents: 'none',
                        zIndex: 4 
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {currentPoints.length} points plotted (Min 3 required)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Right Column: Zone Editor Controls */}
              <Grid size={{ xs: 12, md: 4.5 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {isDrawing ? (
                  <Card sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Save Zone Boundaries
                    </Typography>

                    <FormControl fullWidth size="small">
                      <InputLabel id="zone-type-select-label">Association Type</InputLabel>
                      <Select
                        labelId="zone-type-select-label"
                        value={selectedZoneType}
                        label="Association Type"
                        onChange={(e) => {
                          setSelectedZoneType(e.target.value as any);
                          setSelectedZoneId('');
                        }}
                      >
                        <MenuItem value="new">Create New Zone</MenuItem>
                        {unmappedRoomZones.length > 0 && (
                          <MenuItem value="existing">Link Existing Room Zone</MenuItem>
                        )}
                      </Select>
                    </FormControl>

                    {selectedZoneType === 'new' ? (
                      <TextField
                        size="small"
                        label="New Zone Name"
                        required
                        fullWidth
                        placeholder="e.g. Front Door Corridor"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                      />
                    ) : (
                      <FormControl fullWidth size="small">
                        <InputLabel id="existing-zone-select-label">Select Room Zone</InputLabel>
                        <Select
                          labelId="existing-zone-select-label"
                          value={selectedZoneId}
                          label="Select Room Zone"
                          onChange={(e) => setSelectedZoneId(e.target.value)}
                        >
                          {unmappedRoomZones.map((z) => (
                            <MenuItem key={z.id} value={z.id}>
                              {z.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={handleSaveZone}
                      disabled={currentPoints.length < 3}
                      startIcon={<IconCheck size={16} />}
                      sx={{ color: 'white' }}
                    >
                      Save Zone Polygon
                    </Button>
                  </Card>
                ) : (
                  <Card sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      ACTIVE ZONES ON THIS CAMERA ({cameraZones.length})
                    </Typography>
                    
                    {cameraZones.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          No Zones Mapped
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click "Draw Zone Overlay" to define detection zones on this camera feed.
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 0, overflowY: 'auto', maxHeight: 280 }}>
                        {cameraZones.map((z) => {
                          const config = z.cameraConfigs.find(c => c.cameraId === previewCamera.id);
                          const coordsCount = config?.polygon.length || 0;
                          return (
                            <ListItem 
                              key={z.id}
                              disablePadding
                              secondaryAction={
                                <Box sx={{ display: 'flex', gap: 0.25 }}>
                                  <Tooltip title="Delete Zone Completely">
                                    <IconButton size="small" color="error" onClick={() => deleteZone(z.id)}>
                                      <IconTrash size={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Disconnect from Camera">
                                    <IconButton size="small" onClick={() => removeCameraConfigFromZone(z.id, previewCamera.id)}>
                                      <IconX size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              }
                              onMouseEnter={() => setHoveredZoneId(z.id)}
                              onMouseLeave={() => setHoveredZoneId(null)}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  width: '100%',
                                  p: 1.25,
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor: hoveredZoneId === z.id ? 'primary.main' : 'divider',
                                  bgcolor: hoveredZoneId === z.id ? 'rgba(225, 29, 72, 0.04)' : 'transparent',
                                  transition: 'all 0.2s ease',
                                  pr: 9 // Avoid overlapping with secondary actions
                                }}
                              >
                                <ListItemText
                                  primary={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{z.name}</Typography>}
                                  secondary={<Typography variant="caption" color="text.secondary">{coordsCount} polygon points mapped</Typography>}
                                />
                              </Box>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Card>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              variant="outlined"
              onClick={() => {
                setPreviewDialogOpen(false);
                setPreviewCamera(null);
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Cameras;
