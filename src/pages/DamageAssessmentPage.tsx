import React, { useState, useEffect } from 'react';
import {
  Building2,
  Layers,
  Upload,
  UserCheck,
  Users,
  FileText,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Compass,
  MapPin,
  ExternalLink,
  Info,
  BadgeAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DamageAssessmentRecord } from '../types/damageAssessment';
import { damageAssessmentService } from '../services/damageAssessmentService';
import { ImageComparisonSlider } from '../components/damage/ImageComparisonSlider';
import { InspectionPriorityQueue } from '../components/damage/InspectionPriorityQueue';
import { ImageUploadModal } from '../components/damage/ImageUploadModal';
import { HumanVerificationModal } from '../components/damage/HumanVerificationModal';
import { AssignTeamModal } from '../components/damage/AssignTeamModal';
import { DamageReportModal } from '../components/damage/DamageReportModal';
import { DamageAssessmentWizard } from '../components/damage/DamageAssessmentWizard';
import { RiskMap } from '../components/map/RiskMap';

export const DamageAssessmentPage: React.FC = () => {
  const { setMapCenter, setMapZoom } = useApp();
  const [searchParams] = useSearchParams();
  const [assessments, setAssessments] = useState<DamageAssessmentRecord[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<DamageAssessmentRecord | null>(null);

  // Modals
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'wizard') {
      setShowWizardModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const records = damageAssessmentService.getAllAssessments();
    setAssessments(records);
    if (records.length > 0) {
      setSelectedAssessment(records[0]);
    }
  }, []);

  const handleSelectAssessment = (record: DamageAssessmentRecord) => {
    setSelectedAssessment(record);
    setMapCenter([record.coordinates.lat, record.coordinates.lng]);
    setMapZoom(13);
  };

  const handleResetPresets = () => {
    const pristine = damageAssessmentService.resetToPresets();
    setAssessments(pristine);
    if (pristine.length > 0) {
      setSelectedAssessment(pristine[0]);
    }
  };

  const handleRecordUpdated = (updated: DamageAssessmentRecord) => {
    setAssessments((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedAssessment(updated);
  };

  const handleAssessmentCreated = (newRecord: DamageAssessmentRecord) => {
    setAssessments((prev) => [newRecord, ...prev]);
    setSelectedAssessment(newRecord);
  };

  if (!selectedAssessment) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <h2 className="text-base font-bold">Loading Damage Assessment Workspace...</h2>
      </div>
    );
  }

  const priorityBadgeStyle =
    selectedAssessment.priorityTier === 'P1_URGENT'
      ? 'bg-red-600 text-white animate-pulse'
      : selectedAssessment.priorityTier === 'P2_HIGH'
      ? 'bg-orange-600 text-white'
      : selectedAssessment.priorityTier === 'P3_MEDIUM'
      ? 'bg-amber-600 text-white'
      : 'bg-emerald-600 text-white';

  return (
    <div className="space-y-6 max-w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
              PS-53 CORE WORKSPACE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
              EMS-98 & FEMA STANDARDS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Disaster Damage Prioritization System
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Combine satellite, UAV, and historical imagery to estimate structural damage and rank urgent physical inspection priorities.
          </p>
        </div>

        {/* Global Workspace Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowWizardModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            title="Open 7-step guided damage assessment wizard"
          >
            <Sparkles className="w-4 h-4 text-orange-200" />
            <span>Start Guided Wizard</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Upload Imagery</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 border border-slate-700 shadow-sm transition-all"
            title="Generate Official NDMA Inspection Report"
          >
            <FileText className="w-4 h-4" />
            <span>Official Report</span>
          </button>
        </div>
      </div>

      {/* Active Assessment Hero Dossier Banner */}
      <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black tracking-wider uppercase ${priorityBadgeStyle}`}>
                {selectedAssessment.priorityTier.replace('_', ' ')}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-purple-300 border border-purple-500/30">
                {selectedAssessment.estimatedDamageCategory}
              </span>
              <span className="text-xs font-mono text-slate-400">
                REF: {selectedAssessment.id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {selectedAssessment.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
              <span className="flex items-center gap-1 text-orange-400">
                <MapPin className="w-3.5 h-3.5" />
                {selectedAssessment.locationName} ({selectedAssessment.district}, {selectedAssessment.state})
              </span>
              <span>•</span>
              <span>Event: {selectedAssessment.disasterEvent}</span>
              <span>•</span>
              <span>
                Coordinates: {selectedAssessment.coordinates.lat.toFixed(4)}°N, {selectedAssessment.coordinates.lng.toFixed(4)}°E
              </span>
            </div>
          </div>

          {/* Quick Action Ribbon */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Verify / Adjust</span>
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Dispatch Unit</span>
            </button>
          </div>
        </div>

        {/* Priority Score Breakdown Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">COMPOSITE PRIORITY</span>
            <span className="text-lg font-black font-mono text-orange-400">
              {selectedAssessment.scores.compositePriorityScore}
              <span className="text-xs text-slate-500">/100</span>
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">PHYSICAL DAMAGE (35%)</span>
            <span className="text-lg font-black font-mono text-red-400">
              {selectedAssessment.scores.physicalDamageScore}%
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">POPULATION RISK (25%)</span>
            <span className="text-lg font-black font-mono text-amber-400">
              {selectedAssessment.scores.populationExposureScore}%
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">INFRASTRUCTURE (20%)</span>
            <span className="text-lg font-black font-mono text-blue-400">
              {selectedAssessment.scores.criticalInfrastructureScore}%
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">HAZARD ESCALATION (15%)</span>
            <span className="text-lg font-black font-mono text-purple-400">
              {selectedAssessment.scores.hazardEscalationScore}%
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">UNCERTAINTY PENALTY</span>
            <span className="text-lg font-black font-mono text-slate-400">
              {selectedAssessment.scores.uncertaintyScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (2 Columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bitemporal Comparison Slider (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-600" />
                <span>Bitemporal Satellite & UAV Damage Comparison</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Drag slider to inspect changes
              </span>
            </div>

            <ImageComparisonSlider
              preImage={selectedAssessment.preImage}
              postImage={selectedAssessment.postImage}
              visualEvidence={selectedAssessment.visualEvidence}
            />

            {/* Explainable Rationale Box */}
            <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200/80 space-y-1.5 text-xs">
              <div className="font-extrabold text-orange-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Transparent Prioritization Rationale</span>
              </div>
              <p className="text-orange-900 leading-relaxed font-medium">
                {selectedAssessment.priorityRationale}
              </p>
            </div>
          </div>

          {/* Detected Visual Evidence Points */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Detected Visual Evidence & Indicators ({selectedAssessment.visualEvidence.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">AI Computer Vision Features</span>
            </h4>

            <div className="space-y-2">
              {selectedAssessment.visualEvidence.map((ev, i) => (
                <div
                  key={ev.featureId || i}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5 text-xs"
                >
                  <div className="p-1 rounded-md bg-red-100 text-red-700 shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {ev.type.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-orange-700">
                        {Math.round(ev.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 leading-snug">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Uncertainty and Limitations */}
            {selectedAssessment.uncertaintyFactors.length > 0 && (
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">
                  Identified Uncertainty Factors (Requires Ground Truth):
                </span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {selectedAssessment.uncertaintyFactors.map((fact, idx) => (
                    <li key={idx}>{fact}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verification Status, Dispatched Units & Mini GIS Context (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Human-in-the-Loop Verification Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Human Verification Status</span>
              </h3>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  selectedAssessment.verificationStatus === 'VERIFIED_CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedAssessment.verificationStatus.replace(/_/g, ' ')}
              </span>
            </div>

            {selectedAssessment.humanReview ? (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{selectedAssessment.humanReview.reviewerName}</span>
                    <span className="text-[10px] font-mono text-emerald-700">
                      {selectedAssessment.humanReview.badgeId || 'SDMA Verified'}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-800">{selectedAssessment.humanReview.reviewerRole}</div>
                  <div className="text-[11px] italic mt-1 pt-1 border-t border-emerald-200/60">
                    "{selectedAssessment.humanReview.justification}"
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 text-right">
                    {new Date(selectedAssessment.humanReview.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <p className="leading-snug">
                  This AI prioritization score is currently <strong>PENDING REVIEW</strong>. Authorized disaster inspectors can confirm evidence or adjust the priority tier.
                </p>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                >
                  Conduct Ground Truth Review
                </button>
              </div>
            )}

            {/* Dispatched Inspection Team */}
            {selectedAssessment.assignedTeam ? (
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between font-bold text-orange-950">
                  <span>DISPATCHED RESCUE SQUAD</span>
                  <span className="text-orange-700">ETA ~{selectedAssessment.assignedTeam.etaMinutes}m</span>
                </div>
                <div className="text-slate-800">{selectedAssessment.assignedTeam.teamName}</div>
                <div className="text-[11px] text-slate-500">
                  Officer: {selectedAssessment.assignedTeam.contactPerson} ({selectedAssessment.assignedTeam.contactRadio})
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAssignModal(true)}
                className="w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>Assign Field Inspection Squad</span>
              </button>
            )}
          </div>

          {/* Interactive GIS Spatial Overview Link */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>GIS Spatial Coordinate Verification</span>
              </h3>
              <Link
                to="/risk-map"
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>Full Map</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="h-52 rounded-xl overflow-hidden border border-slate-200 relative">
              <RiskMap
                center={[selectedAssessment.coordinates.lat, selectedAssessment.coordinates.lng]}
                zoom={14}
                height="100%"
                activeIncidentCoordinates={{
                  lat: selectedAssessment.coordinates.lat,
                  lng: selectedAssessment.coordinates.lng,
                  label: selectedAssessment.locationName,
                }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
              <span>Lat: {selectedAssessment.coordinates.lat.toFixed(4)}°N</span>
              <span>Lng: {selectedAssessment.coordinates.lng.toFixed(4)}°E</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Inspection Priority Queue */}
      <InspectionPriorityQueue
        assessments={assessments}
        selectedAssessmentId={selectedAssessment.id}
        onSelectAssessment={handleSelectAssessment}
        onOpenVerifyModal={(rec) => {
          setSelectedAssessment(rec);
          setShowVerifyModal(true);
        }}
        onOpenAssignModal={(rec) => {
          setSelectedAssessment(rec);
          setShowAssignModal(true);
        }}
        onOpenReportModal={(rec) => {
          setSelectedAssessment(rec);
          setShowReportModal(true);
        }}
        onResetPresets={handleResetPresets}
      />

      {/* Modals */}
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onAssessmentCreated={handleAssessmentCreated}
      />

      <HumanVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        assessment={selectedAssessment}
        onVerified={handleRecordUpdated}
      />

      <AssignTeamModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        assessment={selectedAssessment}
        onAssigned={handleRecordUpdated}
      />

      <DamageReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        assessment={selectedAssessment}
      />

      <DamageAssessmentWizard
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        onAssessmentCompleted={handleAssessmentCreated}
      />
    </div>
  );
};

export default DamageAssessmentPage;
