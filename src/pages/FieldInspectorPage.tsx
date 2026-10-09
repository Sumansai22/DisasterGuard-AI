import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  MapPin,
  Camera,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  FileText,
  Save,
  Send,
  RotateCcw,
  Navigation,
  Shield,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DamageAssessmentRecord, InspectionPriorityTier } from '../types/damageAssessment';
import { damageAssessmentService } from '../services/damageAssessmentService';
import { RiskMap } from '../components/map/RiskMap';
import { ImageComparisonSlider } from '../components/damage/ImageComparisonSlider';

export const FieldInspectorPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<DamageAssessmentRecord[]>([]);
  const [selectedTask, setSelectedTask] = useState<DamageAssessmentRecord | null>(null);

  // Field Observation Form
  const [observedDamage, setObservedDamage] = useState<string>('MAJOR_DAMAGE');
  const [roadPassable, setRoadPassable] = useState<boolean>(false);
  const [foundationScoured, setFoundationScoured] = useState<boolean>(true);
  const [civilianCountEstimate, setCivilianCountEstimate] = useState<number>(45);
  const [fieldNotes, setFieldNotes] = useState<string>(
    'Ground reconnaissance confirms primary access bridge is completely washed out. Mud silt depth measures 1.8m. Heavy excavation machinery required.'
  );
  const [photoEvidenceUrl, setPhotoEvidenceUrl] = useState<string>(
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
  );
  const [isSavedOffline, setIsSavedOffline] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    const all = damageAssessmentService.getAllAssessments();
    // Prioritize P1 and P2 tasks
    const sorted = [...all].sort((a, b) => b.scores.compositePriorityScore - a.scores.compositePriorityScore);
    setTasks(sorted);
    if (sorted.length > 0) {
      setSelectedTask(sorted[0]);
    }
  }, []);

  const handleSelectTask = (task: DamageAssessmentRecord) => {
    setSelectedTask(task);
    setIsSavedOffline(false);
    setIsSubmitted(false);
    setObservedDamage(task.estimatedDamageCategory);
  };

  const handleSaveDraft = () => {
    if (!selectedTask) return;
    try {
      const draft = {
        taskId: selectedTask.id,
        observedDamage,
        roadPassable,
        foundationScoured,
        civilianCountEstimate,
        fieldNotes,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`inspector_draft_${selectedTask.id}`, JSON.stringify(draft));
      setIsSavedOffline(true);
      setTimeout(() => setIsSavedOffline(false), 3000);
    } catch (e) {
      console.warn('Draft save failed:', e);
    }
  };

  const handleSubmitFieldReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    // Commit ground truth verification
    const updated = damageAssessmentService.verifyAssessment(selectedTask.id, {
      reviewerName: currentUser.name,
      reviewerRole: `${currentUser.role} • ${currentUser.agency}`,
      badgeId: currentUser.badgeId || 'FIELD-INSP',
      decision: 'VERIFIED_CONFIRMED',
      justification: `[FIELD ON-SITE INSPECTION REPORT]: ${fieldNotes}. Road Passable: ${roadPassable ? 'YES' : 'NO'}. Estimated Casualties/Displaced: ${civilianCountEstimate}. Ground damage confirmed as ${observedDamage}.`,
    });

    if (updated) {
      setSelectedTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setIsSubmitted(true);
    }
  };

  if (!selectedTask) {
    return (
      <div className="p-8 text-center text-slate-500">
        <UserCheck className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <h2 className="text-base font-bold">No assigned inspection tasks found.</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              FIELD INSPECTOR WORKSPACE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-emerald-400">
              OFFICER: {currentUser.name} ({currentUser.badgeId || 'NDRF UNIT'})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            On-Site Ground Truth & Rapid Damage Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Field inspectors verify AI bitemporal satellite damage estimates, record structural stability, and update ground truth triage.
          </p>
        </div>

        {/* Connectivity & Offline Mode Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telemetry Uplink Active</span>
          </div>
          <button
            onClick={handleSaveDraft}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Save offline draft report in local storage"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Offline Draft</span>
          </button>
        </div>
      </div>

      {isSavedOffline && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Field inspection draft saved locally on device. Will auto-sync when network allows.</span>
        </div>
      )}

      {isSubmitted && (
        <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <strong>Field Verification Report Successfully Committed!</strong>
              <p className="text-[11px] text-emerald-800">
                Logged to immutable audit history as {currentUser.name}. Triage status updated to VERIFIED_CONFIRMED.
              </p>
            </div>
          </div>
          <Link
            to="/damage-assessment"
            className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-bold text-xs hover:bg-emerald-800"
          >
            View in Priority Queue
          </Link>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Task Queue & GPS Map (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Assigned Task Queue */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-orange-600" />
                <span>Assigned Inspection Sites ({tasks.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Sorted by Priority</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {tasks.map((task) => {
                const isSelected = selectedTask.id === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate max-w-[200px] text-slate-900">{task.title}</span>
                      <span
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                          task.priorityTier === 'P1_URGENT'
                            ? 'bg-red-100 text-red-800'
                            : task.priorityTier === 'P2_HIGH'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.priorityTier.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
                      <span>{task.locationName}</span>
                      <span>{task.scores.compositePriorityScore}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Tactical Navigation Map */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Target Coordinates & Route Corridor</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {selectedTask.coordinates.lat.toFixed(4)}°N, {selectedTask.coordinates.lng.toFixed(4)}°E
              </span>
            </div>

            <div className="h-64 rounded-xl overflow-hidden border border-slate-200">
              <RiskMap
                center={[selectedTask.coordinates.lat, selectedTask.coordinates.lng]}
                zoom={14}
                height="100%"
                activeIncidentCoordinates={{
                  lat: selectedTask.coordinates.lat,
                  lng: selectedTask.coordinates.lng,
                  label: selectedTask.locationName,
                }}
              />
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-center justify-between font-mono">
              <span>Target: {selectedTask.locationName}</span>
              <a
                href={`https://maps.google.com/?q=${selectedTask.coordinates.lat},${selectedTask.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-blue-700"
              >
                Open GPS Directions ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Bitemporal Evidence & Field Observation Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Bitemporal Imagery Viewer */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {selectedTask.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Satellite Pre vs UAV Post Evidence • {selectedTask.id}
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                AI Grade: {selectedTask.estimatedDamageCategory}
              </span>
            </div>

            <ImageComparisonSlider
              preImage={selectedTask.preImage}
              postImage={selectedTask.postImage}
              visualEvidence={selectedTask.visualEvidence}
            />

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs italic text-slate-700">
              <strong>AI Triage Rationale: </strong>"{selectedTask.priorityRationale}"
            </div>
          </div>

          {/* Field Verification & Observation Form */}
          <form onSubmit={handleSubmitFieldReport} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>On-Site Ground Observation Form</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">
                Human-in-the-Loop Protocol
              </span>
            </div>

            {/* Observed Physical Damage Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirmed Physical Damage Category (EMS-98) *
                </label>
                <select
                  value={observedDamage}
                  onChange={(e) => setObservedDamage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono font-bold"
                >
                  <option value="DESTROYED">DESTROYED — Grade 5 Total Structural Collapse</option>
                  <option value="MAJOR_DAMAGE">MAJOR DAMAGE — Grade 4 Severe Wall/Roof Failure</option>
                  <option value="MODERATE_DAMAGE">MODERATE DAMAGE — Grade 3 Substantial Cracks</option>
                  <option value="MINOR_DAMAGE">MINOR DAMAGE — Grade 2 Superficial Damage</option>
                  <option value="UNAFFECTED">UNAFFECTED — Grade 1/0 Structurally Sound</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Affected Population / Household Headcount
                </label>
                <input
                  type="number"
                  value={civilianCountEstimate}
                  onChange={(e) => setCivilianCountEstimate(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Field Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={roadPassable}
                  onChange={(e) => setRoadPassable(e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Arterial Road is Passable for 4x4 Responders</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={foundationScoured}
                  onChange={(e) => setFoundationScoured(e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Severe Foundation Scouring / Subsurface Voids Observed</span>
              </label>
            </div>

            {/* Field Notes Textarea */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Field Observations & Engineering Notes *
              </label>
              <textarea
                rows={3}
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                placeholder="Document observed debris depth, structural stability, urgent evacuation needs..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>

            {/* Submit Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 text-xs"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Commit Ground Truth Verification</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FieldInspectorPage;
