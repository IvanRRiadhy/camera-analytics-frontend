import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zoneService } from '../services/zone.service';
import type { CreateZonePayload } from '../models/zone.model';
import type { Point2D } from '../utils/polygonNormalizer';

export function useZonesModule() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['spatial-zones'],
    queryFn: zoneService.getZones,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateZonePayload) => zoneService.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-zones'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateZonePayload }) =>
      zoneService.updateZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-zones'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => zoneService.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spatial-zones'] });
    },
  });

  const saveCameraConfigToZone = async (zoneId: string, cameraId: string, polygon: Point2D[]) => {
    const zones = query.data || [];
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;

    const existing = zone.cameraConfigs || [];
    const filtered = existing.filter((c) => c.cameraId !== cameraId);
    const updatedConfigs = [...filtered, { cameraId, polygon }];

    await updateMutation.mutateAsync({
      id: zoneId,
      data: {
        name: zone.name,
        roomId: zone.roomId,
        cameraConfigs: updatedConfigs,
      },
    });
  };

  return {
    zones: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createZone: createMutation.mutateAsync,
    updateZone: updateMutation.mutateAsync,
    deleteZone: deleteMutation.mutateAsync,
    saveCameraConfigToZone,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
