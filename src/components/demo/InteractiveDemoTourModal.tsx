import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Compass,
  Building2,
  Crosshair,
  ScanLine,
  BrainCircuit,
  CloudRain,
  Navigation,
  BellRing,
  LifeBuoy,
  History,
  LayoutDashboard,
  MapPin,
  Flame,
  Waves,
  ListFilter,
  UserCheck,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useDemoTour } from '../../context/DemoTourContext';
import { DEMO_FEATURES } from '../../data/demoTourData';
import DataProvenanceBadge from '../common/DataProvenanceBadge';

export const InteractiveDemoTourModal: React.FC = () => {
  const {
    isOpen,
    currentStepIndex,
    totalSteps,
    isPlaying,
    secondsRemaining,
    autoPlayDuration,
    viewMode,
    closeDemoTour,
    nextStep,
    prevStep,
    goToStep,
    togglePlayPause,
    restartTour,
    setViewMode,
    currentFeature,
  } = useDemoTour();

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-navigate to feature route when step changes
  useEffect(() => {
    if (!isOpen) return;

    if (currentFeature && location.pathname !== currentFeature.route) {
      navigate(currentFeature.route);
    } else if (currentStepIndex === 0 && location.pathname !== '/') {
      navigate('/');
    } else if (currentStepIndex === totalSteps - 1 && location.pathname !== '/mission-control') {
      // Optional summary route
    }
  }, [isOpen, currentStepIndex, currentFeature, navigate, location.pathname, totalSteps]);

  if (!isOpen) return null;

  const isOverview = currentStepIndex === 0;
  const isSummary = currentStepIndex === totalSteps - 1;
  const isFeatureStep = currentFeature !== null;

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Crosshair':
        return <Crosshair className="w-5 h-5" />;
      case 'ScanLine':
        return <ScanLine className="w-5 h-5" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5" />;
      case 'CloudRain':
        return <CloudRain className="w-5 h-5" />;
      case 'Building2':
        return <Building2 className="w-5 h-5" />;
      case 'Navigation':
        return <Navigation className="w-5 h-5" />;
      case 'BellRing':
        return <BellRing className="w-5 h-5" />;
      case 'LifeBuoy':
        return <LifeBuoy className="w-5 h-5" />;
      case 'History':
        return <History className="w-5 h-5" />;
      case 'ListFilter':
        return <ListFilter className="w-5 h-5" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between pointer-events-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn text-slate-100">
      {/* Top Banner / Navigation Strip */}
      <header className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3 shrink-0 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md ring-1 ring-orange-400/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                DisasterGuard AI
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-orange-400 uppercase tracking-wider hidden sm:inline">
                Disaster Damage Prioritization System
              </span>
              <DataProvenanceBadge status="DEMO" label="HACKATHON JURY SHOWCASE" size="sm" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {isOverview
                ? 'Step 0: System Architecture & Triage Pipeline'
                : isSummary
                ? 'Final Step: Hackathon Value Proposition'
                : `Feature ${currentFeature?.stepNumber} of ${DEMO_FEATURES.length}: ${currentFeature?.name}`}
            </p>
          </div>
        </div>

        {/* Top Right Controls: Timer, View Mode Switch, Close */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Auto-Play Timer Indicator */}
          <button
            onClick={togglePlayPause}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
              isPlaying
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isPlaying ? 'Pause auto-advance' : 'Start auto-advance'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[11px]">Auto {secondsRemaining}s</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] hidden sm:inline">Auto-Play</span>
              </>
            )}
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'DOSSIER' ? 'COMPACT_HUD' : 'DOSSIER')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition"
            title={viewMode === 'DOSSIER' ? 'Switch to Compact HUD view' : 'Switch to Full Dossier view'}
          >
            {viewMode === 'DOSSIER' ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline text-[11px]">Compact HUD</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline text-[11px]">Full Dossier</span>
              </>
            )}
          </button>

          {/* Exit Button */}
          <button
            onClick={closeDemoTour}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-700/80 text-slate-400 transition"
            title="Exit Demo Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body (Dossier Mode vs Compact HUD Mode) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto min-w-0">
        {/* ========================================================================= */}
        {/* STEP 0: DEDICATED DEMO OVERVIEW SCREEN                                    */}
        {/* ========================================================================= */}
        {isOverview && (
          <div className="space-y-6 animate-fadeIn">
            {/* Hero Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold tracking-wider uppercase">
                  <span>DISASTER DAMAGE PRIORITIZATION SYSTEM</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  DISASTERGUARD AI
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                  An end-to-end multi-hazard early warning and disaster damage prioritization command platform.
                  Engineered to assist emergency operations centers, district collectors, and NDRF/SDRF units in
                  cutting through the chaos of extreme disaster events and systematically directing inspection and
                  rescue resources to where lives and lifelines are most endangered.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-950/50 transition-all hover:scale-[1.02]"
                  >
                    <span>Start Feature Walkthrough (1 of 12)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-mono">
                    Created by Team Heroshi | Ai Verse
                  </span>
                </div>
              </div>
            </div>

            {/* Architectural Pillars & End-to-End Workflow */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Problem Addressed */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Critical Problem Addressed</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In the golden hours following sudden multi-hazard events (monsoon cloudbursts, debris flows, cyclones,
                  and seismic shocks), dispatchers face conflicting telemetry from disparate sensors. Without an
                  automated damage prioritization formula, field inspection teams are dispatched haphazardly,
                  delaying help to isolated settlements.
                </p>
              </div>

              {/* Integrated AI/ML Stack */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>Real Integrated AI/ML Architecture</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span><strong>Random Forest Classifier:</strong> 9-parameter geotechnical & met model (<code>landslide_model.pkl</code>)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span><strong>U-Net CNN:</strong> 2D satellite semantic terrain segmentation (<code>SIH26001_Landslide_UNet.keras</code>)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span><strong>YOLOv8 Nano:</strong> UAV drone aerial vision & victim distress scoring (<code>yolov8n.pt</code>)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span><strong>Google Gemini Vision:</strong> Multimodal geological risk reasoning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual End-to-End Workflow Diagram */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider block">
                End-to-End Operational Decision Workflow
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                {[
                  { step: '1', title: 'Data Collection', desc: 'AWS sensors, IMD feeds, drone & satellite' },
                  { step: '2', title: 'AI Assessment', desc: 'RandomForest & U-Net computer vision' },
                  { step: '3', title: 'Damage Analysis', desc: 'Spatial overlay of roads, hospitals & census' },
                  { step: '4', title: 'Priority Ranking', desc: 'Triage algorithm sorts vulnerable sectors' },
                  { step: '5', title: 'Human Verification', desc: 'Command operator audits model evidence' },
                  { step: '6', title: 'Response Support', desc: 'NDRF dispatch & safe evacuation corridors' },
                ].map((item, idx) => (
                  <div
                    key={item.step}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between text-center relative group hover:border-orange-500/50 transition"
                  >
                    <div>
                      <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold font-mono mx-auto flex items-center justify-center mb-1.5">
                        {item.step}
                      </div>
                      <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2 border-t border-slate-800/80">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Ethical AI Guardrail:</strong> DisasterGuard AI is designed as a Decision-Support System (DSS).
                  It presents ranked empirical evidence to human command officers and never independently authorizes life-critical actions.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEPS 1-12: DETAILED FEATURE DOSSIERS                                     */}
        {/* ========================================================================= */}
        {isFeatureStep && currentFeature && (
          <div className="space-y-5 animate-fadeIn">
            {/* Feature Header Card */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                currentFeature.isHighlightFeature
                  ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/60 shadow-xl ring-1 ring-amber-500/30'
                  : 'bg-slate-900 border-slate-800 shadow-lg'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      currentFeature.isHighlightFeature
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    }`}
                  >
                    {getFeatureIcon(currentFeature.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700 tracking-wider uppercase">
                        Feature {currentFeature.stepNumber} of 12
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {currentFeature.badge}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                      {currentFeature.name}
                    </h2>
                  </div>
                </div>

                {/* Direct Live Page Navigation Button */}
                <button
                  onClick={() => {
                    navigate(currentFeature.route);
                    setViewMode('COMPACT_HUD');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <span>Interact with Live Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

              {/* Purpose & Technical Workflow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wide flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Purpose & Problem Solved</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {currentFeature.purpose}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>How It Works (Technical Pipeline)</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {currentFeature.howItWorks}
                  </p>
                </div>
              </div>
            </div>

            {/* Input & Output Specifications + Tech Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Input Data */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Required Inputs
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {currentFeature.inputData.map((inp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-mono mt-0.5">•</span>
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actual Outputs */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Generated Outputs
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {currentFeature.outputData.map((out, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technologies Applied */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Verified Technologies Used
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentFeature.technologyUsed.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Disaster Scenario & Contribution to Prioritization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Practical Use Case */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Practical Disaster Scenario
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{currentFeature.practicalUseCase}</p>
              </div>

              {/* Contribution to Damage Prioritization */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Project Contribution: Damage Prioritization
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{currentFeature.projectContribution}</p>
              </div>
            </div>

            {/* Operational Limitations */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Operational Limitations & Dependencies
              </span>
              <ul className="space-y-0.5 text-[11px] text-slate-400">
                {currentFeature.limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-mono">-</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 13: FINAL HACKATHON SUMMARY SCREEN                                   */}
        {/* ========================================================================= */}
        {isSummary && (
          <div className="space-y-6 animate-fadeIn text-center py-4 sm:py-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>COMPLETE 12-MODULE DEMO COMPLETED</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                DISASTERGUARD AI
              </h1>
              <p className="text-base sm:text-lg text-orange-400 font-medium">
                Disaster Damage Prioritization System
              </p>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
                By uniting real-time hydrological curves, multi-hazard cascading matrices, Random Forest geotechnical
                inference, U-Net satellite scar segmentation, YOLOv8 drone rescue scanning, and census demographic overlays,
                DisasterGuard AI transforms chaotic multi-hazard signals into a clear, prioritized inspection queue.
              </p>

              {/* Value Proposition Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold text-cyan-400 block mb-1">Triage Where Lives Matter</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Prioritizes sectors isolating hospitals, schools, and vulnerable elderly/children over empty pastures.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold text-amber-400 block mb-1">Explainable AI Attribution</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every alert provides transparent feature weight attribution, letting human commanders verify why risk was flagged.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">Actionable Evacuation Corridors</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Directs stranded populations along hazard-avoiding routes directly into verified high-ground emergency shelters.
                  </p>
                </div>
              </div>

              {/* Closing Motto & Attribution */}
              <div className="pt-6 border-t border-slate-800 space-y-2">
                <blockquote className="text-xl sm:text-2xl font-serif italic text-white tracking-wide">
                  “See the Damage. Prioritize the Response.”
                </blockquote>
                <p className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
                  TEAM HEROSHI | Ai Verse
                </p>
              </div>

              {/* Post-Demo Actions */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={restartTour}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Restart Walkthrough</span>
                </button>
                <button
                  onClick={closeDemoTour}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-950/40 transition"
                >
                  <span>Explore Live Command Application</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Controller Bar */}
      <footer className="bg-slate-900/95 border-t border-slate-800 px-4 sm:px-6 py-3 shrink-0 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Step Indicator & Jump Dots */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-xs font-mono text-slate-400 shrink-0">
            {isOverview ? 'Overview' : isSummary ? 'Summary' : `${currentStepIndex} of ${DEMO_FEATURES.length}`}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {/* 0 (Overview) */}
            <button
              onClick={() => goToStep(0)}
              className={`w-2.5 h-2.5 rounded-full transition ${
                currentStepIndex === 0 ? 'bg-orange-500 ring-2 ring-orange-400/50 scale-125' : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title="Overview"
            />

            {/* 1..12 Features */}
            {DEMO_FEATURES.map((feat) => {
              const idx = feat.stepNumber;
              const isCurrent = currentStepIndex === idx;
              return (
                <button
                  key={feat.id}
                  onClick={() => goToStep(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    isCurrent
                      ? feat.isHighlightFeature
                        ? 'bg-amber-400 ring-2 ring-amber-400/70 scale-125 animate-pulse'
                        : 'bg-cyan-400 ring-2 ring-cyan-400/60 scale-125'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Feature ${idx}: ${feat.shortTitle}`}
                />
              );
            })}

            {/* 13 (Summary) */}
            <button
              onClick={() => goToStep(totalSteps - 1)}
              className={`w-2.5 h-2.5 rounded-full transition ${
                currentStepIndex === totalSteps - 1 ? 'bg-emerald-500 ring-2 ring-emerald-400/50 scale-125' : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title="Summary"
            />
          </div>
        </div>

        {/* Playback & Navigation Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={togglePlayPause}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title={isPlaying ? 'Pause Auto-Play' : 'Resume Auto-Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={nextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-md shadow-orange-950/40 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={restartTour}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Restart Walkthrough"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={closeDemoTour}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-medium transition"
          >
            Exit Demo
          </button>
        </div>
      </footer>
    </div>
  );
};

export default InteractiveDemoTourModal;
