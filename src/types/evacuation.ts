import { GeoLocation } from './map';

export interface SafeZone {
  id: string;
  name: string;
  type: 'Relief Camp' | 'Community Hall' | 'Higher Ground Stadium' | 'Hospital Facility';
  location: GeoLocation;
  capacityTotal: number;
  capacityOccupied: number;
  facilities: string[];
  contactNumber: string;
  isAvailable: boolean;
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  hazardNote?: string;
  status: 'SAFE' | 'CAUTION';
}

export interface EvacuationRoutePlan {
  id: string;
  affectedZoneId: string;
  affectedZoneName: string;
  originCoordinates: GeoLocation;
  targetSafeZone: SafeZone;
  distanceKm: number;
  estimatedTimeMin: number;
  routeSafety: 'SAFE' | 'MODERATE_HAZARD' | 'BLOCKED';
  waypoints: [number, number][]; // lat/lng pairs for polyline
  steps: RouteStep[];
  isSimulation: boolean;
  generatedAt: string;
}
