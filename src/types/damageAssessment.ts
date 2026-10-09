/**
 * DisasterGuard AI — Damage Assessment & Inspection Prioritization Types (PS-53)
 * Grounded in European Macroseismic Scale (EMS-98) & FEMA Structural Damage Tiers.
 */

export type PhysicalDamageCategory =
  | 'DESTROYED'        // Grade 5: Total collapse, structural integrity lost
  | 'MAJOR_DAMAGE'     // Grade 4: Heavy structural damage, roof/walls compromised, uninhabitable
  | 'MODERATE_DAMAGE'  // Grade 3: Substantial non-structural & moderate structural fissures
  | 'MINOR_DAMAGE'     // Grade 2: Superficial damage, shattered windows, tiles displaced
  | 'UNAFFECTED';      // Grade 1/0: No visible damage detected

export type InspectionPriorityTier =
  | 'P1_URGENT'   // Field deployment within 2 hours (life threat, arterial access cutoff)
  | 'P2_HIGH'     // Inspect within 6 hours (heavy structural damage, isolated community)
  | 'P3_MEDIUM'   // Inspect within 24 hours (moderate damage, utility disruption)
  | 'P4_LOW';     // Routine monitoring / post-event survey within 72 hours

export type HumanVerificationStatus =
  | 'PENDING_REVIEW'
  | 'VERIFIED_CONFIRMED'
  | 'RE_INSPECTION_REQUESTED'
  | 'REJECTED';

export type InspectionWorkflowStatus =
  | 'QUEUE'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_SITE_VERIFIED'
  | 'CLOSED';

export interface ImageMetadata {
  filename: string;
  url: string;
  captureDate: string;
  sourcePlatform: 'Sentinel-2 Multispectral' | 'Cartosat-2E' | 'WorldView-3' | 'DJI Matrice 300 UAV' | 'PlanetScope' | 'User Upload';
  resolutionMeters: number;
  dimensions: { width: number; height: number };
  fileSizeBytes: number;
  cloudCoverPercent?: number;
  angleNadirDeg?: number;
}

export interface DamageScoreBreakdown {
  physicalDamageScore: number;         // 0–100 (Weight 0.35)
  populationExposureScore: number;     // 0–100 (Weight 0.25)
  criticalInfrastructureScore: number; // 0–100 (Weight 0.20)
  hazardEscalationScore: number;       // 0–100 (Weight 0.15)
  uncertaintyScore: number;            // 0–100 (Weight 0.05 penalty)
  compositePriorityScore: number;      // 0–100 final weighted score
}

export interface VisualDamageEvidence {
  featureId: string;
  type: 'COLLAPSED_ROOF' | 'WALL_SHEAR_FAILURE' | 'DEBRIS_ENCROACHMENT' | 'ROAD_SEVERED' | 'WATER_INUNDATION' | 'BRIDGE_WASHOUT' | 'FOUNDATION_SLIP';
  description: string;
  confidence: number;
  coordinatesPx?: { x: number; y: number; width?: number; height?: number };
}

export interface HumanReviewRecord {
  reviewerName: string;
  reviewerRole: string;
  decision: HumanVerificationStatus;
  originalPriority: InspectionPriorityTier;
  adjustedPriority?: InspectionPriorityTier;
  justification: string;
  timestamp: string;
  badgeId?: string;
}

export interface AssignedRescueTeam {
  teamId: string;
  teamName: string;
  teamType: 'NDRF' | 'SDRF' | 'PWD_STRUCTURAL' | 'CIVIL_DEFENSE' | 'DISTRICT_RAPID_RESPONSE';
  contactPerson: string;
  contactRadio: string;
  etaMinutes: number;
  assignedAt: string;
}

export interface AssessmentAuditEntry {
  id: string;
  timestamp: string;
  action: 'ASSESSMENT_CREATED' | 'IMAGES_UPLOADED' | 'AI_INFERENCE_RUN' | 'PRIORITY_CALCULATED' | 'PRIORITY_ADJUSTED' | 'HUMAN_VERIFIED' | 'TEAM_ASSIGNED' | 'REPORT_GENERATED';
  operator: string;
  details: string;
}

export interface DamageAssessmentRecord {
  id: string;                         // e.g. "ASMT-2026-KL-0914"
  title: string;
  disasterEvent: string;
  disasterType: 'LANDSLIDE' | 'FLASH_FLOOD' | 'CYCLONE' | 'EARTHQUAKE' | 'SUBSIDENCE';
  locationName: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  preImage: ImageMetadata;
  postImage: ImageMetadata;
  estimatedDamageCategory: PhysicalDamageCategory;
  priorityTier: InspectionPriorityTier;
  scores: DamageScoreBreakdown;
  priorityRationale: string;
  visualEvidence: VisualDamageEvidence[];
  uncertaintyFactors: string[];
  operationalLimitations: string[];
  verificationStatus: HumanVerificationStatus;
  inspectionStatus: InspectionWorkflowStatus;
  humanReview?: HumanReviewRecord;
  assignedTeam?: AssignedRescueTeam;
  auditTrail: AssessmentAuditEntry[];
  createdAt: string;
  updatedAt: string;
  isPresetScenario?: boolean;
}
