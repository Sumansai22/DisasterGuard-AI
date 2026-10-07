import React from 'react';
import {
  MapPin,
  Database,
  BrainCircuit,
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  BellRing,
  ShieldCheck,
  Navigation,
  Home,
  ArrowRight,
  ArrowDown,
  Layers,
  Cpu,
} from 'lucide-react';
import { MultiHazardAssessment } from '../../types/multiHazard';

interface CascadingHazardFlowProps {
  assessment: MultiHazardAssessment | null;
}

export const CascadingHazardFlow: React.FC<CascadingHazardFlowProps> = ({ assessment }) => {
  if (!assessment) return null;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-4 w-full min-w-0 box-border">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-white tracking-tight truncate">
              Multi-Hazard Decision-Support Architecture Pipeline
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              End-to-end data fusion from geospatial input to emergency response & evacuation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700">
            NDMA Architecture Compliant
          </span>
        </div>
      </div>

      {/* Visual Workflow Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs w-full min-w-0">
        {/* Step 1: Location & Ingestion */}
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Stage 1: Ingestion</span>
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              {assessment.location.name}
            </h5>
            <p className="text-[11px] text-slate-300 font-mono">
              ({assessment.location.latitude.toFixed(4)}°N, {assessment.location.longitude.toFixed(4)}°E)
            </p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
              AWS Pluviometer, IMD Doppler Radar, USGS Fault Lines & Sensor Nodes
            </div>
          </div>
        </div>

        {/* Step 2: Multi-Hazard AI Engine */}
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Stage 2: AI Engine</span>
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-white text-xs">Multi-Hazard Synthesizer</h5>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-orange-900/60 text-orange-300 border border-orange-700/50">
                RandomForest ML
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                U-Net 2D Scan
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-900/60 text-sky-300 border border-sky-700/50">
                Hydro-Stage
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/60">
              Evaluates Landslide, Flood, Cloudburst, Cyclone, Debris, and Seismic vectors
            </p>
          </div>
        </div>

        {/* Step 3: Impact & Exposure Synthesis */}
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Stage 3: Exposure</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-white text-xs">Demographics & Assets</h5>
            <p className="text-[11px] text-purple-300 font-bold">
              {assessment.impactExposure.estimatedPopulationAtRisk.toLocaleString()} People at Risk
            </p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/60 flex items-center justify-between font-mono">
              <span>{assessment.impactExposure.criticalAssetsExposed} Critical Assets</span>
              <span>{assessment.impactExposure.transportCorridorsAffected} Corridors</span>
            </div>
          </div>
        </div>

        {/* Step 4: Coordinated Response & Evacuation */}
        <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Stage 4: Action</span>
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {assessment.emergencyResponse.alertLevel}
              </span>
            </h5>
            <p className="text-[11px] text-emerald-300 font-medium">
              Priority: {assessment.emergencyResponse.evacuationPriority}
            </p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/60 flex items-center justify-between">
              <span>{assessment.impactExposure.safeSheltersAvailable} Geo-Shelters</span>
              <span className="text-emerald-400 font-bold">Safe Routes Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
