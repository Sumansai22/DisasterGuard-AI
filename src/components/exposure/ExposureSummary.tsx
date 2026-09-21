import React from 'react';
import { ExposureMetrics } from '../../types/exposure';
import {
  Users,
  Building,
  GraduationCap,
  Hospital,
  Route,
  GitCommit,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface ExposureSummaryProps {
  data: ExposureMetrics;
}

export const ExposureSummary: React.FC<ExposureSummaryProps> = ({ data }) => {
  const cards = [
    {
      label: 'Estimated Population Exposed',
      value: data.estimatedPopulationExposed.toLocaleString(),
      subtitle: `${data.vulnerableGroups.elderly} elderly • ${data.vulnerableGroups.children} children`,
      icon: Users,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      label: 'Buildings at Risk',
      value: data.buildingsCount,
      subtitle: 'Residential & Commercial structures',
      icon: Building,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      label: 'Schools & Educational Units',
      value: data.schoolsCount,
      subtitle: 'Evacuation protocol required',
      icon: GraduationCap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: 'Hospitals & Medical Centres',
      value: data.hospitalsCount,
      subtitle: 'Critical patient relocation priority',
      icon: Hospital,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    {
      label: 'Roads & Mountain Passes',
      value: data.roadsCount,
      subtitle: 'Prone to debris blockages',
      icon: Route,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'Bridges & Culverts',
      value: data.bridgesCount,
      subtitle: 'High structural flood/mud load',
      icon: GitCommit,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
    {
      label: 'Critical Infrastructure Assets',
      value: data.criticalInfrastructureCount,
      subtitle: 'Power substations, cell towers',
      icon: Zap,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">
              Vulnerability & Asset Exposure: {data.locationName}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Geospatial intersection of AI Predicted Hazard Zone with OpenStreetMap Census & Infrastructure Layer
          </p>
        </div>

        <RiskBadge level={data.riskLevel} score={data.riskScore} size="lg" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={`bg-white rounded-xl border ${c.border} p-4 shadow-2xs hover:shadow-xs transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {c.label}
                </span>
                <div className={`p-2 rounded-lg ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {c.value}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {c.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
