import axios, { type AxiosInstance } from 'axios';
import { getConfig } from '../config';

// Base URL set dynamically after config.json loads
export let BASE_URL = '';

let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: () => void) => {
  onSessionExpired = handler;
};

// Initialize base URL from runtime config (call after loadRuntimeConfig)
export function initializeAxiosBaseURL() {
  const config = getConfig();
  BASE_URL = config.API_BASE_URL;
  axiosServices.defaults.baseURL = BASE_URL;
}

function createAxiosService(): AxiosInstance {
  const instance = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: inject baseURL + auth token
  instance.interceptors.request.use((request) => {
    request.baseURL = BASE_URL;

    const accessToken = localStorage.getItem('token');
    if (accessToken) {
      request.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return request;
  });

  // Response interceptor: handle 401 session expiry
  instance.interceptors.response.use(
    (response) => {
      // Auto-parse stringified JSON responses
      const contentType = String(response.headers['content-type'] || '');
      if (
        typeof response.data === 'string' &&
        contentType.includes('application/json')
      ) {
        try {
          response.data = JSON.parse(response.data);
        } catch { /* ignore parse errors */ }
      }
      return response;
    },
    async (error) => {
      if (error.response?.status === 401) {
        // Clear auth state and trigger session expired handler
        localStorage.removeItem('token');
        if (onSessionExpired) onSessionExpired();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const axiosServices = createAxiosService();

export default axiosServices;
