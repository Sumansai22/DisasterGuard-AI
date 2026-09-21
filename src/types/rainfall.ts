export interface RainfallMetric {
  period: '1h' | '6h' | '12h' | '24h' | '72h' | '7d';
  label: string;
  value: number; // in mm
  change: number; // % change compared to previous interval
  status: 'normal' | 'moderate' | 'heavy' | 'extreme';
}

export interface HourlyRainfall {
  time: string;
  rainfall: number; // mm
  cumulative: number; // mm
  threshold: number; // trigger threshold
  riskScore: number; // projected risk (0-100)
}

export interface RainfallCorrelationPoint {
  rainfall: number; // mm
  simulatedRisk: number; // 0-100
  actualIncidents: number;
}

export interface RainfallStation {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  currentRainfall: number;
  rainfall24h: number;
  rainfall7d: number;
  sensorStatus: 'Active' | 'Warning' | 'Offline';
  lastUpdated: string;
}

export interface RainfallOverviewResponse {
  currentRainfall: number;
  metrics: RainfallMetric[];
  trend: HourlyRainfall[];
  correlation: RainfallCorrelationPoint[];
  stations: RainfallStation[];
}
