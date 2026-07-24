import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemAvatar, 
  ListItemText,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import { 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconBuilding, 
  IconStack, 
  IconHome, 
  IconArrowRight,
  IconBuildingSkyscraper
} from '@tabler/icons-react';
import { useRooms } from '../hooks/useRooms';
import type { Building, Floor, Room } from '../hooks/useRooms';
import { useZones } from '../hooks/useZones';
import { useCameras } from '../hooks/useCameras';

export const Rooms: React.FC = () => {
  const {
    buildings,
    floors,
    rooms,
    addBuilding,
    updateBuilding,
    deleteBuilding,
    addFloor,
    updateFloor,
    deleteFloor,
    addRoom,
    updateRoom,
    deleteRoom,
  } = useRooms();

  const { zones } = useZones();
  const { cameras } = useCameras();

  const getZoneTooltipText = (z: any) => {
    if (z.cameraConfigs.length === 0) return 'No cameras mapped';
    const camNames = z.cameraConfigs
      .map((config: any) => {
        const camera = cameras.find((c) => c.id === config.cameraId);
        return camera ? camera.name : 'Unknown Camera';
      })
      .join(', ');
    return `Observed by: ${camNames}`;
  };

  // Active Selections
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<'building' | 'floor' | 'room'>('building');
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered lists based on selections
  const activeFloors = useMemo(() => {
    if (!selectedBuildingId) return [];
    return floors.filter((f) => f.buildingId === selectedBuildingId);
  }, [floors, selectedBuildingId]);

  const activeRooms = useMemo(() => {
    if (!selectedFloorId) return [];
    return rooms.filter((r) => r.floorId === selectedFloorId);
  }, [rooms, selectedFloorId]);

  // Handle Selections
  const handleSelectBuilding = (id: string) => {
    setSelectedBuildingId(id);
    setSelectedFloorId(null); // Reset floor select on building change
  };

  const handleSelectFloor = (id: string) => {
    setSelectedFloorId(id);
  };

  // Open Dialogs
  const handleOpenCreate = (target: 'building' | 'floor' | 'room') => {
    if (target === 'floor' && !selectedBuildingId) return;
    if (target === 'room' && !selectedFloorId) return;

    setDialogTarget(target);
    setDialogMode('create');
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    
    // Set default visual assets/placeholders based on layer
    if (target === 'building') {
      setFormImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80');
    } else if (target === 'floor') {
      setFormImage('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80');
    } else {
      setFormImage('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=300&q=80');
    }

    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (target: 'building' | 'floor' | 'room', item: Building | Floor | Room) => {
    setDialogTarget(target);
    setDialogMode('edit');
    setEditingId(item.id);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormImage(item.image);
    setFormError(null);
    setDialogOpen(true);
  };

  // Form submit dispatcher
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Name is required.');
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      image: formImage.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80',
    };

    if (dialogTarget === 'building') {
      if (dialogMode === 'create') {
        addBuilding(payload);
      } else if (editingId) {
        updateBuilding(editingId, payload);
      }
    } else if (dialogTarget === 'floor') {
      if (dialogMode === 'create' && selectedBuildingId) {
        addFloor({ ...payload, buildingId: selectedBuildingId });
      } else if (editingId && selectedBuildingId) {
        const floorItem = floors.find(f => f.id === editingId);
        if (floorItem) {
          updateFloor(editingId, { ...payload, buildingId: floorItem.buildingId });
        }
      }
    } else if (dialogTarget === 'room') {
      if (dialogMode === 'create' && selectedFloorId) {
        addRoom({ ...payload, floorId: selectedFloorId });
      } else if (editingId && selectedFloorId) {
        const roomItem = rooms.find(r => r.id === editingId);
        if (roomItem) {
          updateRoom(editingId, { ...payload, floorId: roomItem.floorId });
        }
      }
    }

    setDialogOpen(false);
  };

  // Deletion helper
  const handleDeleteItem = (target: 'building' | 'floor' | 'room', id: string, name: string) => {
    let confirmMsg = `Are you sure you want to delete "${name}"?`;
    if (target === 'building') {
      confirmMsg += ' This will delete all associated floors and rooms as well.';
    } else if (target === 'floor') {
      confirmMsg += ' This will delete all rooms on this floor.';
    }

    if (window.confirm(confirmMsg)) {
      if (target === 'building') {
        deleteBuilding(id);
        if (selectedBuildingId === id) {
          setSelectedBuildingId(null);
          setSelectedFloorId(null);
        }
      } else if (target === 'floor') {
        deleteFloor(id);
        if (selectedFloorId === id) {
          setSelectedFloorId(null);
        }
      } else if (target === 'room') {
        deleteRoom(id);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Dynamic Header Path Indicator */}
      {(selectedBuildingId || selectedFloorId) && (
        <Card sx={{ py: 1.5, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconBuildingSkyscraper size={18} style={{ color: 'var(--mui-palette-primary-main)' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            Explorer: 
            <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }} onClick={() => { setSelectedBuildingId(null); setSelectedFloorId(null); }}>
              All Buildings
            </Box>
            {selectedBuildingId && (
              <>
                <IconArrowRight size={14} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                <Box component="span" sx={{ color: 'text.primary' }}>
                  {buildings.find(b => b.id === selectedBuildingId)?.name}
                </Box>
              </>
            )}
            {selectedFloorId && (
              <>
                <IconArrowRight size={14} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                <Box component="span" sx={{ color: 'text.primary' }}>
                  {floors.find(f => f.id === selectedFloorId)?.name}
                </Box>
              </>
            )}
          </Typography>
        </Card>
      )}

      <Grid container spacing={3.5}>
        {/* Column 1: Buildings */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              minHeight: 500, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
            elevation={0}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <IconBuilding size={20} style={{ color: 'var(--mui-palette-primary-main)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Buildings ({buildings.length})
                </Typography>
              </Box>
              <Tooltip title="Add Building">
                <IconButton 
                  size="small" 
                  onClick={() => handleOpenCreate('building')}
                  sx={{ bgcolor: 'rgba(225, 29, 72, 0.08)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.15)' } }}
                >
                  <IconPlus size={18} />
                </IconButton>
              </Tooltip>
            </Box>

            <List sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 0, maxHeight: 520 }}>
              {buildings.map((building) => {
                const isSelected = selectedBuildingId === building.id;
                return (
                  <ListItem key={building.id} disablePadding secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit('building', building)}>
                        <IconPencil size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteItem('building', building.id, building.name)}>
                        <IconTrash size={16} />
                      </IconButton>
                    </Box>
                  }>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleSelectBuilding(building.id)}
                      sx={{
                        borderRadius: 2.5,
                        pr: 8, // Avoid overlapping with secondary actions
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        bgcolor: isSelected ? 'rgba(225, 29, 72, 0.04)' : 'transparent',
                        '&.Mui-selected': {
                          bgcolor: 'rgba(225, 29, 72, 0.06)',
                          '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.1)' }
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={building.image} 
                          alt={building.name}
                          sx={{ width: 44, height: 44, border: '1px solid', borderColor: 'divider' }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700, fontSize: '0.925rem' }}>{building.name}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{building.description}</Typography>}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Column 2: Floors */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              minHeight: 500, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              opacity: selectedBuildingId ? 1 : 0.6,
              pointerEvents: selectedBuildingId ? 'auto' : 'none',
              transition: 'all 0.2s ease',
            }}
            elevation={0}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <IconStack size={20} style={{ color: selectedBuildingId ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-secondary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: selectedBuildingId ? 'text.primary' : 'text.secondary' }}>
                  Floors {selectedBuildingId ? `(${activeFloors.length})` : ''}
                </Typography>
              </Box>
              {selectedBuildingId && (
                <Tooltip title="Add Floor">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenCreate('floor')}
                    sx={{ bgcolor: 'rgba(225, 29, 72, 0.08)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.15)' } }}
                  >
                    <IconPlus size={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {!selectedBuildingId ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 1, p: 2 }}>
                <IconStack size={36} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Select a Building to view and manage its Floors.
                </Typography>
              </Box>
            ) : activeFloors.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  No floors created for this building. Click the '+' button to add one.
                </Typography>
              </Box>
            ) : (
              <List sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 0, maxHeight: 520 }}>
                {activeFloors.map((floor) => {
                  const isSelected = selectedFloorId === floor.id;
                  return (
                    <ListItem key={floor.id} disablePadding secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        <IconButton size="small" onClick={() => handleOpenEdit('floor', floor)}>
                          <IconPencil size={16} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteItem('floor', floor.id, floor.name)}>
                          <IconTrash size={16} />
                        </IconButton>
                      </Box>
                    }>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => handleSelectFloor(floor.id)}
                        sx={{
                          borderRadius: 2.5,
                          pr: 8,
                          border: '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'transparent',
                          bgcolor: isSelected ? 'rgba(225, 29, 72, 0.04)' : 'transparent',
                          '&.Mui-selected': {
                            bgcolor: 'rgba(225, 29, 72, 0.06)',
                            '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.1)' }
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            variant="rounded" 
                            src={floor.image} 
                            alt={floor.name}
                            sx={{ width: 44, height: 44, border: '1px solid', borderColor: 'divider' }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 700, fontSize: '0.925rem' }}>{floor.name}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{floor.description}</Typography>}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Column 3: Rooms */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              minHeight: 500, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              opacity: selectedFloorId ? 1 : 0.6,
              pointerEvents: selectedFloorId ? 'auto' : 'none',
              transition: 'all 0.2s ease',
            }}
            elevation={0}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <IconHome size={20} style={{ color: selectedFloorId ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-secondary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: selectedFloorId ? 'text.primary' : 'text.secondary' }}>
                  Rooms {selectedFloorId ? `(${activeRooms.length})` : ''}
                </Typography>
              </Box>
              {selectedFloorId && (
                <Tooltip title="Add Room">
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenCreate('room')}
                    sx={{ bgcolor: 'rgba(225, 29, 72, 0.08)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.15)' } }}
                  >
                    <IconPlus size={18} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {!selectedFloorId ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 1, p: 2 }}>
                <IconHome size={36} style={{ color: 'var(--mui-palette-text-secondary)' }} />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Select a Floor to view and manage its Rooms.
                </Typography>
              </Box>
            ) : activeRooms.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: 1, p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  No rooms created on this floor. Click the '+' button to add one.
                </Typography>
              </Box>
            ) : (
              <List sx={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 0, maxHeight: 520 }}>
                {activeRooms.map((room) => {
                  return (
                    <ListItem key={room.id} disablePadding secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        <IconButton size="small" onClick={() => handleOpenEdit('room', room)}>
                          <IconPencil size={16} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteItem('room', room.id, room.name)}>
                          <IconTrash size={16} />
                        </IconButton>
                      </Box>
                    }>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          p: 1.5,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'action.hover',
                          bgcolor: 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <Avatar 
                          variant="rounded" 
                          src={room.image} 
                          alt={room.name}
                          sx={{ width: 44, height: 44, mr: 2, border: '1px solid', borderColor: 'divider' }}
                        />
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 700, fontSize: '0.925rem' }}>{room.name}</Typography>}
                          secondary={
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {room.description}
                              </Typography>
                              {zones.filter((z) => z.roomId === room.id).length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                                  {zones.filter((z) => z.roomId === room.id).map((z) => (
                                    <Tooltip key={z.id} title={getZoneTooltipText(z)} arrow>
                                      <Chip
                                        size="small"
                                        label={z.name}
                                        sx={{
                                          height: 18,
                                          fontSize: '0.675rem',
                                          fontWeight: 600,
                                          bgcolor: 'rgba(225, 29, 72, 0.06)',
                                          color: 'primary.main',
                                          border: '1px solid rgba(225, 29, 72, 0.15)',
                                          '& .MuiChip-label': { px: 0.75 }
                                        }}
                                      />
                                    </Tooltip>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Unified Edit/Create Dialog */}
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
            {dialogMode === 'create' ? 'Create' : 'Edit'} {dialogTarget.charAt(0).toUpperCase() + dialogTarget.slice(1)}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            {formError && (
              <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
                {formError}
              </Typography>
            )}

            <TextField
              label="Name"
              required
              fullWidth
              variant="outlined"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />

            <TextField
              label="Image URL"
              fullWidth
              variant="outlined"
              placeholder="https://example.com/image.jpg"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              helperText="Provide an image URL. A default placeholder will be set if left blank."
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
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
              sx={{ color: 'white' }}
            >
              {dialogMode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Rooms;
