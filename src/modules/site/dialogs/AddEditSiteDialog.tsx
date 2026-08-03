import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import type { Site, CreateSitePayload } from '../models/site.model';

interface AddEditSiteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSitePayload) => Promise<void>;
  editingSite?: Site | null;
  isLoading?: boolean;
}

export const AddEditSiteDialog: React.FC<AddEditSiteDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingSite,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingSite) {
      setName(editingSite.name || '');
      setCode(editingSite.code || '');
      setDescription(editingSite.description || '');
    } else {
      setName('');
      setCode('');
      setDescription('');
    }
  }, [editingSite, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      code: code.trim() || undefined,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingSite ? 'Edit Master Site' : 'Add Master Site'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Site Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Site Code (Optional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SITE_HQ_NORTH"
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ fontWeight: 800 }}>
            {editingSite ? 'Save Changes' : 'Create Site'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
