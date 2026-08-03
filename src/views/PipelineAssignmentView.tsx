import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Skeleton
} from '@mui/material';
import {
  IconSearch,
  IconCamera,
  IconServer,
  IconDeviceAnalytics,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { useAnalyticsPipelinesQuery } from '../hooks/queries/useAnalyticsPipelinesQuery';
import { useAnalyticsModulesQuery } from '../hooks/queries/useAnalyticsModulesQuery';
import { usePipelineModuleAssignmentMutation } from '../hooks/mutations/usePipelineModuleAssignmentMutation';
import type { PipelineAssignmentDto } from '../services/analyticsPipelineService';

export default function PipelineAssignmentView() {
  const { data: pipelines = [], isLoading: isPipelinesLoading } = useAnalyticsPipelinesQuery();
  const { data: availableModules = [], isLoading: isModulesLoading } = useAnalyticsModulesQuery();
  const updateModulesMutation = usePipelineModuleAssignmentMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineAssignmentDto | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredPipelines = useMemo(() => {
    return pipelines.filter(p =>
      p.cameraName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pipelineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rtspUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.engineHostname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pipelines, searchTerm]);

  const handleOpenAssignModal = (pipeline: PipelineAssignmentDto) => {
    setSelectedPipeline(pipeline);
    setSelectedModuleIds(pipeline.assignedModules.map(m => m.moduleId));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPipeline(null);
    setSelectedModuleIds([]);
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModuleIds(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSaveAssignments = () => {
    if (!selectedPipeline) return;
    updateModulesMutation.mutate(
      { pipelineId: selectedPipeline.id, moduleIds: selectedModuleIds },
      {
        onSuccess: () => {
          handleCloseModal();
        }
      }
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
          Pipeline Module Assignment
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, fontFamily: 'monospace' }}>
          Dynamically assign multi-vision AI analytics modules to camera RTSP pipelines.
        </Typography>
      </Box>

      {/* Filter & Search Controls */}
      <Paper sx={{ p: 2, mb: 4, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: '1 1 350px', maxWidth: '500px' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search camera, pipeline name, RTSP stream URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} color="#64748b" />
                    </InputAdornment>
                  ),
                  sx: { color: '#f8fafc', bgcolor: '#020617', borderRadius: '6px', border: '1px solid #1e293b' }
                }
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Pipeline List */}
      {isPipelinesLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rectangular" height={140} sx={{ bgcolor: '#090d16', borderRadius: '8px' }} />
          ))}
        </Box>
      ) : filteredPipelines.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', color: '#64748b' }}>
          <Typography variant="h6" sx={{ color: '#cbd5e1' }}>No Camera Pipeline Assignments Found</Typography>
          <Typography variant="caption">Ensure cameras and worker node instances are registered.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {filteredPipelines.map(pipe => (
            <Paper
              key={pipe.id}
              sx={{
                p: 3,
                bgcolor: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2,
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: '#3b82f6' }
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box sx={{ p: 1, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <IconCamera size={20} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                      {pipe.cameraName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                      {pipe.pipelineId} • {pipe.rtspUrl}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                    <IconServer size={14} />
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      Host: {pipe.engineHostname || 'edge-server-01'}
                    </Typography>
                  </Box>

                  <Chip
                    label={pipe.status}
                    size="small"
                    sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', fontWeight: 900, fontSize: '10px', height: '18px', borderRadius: '3px' }}
                  />
                </Box>

                {/* Assigned Modules Chips */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mr: 0.5 }}>
                    Active Plugins ({pipe.assignedModules.length}):
                  </Typography>

                  {pipe.assignedModules.length === 0 ? (
                    <Chip label="No Modules Assigned" size="small" sx={{ bgcolor: '#1e293b', color: '#64748b', fontSize: '10px', height: '20px' }} />
                  ) : (
                    pipe.assignedModules.map(mod => (
                      <Chip
                        key={mod.moduleId}
                        label={mod.displayName || mod.moduleCode}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          fontWeight: 700,
                          fontSize: '11px',
                          height: '22px',
                          borderRadius: '4px'
                        }}
                      />
                    ))
                  )}
                </Box>
              </Box>

              <Button
                variant="outlined"
                startIcon={<IconDeviceAnalytics size={18} />}
                onClick={() => handleOpenAssignModal(pipe)}
                sx={{
                  color: '#3b82f6',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6' }
                }}
              >
                Manage Modules
              </Button>
            </Paper>
          ))}
        </Box>
      )}

      {/* Module Assignment Modal */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', color: '#f8fafc' }
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #1e293b', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc' }}>
            Assign Analytics Modules — {selectedPipeline?.cameraName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
            Pipeline: {selectedPipeline?.pipelineId}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {isModulesLoading ? (
            <Skeleton variant="rectangular" height={200} sx={{ bgcolor: '#020617' }} />
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              {availableModules.map(mod => {
                const isSelected = selectedModuleIds.includes(mod.id);

                return (
                  <Paper
                    key={mod.id}
                    onClick={() => handleModuleToggle(mod.id)}
                    sx={{
                      p: 2,
                      bgcolor: isSelected ? 'rgba(59, 130, 246, 0.1)' : '#020617',
                      border: `1px solid ${isSelected ? '#3b82f6' : '#1e293b'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.2s, background-color 0.2s',
                      '&:hover': { borderColor: '#3b82f6' }
                    }}
                  >
                    <Box sx={{ flex: 1, pr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#60a5fa' : '#f8fafc' }}>
                          {mod.displayName}
                        </Typography>
                        <Chip
                          label={`CUDA ${mod.minimumCudaCapability}`}
                          size="small"
                          sx={{ bgcolor: '#1e293b', color: '#4ade80', fontSize: '9px', height: '16px', borderRadius: '2px' }}
                        />
                      </Box>

                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '11px', display: 'block', lineHeight: 1.4 }}>
                        {mod.description}
                      </Typography>
                    </Box>

                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleModuleToggle(mod.id)}
                      color="primary"
                      sx={{ p: 0, color: '#475569' }}
                    />
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #1e293b', px: 3, py: 2 }}>
          <Button
            onClick={handleCloseModal}
            startIcon={<IconX size={18} />}
            sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAssignments}
            disabled={updateModulesMutation.isPending}
            startIcon={<IconCheck size={18} />}
            sx={{ bgcolor: '#3b82f6', color: '#fff', fontWeight: 800, textTransform: 'none', borderRadius: '6px', '&:hover': { bgcolor: '#2563eb' } }}
          >
            {updateModulesMutation.isPending ? 'Saving...' : `Save Assignments (${selectedModuleIds.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
