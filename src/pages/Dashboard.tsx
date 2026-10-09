import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAlerts } from '../hooks/useAlerts';
import { useTranslation } from '../i18n';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BellRing,
  ArrowRight,
  ShieldCheck,
  Compass,
  MapPin,
  ChevronDown,
  Activity,
  Layers,
  Crosshair,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { RiskMap } from '../components/map/RiskMap';
import { damageAssessmentService } from '../services/damageAssessmentService';
import { DamageAssessmentRecord } from '../types/damageAssessment';
import { DamageAssessmentWizard } from '../components/damage/DamageAssessmentWizard';
import { ScenarioSimulatorModal } from '../components/common/ScenarioSimulatorModal';
import { DemoTourButton } from '../components/demo/DemoTourButton';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { useDemoTour } from '../context/DemoTourContext';

export const DashboardPage: React.FC = () => {
  const {
    activeLocation,
    selectedStation,
    selectTelemetryStation,
  } = useApp();
  const { alerts } = useAlerts();
  const { t, formatNumber } = useTranslation();
  const { openDemoTour } = useDemoTour();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<DamageAssessmentRecord[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  useEffect(() => {
    setAssessments(damageAssessmentService.getAllAssessments());
  }, []);

  // Compute 4 Essential Summary Cards safely based on actual data
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const assessmentsAwaitingReview = safeAssessments.filter(
    (a) => a?.verificationStatus === 'PENDING_REVIEW'
  ).length;

  const highPriorityLocations = safeAssessments.filter(
    (a) => a?.priorityTier === 'P1_URGENT' || a?.priorityTier === 'P2_HIGH'
  ).length;

  const humanVerifiedAssessments = safeAssessments.filter(
    (a) => a?.verificationStatus === 'VERIFIED_CONFIRMED'
  ).length;

  const openIncidents = safeAlerts.filter((a) => a?.status === 'ACTIVE').length;

  const handleAssessmentCompleted = (newRec: DamageAssessmentRecord) => {
    setAssessments(damageAssessmentService.getAllAssessments());
    setIsWizardOpen(false);
  };

  return (
    <div className="space-y-6 max-w-full min-w-0">
      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL RESPONSIVE HERO SECTION (PS-53 & MULTI-HAZARD DSS)       */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-7 shadow-xs w-full min-w-0">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-5 lg:gap-8 items-center min-w-0">
          {/* LEFT COLUMN: Badges, Heading, Description, Context Info */}
          <div className="min-w-0 space-y-3">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200 tracking-wider">
                NDMA DSS
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-900 text-white tracking-wider">
                MULTI-HAZARD
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                PS-53 CORE
              </span>
              <DataProvenanceBadge status="LIVE" label="OPERATIONAL FEED" size="sm" />
            </div>

            {/* Responsive Heading */}
            <h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight break-words"
              style={{ fontSize: 'clamp(1.25rem, 1.8vw + 0.6rem, 1.875rem)' }}
            >
              DisasterGuard AI — Multi-Hazard Disaster Management & Early Warning System
            </h1>

            {/* Supporting description */}
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
              AI-assisted structural damage assessment, real-time hydrological risk forecasting, and explainable inspection prioritization for rapid disaster triage and field response across vulnerable sectors.
            </p>

            {/* Supporting context info */}
            <div className="flex items-center gap-2 sm:gap-4 pt-1 text-[11px] sm:text-xs text-slate-500 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sector: <strong className="text-slate-800">{activeLocation.name}</strong></span>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>Framework: <strong className="text-slate-800">EMS-98 & FEMA Tiers</strong></span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span>Team: <strong className="text-orange-700 font-semibold">Ai Verse (Team Heroshi)</strong></span>
            </div>
          </div>

          {/* RIGHT COLUMN: Neatly aligned group of action buttons */}
          <div className="min-w-0 w-full">
            <div className="space-y-2.5">
              {/* Button 1: Start Project Demo (Primary Action) */}
              <button
                type="button"
                onClick={() => openDemoTour(0)}
                className="w-full group relative flex items-center justify-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-xl font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/25 hover:shadow-lg hover:shadow-orange-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all border border-orange-400/40 cursor-pointer overflow-hidden"
                title="Launch Interactive Hackathon Jury Demo Walkthrough"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
                <Sparkles className="w-4 h-4 text-orange-200 shrink-0" />
                <span className="tracking-wide uppercase font-black">▶ Start Project Demo</span>
              </button>

              {/* Grid of secondary action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {/* Button 2: Damage Prioritization (PS-53) */}
                <Link
                  to="/damage-assessment"
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all truncate group"
                  title="Navigate to Damage Assessment & Prioritization Workspace (PS-53)"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left truncate">
                    <p className="font-extrabold text-slate-900 truncate leading-tight">Damage Prioritization</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">PS-53 Engine</p>
                  </div>
                </Link>

                {/* Button 3: Scenario Simulator */}
                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all truncate group text-left cursor-pointer"
                  title="Launch Multi-Hazard Disaster Scenario Simulator"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left truncate">
                    <p className="font-extrabold text-slate-900 truncate leading-tight">Scenario Simulator</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">Cascade Sim</p>
                  </div>
                </button>

                {/* Button 4: Drone Rescue */}
                <Link
                  to="/drone-rescue"
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all truncate group"
                  title="Navigate to Autonomous UAV Drone Rescue Scanner"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left truncate">
                    <p className="font-extrabold text-slate-900 truncate leading-tight">Drone Rescue</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">UAV Thermal</p>
                  </div>
                </Link>

                {/* Button 5: Evacuation Routes */}
                <Link
                  to="/evacuation"
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all truncate group"
                  title="Navigate to Dynamic Evacuation Routes & Safe Relief Hubs"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left truncate">
                    <p className="font-extrabold text-slate-900 truncate leading-tight">Evacuation Routes</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">Safe Corridors</p>
                  </div>
                </Link>

                {/* Button 6: AI Predictor */}
                <Link
                  to="/prediction"
                  className="sm:col-span-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300 flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition-all truncate group"
                  title="Navigate to AI Geotechnical Landslide & Flood Predictor"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 text-left truncate">
                      <p className="font-extrabold text-slate-900 truncate leading-tight">AI Predictor</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">9 Geotechnical & Rainfall Parameters</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 mr-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ESSENTIAL SUMMARY CARDS (EXACT 4 CARDS AS SPECIFIED)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        {/* Card 1: Assessments awaiting review */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Awaiting Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {assessmentsAwaitingReview}
          </div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <span>Pending engineer verification</span>
          </p>
        </div>

        {/* Card 2: High-priority inspection locations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              High-Priority Locations
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center border border-red-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-600 font-mono">
            {highPriorityLocations}
          </div>
          <p className="text-[11px] text-red-700 font-semibold mt-1">
            P1 Urgent & P2 High sectors
          </p>
        </div>

        {/* Card 3: Human-verified assessments */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Human-Verified
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {humanVerifiedAssessments}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Confirmed field inspections
          </p>
        </div>

        {/* Card 4: Open incidents */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Open Incidents
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 font-mono">
            {openIncidents}
          </div>
          <p className="text-[11px] text-blue-700 font-semibold mt-1">
            Active EOC incident bulletins
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SECTION: PRIORITIZED INSPECTION QUEUE & INTERACTIVE GIS MAP       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        {/* Left Column: Prioritized Inspection Queue (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col min-w-0 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-600" />
                <span>Prioritized Inspection Queue</span>
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by multi-factor damage, population risk, and infrastructure score
              </p>
            </div>
            <Link
              to="/damage-assessment"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Full Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Queue List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
            {safeAssessments.slice(0, 5).map((asmt) => (
              <div
                key={asmt.id}
                onClick={() => navigate('/damage-assessment')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        asmt.priorityTier === 'P1_URGENT'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : asmt.priorityTier === 'P2_HIGH'
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : asmt.priorityTier === 'P3_MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {asmt.priorityTier.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{asmt.id}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                      {asmt.estimatedDamageCategory}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 truncate">{asmt.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {asmt.locationName} ({asmt.district}, {asmt.state})
                  </p>
                </div>

                <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className="font-black text-slate-900 font-mono text-base">
                    {asmt.scores.compositePriorityScore}
                    <span className="text-[10px] text-slate-400 font-normal">/100</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      asmt.verificationStatus === 'VERIFIED_CONFIRMED'
                        ? 'text-emerald-700'
                        : asmt.verificationStatus === 'PENDING_REVIEW'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {asmt.verificationStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              to="/damage-assessment"
              className="text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors"
            >
              View All {assessments.length} Inspection Priority Records →
            </Link>
          </div>
        </div>

        {/* Right Column: Interactive GIS Tactical Map (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col min-w-0 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Geospatial Risk & Damage Map</span>
              </h2>
              <p className="text-xs text-slate-500">
                Active sensor nodes and assessed structural damage points
              </p>
            </div>
            <Link
              to="/risk-map"
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              Full GIS Map →
            </Link>
          </div>

          <div className="flex-1 min-h-[360px] sm:min-h-[420px] rounded-xl overflow-hidden border border-slate-200">
            <RiskMap
              height="420px"
              selectedStationId={selectedStation?.id}
              onStationSelect={selectTelemetryStation}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT ASSESSMENTS & INCIDENTS AUDIT STRIP                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Recent Incident Actions & Verification Audit</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Audit Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800">Meppadi Access Corridor</span>
              <span className="text-slate-400 font-mono">14m ago</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Ground inspection confirmed: 4 downed utility poles & washed culvert. Priority locked to P1.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800">Joshimath Subsidence Zone</span>
              <span className="text-slate-400 font-mono">1h ago</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              UAV orthophoto scan completed. 8 structures flagged for deep foundation scouring.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800">Bhimavaram Canal East</span>
              <span className="text-slate-400 font-mono">3h ago</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Inundation monitoring: Silt depth measures 1.2m. Civil defense sandbagging deployed.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. GUIDED DAMAGE ASSESSMENT WIZARD MODAL                                  */}
      {/* ========================================================================= */}
      <DamageAssessmentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onAssessmentCompleted={handleAssessmentCompleted}
      />

      {/* Scenario Simulator Modal */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        activeLocationName={activeLocation.name}
      />
    </div>
  );
};

export default DashboardPage;
