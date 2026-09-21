import { apiClient } from './api';
import { RainfallOverviewResponse, HourlyRainfall, RainfallMetric, RainfallCorrelationPoint } from '../types/rainfall';

const MOCK_METRICS: RainfallMetric[] = [
  { period: '1h', label: '1-Hour Rainfall', value: 14.2, change: +18, status: 'moderate' },
  { period: '6h', label: '6-Hour Rainfall', value: 48.6, change: +35, status: 'heavy' },
  { period: '12h', label: '12-Hour Rainfall', value: 86.4, change: +42, status: 'heavy' },
  { period: '24h', label: '24-Hour Rainfall', value: 138.0, change: +65, status: 'extreme' },
  { period: '72h', label: '72-Hour Cumulative', value: 245.5, change: +28, status: 'extreme' },
  { period: '7d', label: '7-Day Cumulative', value: 412.0, change: +15, status: 'extreme' },
];

const MOCK_HOURLY_TREND: HourlyRainfall[] = [
  { time: '00:00', rainfall: 4.2, cumulative: 4.2, threshold: 25, riskScore: 28 },
  { time: '02:00', rainfall: 6.8, cumulative: 11.0, threshold: 25, riskScore: 34 },
  { time: '04:00', rainfall: 9.5, cumulative: 20.5, threshold: 25, riskScore: 45 },
  { time: '06:00', rainfall: 14.2, cumulative: 34.7, threshold: 25, riskScore: 58 },
  { time: '08:00', rainfall: 18.6, cumulative: 53.3, threshold: 25, riskScore: 68 },
  { time: '10:00', rainfall: 22.4, cumulative: 75.7, threshold: 25, riskScore: 78 },
  { time: '12:00', rainfall: 28.1, cumulative: 103.8, threshold: 25, riskScore: 86 },
  { time: '14:00', rainfall: 24.5, cumulative: 128.3, threshold: 25, riskScore: 89 },
  { time: '16:00', rainfall: 19.8, cumulative: 148.1, threshold: 25, riskScore: 85 },
  { time: '18:00', rainfall: 16.2, cumulative: 164.3, threshold: 25, riskScore: 82 },
  { time: '20:00', rainfall: 12.0, cumulative: 176.3, threshold: 25, riskScore: 76 },
  { time: '22:00', rainfall: 9.4, cumulative: 185.7, threshold: 25, riskScore: 71 },
];

const MOCK_CORRELATION: RainfallCorrelationPoint[] = [
  { rainfall: 10, simulatedRisk: 14, actualIncidents: 0 },
  { rainfall: 25, simulatedRisk: 28, actualIncidents: 1 },
  { rainfall: 45, simulatedRisk: 44, actualIncidents: 2 },
  { rainfall: 70, simulatedRisk: 62, actualIncidents: 5 },
  { rainfall: 95, simulatedRisk: 78, actualIncidents: 9 },
  { rainfall: 120, simulatedRisk: 88, actualIncidents: 14 },
  { rainfall: 150, simulatedRisk: 95, actualIncidents: 21 },
  { rainfall: 180, simulatedRisk: 98, actualIncidents: 28 },
];

export const rainfallService = {
  async getOverview(stationId?: string): Promise<RainfallOverviewResponse> {
    try {
      const response = await apiClient.get<RainfallOverviewResponse>('/rainfall/current', {
        params: { stationId },
      });
      return response.data;
    } catch (error) {
      console.warn('[rainfallService] Fallback to mock rainfall overview');
      return {
        currentRainfall: 86.4,
        metrics: MOCK_METRICS,
        trend: MOCK_HOURLY_TREND,
        correlation: MOCK_CORRELATION,
        stations: [],
      };
    }
  },

  async getHistory(range: '24h' | '7d' | '30d' = '24h'): Promise<HourlyRainfall[]> {
    try {
      const response = await apiClient.get<HourlyRainfall[]>('/rainfall/history', {
        params: { range },
      });
      return response.data;
    } catch (error) {
      return MOCK_HOURLY_TREND;
    }
  }
};
