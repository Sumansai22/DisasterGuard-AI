import React from 'react';
import { InfrastructureAsset } from '../../types/exposure';
import { Hospital, GraduationCap, Zap, Route, GitCommit, ShieldAlert, Phone } from 'lucide-react';

interface CriticalInfrastructureCardsProps {
  assets: InfrastructureAsset[];
}

export const CriticalInfrastructureCards: React.FC<CriticalInfrastructureCardsProps> = ({ assets }) => {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return Hospital;
      case 'school':
        return GraduationCap;
      case 'power_substation':
        return Zap;
      case 'road':
        return Route;
      case 'bridge':
        return GitCommit;
      default:
        return ShieldAlert;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'high_risk':
        return { text: 'High Hazard Zone', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'evacuating':
        return { text: 'Evacuation in Progress', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'safe':
        return { text: 'Operational & Safe', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { text: 'Monitored', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Identified Exposed Assets & Public Facilities
          </h4>
          <p className="text-xs text-slate-500">
            Within 1.5km proximity to predicted landslide trajectory
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          {assets.length} Facilities Catalogued
        </span>
      </div>

      <div className="space-y-2.5">
        {assets.map((asset) => {
          const Icon = getAssetIcon(asset.type);
          const badge = getStatusBadge(asset.status);

          return (
            <div
              key={asset.id}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white text-blue-600 border border-slate-200 shadow-2xs shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{asset.name}</h5>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="capitalize">{asset.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Distance from slope toe: <strong>{asset.distanceFromRiskCenterKm} km</strong></span>
                    {asset.capacity && (
                      <>
                        <span>•</span>
                        <span>Capacity: {asset.capacity} persons</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:self-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.text}
                </span>
                {asset.contact && (
                  <a
                    href={`tel:${asset.contact}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Emergency Call</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
