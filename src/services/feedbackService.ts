import { apiClient } from './api';

export type FeedbackType = 'BUG_REPORT' | 'FEATURE_REQUEST' | 'USABILITY_ISSUE' | 'GENERAL_FEEDBACK';

export interface UserFeedbackSubmission {
  id: string;
  type: FeedbackType;
  rating: number; // 1 to 5
  subject: string;
  description: string;
  affectedFeature?: string;
  userRole: string;
  userName: string;
  userEmail: string;
  submittedAt: string;
  status: 'PENDING_REVIEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  persistedRemotely: boolean;
}

const LOCAL_STORAGE_KEY = 'disasterguard_user_feedback_v1';

export const feedbackService = {
  // Get all submitted feedback items from local storage
  getLocalSubmissions(): UserFeedbackSubmission[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  // Save new submission
  async submitFeedback(data: {
    type: FeedbackType;
    rating: number;
    subject: string;
    description: string;
    affectedFeature?: string;
    userRole: string;
    userName: string;
    userEmail: string;
  }): Promise<{
    submission: UserFeedbackSubmission;
    persistedRemotely: boolean;
    notice: string;
  }> {
    const id = `FDB-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    let persistedRemotely = false;
    let notice = 'Feedback stored in local browser cache. Backend database synchronization pending.';

    // Integration boundary: try backend endpoint if available
    try {
      const res = await apiClient.post('/v1/feedback', {
        id,
        ...data,
        submitted_at: now,
      });
      if (res && (res.status === 200 || res.status === 201)) {
        persistedRemotely = true;
        notice = 'Feedback successfully transmitted to server database.';
      }
    } catch {
      // Backend does not have /v1/feedback yet; graceful fallback to client storage
      persistedRemotely = false;
      notice = 'Feedback recorded in local session log. Remote server persistence requires backend /v1/feedback endpoint.';
    }

    const newRecord: UserFeedbackSubmission = {
      id,
      ...data,
      submittedAt: now,
      status: 'PENDING_REVIEW',
      persistedRemotely,
    };

    // Store in localStorage
    try {
      const existing = this.getLocalSubmissions();
      const updated = [newRecord, ...existing];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch (e) {
      console.warn('Could not store feedback in localStorage:', e);
    }

    return {
      submission: newRecord,
      persistedRemotely,
      notice,
    };
  },

  // Clear local submissions (for testing)
  clearLocalSubmissions() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};
