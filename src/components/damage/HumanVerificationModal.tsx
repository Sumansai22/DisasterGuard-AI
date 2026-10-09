import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import {
  DamageAssessmentRecord,
  InspectionPriorityTier,
  HumanVerificationStatus,
} from '../../types/damageAssessment';
import { damageAssessmentService } from '../../services/damageAssessmentService';
import { useFeedback } from '../../context/FeedbackContext';

interface HumanVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: DamageAssessmentRecord;
  onVerified: (updated: DamageAssessmentRecord) => void;
}

export const HumanVerificationModal: React.FC<HumanVerificationModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onVerified,
}) => {
  const { showSuccess, showError } = useFeedback();
  const [reviewerName, setReviewerName] = useState('Dr. S. K. Ramanathan');
  const [reviewerRole, setReviewerRole] = useState('State Disaster Management Authority (SDMA) Chief Geologist');
  const [badgeId, setBadgeId] = useState('SDMA-OFFICER-108');
  const [decision, setDecision] = useState<HumanVerificationStatus>('VERIFIED_CONFIRMED');
  const [adjustedPriority, setAdjustedPriority] = useState<InspectionPriorityTier>(assessment.priorityTier);
  const [justification, setJustification] = useState(
    'Satellite change detection and drone footage corroborate extensive structural masonry loss. Field priority confirmed.'
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !justification.trim()) {
      setError('Reviewer Name and Justification Rationale are required for auditability.');
      showError('Please complete all required fields.');
      return;
    }

    const updated = damageAssessmentService.verifyAssessment(assessment.id, {
      reviewerName: reviewerName.trim(),
      reviewerRole: reviewerRole.trim(),
      badgeId: badgeId.trim(),
      decision,
      adjustedPriority: adjustedPriority !== assessment.priorityTier ? adjustedPriority : undefined,
      justification: justification.trim(),
    });

    if (updated) {
      showSuccess(`Assessment ${assessment.id} verified as ${decision.replace(/_/g, ' ')}.`);
      onVerified(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-4 sm:p-6 text-slate-800 relative font-sans max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Human Verification & Ground Truth Audit
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {assessment.id} • {assessment.locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 py-4 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* AI vs Reviewer Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <BadgeAlert className="w-4 h-4" />
              <span>PS-53 Protocol: Human-in-the-Loop Safeguard</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700">
              AI estimates must never replace confirmed physical inspections. Your verification decision will be stamped onto the immutable audit log and transmitted to district response teams.
            </p>
          </div>

          {/* Reviewer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Inspector / Officer Name *</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Badge ID / Agency Code</label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Role / Designation</label>
            <input
              type="text"
              value={reviewerRole}
              onChange={(e) => setReviewerRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Verification Decision */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Verification Decision *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDecision('VERIFIED_CONFIRMED')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  decision === 'VERIFIED_CONFIRMED'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Assessment</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Damage evidence verified; advance to dispatch
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDecision('RE_INSPECTION_REQUESTED')}
                className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                  decision === 'RE_INSPECTION_REQUESTED'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-amber-700">
                  <RotateCcw className="w-4 h-4" />
                  <span>Request Drone Re-scan</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  High uncertainty; need lower altitude UAV
                </div>
              </button>
            </div>
          </div>

          {/* Priority Tier Adjustment */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Field Priority Tier (Current AI: <span className="font-mono text-orange-600">{assessment.priorityTier.replace('_', ' ')}</span>)
            </label>
            <select
              value={adjustedPriority}
              onChange={(e) => setAdjustedPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
            >
              <option value="P1_URGENT">P1 URGENT — Deploy within 2 Hours</option>
              <option value="P2_HIGH">P2 HIGH — Inspect within 6 Hours</option>
              <option value="P3_MEDIUM">P3 MEDIUM — Inspect within 24 Hours</option>
              <option value="P4_LOW">P4 LOW — Routine Survey within 72 Hours</option>
            </select>
          </div>

          {/* Justification Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Audit Justification / Decision Rationale *
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Provide evidence rationale for confirming or modifying priority..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign & Commit Verification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
