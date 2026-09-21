import { apiClient } from './api';
import { EmergencyAlert, CreateAlertPayload } from '../types/alerts';

const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: 'ALT-2026-001',
    severity: 'CRITICAL',
    title: '🚨 CRITICAL LANDSLIDE WARNING',
    locationName: 'Meppadi - Chooralmala Sector (Wayanad)',
    zoneId: 'ZONE-WAYANAD-RED',
    riskScore: 91,
    reason: 'Extremely high rainfall (148mm/24h) + saturated clay-silt matrix + slope > 40°',
    recommendedAction: 'Immediate evacuation of Zone 4 & 5 residents to Higher Ground Relief Center. Halt vehicular traffic on Hill Road SH-59.',
    recipients: ['District Collectorate', 'NDRF 4th Battalion', 'Kerala SDMA', 'Public SMS Broadcast (Cell Broadcast #44)'],
    issuedAt: '12 minutes ago',
    status: 'ACTIVE',
    isDemo: true
  },
  {
    id: 'ALT-2026-002',
    severity: 'HIGH',
    title: '⚠️ HIGH RISK ADVISORY: Munnar Tea Estate Slopes',
    locationName: 'Munnar Tea Estate Zone A (Idukki)',
    zoneId: 'ZONE-MUNNAR-ORANGE',
    riskScore: 87,
    reason: 'Continuous downpour over 12h leading to toe erosion along riverbank',
    recommendedAction: 'Deploy Quick Response Teams (QRT). Issue yellow alert for plantation workers and close scenic bypass.',
    recipients: ['Idukki District Control Room', 'Forest Department', 'Local Police'],
    issuedAt: '45 minutes ago',
    status: 'ACTIVE',
    isDemo: true
  },
  {
    id: 'ALT-2026-003',
    severity: 'HIGH',
    title: '⚠️ ELEVATED SLOPE SUBSIDENCE WARNING',
    locationName: 'Shimla Ridge - Summer Hill',
    zoneId: 'ZONE-SHIMLA-ORANGE',
    riskScore: 74,
    reason: 'Micro-tremor activity (0.4 Mag) coupled with urban drainage overflow',
    recommendedAction: 'Inspect structural retention walls along railway line. Restrict heavy commercial vehicles.',
    recipients: ['Shimla Municipal Corporation', 'HP SDMA'],
    issuedAt: '2 hours ago',
    status: 'ACKNOWLEDGED',
    isDemo: true
  },
  {
    id: 'ALT-2026-004',
    severity: 'MODERATE',
    title: 'ℹ️ WEATHER & PRECIPITATION WATCH',
    locationName: 'Paglajhora Pass (Darjeeling)',
    zoneId: 'ZONE-DARJEELING-YELLOW',
    riskScore: 56,
    reason: 'Forecast predicts 60mm rainfall over the next 18 hours',
    recommendedAction: 'Keep excavators on standby along National Highway 55.',
    recipients: ['Darjeeling Disaster Management Authority', 'NHAI'],
    issuedAt: '4 hours ago',
    status: 'ACKNOWLEDGED',
    isDemo: true
  },
  {
    id: 'ALT-2026-005',
    severity: 'INFO',
    title: 'ℹ️ SENSOR CALIBRATION NOTICE',
    locationName: 'Mussoorie Bypass Station',
    riskScore: 16,
    reason: 'Routine sensor telemetry check completed successfully',
    recommendedAction: 'No public action needed. All parameters normal.',
    recipients: ['Central Telemetry Monitoring Cell'],
    issuedAt: '6 hours ago',
    status: 'RESOLVED',
    isDemo: true
  }
];

// Local state cache for persistent simulation during user interaction
let localAlerts = [...INITIAL_ALERTS];

export const alertService = {
  async getAlerts(): Promise<EmergencyAlert[]> {
    try {
      const response = await apiClient.get<EmergencyAlert[]>('/alerts');
      return response.data;
    } catch (error) {
      return [...localAlerts];
    }
  },

  async createAlert(payload: CreateAlertPayload): Promise<EmergencyAlert> {
    try {
      const response = await apiClient.post<EmergencyAlert>('/alerts', payload);
      return response.data;
    } catch (error) {
      const newAlert: EmergencyAlert = {
        id: `ALT-2026-${String(localAlerts.length + 1).padStart(3, '0')}`,
        severity: payload.severity,
        title: `${payload.severity === 'CRITICAL' ? '🚨 CRITICAL' : payload.severity === 'HIGH' ? '⚠️ HIGH RISK' : 'ℹ️'} ALERT: ${payload.locationName}`,
        locationName: payload.locationName,
        zoneId: payload.zoneId,
        riskScore: payload.riskScore,
        reason: payload.message,
        recommendedAction: payload.recommendedAction,
        recipients: payload.recipients.length > 0 ? payload.recipients : ['Emergency Operations Center (EOC)', 'Public SMS Relay'],
        issuedAt: 'Just now',
        status: 'ACTIVE',
        isDemo: true,
      };
      localAlerts = [newAlert, ...localAlerts];
      return newAlert;
    }
  },

  async updateStatus(id: string, status: 'ACKNOWLEDGED' | 'RESOLVED'): Promise<void> {
    try {
      await apiClient.patch(`/alerts/${id}`, { status });
    } catch (error) {
      localAlerts = localAlerts.map(a => a.id === id ? { ...a, status } : a);
    }
  }
};
