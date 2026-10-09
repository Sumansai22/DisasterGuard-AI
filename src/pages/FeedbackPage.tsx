import React, { useState, useEffect } from 'react';
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
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import {
  feedbackService,
  FeedbackType,
  UserFeedbackSubmission,
} from '../services/feedbackService';

const FEEDBACK_TYPES: { type: FeedbackType; label: string; icon: any; color: string; bg: string }[] = [
  {
    type: 'BUG_REPORT',
    label: 'Bug Report',
    icon: Bug,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200 hover:bg-red-100',
  },
  {
    type: 'FEATURE_REQUEST',
    label: 'Feature Request',
    icon: Lightbulb,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  },
  {
    type: 'USABILITY_ISSUE',
    label: 'Usability Issue',
    icon: Sparkles,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  },
  {
    type: 'GENERAL_FEEDBACK',
    label: 'General Feedback',
    icon: MessageCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  },
];

const PLATFORM_FEATURES = [
  'General Platform / Overview Dashboard',
  'PS-53 Damage Prioritization & Inspection Queue',
  'Map & GIS Multi-Hazard Risk Visualization',
  'Drone & Rescue Dispatch Fleet',
  'Weather Telemetry & Rainfall Monitoring',
  'Evacuation Routes & Safe Shelters',
  'Incidents & Emergency SOS',
  'Reports & Historical Records',
  'Admin Center & Model Lifecycle',
  'Language Localization & UI Accessibility',
];

export const FeedbackPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError, showWarning } = useFeedback();

  const [type, setType] = useState<FeedbackType>('GENERAL_FEEDBACK');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [affectedFeature, setAffectedFeature] = useState<string>(PLATFORM_FEATURES[0]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ subject?: string; description?: string }>({});
  const [submissions, setSubmissions] = useState<UserFeedbackSubmission[]>([]);
  const [integrationNotice, setIntegrationNotice] = useState<string | null>(null);

  useEffect(() => {
    setSubmissions(feedbackService.getLocalSubmissions());
  }, []);

  const validateForm = (): boolean => {
    const errors: { subject?: string; description?: string } = {};

    if (!subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (subject.trim().length < 5) {
      errors.subject = 'Subject must be at least 5 characters long';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length < 15) {
      errors.description = 'Description must be at least 15 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReset = () => {
    setSubject('');
    setDescription('');
    setRating(5);
    setType('GENERAL_FEEDBACK');
    setAffectedFeature(PLATFORM_FEATURES[0]);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showWarning('Please correct the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await feedbackService.submitFeedback({
        type,
        rating,
        subject: subject.trim(),
        description: description.trim(),
        affectedFeature,
        userRole: currentUser.role,
        userName: currentUser.name,
        userEmail: currentUser.email,
      });

      setSubmissions(feedbackService.getLocalSubmissions());
      setIntegrationNotice(result.notice);
      showSuccess(`Feedback "${subject.slice(0, 30)}..." submitted successfully`);
      handleReset();
    } catch (err: any) {
      showError(err?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return 'Poor (Needs Major Improvement)';
      case 2:
        return 'Fair (Encountered Friction)';
      case 3:
        return 'Good (Acceptable Performance)';
      case 4:
        return 'Very Good (Satisfied)';
      case 5:
        return 'Excellent (Exceptional Reliability)';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200 shadow-2xs">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  User Feedback & Platform Diagnostics
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                  PS-53 Quality Assurance
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Submit usability feedback, report software bugs, or propose operational features to improve disaster response efficiency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800">Current Submitter: </span>
              <span className="font-bold text-slate-900">{currentUser.name}</span> ({currentUser.role})
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Hotline Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Life-Threatening Emergency Notice: </strong>
          This feedback form is strictly for software improvements and bug tracking. Do not use this form to report active disaster distress.
          For immediate rescue, trigger the top bar <strong className="text-red-700">EMERGENCY SOS</strong> button or dial national dispatch hotlines (<strong>112 / 1078</strong>).
        </div>
      </div>

      {/* Main Grid: Form (Left) & History / Integration Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container (7 Columns on Large) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Feedback Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Feedback Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FEEDBACK_TYPES.map((item) => {
                  const isSelected = type === item.type;
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => setType(item.type)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-500/20 text-orange-950 font-bold'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Satisfaction Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                2. Satisfaction & Usability Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                      title={`${star} Star`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>
            </div>

            {/* Affected Feature */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                3. Affected Platform Component / Feature
              </label>
              <select
                value={affectedFeature}
                onChange={(e) => setAffectedFeature(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
              >
                {PLATFORM_FEATURES.map((feat) => (
                  <option key={feat} value={feat}>
                    {feat}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  4. Subject Summary <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{subject.length}/100</span>
              </div>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Priority sorting resets after applying rainfall threshold filter..."
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (formErrors.subject) setFormErrors({ ...formErrors, subject: undefined });
                }}
                className={`w-full text-xs font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all ${
                  formErrors.subject
                    ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
              {formErrors.subject && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.subject}</p>
              )}
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  5. Detailed Description & Reproduction Steps <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">{description.length}/500</span>
              </div>
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Describe what occurred, expected outcome, device/browser details, and suggestions..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formErrors.description) setFormErrors({ ...formErrors, description: undefined });
                }}
                className={`w-full text-xs font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white border rounded-xl p-3.5 focus:outline-none focus:ring-2 transition-all resize-none ${
                  formErrors.description
                    ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
              {formErrors.description && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{formErrors.description}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-bold shadow-md shadow-orange-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar / History Column (5 Columns on Large) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Integration Boundary Notice */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Persistence Architecture
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submissions are captured through the verified frontend integration boundary. Entries are cached in browser local storage and queued for backend synchronization with <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">POST /v1/feedback</code>.
            </p>
            {integrationNotice && (
              <div className="mt-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 font-medium">
                {integrationNotice}
              </div>
            )}
          </div>

          {/* Submission History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Recent Submissions ({submissions.length})
                </h3>
              </div>
              {submissions.length > 0 && (
                <button
                  onClick={() => {
                    feedbackService.clearLocalSubmissions();
                    setSubmissions([]);
                  }}
                  className="text-[10px] text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-1">
                <MessageSquarePlus className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No submissions yet</p>
                <p className="text-[11px]">Your submitted feedback records will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {sub.id}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: sub.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="font-bold text-slate-900 leading-tight">
                      {sub.subject}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>

                    <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{sub.type.replace(/_/g, ' ')}</span>
                      <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
