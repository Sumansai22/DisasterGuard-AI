import axios from 'axios';
import { LandScanResponse, ModelStatusResponse, ScanHistoryResponse } from '../types/landScan';

const getBaseUrl = () => {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    ''
  ).trim().replace(/\/+$/, '');
};

const client = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // 30s timeout for image segmentation
});

export const landScanService = {
  /**
   * Uploads satellite / drone terrain image for U-Net segmentation
   */
  async analyzeLandImage(file: File): Promise<LandScanResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post<LandScanResponse>(
      '/api/segmentation/predict',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Checks the operational health and readiness of the U-Net model
   */
  async getModelStatus(): Promise<ModelStatusResponse> {
    const response = await client.get<ModelStatusResponse>('/api/segmentation/status');
    return response.data;
  },

  /**
   * Retrieves previous scan history records from the database
   */
  async getScanHistory(limit: number = 20): Promise<ScanHistoryResponse> {
    const response = await client.get<ScanHistoryResponse>('/api/segmentation/history', {
      params: { limit },
    });
    return response.data;
  },
};
