import React from 'react';
import { FactorContribution } from '../../types/prediction';
import { RiskFactorBar } from '../common/RiskFactorBar';
import { HelpCircle, Info, BrainCircuit, BarChart2 } from 'lucide-react';

interface XAIBreakdownProps {
  factors: FactorContribution[];
  explanation?: string;
  shapValues?: Record<string, number>;
}

export const XAIBreakdown: React.FC<XAIBreakdownProps> = ({
  factors,
  explanation,
  shapValues,
}) => {
  const hasShap = Boolean(shapValues && Object.keys(shapValues).length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Why is this area at risk? (Explainable AI)
            </h4>
            <p className="text-xs text-slate-500">
              {hasShap
                ? 'SHAP Game-Theoretic Feature Attributions'
                : 'Geotechnical Input Factors & Condition Weight Breakdown'}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          {hasShap ? 'SHAP Engine Active' : 'Factor Decomposition'}
        </span>
      </div>

      {/* Primary Explanation Box */}
      {explanation && (
        <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 text-xs text-slate-800 leading-relaxed flex items-start gap-3">
          <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-orange-950 block mb-0.5">
              Geotechnical Diagnostic Assessment:
            </span>
            <span>{explanation}</span>
          </div>
        </div>
      )}

      {/* Factor Bars */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1">
          <span>Primary Environmental Factors</span>
          <span>Impact Level</span>
        </div>

        {factors.map((factor) => (
          <RiskFactorBar
            key={factor.name}
            label={factor.name}
            valueDisplay={String(factor.value)}
            level={factor.impact}
            score={factor.score}
            direction={factor.direction}
            explanation={factor.explanation}
          />
        ))}
      </div>

      {/* SHAP Attributions (if backend provides them) */}
      {hasShap && shapValues && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <h5 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            Empirical Feature Weights (Local Attribution)
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(shapValues).map(([feat, val]) => (
              <div
                key={feat}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-mono"
              >
                <div className="text-slate-500 truncate text-[10px]">{feat}</div>
                <div
                  className={`font-bold text-xs ${
                    val > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {val > 0 ? `+${val}` : val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
