import { RiskLevel } from './prediction';

export interface HistoricalLandslideEvent {
  id: string;
  date: string;
  locationName: string;
  state: string;
  coordinates: [number, number];
  rainfallRecordedMm: number;
  slopeAngleDeg: number;
  estimatedDamageLakhs: number;
  fatalities: number;
  evacuatedCount: number;
  triggerCause: string;
  aiPredictedRiskScore: number;
  predictionAccuracyMatch: boolean;
}

export interface YearlyTrend {
  year: number;
  eventsCount: number;
  avgRainfall: number;
  highRiskZonesDetected: number;
}

export interface MonthlyDistribution {
  month: string;
  count: number;
  avgRainfall: number;
}
