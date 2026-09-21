import React from 'react';
import { RainfallMetric } from '../../types/rainfall';
import { CloudRain, TrendingUp, TrendingDown } from 'lucide-react';

interface RainfallStatCardsProps {
  metrics: RainfallMetric[];
}

export const RainfallStatCards: React.FC<RainfallStatCardsProps> = ({ metrics }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'extreme':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'heavy':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'moderate':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.period}
          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>{metric.label}</span>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${getStatusColor(
                metric.status
              )}`}
            >
              {metric.status}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
              {metric.value.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-400">mm</span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-[10px] font-medium">
            {metric.change >= 0 ? (
              <span className="text-red-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                +{metric.change}%
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                {metric.change}%
              </span>
            )}
            <span className="text-slate-400">vs prev</span>
          </div>
        </div>
      ))}
    </div>
  );
};
