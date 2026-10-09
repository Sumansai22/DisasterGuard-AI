import React from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Cpu,
  Layers,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { DamageAssessmentRecord } from '../../types/damageAssessment';
import { damageAssessmentService } from '../../services/damageAssessmentService';
import { useFeedback } from '../../context/FeedbackContext';

interface DamageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: DamageAssessmentRecord;
}

export const DamageReportModal: React.FC<DamageReportModalProps> = ({
  isOpen,
  onClose,
  assessment,
}) => {
  const { showSuccess, showError } = useFeedback();

  if (!isOpen) return null;

  const handlePrint = () => {
    try {
      damageAssessmentService.logReportGenerated(assessment.id, 'Officer In-Charge');
      showSuccess('Report document prepared for print / PDF export.');
      window.print();
    } catch {
      showError('Unable to generate print dialog.');
    }
  };

  const handleDownloadDossier = () => {
    try {
      damageAssessmentService.logReportGenerated(assessment.id, 'Officer In-Charge');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(assessment, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `NDMA-PS53-Report-${assessment.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showSuccess('Report downloaded successfully.');
    } catch {
      showError('Failed to download report dossier.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-4 sm:p-8 text-slate-800 relative font-sans max-h-[94vh] flex flex-col my-auto">
        {/* Modal Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                Disaster Damage & Inspection Prioritization Report (PS-53)
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Document Ref: NDMA-PS53-{assessment.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDossier}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Download structured JSON report dossier"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Dossier</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-6 text-xs text-slate-800">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-orange-600 text-white uppercase tracking-wider">
                  NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)
                </span>
                <span className="font-mono text-[10px] text-slate-500">PS-53 PROTOCOL</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                PHYSICAL DAMAGE ASSESSMENT & INSPECTION PRIORITIZATION REPORT
              </h1>
              <p className="text-[11px] text-slate-600 font-medium">
                DisasterGuard AI • Ai Verse (Team Heroshi) • Automated Multi-Source Damage Prioritization System
              </p>
            </div>
            <div className="sm:text-right font-mono text-[11px] shrink-0 space-y-0.5">
              <div><strong>REPORT ID:</strong> {assessment.id}</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString()}</div>
              <div><strong>CLASSIFICATION:</strong> RESTRICTED (EMERGENCY RESPONSE)</div>
            </div>
          </div>

          {/* Incident & Geographic Context */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">DISASTER EVENT</div>
              <div className="font-bold text-slate-900 mt-0.5">{assessment.disasterEvent}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">HAZARD VECTOR</div>
              <div className="font-bold text-slate-900 mt-0.5">{assessment.disasterType}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">TARGET LOCATION</div>
              <div className="font-bold text-slate-900 mt-0.5">{assessment.locationName}</div>
              <div className="text-[10px] font-mono text-slate-500">{assessment.district}, {assessment.state}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">COORDINATES</div>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                {assessment.coordinates.lat.toFixed(4)}°N, {assessment.coordinates.lng.toFixed(4)}°E
              </div>
            </div>
          </div>

          {/* Executive Priority & Severity Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border-2 border-red-500 bg-red-50/70">
              <div className="text-[10px] font-bold uppercase tracking-wider text-red-700">INSPECTION PRIORITY TIER</div>
              <div className="text-xl font-black text-red-950 font-mono mt-0.5">
                {assessment.priorityTier.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-red-700 font-semibold mt-1">
                {assessment.priorityTier === 'P1_URGENT'
                  ? 'Immediate Field Ground Deployment (< 2 Hours)'
                  : assessment.priorityTier === 'P2_HIGH'
                  ? 'Field Inspection within 6 Hours'
                  : 'Survey within 24–72 Hours'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ESTIMATED PHYSICAL DAMAGE</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {assessment.estimatedDamageCategory}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                EMS-98 Scale Grade (Structural Integrity Breakdown)
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">WEIGHTED PRIORITY SCORE</div>
              <div className="text-xl font-black text-orange-600 font-mono mt-0.5">
                {assessment.scores.compositePriorityScore} / 100
              </div>
              <div className="text-[10px] text-slate-600 mt-1">
                Uncertainty Penalty: {assessment.scores.uncertaintyScore}%
              </div>
            </div>
          </div>

          {/* Transparent Scoring Rationale Breakdown */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              Explainable Prioritization Rationale & Weight Matrix
            </h3>
            <p className="text-slate-700 text-xs leading-relaxed italic border-l-2 border-orange-500 pl-3">
              "{assessment.priorityRationale}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-100">
                <span className="text-slate-500 block text-[10px]">Physical Damage (35%):</span>
                <span className="font-bold text-slate-800">{assessment.scores.physicalDamageScore}/100</span>
              </div>
              <div className="p-2 rounded bg-slate-100">
                <span className="text-slate-500 block text-[10px]">Population Exposure (25%):</span>
                <span className="font-bold text-slate-800">{assessment.scores.populationExposureScore}/100</span>
              </div>
              <div className="p-2 rounded bg-slate-100">
                <span className="text-slate-500 block text-[10px]">Critical Infrastructure (20%):</span>
                <span className="font-bold text-slate-800">{assessment.scores.criticalInfrastructureScore}/100</span>
              </div>
              <div className="p-2 rounded bg-slate-100">
                <span className="text-slate-500 block text-[10px]">Hazard Escalation (15%):</span>
                <span className="font-bold text-slate-800">{assessment.scores.hazardEscalationScore}/100</span>
              </div>
            </div>
          </div>

          {/* Bitemporal Visual Imagery Evidence Evidence */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
              Bitemporal Satellite / Drone Evidence Record
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="h-44 bg-slate-200">
                  <img src={assessment.preImage.url} alt="Pre-Disaster" className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5 bg-slate-50 text-[10px] font-mono space-y-0.5">
                  <div className="font-bold text-emerald-800">PRE-DISASTER BASELINE</div>
                  <div>Source: {assessment.preImage.sourcePlatform} ({assessment.preImage.resolutionMeters}m res)</div>
                  <div>Captured: {new Date(assessment.preImage.captureDate).toLocaleString()}</div>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="h-44 bg-slate-200">
                  <img src={assessment.postImage.url} alt="Post-Disaster" className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5 bg-slate-50 text-[10px] font-mono space-y-0.5">
                  <div className="font-bold text-red-800">POST-DISASTER TARGET</div>
                  <div>Source: {assessment.postImage.sourcePlatform} ({assessment.postImage.resolutionMeters}m res)</div>
                  <div>Captured: {new Date(assessment.postImage.captureDate).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Evidence Points */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Key Visual Evidence Detected:
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50">
              {assessment.visualEvidence.map((ev, i) => (
                <div key={i} className="p-2.5 flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">{ev.type.replace(/_/g, ' ')}: </span>
                    <span className="text-slate-600">{ev.description}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">
                      (Model Confidence: {Math.round(ev.confidence * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human Review & Signoff Block */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/80 space-y-3">
            <h3 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs flex items-center justify-between">
              <span>Human Verification & Field Approval Record</span>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                assessment.verificationStatus === 'VERIFIED_CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {assessment.verificationStatus}
              </span>
            </h3>

            {assessment.humanReview ? (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div><strong>Reviewer:</strong> {assessment.humanReview.reviewerName}</div>
                  <div><strong>Designation:</strong> {assessment.humanReview.reviewerRole}</div>
                  <div><strong>Timestamp:</strong> {new Date(assessment.humanReview.timestamp).toLocaleString()}</div>
                  <div><strong>Badge Code:</strong> {assessment.humanReview.badgeId || 'N/A'}</div>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 italic">
                  "{assessment.humanReview.justification}"
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-800 italic">
                Awaiting authorized ground-truth reviewer signoff. Assessment marked PENDING_REVIEW.
              </div>
            )}

            {/* Assigned Rescue Team */}
            {assessment.assignedTeam && (
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs flex items-center justify-between font-mono">
                <div>
                  <strong className="text-orange-900">DISPATCHED UNIT:</strong> {assessment.assignedTeam.teamName} ({assessment.assignedTeam.teamType})
                </div>
                <div className="text-slate-600">
                  ETA: ~{assessment.assignedTeam.etaMinutes} mins | Radio: {assessment.assignedTeam.contactRadio}
                </div>
              </div>
            )}
          </div>

          {/* Traceable Audit Trail Log */}
          <div className="space-y-1.5 pt-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Traceable Assessment Audit History:
            </h4>
            <div className="font-mono text-[10px] space-y-1 bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
              {assessment.auditTrail.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-orange-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-emerald-400 font-bold">{log.action}:</span>
                  <span className="text-slate-300">{log.details}</span>
                  <span className="text-slate-500">({log.operator})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
            Generated by DisasterGuard AI Decision Support Platform • PS-53 Disaster Damage Prioritization System
          </div>
        </div>
      </div>
    </div>
  );
};
