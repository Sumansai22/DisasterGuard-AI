import { apiClient } from './api';
import { HistoricalLandslideEvent, YearlyTrend, MonthlyDistribution } from '../types/historical';

const MOCK_EVENTS: HistoricalLandslideEvent[] = [
  {
    id: 'HIST-2024-001',
    date: '2024-07-30',
    locationName: 'Chooralmala & Mundakkai, Wayanad',
    state: 'Kerala',
    coordinates: [11.5362, 76.1308],
    rainfallRecordedMm: 572,
    slopeAngleDeg: 42,
    estimatedDamageLakhs: 4800,
    fatalities: 231,
    evacuatedCount: 3500,
    triggerCause: 'Extreme cloudburst rainfall on overburdened saturated tea-estate slope',
    aiPredictedRiskScore: 96,
    predictionAccuracyMatch: true
  },
  {
    id: 'HIST-2023-002',
    date: '2023-08-14',
    locationName: 'Summer Hill Shiv Temple, Shimla',
    state: 'Himachal Pradesh',
    coordinates: [31.1048, 77.1734],
    rainfallRecordedMm: 245,
    slopeAngleDeg: 38,
    estimatedDamageLakhs: 1200,
    fatalities: 18,
    evacuatedCount: 450,
    triggerCause: 'Severe monsoon downpour and blocked slope culverts',
    aiPredictedRiskScore: 89,
    predictionAccuracyMatch: true
  },
  {
    id: 'HIST-2023-003',
    date: '2023-07-19',
    locationName: 'Irshalwadi, Raigad',
    state: 'Maharashtra',
    coordinates: [18.9167, 73.2333],
    rainfallRecordedMm: 498,
    slopeAngleDeg: 45,
    estimatedDamageLakhs: 2100,
    fatalities: 84,
    evacuatedCount: 1200,
    triggerCause: 'Continuous 4-day heavy rainfall on highly weathered basalt ridge',
    aiPredictedRiskScore: 94,
    predictionAccuracyMatch: true
  },
  {
    id: 'HIST-2022-004',
    date: '2022-06-30',
    locationName: 'Tupul Railway Yard, Noney',
    state: 'Manipur',
    coordinates: [24.8167, 93.6333],
    rainfallRecordedMm: 310,
    slopeAngleDeg: 36,
    estimatedDamageLakhs: 3500,
    fatalities: 58,
    evacuatedCount: 800,
    triggerCause: 'Deep cut slope slope failure during heavy monsoonal spell',
    aiPredictedRiskScore: 92,
    predictionAccuracyMatch: true
  },
  {
    id: 'HIST-2021-005',
    date: '2021-10-18',
    locationName: 'Kokkayar & Koottickal, Kottayam/Idukki',
    state: 'Kerala',
    coordinates: [9.6833, 76.9167],
    rainfallRecordedMm: 280,
    slopeAngleDeg: 34,
    estimatedDamageLakhs: 1400,
    fatalities: 15,
    evacuatedCount: 950,
    triggerCause: 'Flash floods and debris flow down saturated gullies',
    aiPredictedRiskScore: 88,
    predictionAccuracyMatch: true
  },
  {
    id: 'HIST-2020-006',
    date: '2020-08-07',
    locationName: 'Pettimudi, Munnar, Idukki',
    state: 'Kerala',
    coordinates: [10.1667, 77.0167],
    rainfallRecordedMm: 620,
    slopeAngleDeg: 40,
    estimatedDamageLakhs: 1800,
    fatalities: 66,
    evacuatedCount: 600,
    triggerCause: 'Grave landslide triggered by 600mm intense rain over 3 days',
    aiPredictedRiskScore: 97,
    predictionAccuracyMatch: true
  }
];

const MOCK_YEARLY_TRENDS: YearlyTrend[] = [
  { year: 2020, eventsCount: 42, avgRainfall: 185, highRiskZonesDetected: 28 },
  { year: 2021, eventsCount: 51, avgRainfall: 210, highRiskZonesDetected: 35 },
  { year: 2022, eventsCount: 48, avgRainfall: 198, highRiskZonesDetected: 31 },
  { year: 2023, eventsCount: 67, avgRainfall: 245, highRiskZonesDetected: 46 },
  { year: 2024, eventsCount: 78, avgRainfall: 280, highRiskZonesDetected: 58 },
  { year: 2025, eventsCount: 62, avgRainfall: 220, highRiskZonesDetected: 41 },
];

const MOCK_MONTHLY_DISTRIBUTION: MonthlyDistribution[] = [
  { month: 'Jan', count: 2, avgRainfall: 18 },
  { month: 'Feb', count: 1, avgRainfall: 22 },
  { month: 'Mar', count: 3, avgRainfall: 35 },
  { month: 'Apr', count: 5, avgRainfall: 52 },
  { month: 'May', count: 12, avgRainfall: 110 },
  { month: 'Jun', count: 38, avgRainfall: 240 },
  { month: 'Jul', count: 64, avgRainfall: 380 },
  { month: 'Aug', count: 58, avgRainfall: 350 },
  { month: 'Sep', count: 32, avgRainfall: 195 },
  { month: 'Oct', count: 18, avgRainfall: 130 },
  { month: 'Nov', count: 8, avgRainfall: 65 },
  { month: 'Dec', count: 3, avgRainfall: 25 },
];

export const historicalService = {
  async getEvents(): Promise<HistoricalLandslideEvent[]> {
    try {
      const response = await apiClient.get<unknown>('/historical-events');
      if (Array.isArray(response.data)) {
        return response.data as HistoricalLandslideEvent[];
      }
      if (response.data && typeof response.data === 'object' && Array.isArray((response.data as Record<string, unknown>).events)) {
        return (response.data as Record<string, unknown>).events as HistoricalLandslideEvent[];
      }
      return MOCK_EVENTS;
    } catch {
      return MOCK_EVENTS;
    }
  },

  async getYearlyTrends(): Promise<YearlyTrend[]> {
    try {
      const response = await apiClient.get<unknown>('/historical-trends');
      if (Array.isArray(response.data)) {
        return response.data as YearlyTrend[];
      }
      return MOCK_YEARLY_TRENDS;
    } catch {
      return MOCK_YEARLY_TRENDS;
    }
  },

  async getMonthlyDistribution(): Promise<MonthlyDistribution[]> {
    try {
      const response = await apiClient.get<unknown>('/monthly-distribution');
      if (Array.isArray(response.data)) {
        return response.data as MonthlyDistribution[];
      }
      return MOCK_MONTHLY_DISTRIBUTION;
    } catch {
      return MOCK_MONTHLY_DISTRIBUTION;
    }
  }
};
