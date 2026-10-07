import { apiClient } from './api';
import {
  MonitoringStation,
  RiskZonePolygon,
  DisasterIncident,
  RainfallStationTelemetry,
  WaterBodyTelemetry,
  EmergencyInfrastructureItem,
  CriticalInfrastructureItem,
  SensorNodeItem,
  PopulationVulnerabilityItem,
  CommandSummaryStats,
} from '../types/map';
import { MONITORED_STATIONS, RISK_ZONES } from '../utils/constants';

let stationsState = [...MONITORED_STATIONS];

export interface DisasterMapContextResponse {
  status: string;
  center: { latitude: number; longitude: number };
  radius_km: number;
  summary: CommandSummaryStats;
  incidents: DisasterIncident[];
  rainfall_stations: RainfallStationTelemetry[];
  water_bodies: WaterBodyTelemetry[];
  emergency_infrastructure: EmergencyInfrastructureItem[];
  critical_infrastructure: CriticalInfrastructureItem[];
  sensors: SensorNodeItem[];
  vulnerability_zones: PopulationVulnerabilityItem[];
}

export const mapService = {
  async getRiskZones(): Promise<RiskZonePolygon[]> {
    try {
      const response = await apiClient.get<RiskZonePolygon[]>('/risk-zones');
      return response.data;
    } catch {
      return RISK_ZONES;
    }
  },

  async getMonitoringStations(): Promise<MonitoringStation[]> {
    try {
      const response = await apiClient.get<MonitoringStation[]>('/stations');
      return response.data;
    } catch {
      return stationsState;
    }
  },

  async addMonitoringStation(station: Omit<MonitoringStation, 'id'>): Promise<MonitoringStation> {
    const newStation: MonitoringStation = {
      ...station,
      id: `STN-${Date.now().toString().slice(-4)}`,
    };
    stationsState = [newStation, ...stationsState];
    return newStation;
  },

  async deleteMonitoringStation(id: string): Promise<void> {
    stationsState = stationsState.filter((s) => s.id !== id);
  },

  async getDisasterMapContext(
    latitude: number,
    longitude: number,
    radiusKm: number = 120
  ): Promise<DisasterMapContextResponse> {
    try {
      const response = await apiClient.get<DisasterMapContextResponse>(
        `/disaster-map/context?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}`
      );
      return response.data;
    } catch (err) {
      console.warn('Backend disaster map API unavailable, generating local context', err);
      return this.getLocalDisasterContext(latitude, longitude, radiusKm);
    }
  },

  getLocalDisasterContext(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): DisasterMapContextResponse {
    return {
      status: 'offline_fallback',
      center: { latitude, longitude },
      radius_km: radiusKm,
      summary: {
        active_incidents: 3,
        critical_zones: 2,
        high_risk_zones: 4,
        active_alerts: 5,
        sensors_online_pct: 94,
        safe_shelters: 7,
        blocked_roads: 2,
        geo_filtered_radius_km: radiusKm,
        center_point: { latitude, longitude },
      },
      incidents: [
        {
          id: 'INC-LCL-01',
          type: 'LANDSLIDE',
          title: 'Regional Slope Subsidence & Slip',
          severity: 'CRITICAL',
          status: 'ACTIVE',
          latitude: latitude + 0.008,
          longitude: longitude + 0.005,
          timestamp: new Date().toISOString(),
          description: 'Active landslide corridor under emergency monitoring.',
          distance_km: 1.2,
          affected_radius_meters: 500,
        },
        {
          id: 'INC-LCL-02',
          type: 'ROAD_BLOCKAGE',
          title: 'Ghat Pass Debris Blockade',
          severity: 'HIGH',
          status: 'ACTIVE',
          latitude: latitude - 0.012,
          longitude: longitude + 0.015,
          timestamp: new Date().toISOString(),
          description: 'Fallen rock and soil obstructing transport route.',
          distance_km: 2.1,
          affected_radius_meters: 250,
        },
      ],
      rainfall_stations: [
        {
          id: 'RAIN-LCL-01',
          station_name: 'Regional Automatic Weather Station (AWS)',
          latitude: latitude + 0.015,
          longitude: longitude - 0.01,
          rainfall_1h_mm: 16.4,
          rainfall_3h_mm: 48.2,
          rainfall_24h_mm: 124.0,
          temperature_c: 21.0,
          humidity_pct: 92,
          wind_speed_kmh: 22.0,
          wind_direction: 'WSW',
          sensor_status: 'ONLINE',
          measurement_time: new Date().toISOString(),
          warning_level: 'ORANGE_ALERT',
          is_simulated: true,
          data_label: 'SIMULATED / DEMO DATA',
          distance_km: 1.8,
        },
      ],
      water_bodies: [
        {
          id: 'RIV-LCL-01',
          name: 'Regional Drainage River Basin',
          type: 'RIVER',
          latitude: latitude - 0.005,
          longitude: longitude - 0.008,
          current_level_m: 6.8,
          danger_level_m: 6.5,
          capacity_pct: 104.6,
          trend: 'RISING',
          sensor_status: 'CRITICAL',
          last_updated: new Date().toISOString(),
          distance_km: 0.9,
        },
      ],
      emergency_infrastructure: [
        {
          id: 'HOSP-LCL-01',
          name: 'District Community Trauma Center',
          type: 'HOSPITAL',
          latitude: latitude + 0.02,
          longitude: longitude + 0.02,
          total_beds: 250,
          icu_available: 12,
          phone: '108',
          status: 'OPERATIONAL',
          distance_km: 2.8,
        },
        {
          id: 'FIRE-LCL-01',
          name: 'Central Fire & Rescue Brigade',
          type: 'FIRE_STATION',
          latitude: latitude - 0.018,
          longitude: longitude - 0.015,
          engines_ready: 3,
          phone: '101',
          status: 'OPERATIONAL',
          distance_km: 2.4,
        },
      ],
      critical_infrastructure: [
        {
          id: 'INF-LCL-01',
          name: 'Regional Valley Highway Corridor',
          type: 'ROADS',
          latitude: latitude + 0.005,
          longitude: longitude - 0.012,
          status: 'PARTIALLY_OPERATIONAL',
          condition_note: 'One lane operational with convoy control.',
          is_demo: true,
          distance_km: 1.5,
        },
      ],
      sensors: [
        {
          id: 'SN-LCL-01',
          name: 'Slope Inclinometer Array',
          sensor_type: 'SLOPE_SENSOR',
          latitude: latitude + 0.004,
          longitude: longitude + 0.003,
          reading: '3.4° Tilt / 24h',
          numeric_value: 3.4,
          threshold: '2.0°',
          unit: 'deg',
          battery_pct: 88,
          status: 'WARNING',
          last_update: 'Just now',
          distance_km: 0.6,
        },
      ],
      vulnerability_zones: [
        {
          id: 'VULN-LCL-01',
          name: 'High Density Slope Community',
          latitude: latitude + 0.007,
          longitude: longitude + 0.002,
          vulnerability_level: 'HIGH',
          estimated_population: '1,200 residents (DEMO)',
          critical_facilities: ['School', 'Community Clinic'],
          evacuation_priority: 'PRIORITY_1',
          is_demo: true,
          note: 'SIMULATED / DEMO VULNERABILITY CENSUS',
          distance_km: 0.8,
        },
      ],
    };
  },
};
