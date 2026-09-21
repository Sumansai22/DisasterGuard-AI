import { RiskLevel } from './prediction';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';

export interface EmergencyAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  locationName: string;
  zoneId?: string;
  riskScore: number;
  reason: string;
  recommendedAction: string;
  recipients: string[];
  issuedAt: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  isDemo?: boolean;
}

export interface CreateAlertPayload {
  severity: AlertSeverity;
  locationName: string;
  zoneId?: string;
  riskScore: number;
  message: string;
  recommendedAction: string;
  recipients: string[];
}
