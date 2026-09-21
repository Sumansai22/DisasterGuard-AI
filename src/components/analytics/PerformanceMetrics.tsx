import React from 'react';
import { Target, CheckSquare, Award, Flame, BarChart } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  } | null;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-xs">
        <p className="text-xs font-semibold text-slate-500">
          Model metrics not available.
        </p>
      </div>
    );
  }

  const items = [
    {
      label: 'Model Accuracy',
      value: `${(metrics.accuracy * 100).toFixed(1)}%`,
      subtitle: 'Overall test dataset concordance',
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Precision',
      value: `${(metrics.precision * 100).toFixed(1)}%`,
      subtitle: 'False positive minimizer',
      icon: CheckSquare,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Recall (Sensitivity)',
      value: `${(metrics.recall * 100).toFixed(1)}%`,
      subtitle: 'Landslide detection rate',
      icon: Award,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'F1-Score',
      value: `${(metrics.f1Score * 100).toFixed(1)}%`,
      subtitle: 'Harmonic balance metric',
      icon: Flame,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'ROC - AUC Score',
      value: metrics.rocAuc.toFixed(3),
      subtitle: 'Discriminative capacity',
      icon: BarChart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Validated Model Evaluation Metrics
          </h4>
          <p className="text-xs text-slate-500">
            Computed on independent 20% holdout cross-validation set
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
          Verified Test Evaluation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {it.label}
                </span>
                <div className={`p-1.5 rounded-md ${it.bg} ${it.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                {it.value}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight truncate">
                {it.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
