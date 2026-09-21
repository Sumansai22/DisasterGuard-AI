import axios, { AxiosError } from 'axios';

// Create base Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens or telemetry headers if needed
    config.headers['X-Client-Version'] = 'LandslideGuard-AI-2026';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Standardized error handling without leaking raw stack traces to the user
    console.warn('[API Client Network Notice]:', error.message);
    return Promise.reject(error);
  }
);
