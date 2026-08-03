import { useQuery } from '@tanstack/react-query';
import { spatialService, type BuildingDto, type FloorDto, type RoomDto, type CameraDto, type ZoneDto } from '../../services/spatialService';

export const useBuildingsQuery = () => {
  return useQuery<BuildingDto[]>({
    queryKey: ['buildings'],
    queryFn: () => spatialService.getBuildings(),
  });
};

export const useFloorsQuery = () => {
  return useQuery<FloorDto[]>({
    queryKey: ['floors'],
    queryFn: () => spatialService.getFloors(),
  });
};

export const useRoomsQuery = () => {
  return useQuery<RoomDto[]>({
    queryKey: ['rooms'],
    queryFn: () => spatialService.getRooms(),
  });
};

export const useCamerasQuery = () => {
  return useQuery<CameraDto[]>({
    queryKey: ['cameras'],
    queryFn: () => spatialService.getCameras(),
    refetchInterval: false,
    staleTime: Infinity,
  });
};

export const useZonesQuery = () => {
  return useQuery<ZoneDto[]>({
    queryKey: ['zones'],
    queryFn: () => spatialService.getZones(),
  });
};
