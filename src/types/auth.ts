export type UserRole = 'ADMIN' | 'INSPECTOR' | 'OPERATOR' | 'CITIZEN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency: string;
  designation?: string;
  badgeId?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  lastLoginAt: string;
}

export interface IncidentSubmission {
  id: string;
  userId: string;
  userName: string;
  incidentType: 'LANDSLIDE' | 'FLASH_FLOOD' | 'STRUCTURAL_COLLAPSE' | 'ROAD_BLOCKAGE' | 'EROSION';
  locationName: string;
  coordinates: { lat: number; lng: number };
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  photoUrl?: string;
  status: 'SUBMITTED' | 'TRIAGED' | 'ASSIGNED' | 'VERIFIED' | 'RESOLVED';
  timestamp: string;
}
