import React from 'react';
import { PredictionResponse } from '../../types/prediction';
import { RiskGauge } from '../common/RiskGauge';
import { RiskBadge } from '../common/RiskBadge';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Navigation,
  BellRing,
  ArrowRight,
  Clock,
  Cpu,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PredictionResultProps {
  result: PredictionResponse;
  onOpenAlertModal?: () => void;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
  result,
  onOpenAlertModal,
}) => {
  const isHighRisk = result.risk_score >= 60;
  const isCritical = result.risk_score >= 80;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            AI Inference Output
          </span>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-0.5">
            AI Risk Assessment
            {result.is_demo && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Demo Mode Response
              </span>
            )}
          </h3>
        </div>
        <RiskBadge level={result.risk_level} score={result.risk_score} size="lg" />
      </div>

      {/* Main Gauge and Status Grid */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-2">
        {/* Left: Animated Circular Gauge */}
        <div className="shrink-0">
          <RiskGauge
            score={result.risk_score}
            riskLevel={result.risk_level}
            size={190}
            strokeWidth={14}
          />
        </div>

        {/* Right: Outcome Details */}
        <div className="flex-1 w-full space-y-3.5">
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              result.prediction === 1
                ? isCritical
                  ? 'bg-red-50/80 border-red-200 text-red-950'
                  : 'bg-orange-50/80 border-orange-200 text-orange-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}
          >
            {result.prediction === 1 ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wide">
                {result.prediction === 1
                  ? 'LANDSLIDE RISK DETECTED'
                  : 'STABLE CONDITIONS — NO IMMEDIATE RISK'}
              </h4>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                {result.prediction === 1
                  ? 'Estimated landslide probability is high based on geological pore-water and slope thresholds.'
                  : 'Current environmental and topographic parameters indicate low landslide vulnerability.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Model Confidence
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 font-mono">
                  {result.confidence}%
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">High Precision</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Inference Timestamp
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Downstream Emergency Workflow Journey Action Bar (Requirement 34) */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Integrated Response Workflow:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Link
            to="/impact-analysis"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Impact Analysis</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/evacuation"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Evacuation Routes</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/alerts"
            className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 text-xs font-bold transition-all group"
          >
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-red-600 animate-bounce" />
              <span>Issue Alert</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
