import axiosServices from '../utils/axios';

export interface BuildingDto {
  id: string;
  name: string;
  description: string;
  image?: string;
  siteId?: string;
}

export interface FloorDto {
  id: string;
  name: string;
  description: string;
  image?: string;
  buildingId: string;
}

export interface RoomDto {
  id: string;
  name: string;
  description: string;
  image?: string;
  floorId: string;
}

export interface CameraDto {
  id: string;
  name: string;
  description: string;
  rtspUrl: string;
  roomId: string;
  status: 'online' | 'offline';
}

export interface CameraZoneConfig {
  cameraId: string;
  polygon: [number, number][];
}

export interface ZoneDto {
  id: string;
  name: string;
  roomId: string;
  cameraConfigs: CameraZoneConfig[];
}

export const spatialService = {
  // Buildings
  getBuildings: async (): Promise<BuildingDto[]> => {
    const res = await axiosServices.get('/api/v1/spatial/buildings');
    return res.data;
  },
  createBuilding: async (data: Omit<BuildingDto, 'id'>): Promise<BuildingDto> => {
    const res = await axiosServices.post('/api/v1/spatial/buildings', data);
    return res.data;
  },
  updateBuilding: async (id: string, data: Omit<BuildingDto, 'id'>): Promise<BuildingDto> => {
    const res = await axiosServices.put(`/api/v1/spatial/buildings/${id}`, data);
    return res.data;
  },
  deleteBuilding: async (id: string): Promise<void> => {
    await axiosServices.delete(`/api/v1/spatial/buildings/${id}`);
  },

  // Floors
  getFloors: async (): Promise<FloorDto[]> => {
    const res = await axiosServices.get('/api/v1/spatial/floors');
    return res.data;
  },
  createFloor: async (data: Omit<FloorDto, 'id'>): Promise<FloorDto> => {
    const res = await axiosServices.post('/api/v1/spatial/floors', data);
    return res.data;
  },
  updateFloor: async (id: string, data: Omit<FloorDto, 'id'>): Promise<FloorDto> => {
    const res = await axiosServices.put(`/api/v1/spatial/floors/${id}`, data);
    return res.data;
  },
  deleteFloor: async (id: string): Promise<void> => {
    await axiosServices.delete(`/api/v1/spatial/floors/${id}`);
  },

  // Rooms
  getRooms: async (): Promise<RoomDto[]> => {
    const res = await axiosServices.get('/api/v1/spatial/rooms');
    return res.data;
  },
  createRoom: async (data: Omit<RoomDto, 'id'>): Promise<RoomDto> => {
    const res = await axiosServices.post('/api/v1/spatial/rooms', data);
    return res.data;
  },
  updateRoom: async (id: string, data: Omit<RoomDto, 'id'>): Promise<RoomDto> => {
    const res = await axiosServices.put(`/api/v1/spatial/rooms/${id}`, data);
    return res.data;
  },
  deleteRoom: async (id: string): Promise<void> => {
    await axiosServices.delete(`/api/v1/spatial/rooms/${id}`);
  },

  // Cameras
  getCameras: async (): Promise<CameraDto[]> => {
    const res = await axiosServices.get('/api/v1/spatial/cameras');
    return res.data;
  },
  createCamera: async (data: Omit<CameraDto, 'id'>): Promise<CameraDto> => {
    const res = await axiosServices.post('/api/v1/spatial/cameras', data);
    return res.data;
  },
  updateCamera: async (id: string, data: Omit<CameraDto, 'id'>): Promise<CameraDto> => {
    const res = await axiosServices.put(`/api/v1/spatial/cameras/${id}`, data);
    return res.data;
  },
  deleteCamera: async (id: string): Promise<void> => {
    await axiosServices.delete(`/api/v1/spatial/cameras/${id}`);
  },

  // Zones
  getZones: async (): Promise<ZoneDto[]> => {
    const res = await axiosServices.get('/api/v1/spatial/zones');
    return res.data;
  },
  createZone: async (data: Omit<ZoneDto, 'id'>): Promise<ZoneDto> => {
    const res = await axiosServices.post('/api/v1/spatial/zones', data);
    return res.data;
  },
  updateZone: async (id: string, data: Omit<ZoneDto, 'id'>): Promise<ZoneDto> => {
    const res = await axiosServices.put(`/api/v1/spatial/zones/${id}`, data);
    return res.data;
  },
  deleteZone: async (id: string): Promise<void> => {
    await axiosServices.delete(`/api/v1/spatial/zones/${id}`);
  },
};
