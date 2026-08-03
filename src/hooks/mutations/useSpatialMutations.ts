import { useMutation, useQueryClient } from '@tanstack/react-query';
import { spatialService, type BuildingDto, type FloorDto, type RoomDto, type CameraDto, type ZoneDto } from '../../services/spatialService';

export const useBuildingMutations = () => {
  const queryClient = useQueryClient();

  const addBuilding = useMutation({
    mutationFn: (data: Omit<BuildingDto, 'id'>) => spatialService.createBuilding(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buildings'] }),
  });

  const updateBuilding = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<BuildingDto, 'id'> }) => spatialService.updateBuilding(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buildings'] }),
  });

  const deleteBuilding = useMutation({
    mutationFn: (id: string) => spatialService.deleteBuilding(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buildings'] }),
  });

  return { addBuilding, updateBuilding, deleteBuilding };
};

export const useFloorMutations = () => {
  const queryClient = useQueryClient();

  const addFloor = useMutation({
    mutationFn: (data: Omit<FloorDto, 'id'>) => spatialService.createFloor(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['floors'] }),
  });

  const updateFloor = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<FloorDto, 'id'> }) => spatialService.updateFloor(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['floors'] }),
  });

  const deleteFloor = useMutation({
    mutationFn: (id: string) => spatialService.deleteFloor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['floors'] }),
  });

  return { addFloor, updateFloor, deleteFloor };
};

export const useRoomMutations = () => {
  const queryClient = useQueryClient();

  const addRoom = useMutation({
    mutationFn: (data: Omit<RoomDto, 'id'>) => spatialService.createRoom(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const updateRoom = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<RoomDto, 'id'> }) => spatialService.updateRoom(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  const deleteRoom = useMutation({
    mutationFn: (id: string) => spatialService.deleteRoom(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
  });

  return { addRoom, updateRoom, deleteRoom };
};

export const useCameraMutations = () => {
  const queryClient = useQueryClient();

  const addCamera = useMutation({
    mutationFn: (data: Omit<CameraDto, 'id'>) => spatialService.createCamera(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cameras'] }),
  });

  const updateCamera = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<CameraDto, 'id'> }) => spatialService.updateCamera(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cameras'] }),
  });

  const deleteCamera = useMutation({
    mutationFn: (id: string) => spatialService.deleteCamera(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cameras'] }),
  });

  return { addCamera, updateCamera, deleteCamera };
};

export const useZoneMutations = () => {
  const queryClient = useQueryClient();

  const addZone = useMutation({
    mutationFn: (data: Omit<ZoneDto, 'id'>) => spatialService.createZone(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const updateZone = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<ZoneDto, 'id'> }) => spatialService.updateZone(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  const deleteZone = useMutation({
    mutationFn: (id: string) => spatialService.deleteZone(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });

  return { addZone, updateZone, deleteZone };
};
