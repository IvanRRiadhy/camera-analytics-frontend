import { useState, useEffect } from 'react';
import axiosServices from '../utils/axios';

export interface CameraZoneConfig {
  cameraId: string;
  polygon: [number, number][]; // coordinates scaled 0-100 for responsiveness
}

export interface Zone {
  id: string;
  name: string;
  roomId: string; // link to Room
  cameraConfigs: CameraZoneConfig[];
}

const DEFAULT_ZONES: Zone[] = [
  {
    id: 'z1',
    name: 'Front Desk Lobby',
    roomId: 'r1',
    cameraConfigs: [
      {
        cameraId: 'c1',
        polygon: [[10, 20], [90, 20], [90, 80], [10, 80]]
      }
    ]
  },
  {
    id: 'z2',
    name: 'Server Rack Aisle',
    roomId: 'r4',
    cameraConfigs: [
      {
        cameraId: 'c3',
        polygon: [[30, 15], [70, 15], [80, 85], [20, 85]]
      }
    ]
  }
];

export const useZones = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('crud_zones');
    if (saved) {
      setZones(JSON.parse(saved));
    } else {
      setZones(DEFAULT_ZONES);
      localStorage.setItem('crud_zones', JSON.stringify(DEFAULT_ZONES));
    }
  }, []);

  const saveZones = (updated: Zone[]) => {
    setZones(updated);
    localStorage.setItem('crud_zones', JSON.stringify(updated));
  };

  // Create Zone
  const addZone = async (item: Omit<Zone, 'id'>) => {
    setLoading(true);
    setError(null);
    const newId = 'z_' + Date.now();
    const newItem: Zone = { ...item, id: newId };

    try {
      console.log('[API Mock] POST /api/zones', newItem);
      await axiosServices.post('/api/zones', newItem);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      saveZones([...zones, newItem]);
      setLoading(false);
    }
    return newItem;
  };

  // Update Zone (PUT)
  const updateZone = async (id: string, item: Omit<Zone, 'id'>) => {
    setLoading(true);
    setError(null);
    const updatedItem: Zone = { ...item, id };

    try {
      console.log(`[API Mock] PUT /api/zones/${id}`, updatedItem);
      await axiosServices.put(`/api/zones/${id}`, updatedItem);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      const updated = zones.map((z) => (z.id === id ? updatedItem : z));
      saveZones(updated);
      setLoading(false);
    }
  };

  // Delete Zone (DELETE)
  const deleteZone = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[API Mock] DELETE /api/zones/${id}`);
      await axiosServices.delete(`/api/zones/${id}`);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      const updated = zones.filter((z) => z.id !== id);
      saveZones(updated);
      setLoading(false);
    }
  };

  // Connect/Update Camera Config within a Zone
  const saveCameraConfigToZone = async (zoneId: string, config: CameraZoneConfig) => {
    setLoading(true);
    setError(null);

    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) {
      setError('Zone not found');
      setLoading(false);
      return;
    }

    // Filter out existing config for this camera if present, and add the new one
    const cleanConfigs = zone.cameraConfigs.filter((c) => c.cameraId !== config.cameraId);
    const updatedConfigs = [...cleanConfigs, config];
    const updatedZone = { ...zone, cameraConfigs: updatedConfigs };

    try {
      console.log(`[API Mock] PUT /api/zones/${zoneId}/camera`, config);
      await axiosServices.put(`/api/zones/${zoneId}`, updatedZone);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      const updated = zones.map((z) => (z.id === zoneId ? updatedZone : z));
      saveZones(updated);
      setLoading(false);
    }
  };

  // Disconnect Camera Config from a Zone
  const removeCameraConfigFromZone = async (zoneId: string, cameraId: string) => {
    setLoading(true);
    setError(null);

    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) {
      setError('Zone not found');
      setLoading(false);
      return;
    }

    const updatedConfigs = zone.cameraConfigs.filter((c) => c.cameraId !== cameraId);
    const updatedZone = { ...zone, cameraConfigs: updatedConfigs };

    try {
      console.log(`[API Mock] DELETE /api/zones/${zoneId}/camera/${cameraId}`);
      await axiosServices.put(`/api/zones/${zoneId}`, updatedZone);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      const updated = zones.map((z) => (z.id === zoneId ? updatedZone : z));
      saveZones(updated);
      setLoading(false);
    }
  };

  return {
    zones,
    loading,
    error,
    addZone,
    updateZone,
    deleteZone,
    saveCameraConfigToZone,
    removeCameraConfigFromZone
  };
};
