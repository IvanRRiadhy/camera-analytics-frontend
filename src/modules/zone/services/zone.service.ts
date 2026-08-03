import axiosServices from '../../../utils/axios';
import type { Zone, CreateZonePayload } from '../models/zone.model';

export const zoneService = {
  getZones: async (): Promise<Zone[]> => {
    const res = await axiosServices.get('/api/v1/spatial/zones');
    return res.data;
  },

  getZoneById: async (id: string): Promise<Zone> => {
    const res = await axiosServices.get(`/api/v1/spatial/zones/${id}`);
    return res.data;
  },

  createZone: async (data: CreateZonePayload): Promise<Zone> => {
    const res = await axiosServices.post('/api/v1/spatial/zones', data);
    return res.data;
  },

  updateZone: async (id: string, data: CreateZonePayload): Promise<Zone> => {
    const res = await axiosServices.put(`/api/v1/spatial/zones/${id}`, data);
    return res.data;
  },

  deleteZone: async (id: string): Promise<void> => {
    await axiosServices.delete(`/api/v1/spatial/zones/${id}`);
  },
};
