import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  IconMapPin,
  IconPlus,
  IconSearch,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import { useSites } from '../hooks/useSites';
import { AddEditSiteDialog } from '../dialogs/AddEditSiteDialog';
import type { Site, CreateSitePayload } from '../models/site.model';

export const SiteListPage: React.FC = () => {
  const { sites, isLoading, createSite, updateSite, deleteSite, isCreating, isUpdating } = useSites();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingSite(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (site: Site) => {
    setEditingSite(site);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CreateSitePayload) => {
    if (editingSite) {
      await updateSite({ id: editingSite.id, data });
    } else {
      await createSite(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this master site?')) {
      await deleteSite(id);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
      {/* Header Banner */}
      <Paper sx={{ p: 2.5, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconMapPin size={24} color="#38bdf8" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', lineHeight: 1.1 }}>
                Master Site Location Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Top-Level Master Location Hierarchy Node — Site ➔ Building ➔ Floor ➔ Area
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<IconPlus size={16} />}
            onClick={handleOpenAdd}
            sx={{ fontWeight: 800 }}
          >
            ADD NEW SITE
          </Button>
        </Box>
      </Paper>

      {/* Toolbar Search */}
      <Paper sx={{ p: 2, bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
        <TextField
          size="small"
          placeholder="Search Site Name or Code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={16} color="#64748b" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 400, bgcolor: '#0f172a', borderRadius: '4px' }}
        />
      </Paper>

      {/* Data Table */}
      <Paper sx={{ bgcolor: '#090d16', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#0f172a', color: '#94a3b8', fontWeight: 800, fontSize: '11px' } }}>
                <TableCell>SITE NAME</TableCell>
                <TableCell>SITE CODE</TableCell>
                <TableCell>DESCRIPTION</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSites.map((s) => (
                <TableRow key={s.id} hover sx={{ '&:hover': { bgcolor: '#0f172a !important' } }}>
                  <TableCell sx={{ color: '#f8fafc', fontWeight: 800 }}>{s.name}</TableCell>
                  <TableCell sx={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px' }}>
                    {s.code || '—'}
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8' }}>{s.description || 'No description'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Site">
                      <IconButton size="small" onClick={() => handleOpenEdit(s)} sx={{ color: '#38bdf8' }}>
                        <IconPencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Site">
                      <IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: '#ef4444' }}>
                        <IconTrash size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {filteredSites.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748b' }}>
                    No master site records found matching search parameter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog Modal */}
      <AddEditSiteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        editingSite={editingSite}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
};
