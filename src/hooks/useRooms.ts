import { useBuildingsQuery, useFloorsQuery, useRoomsQuery } from './queries/useSpatialQueries';
import { useBuildingMutations, useFloorMutations, useRoomMutations } from './mutations/useSpatialMutations';
import { type BuildingDto, type FloorDto, type RoomDto } from '../services/spatialService';

export type Building = BuildingDto;
export type Floor = FloorDto;
export type Room = RoomDto;

export const useRooms = () => {
  const { data: buildings = [], isLoading: loadingB } = useBuildingsQuery();
  const { data: floors = [], isLoading: loadingF } = useFloorsQuery();
  const { data: rooms = [], isLoading: loadingR } = useRoomsQuery();

  const { addBuilding: addBMut, updateBuilding: updateBMut, deleteBuilding: deleteBMut } = useBuildingMutations();
  const { addFloor: addFMut, updateFloor: updateFMut, deleteFloor: deleteFMut } = useFloorMutations();
  const { addRoom: addRMut, updateRoom: updateRMut, deleteRoom: deleteRMut } = useRoomMutations();

  return {
    buildings,
    floors,
    rooms,
    loading: loadingB || loadingF || loadingR,
    error: null,

    // Building Actions
    addBuilding: (item: Omit<Building, 'id'>) => addBMut.mutateAsync(item),
    updateBuilding: (id: string, item: Omit<Building, 'id'>) => updateBMut.mutateAsync({ id, data: item }),
    deleteBuilding: (id: string) => deleteBMut.mutateAsync(id),

    // Floor Actions
    addFloor: (item: Omit<Floor, 'id'>) => addFMut.mutateAsync(item),
    updateFloor: (id: string, item: Omit<Floor, 'id'>) => updateFMut.mutateAsync({ id, data: item }),
    deleteFloor: (id: string) => deleteFMut.mutateAsync(id),

    // Room Actions
    addRoom: (item: Omit<Room, 'id'>) => addRMut.mutateAsync(item),
    updateRoom: (id: string, item: Omit<Room, 'id'>) => updateRMut.mutateAsync({ id, data: item }),
    deleteRoom: (id: string) => deleteRMut.mutateAsync(id),
  };
};
