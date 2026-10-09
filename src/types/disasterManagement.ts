/**
 * ============================================================
 * CENTRAL DISASTER MANAGEMENT & EARLY WARNING ENTITIES
 * ============================================================
 * Production unified data models for:
 * 1. Location
 * 2. DisasterEvent
 * 3. Incident
 * 4. Alert
 * 5. EmergencyResource
 * 6. Route
 * 7. DroneDetection
 */

export type DataProvenanceStatus =
  | 'LIVE'
  | 'FORECAST'
  | 'HISTORICAL'
  | 'MODEL_ESTIMATE'
  | 'SATELLITE'
  | 'SENSOR'
  | 'DEMO'
  | 'SIMULATION'
  | 'UNAVAILABLE'
  | 'ESTIMATED';

export type HazardType =
  | 'ALL'
  | 'LANDSLIDE'
  | 'FLOOD'
  | 'FLASH_FLOOD'
  | 'CYCLONE'
  | 'SEVERE_STORM'
  | 'EARTHQUAKE'
  | 'TSUNAMI'
  | 'WILDFIRE'
  | 'HEATWAVE'
  | 'DROUGHT'
  | 'LIGHTNING'
  | 'EXTREME_RAINFALL'
  | 'ROAD_BLOCKAGE'
  | 'OTHER';

export type HazardSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HazardEventStatus = 'WATCH' | 'ADVISORY' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus =
  | 'CREATED'
  | 'DETECTED'
  | 'ASSESSED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'ACKNOWLEDGED'
  | 'ALERTED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'RESPONDING'
  | 'ON_SCENE'
  | 'RESCUED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'FALSE_POSITIVE'
  | 'CANCELLED'
  | 'SOS_SENT';

export type AlertType =
  | 'HAZARD_WARNING'
  | 'EVACUATION_WARNING'
  | 'ROAD_BLOCKAGE'
  | 'SHELTER_ALERT'
  | 'RESCUE_ALERT'
  | 'WEATHER_ALERT'
  | 'EARTHQUAKE_ALERT'
  | 'FLOOD_ALERT'
  | 'CYCLONE_ALERT'
  | 'LANDSLIDE_ALERT'
  | 'SYSTEM_ALERT';

export type AlertStatus = 'CREATED' | 'SENT' | 'ACKNOWLEDGED' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

export type ResourceType =
  | 'SHELTER'
  | 'HOSPITAL'
  | 'FIRE_STATION'
  | 'POLICE'
  | 'AMBULANCE'
  | 'RESCUE_TEAM'
  | 'EOC'
  | 'RELIEF_CENTER'
  | 'OTHER';

export type ResourceStatus = 'AVAILABLE' | 'ASSIGNED' | 'RESPONDING' | 'ON_SCENE' | 'UNAVAILABLE' | 'FULL';

export type RouteSafetyStatus = 'SAFE' | 'CAUTION' | 'DANGEROUS' | 'BLOCKED';

// -------------------------------------------------------------
// 1. LOCATION MODEL
// -------------------------------------------------------------
export interface LocationModel {
  id: string;
  name: string;
  display_name: string;
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  district?: string;
  postal_code?: string;
  elevation_m?: number;
  source: string;
  source_type: DataProvenanceStatus;
  updated_at: string;
  // Separate local telemetry station status
  has_local_telemetry: boolean;
  telemetry_station_id?: string;
  telemetry_distance_km?: number;
  environmental_data_available: boolean;
}

// -------------------------------------------------------------
// 2. DISASTER EVENT MODEL
// -------------------------------------------------------------
export interface DisasterEvent {
  id: string;
  hazard_type: HazardType;
  title: string;
  severity: HazardSeverity;
  status: HazardEventStatus;
  latitude: number;
  longitude: number;
  affected_radius_km: number;
  probability: number;
  confidence: number;
  source: string;
  source_type: DataProvenanceStatus;
  description: string;
  affected_area_sqkm?: number;
  affected_population?: number;
  issued_at: string;
  updated_at: string;
  expires_at?: string;
  recommended_actions: string[];
}

// -------------------------------------------------------------
// 3. CENTRAL INCIDENT MODEL
// -------------------------------------------------------------
export interface IncidentModel {
  id: string;
  type: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  hazard_type: HazardType;
  latitude: number;
  longitude: number;
  location_name?: string;
  source: string;
  confidence: number;
  distress_score?: number;
  indicators?: string[];
  created_at: string;
  verified_at?: string;
  acknowledged_at?: string;
  dispatched_at?: string;
  on_scene_at?: string;
  resolved_at?: string;
  assigned_team?: string;
  assigned_team_type?: string;
  notes?: string;
  person_id?: string;
  tracking_id?: number;
}

// -------------------------------------------------------------
// 4. CENTRAL ALERT MODEL
// -------------------------------------------------------------
export interface AlertModel {
  id: string;
  type: AlertType;
  hazard_type: HazardType;
  severity: HazardSeverity;
  status: AlertStatus;
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  zone_id?: string;
  risk_score: number;
  source: string;
  source_type: DataProvenanceStatus;
  reason: string;
  recommended_action: string;
  safe_evacuation_route_available?: boolean;
  recipients?: string[];
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

// -------------------------------------------------------------
// 5. EMERGENCY RESOURCE MODEL
// -------------------------------------------------------------
export interface EmergencyResource {
  id: string;
  name: string;
  type: ResourceType;
  latitude: number;
  longitude: number;
  status: ResourceStatus;
  capacity: number;
  occupancy: number;
  available_capacity: number;
  contact: string;
  facilities: string[];
  source: string;
  distance_km?: number;
  address?: string;
}

// -------------------------------------------------------------
// 6. ROUTE MODEL
// -------------------------------------------------------------
export interface RouteModel {
  id: string;
  origin_name: string;
  destination_name: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  distance_km: number;
  duration_minutes: number;
  safety_score: number; // 0-100
  hazard_exposure_km: number;
  status: RouteSafetyStatus;
  route_type: 'RECOMMENDED_SAFE' | 'SAFE_ALTERNATIVE' | 'CAUTION_ROUTE' | 'DANGEROUS_ROUTE' | 'BLOCKED_ROUTE';
  is_recommended: boolean;
  waypoints: [number, number][];
  warnings: string[];
  blocked_reason?: string;
}

// -------------------------------------------------------------
// 7. DRONE DETECTION MODEL
// -------------------------------------------------------------
export interface DroneDetectionModel {
  detection_id: string;
  person_id: string;
  tracking_id: number;
  confidence: number;
  timestamp_sec: number;
  timestamp_str: string;
  frame_number?: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
    x_px?: number;
    y_px?: number;
    width_px?: number;
    height_px?: number;
  };
  distress_score: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  indicators: string[];
  hazard_context: HazardType;
  latitude?: number;
  longitude?: number;
  gps_source: 'DRONE_GPS' | 'ESTIMATED_SECTOR' | 'UNAVAILABLE' | 'DEMO';
  posture?: string;
}
