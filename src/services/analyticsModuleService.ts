import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export interface AnalyticsModuleDto {
  id: string;
  moduleCode: string;
  displayName: string;
  description: string;
  version: string;
  vendor: string;
  category: string;
  pythonEntryPoint: string;
  icon: string;
  documentationUrl: string;
  minimumCudaCapability: string;
  supportsRealtime: boolean;
  supportsBatch: boolean;
  defaultConfigurationJson: string;
  status: 'Active' | 'Disabled' | 'Deprecated';
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface CreateAnalyticsModulePayload {
  moduleCode: string;
  displayName: string;
  description?: string;
  version?: string;
  vendor?: string;
  category?: string;
  pythonEntryPoint?: string;
  icon?: string;
  documentationUrl?: string;
  minimumCudaCapability?: string;
  supportsRealtime?: boolean;
  supportsBatch?: boolean;
  defaultConfigurationJson?: string;
  status?: string;
}

export const analyticsModuleService = {
  getModules: async (): Promise<AnalyticsModuleDto[]> => {
    const response = await axios.get<AnalyticsModuleDto[]>(`${API_URL}/api/v1/analytics/modules`);
    return response.data;
  },

  getModuleById: async (id: string): Promise<AnalyticsModuleDto> => {
    const response = await axios.get<AnalyticsModuleDto>(`${API_URL}/api/v1/analytics/modules/${id}`);
    return response.data;
  },

  createModule: async (payload: CreateAnalyticsModulePayload): Promise<AnalyticsModuleDto> => {
    const response = await axios.post<AnalyticsModuleDto>(`${API_URL}/api/v1/analytics/modules`, payload);
    return response.data;
  },

  updateModule: async (id: string, payload: Partial<CreateAnalyticsModulePayload>): Promise<AnalyticsModuleDto> => {
    const response = await axios.put<AnalyticsModuleDto>(`${API_URL}/api/v1/analytics/modules/${id}`, payload);
    return response.data;
  },

  toggleModuleStatus: async (id: string, status: string): Promise<{ id: string; status: string }> => {
    const response = await axios.patch<{ id: string; status: string }>(`${API_URL}/api/v1/analytics/modules/${id}/status`, { status });
    return response.data;
  },

  deleteModule: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/v1/analytics/modules/${id}`);
  }
};
