import React from 'react';
import { X, HelpCircle, ShieldAlert, Cpu, Database, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';

interface WhyThisAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  riskLevel?: string;
  riskScore?: number;
  primaryContributor?: string;
  modelName?: string;
  timestamp?: string;
  factors?: {
    name: string;
    score: number;
    valueDisplay?: string;
    impact?: string;
    explanation?: string;
  }[];
  source?: string;
}

export const WhyThisAlertModal: React.FC<WhyThisAlertModalProps> = ({
  isOpen,
  onClose,
  title = 'Hazard Alert Assessment',
  riskLevel = 'HIGH',
  riskScore = 78,
  primaryContributor = 'Sustained Heavy Precipitation',
  modelName = 'Random Forest Classifier v2.4 (landslide_model.pkl)',
  timestamp,
  factors,
  source = 'MODEL OUTPUT',
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl shrink-0">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white truncate">
                {t('explainability.modalTitle', 'Why This Alert?')}
              </h3>
              <p className="text-xs text-slate-400 truncate">{title}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Top Risk Level & Model Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block truncate">Risk Level</span>
              <span
                className={`text-base font-black truncate block ${
                  riskScore >= 75
                    ? 'text-red-400'
                    : riskScore >= 50
                    ? 'text-orange-400'
                    : 'text-emerald-400'
                }`}
              >
                {riskLevel}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block truncate">AI Risk Score</span>
              <span className="text-base font-black text-white truncate block">
                {riskScore}%
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block truncate">Data Provenance</span>
              <div className="mt-1">
                <DataProvenanceBadge status={source === 'MODEL OUTPUT' ? 'MODEL_ESTIMATE' : 'SENSOR'} source={source} />
              </div>
            </div>
          </div>

          {/* Primary Contributor */}
          <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/30 text-orange-200 text-xs space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-orange-400 block">
              Primary Contributor
            </span>
            <p className="text-sm font-bold text-white leading-snug">
              {primaryContributor}
            </p>
          </div>

          {/* Contributing Factors Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-1">
              <span className="uppercase font-bold tracking-wider">Contributing Features</span>
              <span>Model Weight</span>
            </div>

            {factors && factors.length > 0 ? (
              <div className="space-y-2">
                {factors.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-200">{f.name}</span>
                      <span className="text-orange-400 font-bold">{Math.round(f.score)}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          f.score >= 70
                            ? 'bg-red-500'
                            : f.score >= 50
                            ? 'bg-orange-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(f.score, 100)}%` }}
                      />
                    </div>

                    {f.explanation && (
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                        {f.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 font-mono">
                Feature contribution details unavailable.
              </div>
            )}
          </div>

          {/* Model & Source Meta */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono text-slate-400">
            <div className="flex items-center justify-between">
              <span>ML Architecture:</span>
              <strong className="text-slate-200">{modelName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Inference Source:</span>
              <strong className="text-slate-200">{source}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Updated:</span>
              <strong className="text-slate-200">{timestamp || new Date().toLocaleTimeString()}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>AI Decision Support</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
