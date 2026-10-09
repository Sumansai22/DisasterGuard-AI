import {
  DamageAssessmentRecord,
  PhysicalDamageCategory,
  InspectionPriorityTier,
  HumanVerificationStatus,
  HumanReviewRecord,
  AssignedRescueTeam,
  AssessmentAuditEntry,
  ImageMetadata,
  DamageScoreBreakdown,
  VisualDamageEvidence,
} from '../types/damageAssessment';
import { INITIAL_ASSESSMENT_RECORDS } from '../data/damageAssessmentData';

const STORAGE_KEY = 'disasterguard_damage_assessments_v1';

class DamageAssessmentService {
  private getStorage(): DamageAssessmentRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse damage assessments from localStorage:', e);
    }
    // Initialize with presets
    this.saveStorage(INITIAL_ASSESSMENT_RECORDS);
    return INITIAL_ASSESSMENT_RECORDS;
  }

  private saveStorage(records: DamageAssessmentRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to persist damage assessments to localStorage:', e);
    }
  }

  public getAllAssessments(): DamageAssessmentRecord[] {
    return this.getStorage();
  }

  public getAssessmentById(id: string): DamageAssessmentRecord | undefined {
    return this.getStorage().find((r) => r.id === id);
  }

  /**
   * Transparent, Grounded Priority Scoring Algorithm
   * Priority = 0.35 * D_damage + 0.25 * P_pop + 0.20 * I_infra + 0.15 * H_hazard - 0.05 * U_uncertainty
   */
  public calculatePriority(
    physicalDamageScore: number,
    populationExposureScore: number,
    criticalInfrastructureScore: number,
    hazardEscalationScore: number,
    uncertaintyScore: number
  ): { compositeScore: number; priorityTier: InspectionPriorityTier; rationale: string } {
    const rawScore =
      0.35 * physicalDamageScore +
      0.25 * populationExposureScore +
      0.20 * criticalInfrastructureScore +
      0.15 * hazardEscalationScore -
      0.05 * uncertaintyScore;

    const compositeScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

    let priorityTier: InspectionPriorityTier = 'P4_LOW';
    if (compositeScore >= 80) {
      priorityTier = 'P1_URGENT';
    } else if (compositeScore >= 60) {
      priorityTier = 'P2_HIGH';
    } else if (compositeScore >= 40) {
      priorityTier = 'P3_MEDIUM';
    } else {
      priorityTier = 'P4_LOW';
    }

    // Dynamic explainable rationale synthesis
    const factors: string[] = [];
    if (physicalDamageScore >= 75) factors.push(`Extensive structural collapse (${physicalDamageScore}%)`);
    if (populationExposureScore >= 75) factors.push(`High civilian density at immediate risk (${populationExposureScore}%)`);
    if (criticalInfrastructureScore >= 70) factors.push(`Crucial transport/utility lifeline severed (${criticalInfrastructureScore}%)`);
    if (hazardEscalationScore >= 70) factors.push(`Active meteorological hazard escalating (${hazardEscalationScore}%)`);

    const rationale = factors.length > 0
      ? `Ranked as ${priorityTier.replace('_', ' ')} based on: ${factors.join('; ')}.`
      : `Ranked as ${priorityTier.replace('_', ' ')} due to low-to-moderate localized impact index (${compositeScore}/100).`;

    return { compositeScore, priorityTier, rationale };
  }

  /**
   * Simulates compatible AI Damage Inference Pipeline for uploaded or selected images
   */
  public runAiDamageInference(params: {
    preImage: ImageMetadata;
    postImage: ImageMetadata;
    disasterType: 'LANDSLIDE' | 'FLASH_FLOOD' | 'CYCLONE' | 'EARTHQUAKE' | 'SUBSIDENCE';
    locationName: string;
  }): {
    estimatedCategory: PhysicalDamageCategory;
    scores: DamageScoreBreakdown;
    priorityTier: InspectionPriorityTier;
    priorityRationale: string;
    visualEvidence: VisualDamageEvidence[];
    uncertaintyFactors: string[];
    operationalLimitations: string[];
  } {
    // Determine realistic baseline metrics based on disaster context
    let physicalDamage = 65;
    let popExposure = 60;
    let infraCriticality = 70;
    let hazardEscalation = 65;
    let uncertainty = 10;
    let category: PhysicalDamageCategory = 'MAJOR_DAMAGE';
    const evidence: VisualDamageEvidence[] = [];

    if (params.disasterType === 'LANDSLIDE') {
      physicalDamage = 88;
      popExposure = 82;
      infraCriticality = 90;
      hazardEscalation = 85;
      uncertainty = 12;
      category = 'DESTROYED';
      evidence.push(
        {
          featureId: 'EV-DET-1',
          type: 'DEBRIS_ENCROACHMENT',
          description: 'High-volume debris track detected through settlement center.',
          confidence: 0.94,
        },
        {
          featureId: 'EV-DET-2',
          type: 'ROAD_SEVERED',
          description: 'Arterial roadway disconnected by slope failure.',
          confidence: 0.96,
        }
      );
    } else if (params.disasterType === 'FLASH_FLOOD') {
      physicalDamage = 76;
      popExposure = 80;
      infraCriticality = 78;
      hazardEscalation = 80;
      uncertainty = 14;
      category = 'MAJOR_DAMAGE';
      evidence.push({
        featureId: 'EV-DET-3',
        type: 'WATER_INUNDATION',
        description: 'Standing floodwaters exceed building plinth levels (>1.2m).',
        confidence: 0.92,
      });
    } else if (params.disasterType === 'EARTHQUAKE' || params.disasterType === 'SUBSIDENCE') {
      physicalDamage = 58;
      popExposure = 62;
      infraCriticality = 60;
      hazardEscalation = 50;
      uncertainty = 18;
      category = 'MODERATE_DAMAGE';
      evidence.push({
        featureId: 'EV-DET-4',
        type: 'WALL_SHEAR_FAILURE',
        description: 'Multi-directional masonry shear fractures identified across facade.',
        confidence: 0.89,
      });
    } else {
      physicalDamage = 45;
      popExposure = 50;
      infraCriticality = 55;
      hazardEscalation = 50;
      uncertainty = 15;
      category = 'MODERATE_DAMAGE';
    }

    const { compositeScore, priorityTier, rationale } = this.calculatePriority(
      physicalDamage,
      popExposure,
      infraCriticality,
      hazardEscalation,
      uncertainty
    );

    const uncertaintyFactors = [
      'Optical contrast limited by cloud shadow over high-slope terrain.',
      'Oblique look angle may conceal ground plinth damage on rear facades.',
    ];

    const operationalLimitations = [
      'Estimate based on satellite/drone optical difference; internal structural integrity requires on-site testing.',
      'Nighttime assessment restricted without thermal or SAR radar companion datasets.',
    ];

    return {
      estimatedCategory: category,
      scores: {
        physicalDamageScore: physicalDamage,
        populationExposureScore: popExposure,
        criticalInfrastructureScore: infraCriticality,
        hazardEscalationScore: hazardEscalation,
        uncertaintyScore: uncertainty,
        compositePriorityScore: compositeScore,
      },
      priorityTier,
      priorityRationale: rationale,
      visualEvidence: evidence,
      uncertaintyFactors,
      operationalLimitations,
    };
  }

  public createAssessment(assessmentData: Omit<DamageAssessmentRecord, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>): DamageAssessmentRecord {
    const records = this.getStorage();
    const id = `ASMT-${new Date().getFullYear()}-GEN-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const auditTrail: AssessmentAuditEntry[] = [
      {
        id: `AUD-${Date.now()}-1`,
        timestamp: now,
        action: 'ASSESSMENT_CREATED',
        operator: 'Field Intelligence Officer',
        details: `Initial comparative assessment registered for ${assessmentData.locationName}.`,
      },
      {
        id: `AUD-${Date.now()}-2`,
        timestamp: now,
        action: 'AI_INFERENCE_RUN',
        operator: 'DisasterGuard AI Inference Engine',
        details: `Damage classified as ${assessmentData.estimatedDamageCategory} with score ${assessmentData.scores.compositePriorityScore}/100.`,
      },
      {
        id: `AUD-${Date.now()}-3`,
        timestamp: now,
        action: 'PRIORITY_CALCULATED',
        operator: 'DisasterGuard PS-53 Ranker',
        details: `Assigned inspection tier ${assessmentData.priorityTier}.`,
      },
    ];

    const newRecord: DamageAssessmentRecord = {
      ...assessmentData,
      id,
      createdAt: now,
      updatedAt: now,
      auditTrail,
    };

    records.unshift(newRecord);
    this.saveStorage(records);
    return newRecord;
  }

  public verifyAssessment(
    id: string,
    review: {
      reviewerName: string;
      reviewerRole: string;
      decision: HumanVerificationStatus;
      adjustedPriority?: InspectionPriorityTier;
      justification: string;
      badgeId?: string;
    }
  ): DamageAssessmentRecord | null {
    const records = this.getStorage();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const record = records[index];
    const now = new Date().toISOString();

    const humanReviewRecord: HumanReviewRecord = {
      ...review,
      originalPriority: record.priorityTier,
      timestamp: now,
    };

    record.verificationStatus = review.decision;
    record.humanReview = humanReviewRecord;
    record.updatedAt = now;

    if (review.adjustedPriority && review.adjustedPriority !== record.priorityTier) {
      record.priorityTier = review.adjustedPriority;
      record.auditTrail.push({
        id: `AUD-${Date.now()}-ADJ`,
        timestamp: now,
        action: 'PRIORITY_ADJUSTED',
        operator: `${review.reviewerName} (${review.reviewerRole})`,
        details: `Priority manually updated from ${humanReviewRecord.originalPriority} to ${review.adjustedPriority}. Justification: ${review.justification}`,
      });
    }

    record.auditTrail.push({
      id: `AUD-${Date.now()}-VER`,
      timestamp: now,
      action: 'HUMAN_VERIFIED',
      operator: `${review.reviewerName} (${review.reviewerRole})`,
      details: `Verification decision marked as ${review.decision}. Notes: ${review.justification}`,
    });

    if (review.decision === 'VERIFIED_CONFIRMED' && record.inspectionStatus === 'QUEUE') {
      record.inspectionStatus = 'ASSIGNED';
    }

    records[index] = record;
    this.saveStorage(records);
    return record;
  }

  public assignRescueTeam(id: string, team: AssignedRescueTeam): DamageAssessmentRecord | null {
    const records = this.getStorage();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const record = records[index];
    const now = new Date().toISOString();

    record.assignedTeam = team;
    record.inspectionStatus = 'IN_PROGRESS';
    record.updatedAt = now;

    record.auditTrail.push({
      id: `AUD-${Date.now()}-TEAM`,
      timestamp: now,
      action: 'TEAM_ASSIGNED',
      operator: 'Disaster Operations Supervisor',
      details: `Dispatched ${team.teamName} (${team.teamType}) with ETA ${team.etaMinutes} mins. Radio: ${team.contactRadio}`,
    });

    records[index] = record;
    this.saveStorage(records);
    return record;
  }

  public logReportGenerated(id: string, operator: string): void {
    const records = this.getStorage();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return;

    records[index].auditTrail.push({
      id: `AUD-${Date.now()}-RPT`,
      timestamp: new Date().toISOString(),
      action: 'REPORT_GENERATED',
      operator: operator || 'Disaster Inspector',
      details: 'Official NDMA / SDMA Inspection Prioritization PDF report generated.',
    });
    this.saveStorage(records);
  }

  public resetToPresets(): DamageAssessmentRecord[] {
    this.saveStorage(INITIAL_ASSESSMENT_RECORDS);
    return INITIAL_ASSESSMENT_RECORDS;
  }
}

export const damageAssessmentService = new DamageAssessmentService();
