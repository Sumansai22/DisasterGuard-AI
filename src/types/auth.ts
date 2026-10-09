export type UserRole = 'ADMIN' | 'INSPECTOR' | 'OPERATOR' | 'CITIZEN';

export type PermissionAction =
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:status'
  | 'role:manage'
  | 'config:read'
  | 'config:update'
  | 'incident:read'
  | 'incident:create'
  | 'incident:update'
  | 'incident:assign'
  | 'assessment:read'
  | 'assessment:create'
  | 'assessment:verify'
  | 'assessment:export'
  | 'gis:read'
  | 'gis:manage'
  | 'model:read'
  | 'model:test'
  | 'sos:read'
  | 'sos:create'
  | 'sos:dispatch'
  | 'alert:read'
  | 'alert:create'
  | 'shelter:read'
  | 'shelter:update'
  | 'feedback:read'
  | 'feedback:create'
  | 'feedback:update'
  | 'report:read'
  | 'report:export'
  | 'audit:read';

export interface RoleDefinition {
  role: UserRole;
  title: string;
  defaultWorkspace: string;
  workspaceName: string;
  description: string;
  permissions: PermissionAction[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  ADMIN: {
    role: 'ADMIN',
    title: 'Disaster Authority Administrator',
    defaultWorkspace: '/admin',
    workspaceName: 'Admin Center',
    description: 'Full governance: user management, model lifecycle, threshold configs, and auditable governance.',
    permissions: [
      'user:read', 'user:create', 'user:update', 'user:status', 'role:manage',
      'config:read', 'config:update',
      'incident:read', 'incident:create', 'incident:update', 'incident:assign',
      'assessment:read', 'assessment:create', 'assessment:verify', 'assessment:export',
      'gis:read', 'gis:manage',
      'model:read', 'model:test',
      'sos:read', 'sos:create', 'sos:dispatch',
      'alert:read', 'alert:create',
      'shelter:read', 'shelter:update',
      'feedback:read', 'feedback:create', 'feedback:update',
      'report:read', 'report:export',
      'audit:read'
    ]
  },
  INSPECTOR: {
    role: 'INSPECTOR',
    title: 'NDRF / Field Inspector',
    defaultWorkspace: '/inspector-workspace',
    workspaceName: 'Field Operations',
    description: 'Field inspection tasks: GPS routing, ground truth verification, structural damage observations, and status updates.',
    permissions: [
      'incident:read', 'incident:update',
      'assessment:read', 'assessment:create', 'assessment:verify',
      'gis:read',
      'shelter:read',
      'sos:create',
      'feedback:create', 'feedback:read'
    ]
  },
  OPERATOR: {
    role: 'OPERATOR',
    title: 'Emergency Operations Lead',
    defaultWorkspace: '/mission-control',
    workspaceName: 'Emergency Operations Center',
    description: 'District command center: triage incoming distress signals, monitor multi-hazard feeds, and dispatch response teams.',
    permissions: [
      'incident:read', 'incident:create', 'incident:update', 'incident:assign',
      'sos:read', 'sos:create', 'sos:dispatch',
      'alert:read', 'alert:create',
      'gis:read',
      'shelter:read', 'shelter:update',
      'assessment:read',
      'report:read',
      'feedback:read', 'feedback:create'
    ]
  },
  CITIZEN: {
    role: 'CITIZEN',
    title: 'Citizen & Community Volunteer',
    defaultWorkspace: '/portal',
    workspaceName: 'Citizen Portal',
    description: 'Public safety portal: community reporting with photo proof, personal dashboard, safe shelters, and advisories.',
    permissions: [
      'incident:create',
      'sos:create',
      'gis:read',
      'shelter:read',
      'feedback:create', 'feedback:read',
      'alert:read'
    ]
  }
};

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
