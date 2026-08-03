import type { Point2D } from '../utils/polygonNormalizer';

export interface CameraZoneConfig {
  cameraId: string;
  polygon: Point2D[];
}

export interface Zone {
  id: string;
  name: string;
  roomId: string;
  cameraConfigs: CameraZoneConfig[];
}

export interface CreateZonePayload {
  name: string;
  roomId: string;
  cameraConfigs?: CameraZoneConfig[];
}

export interface UpdateZonePayload extends CreateZonePayload {
  id: string;
}
