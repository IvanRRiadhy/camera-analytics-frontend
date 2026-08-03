import { useCamerasQuery } from './queries/useSpatialQueries';
import { useCameraMutations } from './mutations/useSpatialMutations';
import { type CameraDto } from '../services/spatialService';

export type Camera = CameraDto;

export const useCameras = () => {
  const { data: cameras = [], isLoading: loading, error } = useCamerasQuery();
  const { addCamera: addMut, updateCamera: updateMut, deleteCamera: deleteMut } = useCameraMutations();

  const addCamera = async (item: Omit<Camera, 'id'>) => {
    await addMut.mutateAsync(item);
  };

  const updateCamera = async (id: string, item: Omit<Camera, 'id'>) => {
    await updateMut.mutateAsync({ id, data: item });
  };

  const deleteCamera = async (id: string) => {
    await deleteMut.mutateAsync(id);
  };

  return {
    cameras,
    loading,
    error: error ? (error as Error).message : null,
    addCamera,
    updateCamera,
    deleteCamera,
  };
};
