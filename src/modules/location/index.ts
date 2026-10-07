/**
 * ============================================================
 * LOCATION SERVICES MODULE
 * ============================================================
 * Handles all location-intelligence, telemetry, geocoding, 
 * real-time weather, and environmental data sources.
 */

import { geocodingService } from '../../services/geocodingService';
import { apiClient } from '../../services/api';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude_m?: number;
}

export interface DisasterLocationContext {
  id?: string;
  name: string;
  state?: string;
  district?: string;
  country?: string;
  lat: number;
  lng: number;
  elevation_m?: number;
  is_telemetry_station?: boolean;
  station_code?: string;
}

export interface TelemetryStationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  status: 'ACTIVE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  last_updated?: string;
  soil_moisture?: number;
  pore_pressure?: number;
  displacement?: number;
  rainfall_1h?: number;
  rainfall_24h?: number;
}

export const locationServices = {
  // Geocoding & place search
  searchLocations: geocodingService.searchLocations.bind(geocodingService),

  // Telemetry Stations
  async getStations(): Promise<TelemetryStationData[]> {
    try {
      const res = await apiClient.get('/stations');
      return res.data?.stations || res.data || [];
    } catch {
      return [];
    }
  },

  async getStationById(id: string): Promise<TelemetryStationData | null> {
    try {
      const res = await apiClient.get(`/stations/${id}`);
      return res.data?.station || res.data || null;
    } catch {
      return null;
    }
  },

  // Weather & Environmental Telemetry
  async getCurrentWeather(lat: number, lng: number) {
    try {
      const res = await apiClient.get(`/weather?lat=${lat}&lon=${lng}`);
      return res.data;
    } catch {
      return null;
    }
  },
};

export default locationServices;
