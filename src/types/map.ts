import { RiskLevel } from './prediction';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface MonitoringStation {
  id: string;
  name: string;
  region: string;
  state: string;
  coordinates: GeoLocation;
  riskScore: number;
  riskLevel: RiskLevel;
  prediction: string;
  confidence: number;
  parameters: {
    rainfall_mm: number;
    slope_angle: number;
    soil_saturation: number;
    vegetation_cover: number;
    earthquake_activity: number;
    proximity_to_water: number;
    soil_type: 'Gravel' | 'Sand' | 'Silt';
  };
  lastReading: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
}

export interface SearchedLocation {
  placeId: string | number;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
  category?: string;
  state?: string;
  country?: string;
  isMonitored: boolean;
  monitoredStation?: MonitoringStation;
}

export interface RiskZonePolygon {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  riskScore: number;
  center: GeoLocation;
  polygon: [number, number][]; // lat/lng pairs
  areaSqKm: number;
  landslideProbability: number;
}

export interface MapLayerVisibility {
  riskZones: boolean;
  monitoringStations: boolean;
  historicalEvents: boolean;
  safeZones: boolean;
  criticalInfrastructure: boolean;
  roads: boolean;
  rivers: boolean;
}
