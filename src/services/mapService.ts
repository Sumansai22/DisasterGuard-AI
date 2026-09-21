import { apiClient } from './api';
import { MonitoringStation, RiskZonePolygon } from '../types/map';
import { MONITORED_STATIONS, RISK_ZONES } from '../utils/constants';

let stationsState = [...MONITORED_STATIONS];

export const mapService = {
  async getRiskZones(): Promise<RiskZonePolygon[]> {
    try {
      const response = await apiClient.get<RiskZonePolygon[]>('/risk-zones');
      return response.data;
    } catch (error) {
      return RISK_ZONES;
    }
  },

  async getMonitoringStations(): Promise<MonitoringStation[]> {
    try {
      const response = await apiClient.get<MonitoringStation[]>('/stations');
      return response.data;
    } catch (error) {
      return stationsState;
    }
  },

  async addMonitoringStation(station: Omit<MonitoringStation, 'id'>): Promise<MonitoringStation> {
    const newStation: MonitoringStation = {
      ...station,
      id: `STN-${Date.now().toString().slice(-4)}`
    };
    stationsState = [newStation, ...stationsState];
    return newStation;
  },

  async deleteMonitoringStation(id: string): Promise<void> {
    stationsState = stationsState.filter(s => s.id !== id);
  }
};
