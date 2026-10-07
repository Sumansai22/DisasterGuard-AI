import React from 'react';
import { Users, AlertTriangle, ShieldAlert, Radio } from 'lucide-react';
import { DroneAnalysisSummary } from '../../types/droneRescue';

interface DroneMissionStatsProps {
  summary: DroneAnalysisSummary;
  isAnalyzing?: boolean;
}

export const DroneMissionStats: React.FC<DroneMissionStatsProps> = ({ summary, isAnalyzing }) => {
  const statCards = [
    {
      title: 'PEOPLE DETECTED',
      value: summary.total_people_detected,
      subtitle: 'Tracked individuals in footage',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      title: 'POSSIBLE DISTRESS',
      value: summary.possible_distress_count,
      subtitle: 'Distress indicators flagged',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      title: 'HIGH PRIORITY',
      value: summary.high_priority_count,
      subtitle: 'Critical & High triage urgency',
      icon: ShieldAlert,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      title: 'RESCUE ALERTS',
      value: summary.rescue_alerts_count,
      subtitle: `${summary.dispatched_count} dispatched • ${summary.verified_count} verified`,
      icon: Radio,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white rounded-2xl border ${card.border} p-4 md:p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
                {isAnalyzing ? (
                  <span className="animate-pulse text-slate-400">...</span>
                ) : (
                  card.value
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};
