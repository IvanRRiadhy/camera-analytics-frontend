import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Switch,
  Button,
  Tabs,
  Tab,
  Pagination,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  IconSearch,
  IconUsers,
  IconBuildingStore,
  IconClock,
  IconShield,
  IconShirt,
  IconFlame,
  IconUserCheck,
  IconCar,
  IconId,
  IconUsersGroup,
  IconAlertTriangle,
  IconActivity,
  IconVectorTriangle,
  IconPackage,
  IconBoxOff,
  IconCpu,
  IconPlus
} from '@tabler/icons-react';
import { useAnalyticsModulesQuery } from '../hooks/queries/useAnalyticsModulesQuery';
import { useAnalyticsModuleMutations } from '../hooks/mutations/useAnalyticsModuleMutations';
import type { AnalyticsModuleDto } from '../services/analyticsModuleService';

const getCategoryColor = (category: string) => {
  switch (category.toUpperCase()) {
    case 'BUSINESS_INTELLIGENCE':
      return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
    case 'SAFETY_SECURITY':
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
    case 'OPERATIONAL_COMPLIANCE':
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    case 'TRAFFIC_MOBILITY':
      return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    default:
      return { bg: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' };
  }
};

const renderIcon = (iconName: string) => {
  const props = { size: 24, stroke: 1.5 };
  switch (iconName) {
    case 'IconUsers': return <IconUsers {...props} />;
    case 'IconBuildingStore': return <IconBuildingStore {...props} />;
    case 'IconClock': return <IconClock {...props} />;
    case 'IconShield': return <IconShield {...props} />;
    case 'IconShirt': return <IconShirt {...props} />;
    case 'IconFlame': return <IconFlame {...props} />;
    case 'IconUserCheck': return <IconUserCheck {...props} />;
    case 'IconCar': return <IconCar {...props} />;
    case 'IconId': return <IconId {...props} />;
    case 'IconUsersGroup': return <IconUsersGroup {...props} />;
    case 'IconAlertTriangle': return <IconAlertTriangle {...props} />;
    case 'IconActivity': return <IconActivity {...props} />;
    case 'IconVectorTriangle': return <IconVectorTriangle {...props} />;
    case 'IconPackage': return <IconPackage {...props} />;
    case 'IconBoxOff': return <IconBoxOff {...props} />;
    default: return <IconShield {...props} />;
  }
};

export default function ModuleCatalog() {
  const { data: modules = [], isLoading } = useAnalyticsModulesQuery();
  const { toggleStatus } = useAnalyticsModuleMutations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const categories = ['ALL', 'BUSINESS_INTELLIGENCE', 'SAFETY_SECURITY', 'OPERATIONAL_COMPLIANCE', 'TRAFFIC_MOBILITY'];

  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchesSearch =
        m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.moduleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vendor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || m.category.toUpperCase() === selectedCategory;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && m.status === 'Active') ||
        (statusFilter === 'DISABLED' && m.status !== 'Active');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [modules, searchTerm, selectedCategory, statusFilter]);

  const totalPages = Math.ceil(filteredModules.length / pageSize) || 1;
  const paginatedModules = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredModules.slice(start, start + pageSize);
  }, [filteredModules, page]);

  const handleToggle = (module: AnalyticsModuleDto) => {
    const nextStatus = module.status === 'Active' ? 'Disabled' : 'Active';
    toggleStatus.mutate({ id: module.id, status: nextStatus });
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
            Plugin Catalog
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, fontFamily: 'monospace' }}>
            Single source of truth for AI Analytics Vision capabilities & model execution engines.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          sx={{
            bgcolor: '#3b82f6',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '6px',
            '&:hover': { bgcolor: '#2563eb' }
          }}
        >
          Register Module
        </Button>
      </Box>

      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 4, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: '1 1 300px', maxWidth: '500px' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search plugins by name, code, description, vendor..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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

          <Box sx={{ display: 'flex', bgcolor: '#020617', borderRadius: '6px', p: 0.5, border: '1px solid #1e293b' }}>
            <Button
              size="small"
              onClick={() => { setStatusFilter('ALL'); setPage(1); }}
              sx={{
                color: statusFilter === 'ALL' ? '#f8fafc' : '#64748b',
                bgcolor: statusFilter === 'ALL' ? '#1e293b' : 'transparent',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'none'
              }}
            >
              All Status
            </Button>
            <Button
              size="small"
              onClick={() => { setStatusFilter('ACTIVE'); setPage(1); }}
              sx={{
                color: statusFilter === 'ACTIVE' ? '#22c55e' : '#64748b',
                bgcolor: statusFilter === 'ACTIVE' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'none'
              }}
            >
              Active Only
            </Button>
            <Button
              size="small"
              onClick={() => { setStatusFilter('DISABLED'); setPage(1); }}
              sx={{
                color: statusFilter === 'DISABLED' ? '#f43f5e' : '#64748b',
                bgcolor: statusFilter === 'DISABLED' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'none'
              }}
            >
              Disabled Only
            </Button>
          </Box>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ mt: 2, borderTop: '1px solid #1e293b', pt: 1 }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, val) => { setSelectedCategory(val); setPage(1); }}
            sx={{
              '& .MuiTab-root': {
                color: '#64748b',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'none',
                minHeight: '36px',
                py: 0
              },
              '& .Mui-selected': { color: '#3b82f6' },
              '& .MuiTabs-indicator': { backgroundColor: '#3b82f6' }
            }}
          >
            {categories.map(cat => (
              <Tab key={cat} label={cat.replace('_', ' ')} value={cat} />
            ))}
          </Tabs>
        </Box>
      </Paper>

      {/* Grid Content */}
      {isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} variant="rectangular" height={260} sx={{ bgcolor: '#090d16', borderRadius: '8px' }} />
          ))}
        </Box>
      ) : paginatedModules.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', color: '#64748b' }}>
          <Typography variant="h6" sx={{ color: '#cbd5e1' }}>No Analytics Modules Found</Typography>
          <Typography variant="caption">Try updating search term or resetting category filters.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {paginatedModules.map(mod => {
            const catStyle = getCategoryColor(mod.category);
            const isActive = mod.status === 'Active';

            return (
              <Paper
                key={mod.id}
                sx={{
                  p: 3,
                  bgcolor: '#090d16',
                  border: `1px solid ${isActive ? '#1e293b' : '#334155'}`,
                  borderRadius: '8px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s',
                  opacity: isActive ? 1 : 0.7,
                  '&:hover': {
                    borderColor: isActive ? '#3b82f6' : '#64748b',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box>
                  {/* Header Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ p: 1.2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        {renderIcon(mod.icon)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                          {mod.displayName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                          {mod.moduleCode}
                        </Typography>
                      </Box>
                    </Box>

                    <Tooltip title={`Toggle ${isActive ? 'Disable' : 'Enable'} Module`}>
                      <Switch
                        checked={isActive}
                        onChange={() => handleToggle(mod)}
                        size="small"
                        color="success"
                      />
                    </Tooltip>
                  </Box>

                  {/* Category & Status Badges */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={mod.category.replace('_', ' ')}
                      size="small"
                      sx={{
                        bgcolor: catStyle.bg,
                        color: catStyle.color,
                        border: `1px solid ${catStyle.border}`,
                        fontWeight: 800,
                        fontSize: '10px',
                        height: '20px',
                        borderRadius: '4px'
                      }}
                    />
                    <Chip
                      label={`v${mod.version}`}
                      size="small"
                      sx={{ bgcolor: '#1e293b', color: '#cbd5e1', fontSize: '10px', height: '20px', borderRadius: '4px' }}
                    />
                    <Chip
                      label={mod.vendor}
                      size="small"
                      sx={{ bgcolor: '#020617', color: '#94a3b8', fontSize: '10px', height: '20px', border: '1px solid #1e293b', borderRadius: '4px' }}
                    />
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '13px', mb: 3, lineHeight: 1.5, height: '40px', overflow: 'hidden' }}>
                    {mod.description}
                  </Typography>
                </Box>

                {/* Footer Row */}
                <Box sx={{ borderTop: '1px solid #1e293b', pt: 2, mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Minimum Required CUDA Capability">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#22c55e' }}>
                        <IconCpu size={14} />
                        <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '11px' }}>
                          CUDA {mod.minimumCudaCapability}
                        </Typography>
                      </Box>
                    </Tooltip>

                    {mod.supportsRealtime && (
                      <Chip label="Realtime" size="small" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '9px', height: '16px', borderRadius: '2px' }} />
                    )}
                    {mod.supportsBatch && (
                      <Chip label="Batch" size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', fontSize: '9px', height: '16px', borderRadius: '2px' }} />
                    )}
                  </Box>

                  <StatusChip status={mod.status} />
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            sx={{
              '& .MuiPaginationItem-root': { color: '#94a3b8' },
              '& .Mui-selected': { bgcolor: '#3b82f6 !important', color: '#fff', fontWeight: 800 }
            }}
          />
        </Box>
      )}
    </Box>
  );
}

function StatusChip({ status }: { status: string }) {
  const isActive = status === 'Active';
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(244, 63, 94, 0.15)',
        color: isActive ? '#22c55e' : '#f43f5e',
        fontWeight: 900,
        fontSize: '10px',
        height: '20px',
        borderRadius: '4px'
      }}
    />
  );
}
