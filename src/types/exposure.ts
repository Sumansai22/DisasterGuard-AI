import { GeoLocation } from './map';
import { RiskLevel } from './prediction';

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'bridge' | 'road' | 'shelter' | 'power_substation';
  location: GeoLocation;
  capacity?: number;
  status: 'operational' | 'high_risk' | 'evacuating' | 'safe';
  distanceFromRiskCenterKm: number;
  contact?: string;
}

export interface ExposureMetrics {
  locationId: string;
  locationName: string;
  riskLevel: RiskLevel;
  riskScore: number;
  estimatedPopulationExposed: number;
  vulnerableGroups: {
    elderly: number;
    children: number;
    differentlyAbled: number;
  };
  buildingsCount: number;
  schoolsCount: number;
  hospitalsCount: number;
  roadsCount: number;
  bridgesCount: number;
  criticalInfrastructureCount: number;
  assets: InfrastructureAsset[];
}
