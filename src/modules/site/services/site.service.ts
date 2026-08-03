/**
 * Site REST API Service (Sprint 11 Master Location)
 */

import axiosServices from '../../../utils/axios';
import type { Site, CreateSitePayload } from '../models/site.model';

export const siteService = {
  getSites: async (): Promise<Site[]> => {
    const res = await axiosServices.get('/api/v1/spatial/sites');
    return res.data;
  },

  getSiteById: async (id: string): Promise<Site> => {
    const res = await axiosServices.get(`/api/v1/spatial/sites/${id}`);
    return res.data;
  },

  createSite: async (data: CreateSitePayload): Promise<Site> => {
    const res = await axiosServices.post('/api/v1/spatial/sites', data);
    return res.data;
  },

  updateSite: async (id: string, data: CreateSitePayload): Promise<Site> => {
    const res = await axiosServices.put(`/api/v1/spatial/sites/${id}`, data);
    return res.data;
  },

  deleteSite: async (id: string): Promise<void> => {
    await axiosServices.delete(`/api/v1/spatial/sites/${id}`);
  },
};
