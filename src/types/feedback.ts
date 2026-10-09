export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface FeedbackAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  message: string;
  title?: string;
  details?: string;
  timestamp: number;
  duration?: number; // ms, undefined or 0 for persistent
  action?: FeedbackAction;
  dismissible?: boolean;
}

export interface FeedbackOptions {
  title?: string;
  details?: string;
  duration?: number;
  action?: FeedbackAction;
  dismissible?: boolean;
}

export interface FeedbackContextValue {
  feedbacks: FeedbackItem[];
  showSuccess: (message: string, options?: FeedbackOptions) => string;
  showError: (message: string, options?: FeedbackOptions) => string;
  showWarning: (message: string, options?: FeedbackOptions) => string;
  showInfo: (message: string, options?: FeedbackOptions) => string;
  showLoading: (message: string, options?: FeedbackOptions) => string;
  updateFeedback: (id: string, updates: Partial<FeedbackItem>) => void;
  dismissFeedback: (id: string) => void;
  clearAllFeedback: () => void;
}
