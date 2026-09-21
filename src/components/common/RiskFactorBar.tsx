import React from 'react';

interface RiskFactorBarProps {
  label: string;
  valueDisplay: string;
  level: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  score: number; // 0-100
  explanation?: string;
  direction?: 'increases' | 'decreases' | 'neutral';
}

export const RiskFactorBar: React.FC<RiskFactorBarProps> = ({
  label,
  valueDisplay,
  level,
  score,
  explanation,
  direction = 'increases',
}) => {
  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case 'Very High':
        return 'bg-red-500 text-red-700';
      case 'High':
        return 'bg-orange-500 text-orange-700';
      case 'Moderate':
        return 'bg-amber-500 text-amber-700';
      case 'Low':
        return 'bg-emerald-500 text-emerald-700';
      case 'Very Low':
        return 'bg-emerald-400 text-emerald-600';
      default:
        return 'bg-slate-400 text-slate-600';
    }
  };

  const colorClass = getLevelColor(level);
  const barBg = colorClass.split(' ')[0];
  const textClr = colorClass.split(' ')[1];

  return (
    <div className="group py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          {label}
          <span className="font-mono text-slate-400 font-normal">({valueDisplay})</span>
        </span>
        <div className="flex items-center gap-2">
          {direction === 'decreases' && (
            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              Mitigating
            </span>
          )}
          <span className={`font-bold uppercase tracking-wider text-[11px] ${textClr}`}>
            {level}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barBg}`}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>

      {explanation && (
        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
          {explanation}
        </p>
      )}
    </div>
  );
};
