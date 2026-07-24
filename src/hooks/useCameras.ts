import { useState, useEffect } from 'react';
import axiosServices from '../utils/axios';

export interface Camera {
  id: string;
  name: string;
  description: string;
  rtspUrl: string;
  roomId: string;
  status: 'online' | 'offline';
}

const DEFAULT_CAMERAS: Camera[] = [
  {
    id: 'c1',
    name: 'Lobby Entrance Cam',
    description: 'Overlooks the front entrance lobby.',
    rtspUrl: 'http://192.168.1.189:8080/video',
    status: 'online',
    roomId: 'r1'
  },
  {
    id: 'c2',
    name: 'Conf Room 101 Pan',
    description: 'Wide-angle pan view of the main table.',
    rtspUrl: 'rtsp://192.168.1.101/stream1',
    status: 'online',
    roomId: 'r2'
  },
  {
    id: 'c3',
    name: 'Server Rack Cam 1',
    description: 'Monitors the main server rack aisle.',
    rtspUrl: 'rtsp://192.168.1.102/stream1',
    status: 'online',
    roomId: 'r4'
  },
  {
    id: 'c4',
    name: 'Dock 1 Aisle Cam',
    description: 'Monitors staging area for Dock 1.',
    rtspUrl: 'rtsp://192.168.1.200/stream2',
    status: 'offline',
    roomId: 'r5'
  }
];

export const useCameras = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('crud_cameras');
    if (saved) {
      setCameras(JSON.parse(saved));
    } else {
      setCameras(DEFAULT_CAMERAS);
      localStorage.setItem('crud_cameras', JSON.stringify(DEFAULT_CAMERAS));
    }
  }, []);

  const saveCameras = (updated: Camera[]) => {
    setCameras(updated);
    localStorage.setItem('crud_cameras', JSON.stringify(updated));
  };

  // Create Camera (POST)
  const addCamera = async (item: Omit<Camera, 'id'>) => {
    setLoading(true);
    setError(null);
    const newId = 'c_' + Date.now();
    const newItem: Camera = { ...item, id: newId };
    
    try {
      console.log(`[API Mock] POST /api/cameras`, newItem);
      // Attempt to hit the actual API (will likely fail, falling back to mock)
      await axiosServices.post('/api/cameras', newItem);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      saveCameras([...cameras, newItem]);
      setLoading(false);
    }
  };

  // Edit Camera (PUT)
  const updateCamera = async (id: string, item: Omit<Camera, 'id'>) => {
    setLoading(true);
    setError(null);
    const updatedItem: Camera = { ...item, id };

    try {
      console.log(`[API Mock] PUT /api/cameras/${id}`, updatedItem);
      // Attempt to hit the actual API (will likely fail, falling back to mock)
      await axiosServices.put(`/api/cameras/${id}`, updatedItem);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      const updated = cameras.map((c) => (c.id === id ? updatedItem : c));
      saveCameras(updated);
      setLoading(false);
    }
  };

  // Delete Camera (DELETE)
  const deleteCamera = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[API Mock] DELETE /api/cameras/${id}`);
      // Attempt to hit the actual API (will likely fail, falling back to mock)
      await axiosServices.delete(`/api/cameras/${id}`);
    } catch (err: any) {
      console.warn('[API Fallback] Server not ready. Saving to local storage.', err.message);
    } finally {
      const updated = cameras.filter((c) => c.id !== id);
      saveCameras(updated);
      setLoading(false);
    }
  };

  return {
    cameras,
    loading,
    error,
    addCamera,
    updateCamera,
    deleteCamera
  };
};
