import { GeoLocation } from './map';

export type TravelMode = 'DRIVE' | 'WALK' | 'BICYCLE';

export type RouteSafetyStatus = 'SAFE' | 'CAUTION' | 'DANGEROUS' | 'BLOCKED';

export interface PlaceSearchResult {
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  category?: string;
}

export interface LocationPointData {
  name: string;
  latitude: number;
  longitude: number;
  formatted_address?: string;
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'Relief Camp' | 'Community Hall' | 'Higher Ground Stadium' | 'Hospital Facility' | 'Higher Ground College Complex' | 'Custom Destination';
  latitude?: number;
  longitude?: number;
  location: GeoLocation;
  distance_km?: number;
  distanceKm?: number;
  capacity?: number;
  capacityTotal: number;
  current_occupancy?: number;
  capacityOccupied: number;
  available_capacity?: number;
  availableCapacity?: number;
  facilities: string[];
  phone?: string;
  contactNumber: string;
  isAvailable: boolean;
  status?: string;
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  hazardNote?: string;
  status: 'SAFE' | 'CAUTION' | 'DANGER';
}

export interface HazardZoneInfo {
  id: string;
  name: string;
  type?: string;
  region?: string;
  state?: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
  riskScore: number;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source?: string;
  center: GeoLocation;
  radiusMeters: number;
  polygon?: [number, number][];
}

export interface HazardExposureItem {
  id?: string;
  type: string;
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affected_distance_km: number;
  source?: string;
}

export interface EvaluatedRoute {
  route_id: string;
  route_index?: number;
  name: string;
  geometry: [number, number][];
  waypoints: [number, number][];
  polyline?: string;
  distance_km: number;
  distanceKm?: number;
  duration_minutes: number;
  estimatedTimeMin?: number;
  duration_seconds?: number;
  safety_score: number;
  safetyScore?: number;
  status: RouteSafetyStatus;
  routeSafety?: RouteSafetyStatus;
  status_label?: string;
  recommended: boolean;
  isRecommended?: boolean;
  hazard_exposure_km: number;
  hazard_proximity_meters?: number;
  hazards: HazardExposureItem[];
  hazard_intersections?: string[];
  hazardIntersections?: string[];
  closest_hazard_name?: string;
  closestHazardName?: string;
  navigation_steps?: RouteStep[];
  steps?: RouteStep[];
  provider?: string;
}

export interface WarningSummary {
  has_dangerous_routes: boolean;
  dangerous_routes_count: number;
  caution_routes_count?: number;
  recommended_route_id: string;
  warning_message: string;
}

export interface EvacuationRoutePlan {
  id: string;
  affectedZoneId: string;
  affectedZoneName: string;
  originCoordinates: GeoLocation;
  origin?: LocationPointData;
  destination?: LocationPointData;
  targetSafeZone: SafeZone;
  travel_mode?: TravelMode;
  travelMode?: TravelMode;
  isSafeRouteAvailable?: boolean;
  is_safe_route_available?: boolean;
  distance_km?: number;
  distanceKm: number;
  distanceMeters?: number;
  duration_minutes?: number;
  estimatedTimeMin: number;
  durationSeconds?: number;
  polyline?: string;
  status?: string;
  routeSafety: RouteSafetyStatus;
  safety_score?: number;
  safetyScore?: number;
  hazard_proximity_meters?: number;
  hazardProximityMeters?: number;
  closest_hazard_name?: string;
  closestHazardName?: string;
  hazard_intersections?: string[];
  hazardIntersections?: string[];
  hazard_exposure_meters?: number;
  hazardExposureMeters?: number;
  hazard_exposure_km?: number;
  hazards?: HazardExposureItem[];
  routingProvider?: string;
  navigation_steps?: RouteStep[];
  waypoints: [number, number][];
  steps: RouteStep[];
  routes?: EvaluatedRoute[];
  hazard_zones?: HazardZoneInfo[];
  warning_summary?: WarningSummary;
  alternatives?: any[];
  isSimulation: boolean;
  generatedAt: string;
}
