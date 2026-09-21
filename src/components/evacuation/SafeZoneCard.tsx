import React from 'react';
import { SafeZone } from '../../types/evacuation';
import { ShieldCheck, Users, Phone, CheckCircle2 } from 'lucide-react';

interface SafeZoneCardProps {
  safeZone: SafeZone;
  isSelected: boolean;
  onSelect: () => void;
}

export const SafeZoneCard: React.FC<SafeZoneCardProps> = ({
  safeZone,
  isSelected,
  onSelect,
}) => {
  const occupancyPercentage = Math.round(
    (safeZone.capacityOccupied / safeZone.capacityTotal) * 100
  );

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-slate-900 leading-tight">
              {safeZone.name}
            </h5>
            <span className="text-[10px] text-slate-500 font-medium">{safeZone.type}</span>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          SAFE
        </span>
      </div>

      {/* Capacity Bar */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            Capacity
          </span>
          <span className="font-mono font-bold text-slate-800">
            {safeZone.capacityOccupied} / {safeZone.capacityTotal}{' '}
            <span className="text-slate-400 font-normal">({occupancyPercentage}%)</span>
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${
              occupancyPercentage > 85
                ? 'bg-red-500'
                : occupancyPercentage > 60
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>

      {/* Facilities Pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {safeZone.facilities.map((fac) => (
          <span
            key={fac}
            className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
          >
            ✓ {fac}
          </span>
        ))}
      </div>

      {/* Phone Contact */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1 font-mono">
          <Phone className="w-3 h-3 text-slate-400" />
          {safeZone.contactNumber}
        </span>
        <span className="font-semibold text-emerald-700">Verified Open</span>
      </div>
    </div>
  );
};
