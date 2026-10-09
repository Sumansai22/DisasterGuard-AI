import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquarePlus,
  Star,
  Bug,
  Lightbulb,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Loader2,
  Clock,
  Shield,
  Layers,
  Info,
  Paperclip,
  X,
  Upload,
  Eye,
  Check,
  Search,
  Filter,
  FileText,
  UserCheck,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { useTranslation } from '../i18n';
import {
  feedbackService,
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  FeedbackAttachment,
  UserFeedbackSubmission,
  FeedbackStats,
} from '../services/feedbackService';
import { SortOption, SortDirection, sortData } from '../types/sorting';
import { SortingToolbar } from '../components/common/SortingToolbar';

const CATEGORY_OPTIONS: { category: FeedbackCategory; icon: any; color: string; bg: string }[] = [
  { category: 'Bug / Technical Issue', icon: Bug, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  { category: 'Risk Prediction Accuracy', icon: Sparkles, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  { category: 'Map / GIS Issue', icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { category: 'Emergency SOS / Incident Workflow', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { category: 'Evacuation / Shelter Information', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { category: 'Field Inspection', icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  { category: 'User Experience / Accessibility', icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  { category: 'Feature Request', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { category: 'Data Quality / Incorrect Information', icon: Info, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  { category: 'Security / Privacy Concern', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  { category: 'General Feedback', icon: MessageSquarePlus, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
];

const MODULE_OPTIONS = [
  'Overview Dashboard',
  'Damage Assessment',
  'Risk Map & GIS',
  'Inspection Priorities',
  'Drone & Rescue',
  'Weather & Rainfall',
  'Evacuation Routes & Shelters',
  'Incidents & SOS',
  'Reports & History',
  'RBAC / Administration',
  'Feedback Center',
  'Other',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const FEEDBACK_SORT_OPTIONS: SortOption<UserFeedbackSubmission>[] = [
  {
    key: 'date',
    label: 'Submission Date',
    directionLabels: { desc: 'Newest First', asc: 'Oldest First' },
    getValue: (item) => item.submittedAt,
    defaultDirection: 'desc',
  },
  {
    key: 'rating',
    label: 'Star Rating',
    directionLabels: { desc: 'Highest Rating (5★ → 1★)', asc: 'Lowest Rating (1★ → 5★)' },
    getValue: (item) => item.satisfactionRating,
    defaultDirection: 'desc',
  },
  {
    key: 'priority',
    label: 'Priority Tier',
    directionLabels: { desc: 'Critical First', asc: 'Low First' },
    getValue: (item) => {
      const rank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return rank[item.priority] || 0;
    },
    defaultDirection: 'desc',
  },
  {
    key: 'category',
    label: 'Category',
    directionLabels: { asc: 'Category A–Z', desc: 'Category Z–A' },
    getValue: (item) => item.category,
    defaultDirection: 'asc',
  },
  {
    key: 'status',
    label: 'Status',
    directionLabels: { asc: 'Status A–Z', desc: 'Status Z–A' },
    getValue: (item) => item.status,
    defaultDirection: 'asc',
  },
];

export const FeedbackPage: React.FC = () => {
  const { currentUser, hasRole } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useFeedback();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'admin'>('submit');

  // Stats State
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 3,
    awaitingReview: 1,
    inProgress: 1,
    resolved: 1,
    averageSatisfaction: 4.3,
  });

  // History State
  const [submissions, setSubmissions] = useState<UserFeedbackSubmission[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<UserFeedbackSubmission | null>(null);

  // Sorting and Filtering State for History
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>('Bug / Technical Issue');
  const [priority, setPriority] = useState<FeedbackPriority>('MEDIUM');
  const [affectedModule, setAffectedModule] = useState<string>('Risk Map & GIS');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [expectedResult, setExpectedResult] = useState<string>('');
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [easeOfUseRating, setEaseOfUseRating] = useState<number>(4);
  const [accuracyRating, setAccuracyRating] = useState<number>(4);
  const [reporterRole, setReporterRole] = useState<string>(currentUser.designation || currentUser.role);
  const [reporterName, setReporterName] = useState<string>(currentUser.name);
  const [contactEmail, setContactEmail] = useState<string>(currentUser.email);
  const [preferredFollowup, setPreferredFollowup] = useState<'No Follow-up' | 'Email' | 'In-App Notification'>('Email');
  const [locationName, setLocationName] = useState<string>('Munnar Tea Estate Zone A');
  const [incidentRefId, setIncidentRefId] = useState<string>('');
  const [assessmentRefId, setAssessmentRefId] = useState<string>('');
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [privacyConfirmed, setPrivacyConfirmed] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Review State
  const [adminReviewStatus, setAdminReviewStatus] = useState<FeedbackStatus>('IN_PROGRESS');
  const [adminReviewNotes, setAdminReviewNotes] = useState<string>('');
  const [adminResolutionSummary, setAdminResolutionSummary] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const loadData = async () => {
    setLoadingHistory(true);
    try {
      const [listData, statsData] = await Promise.all([
        feedbackService.getFeedbackList(),
        feedbackService.getStats(),
      ]);
      setSubmissions(listData);
      setStats(statsData);
      if (listData.length > 0 && !selectedRecord) {
        setSelectedRecord(listData[0]);
      }
    } catch {
      const local = feedbackService.getLocalSubmissions();
      setSubmissions(local);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync reporter info on persona change
  useEffect(() => {
    setReporterRole(currentUser.designation || currentUser.role);
    setReporterName(currentUser.name);
    setContactEmail(currentUser.email);
  }, [currentUser]);

  // File Attachment Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: FeedbackAttachment[] = [];
    const MAX_SIZE_MB = 10;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        showError(`Attachment "${file.name}" exceeds the ${MAX_SIZE_MB}MB limit.`);
        continue;
      }

      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.log')) {
        showWarning(`File format of "${file.name}" is not explicitly verified. Supporting diagnostic or image files recommended.`);
      }

      newAttachments.push({
        filename: file.name,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
      showSuccess(`Attached ${newAttachments.length} file(s) for diagnostic verification.`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    showInfo('Attachment removed.');
  };

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!subject.trim()) {
      errors.subject = 'Subject is required. Please provide a concise summary.';
    } else if (subject.trim().length < 5) {
      errors.subject = 'Subject title must be at least 5 characters.';
    }

    if (!description.trim()) {
      errors.description = 'Detailed description is required to reproduce or assess the issue.';
    } else if (description.trim().length < 15) {
      errors.description = 'Description must be at least 15 characters long.';
    }

    if (satisfactionRating < 1 || satisfactionRating > 5) {
      errors.satisfactionRating = 'Please select a valid rating from 1 to 5 stars.';
    }

    if (!privacyConfirmed) {
      errors.privacyConfirmed = 'Please confirm that no secrets, passwords, or private tokens are contained.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Feedback Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please correct the highlighted validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await feedbackService.submitFeedback({
        category,
        priority,
        affectedModule,
        subject: subject.trim(),
        description: description.trim(),
        expectedResult: expectedResult.trim() || undefined,
        satisfactionRating,
        easeOfUseRating,
        accuracyRating,
        reporterRole,
        reporterName,
        contactEmail: contactEmail.trim() || undefined,
        preferredFollowup,
        locationName,
        incidentRefId: incidentRefId.trim() || undefined,
        assessmentRefId: assessmentRefId.trim() || undefined,
        attachments,
      });

      showSuccess(`Feedback ${result.submission.id} submitted successfully! ${result.notice}`);

      // Reset form
      setSubject('');
      setDescription('');
      setExpectedResult('');
      setAttachments([]);
      setPrivacyConfirmed(false);
      setValidationErrors({});

      // Reload feedback records & switch to history
      await loadData();
      setActiveTab('history');
      setSelectedRecord(result.submission);
    } catch {
      showError('Feedback submission failed. Your entered information has been preserved. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form
  const handleResetForm = () => {
    if (subject.trim() || description.trim() || attachments.length > 0) {
      if (!window.confirm('Reset the feedback submission form? All unsubmitted inputs will be cleared.')) {
        return;
      }
    }
    setSubject('');
    setDescription('');
    setExpectedResult('');
    setAttachments([]);
    setPrivacyConfirmed(false);
    setValidationErrors({});
    showInfo('Feedback form reset.');
  };

  // Save Draft in Session
  const handleSaveDraft = () => {
    try {
      const draft = {
        category,
        priority,
        affectedModule,
        subject,
        description,
        expectedResult,
        satisfactionRating,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('dg_feedback_draft_v2', JSON.stringify(draft));
      showSuccess('Draft saved locally in browser storage.');
    } catch {
      showWarning('Unable to persist draft to localStorage.');
    }
  };

  // Admin Status Update Handler
  const handleUpdateStatus = async () => {
    if (!selectedRecord) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await feedbackService.updateFeedbackStatus(
        selectedRecord.id,
        adminReviewStatus,
        currentUser.name,
        adminReviewNotes.trim() || undefined,
        adminResolutionSummary.trim() || undefined
      );
      setSelectedRecord(updated);
      showSuccess(`Feedback ${selectedRecord.id} status updated to ${adminReviewStatus}.`);
      await loadData();
    } catch {
      showError('Failed to update feedback status. Please retry.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filter & Sort Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (categoryFilter !== 'ALL' && sub.category !== categoryFilter) return false;
      if (priorityFilter !== 'ALL' && sub.priority !== priorityFilter) return false;
      if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
      if (moduleFilter !== 'ALL' && sub.affectedModule !== moduleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = sub.subject.toLowerCase().includes(q);
        const matchesId = sub.id.toLowerCase().includes(q);
        const matchesDesc = sub.description.toLowerCase().includes(q);
        if (!matchesSubject && !matchesId && !matchesDesc) return false;
      }
      return true;
    });
  }, [submissions, categoryFilter, priorityFilter, statusFilter, moduleFilter, searchQuery]);

  const activeSortOption = FEEDBACK_SORT_OPTIONS.find((o) => o.key === sortKey) || FEEDBACK_SORT_OPTIONS[0];
  const sortedSubmissions = useMemo(() => {
    return sortData(filteredSubmissions, activeSortOption, sortDirection);
  }, [filteredSubmissions, activeSortOption, sortDirection]);

  const isAdminOrReviewer = hasRole(['ADMIN', 'OPERATOR']);

  return (
    <div className="space-y-6 max-w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-orange-600/10 text-orange-600 border border-orange-200">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('nav.feedbackCenter', 'Feedback & Experience Center')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Report issues, share operational feedback, and help improve disaster assessment and emergency response workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="px-3 py-1.5 bg-slate-900 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentUser.role} • {currentUser.name}</span>
          </span>
        </div>
      </div>

      {/* Top Data-Backed KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">TOTAL FEEDBACK</span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{stats.totalFeedback}</span>
          <span className="text-[11px] text-slate-500">Documented Inquiries</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-500 block">AWAITING REVIEW</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">{stats.awaitingReview}</span>
          <span className="text-[11px] text-amber-700 font-semibold">Triage Queue</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-blue-500 block">IN PROGRESS</span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">{stats.inProgress}</span>
          <span className="text-[11px] text-blue-700 font-semibold">Assigned & Underway</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-500 block">RESOLVED</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{stats.resolved}</span>
          <span className="text-[11px] text-emerald-700 font-semibold">Verified Closed</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-mono font-bold uppercase text-orange-500 block">SATISFACTION RATING</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-orange-600 font-mono">{stats.averageSatisfaction}</span>
            <span className="text-xs text-slate-400 font-mono">/ 5.0</span>
            <div className="flex text-amber-400 ml-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(stats.averageSatisfaction) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-500">Operational Score</span>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'submit'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Feedback</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Feedback History ({submissions.length})</span>
        </button>

        {isAdminOrReviewer && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Review & Manage Feedback (Admin)</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBMIT FEEDBACK FORM                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'submit' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6 text-xs">
          {/* Section A: Feedback Classification */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold font-mono">
                  A
                </span>
                <span>Feedback Classification & Context</span>
              </h2>
              <span className="text-[11px] text-red-500 font-semibold">* Required fields</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Feedback Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Urgency / Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as FeedbackPriority)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono font-bold cursor-pointer"
                >
                  <option value="LOW">LOW — Routine Suggestion</option>
                  <option value="MEDIUM">MEDIUM — Normal Priority</option>
                  <option value="HIGH">HIGH — Elevated Concern</option>
                  <option value="CRITICAL">CRITICAL — Mission-Blocking / Severe Failure</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Affected Platform Module <span className="text-red-500">*</span>
                </label>
                <select
                  value={affectedModule}
                  onChange={(e) => setAffectedModule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium cursor-pointer"
                >
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subject Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (validationErrors.subject) {
                    setValidationErrors((prev) => ({ ...prev, subject: '' }));
                  }
                }}
                placeholder="e.g. Soil Moisture Layer Inversion in Western Ghats Sector"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium ${
                  validationErrors.subject ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {validationErrors.subject && (
                <p className="text-[11px] text-red-600 mt-1 font-semibold">{validationErrors.subject}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (validationErrors.description) {
                    setValidationErrors((prev) => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Describe what occurred, steps to reproduce, or specific operational feedback..."
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs leading-relaxed ${
                  validationErrors.description ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              {validationErrors.description && (
                <p className="text-[11px] text-red-600 mt-1 font-semibold">{validationErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Expected Result / Suggested Improvement <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                placeholder="What behavior or outcome did you expect to see?"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Section B: User Experience Rating */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold font-mono">
                  B
                </span>
                <span>User Experience & Satisfaction Rating</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Satisfaction */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Overall Satisfaction *</span>
                  <span className="font-mono text-xs font-bold text-orange-600">
                    {satisfactionRating}★ ({RATING_DESCRIPTIONS[satisfactionRating]})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSatisfactionRating(star)}
                      className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} Star - ${RATING_DESCRIPTIONS[star]}`}
                      aria-label={`${star} Stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= satisfactionRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ease of Use */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Ease of Use</span>
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {easeOfUseRating}★ ({RATING_DESCRIPTIONS[easeOfUseRating]})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEaseOfUseRating(star)}
                      className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`${star} Stars Ease of Use`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= easeOfUseRating ? 'fill-blue-400 text-blue-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Accuracy & Usefulness */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Accuracy & Data Quality</span>
                  <span className="font-mono text-xs font-bold text-emerald-600">
                    {accuracyRating}★ ({RATING_DESCRIPTIONS[accuracyRating]})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setAccuracyRating(star)}
                      className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                      aria-label={`${star} Stars Accuracy`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= accuracyRating ? 'fill-emerald-400 text-emerald-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section C: Reporter Information & Operational Context */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold font-mono">
                  C
                </span>
                <span>Reporter Identity & Operational Linkage</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reporter Persona / Role</label>
                <input
                  type="text"
                  value={reporterRole}
                  onChange={(e) => setReporterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Email (Optional)</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="For follow-up notifications"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Follow-up</label>
                <select
                  value={preferredFollowup}
                  onChange={(e) => setPreferredFollowup(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs cursor-pointer"
                >
                  <option value="Email">Email Notification</option>
                  <option value="In-App Notification">In-App Notification</option>
                  <option value="No Follow-up">No Follow-up (Anonymous)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Reference ID</label>
                <input
                  type="text"
                  value={incidentRefId}
                  onChange={(e) => setIncidentRefId(e.target.value)}
                  placeholder="e.g. INC-NDRF-8821"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section D: Evidence and Attachments */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold font-mono">
                  D
                </span>
                <span>Diagnostic Evidence & Screenshots</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">PNG, JPG, PDF, LOG (Max 10MB)</span>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-orange-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.log,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="feedback-attachment-input"
              />
              <label
                htmlFor="feedback-attachment-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 py-2"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs hover:text-orange-600">
                    Click to select files
                  </span>{' '}
                  <span className="text-slate-500">or drag diagnostic screenshots here</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Files are validated for security prior to submission.
                </span>
              </label>
            </div>

            {/* Selected Attachments List */}
            {attachments.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="font-bold text-slate-700 text-[11px]">Selected Supporting Files ({attachments.length}):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-4 h-4 text-orange-600 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-slate-800 truncate text-xs">{file.filename}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {(file.sizeBytes / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section E: Privacy and Confirmation */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConfirmed}
                onChange={(e) => {
                  setPrivacyConfirmed(e.target.checked);
                  if (validationErrors.privacyConfirmed) {
                    setValidationErrors((prev) => ({ ...prev, privacyConfirmed: '' }));
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-600 leading-relaxed">
                I confirm that this feedback does not intentionally contain secrets, passwords, or authentication tokens. Submitted information will be processed securely for platform quality and disaster coordination improvements.
              </span>
            </label>
            {validationErrors.privacyConfirmed && (
              <p className="text-[11px] text-red-600 font-semibold">{validationErrors.privacyConfirmed}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Form</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Server...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 2. FEEDBACK HISTORY SECTION                                               */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Sorting & Filter Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <SortingToolbar
              sortOptions={FEEDBACK_SORT_OPTIONS}
              activeSortKey={sortKey}
              activeDirection={sortDirection}
              onSortChange={(k, d) => {
                setSortKey(k);
                setSortDirection(d);
              }}
              defaultSortKey="date"
              defaultDirection="desc"
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search feedback subject, ID, or description..."
              totalCount={submissions.length}
              filteredCount={sortedSubmissions.length}
              onReset={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setPriorityFilter('ALL');
                setStatusFilter('ALL');
                setModuleFilter('ALL');
                setSortKey('date');
                setSortDirection('desc');
              }}
            />

            {/* Filters Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Module</label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="ALL">All Modules</option>
                  {MODULE_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List & Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List Table / Cards (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Submitted Feedback Records ({sortedSubmissions.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">Chronological Audit Log</span>
              </div>

              {sortedSubmissions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <MessageCircle className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No feedback entries match your filters.</p>
                  <p className="text-[11px]">Adjust your search query or reset the filter toolbar above.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1 space-y-1">
                  {sortedSubmissions.map((sub) => {
                    const isSelected = selectedRecord?.id === sub.id;
                    const statusBadge =
                      sub.status === 'RESOLVED' || sub.status === 'CLOSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : sub.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700';

                    const priorityBadge =
                      sub.priority === 'CRITICAL'
                        ? 'bg-red-100 text-red-800 font-bold'
                        : sub.priority === 'HIGH'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-700';

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedRecord(sub)}
                        className={`p-3 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50/80 border border-orange-300 ring-1 ring-orange-400/40'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-slate-400">{sub.id}</span>
                              <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase ${priorityBadge}`}>
                                {sub.priority}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] uppercase ${statusBadge}`}>
                                {sub.status.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-amber-500 font-mono font-bold">
                                {sub.satisfactionRating}★
                              </span>
                            </div>
                            <h3 className="font-bold text-xs text-slate-900 truncate">{sub.subject}</h3>
                            <p className="text-[11px] text-slate-500 truncate">{sub.description}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>Module: {sub.affectedModule}</span>
                              <span>•</span>
                              <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail Dossier View (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
              {selectedRecord ? (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-orange-600 block">
                        RECORD ID: {selectedRecord.id}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">{selectedRecord.subject}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        selectedRecord.status === 'RESOLVED' || selectedRecord.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedRecord.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedRecord.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Category & Module</span>
                      <div className="font-bold text-slate-800">
                        {selectedRecord.category} • <span className="text-orange-600">{selectedRecord.affectedModule}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Description</span>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {selectedRecord.description}
                      </p>
                    </div>

                    {selectedRecord.expectedResult && (
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">Expected Result</span>
                        <p className="text-slate-600 italic leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-200">
                          "{selectedRecord.expectedResult}"
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Reporter</span>
                        <span className="font-bold text-slate-800">{selectedRecord.reporterName}</span>
                        <span className="text-slate-500 block text-[10px]">{selectedRecord.reporterRole}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">Submission Time</span>
                        <span className="font-mono text-slate-700">{new Date(selectedRecord.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Attachments Display */}
                    {selectedRecord.attachments.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                          Attachments ({selectedRecord.attachments.length})
                        </span>
                        <div className="space-y-1.5">
                          {selectedRecord.attachments.map((att, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Paperclip className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span className="font-bold text-slate-800 truncate">{att.filename}</span>
                              </div>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {(att.sizeBytes / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolution / Reviewer Notes */}
                    {selectedRecord.resolutionSummary && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resolution Notes:</span>
                        </div>
                        <p className="text-[11px] text-emerald-900 leading-snug">
                          {selectedRecord.resolutionSummary}
                        </p>
                        {selectedRecord.reviewerName && (
                          <span className="text-[10px] font-mono text-emerald-700 block">
                            Reviewed by: {selectedRecord.reviewerName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  Select a feedback item on the left to view complete dossier records.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADMINISTRATOR REVIEW SECTION                                           */}
      {/* ========================================================================= */}
      {activeTab === 'admin' && isAdminOrReviewer && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <h2 className="font-extrabold text-slate-900 text-sm">
                  Authorized Feedback Management & Status Transitions
                </h2>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Audit logs, triage prioritization, internal reviewer notes, and resolution dispatches.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
              ADMINISTRATIVE WORKSPACE
            </span>
          </div>

          {selectedRecord ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">TARGET INQUIRY: {selectedRecord.id}</span>
                  <div className="font-bold text-slate-900 text-xs">{selectedRecord.subject}</div>
                  <div className="text-[11px] text-slate-500">
                    Category: {selectedRecord.category} • Current Status: <strong>{selectedRecord.status}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Reporter: {selectedRecord.reporterName} ({selectedRecord.reporterRole})
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Update Status Transition</label>
                  <select
                    value={adminReviewStatus}
                    onChange={(e) => setAdminReviewStatus(e.target.value as FeedbackStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono font-bold cursor-pointer"
                  >
                    <option value="SUBMITTED">SUBMITTED — Newly Logged</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW — In Triage</option>
                    <option value="IN_PROGRESS">IN_PROGRESS — Engineering Assigned</option>
                    <option value="RESOLVED">RESOLVED — Fix Deployed / Addressed</option>
                    <option value="CLOSED">CLOSED — Concluded Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Lead Reviewer</label>
                  <input
                    type="text"
                    value={currentUser.name}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Administrative Notes <span className="text-slate-400 font-normal">(Protected, never exposed to reporters)</span>
                </label>
                <textarea
                  rows={3}
                  value={adminReviewNotes}
                  onChange={(e) => setAdminReviewNotes(e.target.value)}
                  placeholder="Record confidential engineering notes, sensor serial numbers, or deployment hashes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Public Resolution Summary <span className="text-slate-400 font-normal">(Visible in inquiry history)</span>
                </label>
                <input
                  type="text"
                  value={adminResolutionSummary}
                  onChange={(e) => setAdminResolutionSummary(e.target.value)}
                  placeholder="e.g. Model threshold re-calibrated; verified against ground truth."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Status...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Apply Status Transition</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              No target record selected. Please select an inquiry from the Feedback History tab first.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
