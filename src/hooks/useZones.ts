import { useZonesQuery } from './queries/useSpatialQueries';
import { useZoneMutations } from './mutations/useSpatialMutations';
import { type ZoneDto, type CameraZoneConfig } from '../services/spatialService';

export type Zone = ZoneDto;
export type { CameraZoneConfig };

export const useZones = () => {
  const { data: zones = [], isLoading: loading, error } = useZonesQuery();
  const { addZone: addMut, updateZone: updateMut, deleteZone: deleteMut } = useZoneMutations();

  const addZone = async (item: Omit<Zone, 'id'>) => {
    await addMut.mutateAsync(item);
  };

  const updateZone = async (id: string, item: Omit<Zone, 'id'>) => {
    await updateMut.mutateAsync({ id, data: item });
  };

  const deleteZone = async (id: string) => {
    await deleteMut.mutateAsync(id);
  };

  const saveCameraConfigToZone = async (
    zoneId: string,
    cameraIdOrConfig: string | { cameraId: string; polygon: [number, number][] },
    polygon?: [number, number][]
  ) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    const cameraId = typeof cameraIdOrConfig === 'string' ? cameraIdOrConfig : cameraIdOrConfig.cameraId;
    const poly = typeof cameraIdOrConfig === 'string' ? polygon || [] : cameraIdOrConfig.polygon;

    const existingConfigs = zone.cameraConfigs || [];
    const filtered = existingConfigs.filter(c => c.cameraId !== cameraId);
    const updatedConfigs = [...filtered, { cameraId, polygon: poly }];
    await updateZone(zoneId, { ...zone, cameraConfigs: updatedConfigs });
  };

  const removeCameraConfigFromZone = async (zoneId: string, cameraId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    const existingConfigs = zone.cameraConfigs || [];
    const updatedConfigs = existingConfigs.filter(c => c.cameraId !== cameraId);
    await updateZone(zoneId, { ...zone, cameraConfigs: updatedConfigs });
  };

  return {
    zones,
    loading,
    error: error ? (error as Error).message : null,
    addZone,
    updateZone,
    deleteZone,
    saveCameraConfigToZone,
    removeCameraConfigFromZone,
  };
};
