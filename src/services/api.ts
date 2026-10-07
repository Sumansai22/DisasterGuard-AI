import axios, { AxiosError } from 'axios';

// Unified API Base URL configuration for DisasterGuard AI
const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ''
).trim().replace(/\/+$/, '');

export const API_BASE_URL = rawBaseUrl;

// Ensure final baseURL ends with '/api' if a remote origin is specified, or defaults to '/api' for proxying
const finalBaseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`)
  : '/api';

export const apiClient = axios.create({
  baseURL: finalBaseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Add version header and prevent duplicate /api/api paths
apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-Client-Version'] = 'DisasterGuard-AI-2026';
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4); // trim leading '/api' since baseURL ends with /api
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Non-intrusive logging for resilient frontend fallback operation
    console.warn('[DisasterGuard API Network Notice]:', error.message);
    return Promise.reject(error);
  }
);
