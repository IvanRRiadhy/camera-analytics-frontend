/**
 * Site Domain Models (Sprint 11 Master Location)
 */

export interface Site {
  id: string;
  name: string;
  code?: string;
  description?: string;
  image?: string;
}

export interface CreateSitePayload {
  name: string;
  description?: string;
  code?: string;
  image?: string;
}

export interface UpdateSitePayload extends CreateSitePayload {
  id: string;
}
