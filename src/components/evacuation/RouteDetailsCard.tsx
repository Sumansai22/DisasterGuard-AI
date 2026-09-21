import React from 'react';
import { EvacuationRoutePlan } from '../../types/evacuation';
import {
  Navigation,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface RouteDetailsCardProps {
  route: EvacuationRoutePlan;
}

export const RouteDetailsCard: React.FC<RouteDetailsCardProps> = ({ route }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Route Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Recommended Safe Evacuation Corridor
            </h4>
            <p className="text-xs text-slate-500">
              Obstacle-avoidance routing away from landslide trajectory
            </p>
          </div>
        </div>

        {route.isSimulation && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            SIMULATION ROUTE
          </span>
        )}
      </div>

      {/* Quick Route KPI Bar */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Distance
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono">
            {route.distanceKm} km
          </span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Estimated Travel Time
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono">
            ~{route.estimatedTimeMin} mins
          </span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Corridor Safety
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {route.routeSafety}
          </span>
        </div>
      </div>

      {/* Step-by-Step Directions */}
      <div className="space-y-2 pt-1">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Turn-by-Turn Navigation Protocol
        </h5>

        <div className="space-y-2">
          {route.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700"
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                {step.stepNumber}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 leading-snug">{step.instruction}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                  <span>Distance: {step.distanceMeters}m</span>
                  {step.hazardNote && (
                    <span className="text-amber-700 font-sans font-medium flex items-center gap-1 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {step.hazardNote}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <p className="text-[11px] text-slate-400 leading-snug border-t border-slate-100 pt-3">
        ⚠️ <em>Always prioritize local police and disaster rapid response personnel instructions over automated navigational suggestions.</em>
      </p>
    </div>
  );
};
