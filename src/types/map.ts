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
  address?: string;
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  type?: string;
  category?: string;
  state?: string;
  country?: string;
  source?: 'geocoding' | 'telemetry_station';
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

// ----------------------------------------------------------------------
// DISASTER MANAGEMENT GIS EXTENSIONS
// ----------------------------------------------------------------------

export type IncidentType =
  | 'LANDSLIDE'
  | 'FLOOD'
  | 'FLASH_FLOOD'
  | 'FIRE'
  | 'EARTHQUAKE'
  | 'ROAD_BLOCKAGE'
  | 'STRUCTURAL_DAMAGE';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';

export type IncidentStatus = 'ACTIVE' | 'MONITORING' | 'CONTAINED' | 'RESOLVED';

export interface DisasterIncident {
  id: string;
  type: IncidentType;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  timestamp: string;
  description: string;
  region?: string;
  state?: string;
  distance_km?: number;
  affected_radius_meters?: number;
  action_taken?: string;
}

export interface RainfallStationTelemetry {
  id: string;
  station_name: string;
  latitude: number;
  longitude: number;
  rainfall_1h_mm: number;
  rainfall_3h_mm: number;
  rainfall_24h_mm: number;
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  wind_direction: string;
  sensor_status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  measurement_time: string;
  warning_level: string;
  is_simulated?: boolean;
  data_label?: string;
  distance_km?: number;
}

export interface WaterBodyTelemetry {
  id: string;
  name: string;
  type: 'RIVER' | 'DAM_RESERVOIR' | 'FLOOD_ZONE';
  latitude: number;
  longitude: number;
  current_level_m: number;
  danger_level_m: number;
  warning_level_m?: number;
  capacity_pct: number;
  trend: 'RISING' | 'STEADY' | 'RECEDING';
  sensor_status: 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';
  last_updated: string;
  discharge_cusecs?: number;
  distance_km?: number;
  poly_line?: [number, number][];
}

export type EmergencyInfraType =
  | 'HOSPITAL'
  | 'AMBULANCE_STATION'
  | 'FIRE_STATION'
  | 'POLICE_STATION'
  | 'EMERGENCY_OPERATION_CENTER';

export interface EmergencyInfrastructureItem {
  id: string;
  name: string;
  type: EmergencyInfraType;
  latitude: number;
  longitude: number;
  total_beds?: number;
  icu_available?: number;
  fleet_on_duty?: number;
  engines_ready?: number;
  boats_ready?: number;
  patrol_units?: number;
  lead_officer?: string;
  satellite_phone?: string;
  phone: string;
  status: string;
  distance_km?: number;
}

export type CriticalInfraType =
  | 'ROADS'
  | 'BRIDGES'
  | 'TUNNELS'
  | 'RAILWAYS'
  | 'AIRPORTS'
  | 'COMMUNICATION_TOWERS'
  | 'POWER_INFRASTRUCTURE';

export type CriticalInfraStatus =
  | 'OPERATIONAL'
  | 'DAMAGED'
  | 'BLOCKED'
  | 'PARTIALLY_OPERATIONAL'
  | 'UNKNOWN';

export interface CriticalInfrastructureItem {
  id: string;
  name: string;
  type: CriticalInfraType;
  latitude: number;
  longitude: number;
  status: CriticalInfraStatus;
  condition_note: string;
  is_demo?: boolean;
  distance_km?: number;
}

export type SensorNodeType =
  | 'RAIN_GAUGE'
  | 'SOIL_MOISTURE'
  | 'SLOPE_SENSOR'
  | 'RIVER_LEVEL'
  | 'SEISMIC';

export interface SensorNodeItem {
  id: string;
  name: string;
  sensor_type: SensorNodeType;
  latitude: number;
  longitude: number;
  reading: string;
  numeric_value: number;
  threshold: string;
  unit: string;
  battery_pct: number;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  last_update: string;
  distance_km?: number;
}

export interface PopulationVulnerabilityItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  vulnerability_level: string;
  estimated_population: string;
  critical_facilities: string[];
  evacuation_priority: string;
  is_demo?: boolean;
  note?: string;
  distance_km?: number;
}

export interface CommandSummaryStats {
  active_incidents: number;
  critical_zones: number;
  high_risk_zones: number;
  active_alerts: number;
  sensors_online_pct: number;
  safe_shelters: number;
  blocked_roads: number;
  geo_filtered_radius_km: number;
  center_point?: { latitude: number; longitude: number };
}

export type BaseMapStyle = 'STANDARD' | 'SATELLITE' | 'TERRAIN';

export interface DisasterMapLayersState {
  baseMap: BaseMapStyle;
  hazards: {
    landslideRisk: boolean; // default ON
    floodRisk: boolean;
    flashFlood: boolean;
    fire: boolean;
    earthquake: boolean;
    roadBlockage: boolean;
    activeIncidents: boolean;
  };
  weather: {
    rainfall: boolean;
    rainfallForecast: boolean;
    weatherWarnings: boolean;
    wind: boolean;
    temperature: boolean;
    timeframe: '1h' | '3h' | '24h';
  };
  water: {
    rivers: boolean;
    dams: boolean;
    riverWaterLevels: boolean;
    floodZones: boolean;
  };
  emergency: {
    emergencyShelters: boolean; // default ON
    hospitals: boolean;
    ambulanceStations: boolean;
    fireStations: boolean;
    policeStations: boolean;
    eoc: boolean;
  };
  infrastructure: {
    roads: boolean;
    bridges: boolean;
    tunnels: boolean;
    railways: boolean;
    airports: boolean;
    communicationTowers: boolean;
    powerInfra: boolean;
  };
  sensors: {
    rainfallSensors: boolean; // default ON
    soilMoistureSensors: boolean; // default ON
    slopeSensors: boolean; // default ON
    riverSensors: boolean;
    seismicSensors: boolean;
  };
  evacuation: {
    safeEvacuationRoutes: boolean;
    blockedRoads: boolean;
    alternativeRoutes: boolean;
  };
  vulnerability: {
    populationZones: boolean;
  };
}

export const DEFAULT_MAP_LAYERS: DisasterMapLayersState = {
  baseMap: 'STANDARD',
  hazards: {
    landslideRisk: true,
    floodRisk: false,
    flashFlood: false,
    fire: false,
    earthquake: false,
    roadBlockage: false,
    activeIncidents: true,
  },
  weather: {
    rainfall: false,
    rainfallForecast: false,
    weatherWarnings: false,
    wind: false,
    temperature: false,
    timeframe: '24h',
  },
  water: {
    rivers: false,
    dams: false,
    riverWaterLevels: false,
    floodZones: false,
  },
  emergency: {
    emergencyShelters: true,
    hospitals: false,
    ambulanceStations: false,
    fireStations: false,
    policeStations: false,
    eoc: false,
  },
  infrastructure: {
    roads: false,
    bridges: false,
    tunnels: false,
    railways: false,
    airports: false,
    communicationTowers: false,
    powerInfra: false,
  },
  sensors: {
    rainfallSensors: true,
    soilMoistureSensors: true,
    slopeSensors: true,
    riverSensors: false,
    seismicSensors: false,
  },
  evacuation: {
    safeEvacuationRoutes: false,
    blockedRoads: false,
    alternativeRoutes: false,
  },
  vulnerability: {
    populationZones: false,
  },
};
