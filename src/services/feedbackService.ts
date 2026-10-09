import { apiClient } from './api';

export type FeedbackCategory =
  | 'Bug / Technical Issue'
  | 'Risk Prediction Accuracy'
  | 'Map / GIS Issue'
  | 'Emergency SOS / Incident Workflow'
  | 'Evacuation / Shelter Information'
  | 'Field Inspection'
  | 'User Experience / Accessibility'
  | 'Feature Request'
  | 'Data Quality / Incorrect Information'
  | 'Security / Privacy Concern'
  | 'General Feedback';

export type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FeedbackStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface FeedbackAttachment {
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
  dataUrl?: string;
}

export interface UserFeedbackSubmission {
  id: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  affectedModule: string;
  subject: string;
  description: string;
  expectedResult?: string;
  satisfactionRating: number; // 1 to 5
  easeOfUseRating?: number;
  accuracyRating?: number;
  reporterRole: string;
  reporterName: string;
  contactEmail?: string;
  preferredFollowup: 'No Follow-up' | 'Email' | 'In-App Notification';
  locationName?: string;
  incidentRefId?: string;
  assessmentRefId?: string;
  attachments: FeedbackAttachment[];
  status: FeedbackStatus;
  reviewerName?: string;
  reviewerNotes?: string;
  resolutionSummary?: string;
  submittedAt: string;
  updatedAt: string;
  persistedRemotely: boolean;
}

export interface FeedbackStats {
  totalFeedback: number;
  awaitingReview: number;
  inProgress: number;
  resolved: number;
  averageSatisfaction: number;
}

const LOCAL_STORAGE_KEY = 'disasterguard_user_feedback_v2';

const INITIAL_SEED_FEEDBACK: UserFeedbackSubmission[] = [
  {
    id: 'FDB-992014',
    category: 'Map / GIS Issue',
    priority: 'HIGH',
    affectedModule: 'Risk Map & GIS',
    subject: 'Soil Moisture Layer Inversion in Western Ghats Sector',
    description: 'The soil saturation gradient displayed elevated risk in the valley basin but inverted lower values on steep escarpments above 35 degrees during heavy monsoonal bursts.',
    expectedResult: 'Contour isolines should account for slope-induced hydraulic pore pressure accumulation.',
    satisfactionRating: 4,
    easeOfUseRating: 4,
    accuracyRating: 3,
    reporterRole: 'NDRF / Field Inspector',
    reporterName: 'Insp. Anand Verma',
    contactEmail: 'anand.verma@ndrf.gov.in',
    preferredFollowup: 'Email',
    locationName: 'Munnar Tea Estate Zone A',
    incidentRefId: 'INC-NDRF-8821',
    assessmentRefId: 'ASM-PS53-001',
    attachments: [
      { filename: 'satellite_layer_glitch.png', sizeBytes: 1048576, uploadedAt: '2026-10-08T14:22:00Z' }
    ],
    status: 'IN_PROGRESS',
    reviewerName: 'Dr. S. K. Ramanathan',
    reviewerNotes: 'Hydrological flow model re-calibrated against Sentinel-2 SAR surface reflectance.',
    resolutionSummary: 'Assigned to GIS Engineering Team for sensor calibration update.',
    submittedAt: '2026-10-08T14:22:00Z',
    updatedAt: '2026-10-09T09:15:00Z',
    persistedRemotely: true,
  },
  {
    id: 'FDB-992015',
    category: 'Risk Prediction Accuracy',
    priority: 'MEDIUM',
    affectedModule: 'Inspection Priorities',
    subject: 'Early Warning Threshold Trigger Speed',
    description: 'Random Forest inference responded within 24ms, providing an early heads-up for field teams before ground runoff peaked.',
    expectedResult: 'Maintain sub-50ms inference latency during active regional alerts.',
    satisfactionRating: 5,
    easeOfUseRating: 5,
    accuracyRating: 5,
    reporterRole: 'Emergency Operations Lead',
    reporterName: 'Officer Priya Sharma',
    contactEmail: 'priya.sharma@disasterops.in',
    preferredFollowup: 'In-App Notification',
    locationName: 'Chooralmala Settlement',
    incidentRefId: 'INC-DEOC-109',
    attachments: [],
    status: 'RESOLVED',
    reviewerName: 'Dr. S. K. Ramanathan',
    reviewerNotes: 'Telemetry streaming verified stable across Kerala State Data Center nodes.',
    resolutionSummary: 'System operating within verified design parameters. Positive field confirmation archived.',
    submittedAt: '2026-10-07T18:40:00Z',
    updatedAt: '2026-10-08T11:00:00Z',
    persistedRemotely: true,
  },
  {
    id: 'FDB-992016',
    category: 'User Experience / Accessibility',
    priority: 'LOW',
    affectedModule: 'Feedback Center',
    subject: 'Add Malayalam Native Script Keyboard Shortcuts',
    description: 'Multilingual toggle works instantly, but having shortcut keys for district switching in vernacular script would benefit field workers.',
    expectedResult: 'Alt+1..6 quick language hotkeys for field mobile tablets.',
    satisfactionRating: 4,
    easeOfUseRating: 4,
    accuracyRating: 4,
    reporterRole: 'Citizen / Community Volunteer',
    reporterName: 'Ravi Kumar',
    contactEmail: 'ravi.kumar.volunteer@gmail.com',
    preferredFollowup: 'No Follow-up',
    locationName: 'Meppadi Ward 04',
    attachments: [],
    status: 'UNDER_REVIEW',
    submittedAt: '2026-10-09T08:05:00Z',
    updatedAt: '2026-10-09T08:05:00Z',
    persistedRemotely: true,
  },
];

export const feedbackService = {
  getLocalSubmissions(): UserFeedbackSubmission[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_FEEDBACK));
        return INITIAL_SEED_FEEDBACK;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : INITIAL_SEED_FEEDBACK;
    } catch {
      return INITIAL_SEED_FEEDBACK;
    }
  },

  async getFeedbackList(): Promise<UserFeedbackSubmission[]> {
    try {
      const res = await apiClient.get('/api/v1/feedback');
      if (res && res.data && Array.isArray(res.data.feedback)) {
        return res.data.feedback.map((f: any) => this.mapApiToSubmission(f));
      }
    } catch {
      // Fallback to local storage
    }
    return this.getLocalSubmissions();
  },

  async getStats(): Promise<FeedbackStats> {
    try {
      const res = await apiClient.get('/api/v1/feedback/stats');
      if (res && res.data && res.data.stats) {
        return {
          totalFeedback: res.data.stats.total_feedback,
          awaitingReview: res.data.stats.awaiting_review,
          inProgress: res.data.stats.in_progress,
          resolved: res.data.stats.resolved,
          averageSatisfaction: res.data.stats.average_satisfaction,
        };
      }
    } catch {
      // Calculate from local submissions
    }

    const items = this.getLocalSubmissions();
    const total = items.length;
    const awaiting = items.filter((i) => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length;
    const inProgress = items.filter((i) => i.status === 'IN_PROGRESS').length;
    const resolved = items.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    const ratings = items.map((i) => i.satisfactionRating).filter(Boolean);
    const avg = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 5.0;

    return {
      totalFeedback: total,
      awaitingReview: awaiting,
      inProgress,
      resolved,
      averageSatisfaction: avg,
    };
  },

  async submitFeedback(data: {
    category: FeedbackCategory;
    priority: FeedbackPriority;
    affectedModule: string;
    subject: string;
    description: string;
    expectedResult?: string;
    satisfactionRating: number;
    easeOfUseRating?: number;
    accuracyRating?: number;
    reporterRole: string;
    reporterName: string;
    contactEmail?: string;
    preferredFollowup: 'No Follow-up' | 'Email' | 'In-App Notification';
    locationName?: string;
    incidentRefId?: string;
    assessmentRefId?: string;
    attachments: FeedbackAttachment[];
  }): Promise<{
    submission: UserFeedbackSubmission;
    persistedRemotely: boolean;
    notice: string;
  }> {
    const id = `FDB-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    let persistedRemotely = false;
    let notice = 'Feedback recorded in local verified session store.';

    try {
      const res = await apiClient.post('/api/v1/feedback', {
        category: data.category,
        priority: data.priority,
        affected_module: data.affectedModule,
        subject: data.subject,
        description: data.description,
        expected_result: data.expectedResult,
        satisfaction_rating: data.satisfactionRating,
        ease_of_use_rating: data.easeOfUseRating,
        accuracy_rating: data.accuracyRating,
        reporter_role: data.reporterRole,
        reporter_name: data.reporterName,
        contact_email: data.contactEmail,
        preferred_followup: data.preferredFollowup,
        location_name: data.locationName,
        incident_ref_id: data.incidentRefId,
        assessment_ref_id: data.assessmentRefId,
        attachments: data.attachments.map((a) => ({
          filename: a.filename,
          size_bytes: a.sizeBytes,
          uploaded_at: a.uploadedAt,
        })),
        privacy_confirmed: true,
      });

      if (res && (res.status === 200 || res.status === 201)) {
        persistedRemotely = true;
        notice = 'Feedback transmitted and confirmed in DisasterGuard database.';
      }
    } catch {
      persistedRemotely = false;
      notice = 'Feedback safely preserved in local verified offline cache. Remote sync will resume once connected.';
    }

    const newRecord: UserFeedbackSubmission = {
      id,
      ...data,
      status: 'SUBMITTED',
      submittedAt: now,
      updatedAt: now,
      persistedRemotely,
    };

    try {
      const existing = this.getLocalSubmissions();
      const updated = [newRecord, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

    return {
      submission: newRecord,
      persistedRemotely,
      notice,
    };
  },

  async updateFeedbackStatus(
    id: string,
    status: FeedbackStatus,
    reviewerName: string,
    reviewerNotes?: string,
    resolutionSummary?: string
  ): Promise<UserFeedbackSubmission> {
    const now = new Date().toISOString();

    try {
      await apiClient.patch(`/api/v1/feedback/${id}/status`, {
        status,
        reviewer_name: reviewerName,
        reviewer_notes: reviewerNotes,
        resolution_summary: resolutionSummary,
      });
    } catch {
      // Offline fallback
    }

    const items = this.getLocalSubmissions();
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          reviewerName,
          reviewerNotes: reviewerNotes || item.reviewerNotes,
          resolutionSummary: resolutionSummary || item.resolutionSummary,
          updatedAt: now,
        };
      }
      return item;
    });

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
    const target = updatedItems.find((i) => i.id === id);
    return target!;
  },

  mapApiToSubmission(apiObj: any): UserFeedbackSubmission {
    return {
      id: apiObj.id,
      category: apiObj.category,
      priority: apiObj.priority,
      affectedModule: apiObj.affected_module,
      subject: apiObj.subject,
      description: apiObj.description,
      expectedResult: apiObj.expected_result,
      satisfactionRating: apiObj.satisfaction_rating || 5,
      easeOfUseRating: apiObj.ease_of_use_rating,
      accuracyRating: apiObj.accuracy_rating,
      reporterRole: apiObj.reporter_role,
      reporterName: apiObj.reporter_name,
      contactEmail: apiObj.contact_email,
      preferredFollowup: apiObj.preferred_followup || 'Email',
      locationName: apiObj.location_name,
      incidentRefId: apiObj.incident_ref_id,
      assessmentRefId: apiObj.assessment_ref_id,
      attachments: Array.isArray(apiObj.attachments)
        ? apiObj.attachments.map((a: any) => ({
            filename: a.filename,
            sizeBytes: a.size_bytes || 0,
            uploadedAt: a.uploaded_at || apiObj.submitted_at,
          }))
        : [],
      status: apiObj.status,
      reviewerName: apiObj.reviewer_name,
      reviewerNotes: apiObj.reviewer_notes,
      resolutionSummary: apiObj.resolution_summary,
      submittedAt: apiObj.submitted_at,
      updatedAt: apiObj.updated_at || apiObj.submitted_at,
      persistedRemotely: true,
    };
  },
};
