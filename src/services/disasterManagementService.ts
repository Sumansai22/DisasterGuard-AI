/**
 * ============================================================
 * UNIFIED DISASTER MANAGEMENT FRONTEND SERVICE
 * ============================================================
 * Provides high-level methods for:
 * - Incident Management (Detect -> Verify -> Alert -> Dispatch -> Resolve)
 * - Emergency Resources GIS & Smart Tiered Shelters
 * - Multi-Hazard Scenario Simulator
 * - Central Audit Logging & Time-to-Response Analytics
 * - System Health Monitoring
 */

import { apiClient } from './api';
import {
  IncidentModel,
  DisasterEvent,
  EmergencyResource,
  AlertModel,
  DataProvenanceStatus,
} from '../types/disasterManagement';

const API_V1 = '/api/v1';

export interface TieredSheltersResponse {
  query_coordinates: { lat: number; lng: number };
  requested_radius_km: number;
  total_found: number;
  shelters: EmergencyResource[];
  tier_counts: {
    within_25km: number;
    within_50km: number;
    within_100km: number;
    extended: number;
  };
  message: string;
}

export interface ScenarioSimulationResult {
  scenario: string;
  location: string;
  event: {
    hazard_type: string;
    title: string;
    severity: string;
    rainfall_mm: number;
    affected_population: number;
    affected_buildings: number;
    affected_roads_km: number;
    blocked_roads: string[];
    recommended_action: string;
    active_incidents_count: number;
  };
  status: string;
  timestamp: string;
}

export const disasterManagementService = {
  // -------------------------------------------------------------
  // 1. INCIDENT LIFECYCLE MANAGEMENT
  // -------------------------------------------------------------
  async getIncidents(status?: string): Promise<IncidentModel[]> {
    try {
      const res = await apiClient.get<{ incidents: IncidentModel[] }>(`${API_V1}/incidents`, {
        params: status ? { status } : {},
      });
      return res.data.incidents || [];
    } catch {
      // Fallback initial incidents
      return [];
    }
  },

  async verifyIncident(incidentId: string, operator: string = 'Command Center Operator'): Promise<IncidentModel> {
    const res = await apiClient.post<{ incident: IncidentModel }>(
      `${API_V1}/incidents/${incidentId}/verify?operator=${encodeURIComponent(operator)}`
    );
    return res.data.incident;
  },

  async dispatchIncident(params: {
    incidentId: string;
    teamName: string;
    teamType?: string;
    instructions?: string;
    operator?: string;
  }): Promise<{ success: boolean; incident: IncidentModel; message: string }> {
    const res = await apiClient.post<{ incident: IncidentModel; message: string }>(`${API_V1}/incidents/dispatch`, {
      incident_id: params.incidentId,
      team_name: params.teamName,
      team_type: params.teamType || 'NDRF',
      instructions: params.instructions || 'Deploy search & rescue immediate',
      operator: params.operator || 'Command Center Supervisor',
    });
    return { success: true, incident: res.data.incident, message: res.data.message };
  },

  async resolveIncident(incidentId: string, operator: string = 'Command Center Operator'): Promise<IncidentModel> {
    const res = await apiClient.post<{ incident: IncidentModel }>(
      `${API_V1}/incidents/${incidentId}/resolve?operator=${encodeURIComponent(operator)}`
    );
    return res.data.incident;
  },

  async acknowledgeIncident(params: { incidentId: string; operator?: string; notes?: string }): Promise<IncidentModel> {
    const res = await apiClient.post<{ incident: IncidentModel }>(`${API_V1}/incidents/acknowledge`, {
      incident_id: params.incidentId,
      operator: params.operator || 'Command Center Operator',
      notes: params.notes,
    });
    return res.data.incident;
  },

  async assignIncident(params: {
    incidentId: string;
    teamName: string;
    teamType?: string;
    operator?: string;
    notes?: string;
  }): Promise<IncidentModel> {
    const res = await apiClient.post<{ incident: IncidentModel }>(`${API_V1}/incidents/assign`, {
      incident_id: params.incidentId,
      team_name: params.teamName,
      team_type: params.teamType || 'NDRF',
      operator: params.operator || 'Command Center Supervisor',
      notes: params.notes,
    });
    return res.data.incident;
  },

  async closeIncident(incidentId: string, operator: string = 'Command Center Operator', notes?: string): Promise<IncidentModel> {
    const res = await apiClient.post<{ incident: IncidentModel }>(
      `${API_V1}/incidents/${incidentId}/close?operator=${encodeURIComponent(operator)}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`
    );
    return res.data.incident;
  },

  async reportCitizenIncident(params: {
    incidentType: string;
    latitude: number;
    longitude: number;
    locationName: string;
    description: string;
    priority?: string;
    photoFilename?: string;
  }): Promise<{ incidentId: string; incident: IncidentModel; message: string }> {
    const res = await apiClient.post<{ incident_id: string; incident: IncidentModel; message: string }>(
      `${API_V1}/incidents/report`,
      {
        incident_type: params.incidentType,
        latitude: params.latitude,
        longitude: params.longitude,
        location_name: params.locationName,
        description: params.description,
        priority: params.priority || 'HIGH',
        photo_filename: params.photoFilename,
      }
    );
    return {
      incidentId: res.data.incident_id,
      incident: res.data.incident,
      message: res.data.message,
    };
  },

  async markFalsePositive(incidentId: string, operator: string = 'Command Center Operator'): Promise<IncidentModel> {
    const res = await apiClient.post<{ incident: IncidentModel }>(
      `${API_V1}/incidents/${incidentId}/false-positive?operator=${encodeURIComponent(operator)}`
    );
    return res.data.incident;
  },

  async getInfrastructure(lat: number = 16.5448, lng: number = 81.5212, radiusKm: number = 120): Promise<any[]> {
    try {
      const res = await apiClient.get<{ infrastructure: any[] }>(`${API_V1}/infrastructure`, {
        params: { lat, lng, radius_km: radiusKm },
      });
      return res.data.infrastructure || [];
    } catch {
      return [];
    }
  },

  // -------------------------------------------------------------
  // 2. EMERGENCY RESOURCES & SMART SHELTER ENGINE
  // -------------------------------------------------------------
  async getEmergencyResources(params: {
    lat: number;
    lng: number;
    type?: string;
    radiusKm?: number;
  }): Promise<EmergencyResource[]> {
    try {
      const res = await apiClient.get<{ resources: EmergencyResource[] }>(`${API_V1}/emergency-resources`, {
        params: {
          lat: params.lat,
          lng: params.lng,
          type: params.type,
          radius_km: params.radiusKm || 120,
        },
      });
      return res.data.resources || [];
    } catch {
      return [];
    }
  },

  async getTieredShelters(lat: number, lng: number, radiusKm: number = 25): Promise<TieredSheltersResponse> {
    try {
      const res = await apiClient.get<TieredSheltersResponse>(`${API_V1}/shelters`, {
        params: { lat, lng, radius_km: radiusKm },
      });
      return res.data;
    } catch {
      return {
        query_coordinates: { lat, lng },
        requested_radius_km: radiusKm,
        total_found: 0,
        shelters: [],
        tier_counts: { within_25km: 0, within_50km: 0, within_100km: 0, extended: 0 },
        message: 'No verified emergency shelters found in vicinity.',
      };
    }
  },

  // -------------------------------------------------------------
  // 3. SCENARIO SIMULATOR
  // -------------------------------------------------------------
  async simulateScenario(scenarioType: string, locationName: string = 'Bhimavaram'): Promise<ScenarioSimulationResult> {
    const res = await apiClient.post<{ scenario: ScenarioSimulationResult }>(`${API_V1}/scenario/simulate`, {
      scenario_type: scenarioType,
      location_name: locationName,
    });
    return res.data.scenario;
  },

  // -------------------------------------------------------------
  // 4. AUDIT LOGS & RESPONSE TIME ANALYTICS
  // -------------------------------------------------------------
  async getAuditLogs(): Promise<any[]> {
    try {
      const res = await apiClient.get<{ logs: any[] }>(`${API_V1}/audit-logs`);
      return res.data.logs || [];
    } catch {
      return [];
    }
  },

  async getResponseAnalytics(): Promise<any> {
    try {
      const res = await apiClient.get<{ analytics: any }>(`${API_V1}/response-analytics`);
      return res.data.analytics;
    } catch {
      return null;
    }
  },

  // -------------------------------------------------------------
  // 5. SYSTEM HEALTH MONITORING
  // -------------------------------------------------------------
  async getSystemHealth(): Promise<any> {
    try {
      const res = await apiClient.get(`${API_V1}/system-health`);
      return res.data;
    } catch {
      return null;
    }
  },
};

export default disasterManagementService;
