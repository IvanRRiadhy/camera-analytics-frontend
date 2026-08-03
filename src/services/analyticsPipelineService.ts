import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export interface AssignedModuleDto {
  moduleId: string;
  moduleCode: string;
  displayName: string;
  category: string;
  pythonEntryPoint: string;
  isEnabled: boolean;
  parametersJson: string;
  assignedAtUtc?: string;
}

export interface PipelineAssignmentDto {
  id: string;
  pipelineId: string;
  pipelineName: string;
  priority: number;
  status: string;
  cameraId: string;
  cameraName: string;
  rtspUrl: string;
  instanceId: string;
  engineInstanceId: string;
  engineHostname: string;
  assignedModules: AssignedModuleDto[];
}

export const analyticsPipelineService = {
  getPipelines: async (): Promise<PipelineAssignmentDto[]> => {
    const response = await axios.get<PipelineAssignmentDto[]>(`${API_URL}/api/v1/analytics/pipelines`);
    return response.data;
  },

  getPipelineById: async (id: string): Promise<PipelineAssignmentDto> => {
    const response = await axios.get<PipelineAssignmentDto>(`${API_URL}/api/v1/analytics/pipelines/${id}`);
    return response.data;
  },

  updatePipelineModules: async (id: string, moduleIds: string[]): Promise<any> => {
    const response = await axios.put(`${API_URL}/api/v1/analytics/pipelines/${id}/modules`, { moduleIds });
    return response.data;
  }
};
