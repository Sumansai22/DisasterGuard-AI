import React from 'react';
import { SafeZone } from '../../types/evacuation';
import { ShieldCheck, Users, Phone, Navigation, MapPin } from 'lucide-react';

interface SafeZoneCardProps {
  safeZone: SafeZone;
  isSelected: boolean;
  onSelect: () => void;
  onRouteTo?: () => void;
}

export const SafeZoneCard: React.FC<SafeZoneCardProps> = ({
  safeZone,
  isSelected,
  onSelect,
  onRouteTo,
}) => {
  const cap = safeZone.capacityTotal || safeZone.capacity || 1000;
  const occ = safeZone.capacityOccupied !== undefined ? safeZone.capacityOccupied : (safeZone.current_occupancy || 0);
  const avail = safeZone.availableCapacity !== undefined ? safeZone.availableCapacity : (safeZone.available_capacity ?? Math.max(0, cap - occ));
  const occupancyPercentage = Math.round((occ / cap) * 100);

  const distanceText = (safeZone.distanceKm !== undefined && safeZone.distanceKm !== null)
    ? `${safeZone.distanceKm} km away`
    : (safeZone.distance_km !== undefined && safeZone.distance_km !== null)
    ? `${safeZone.distance_km} km away`
    : null;

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
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-500 font-medium">{safeZone.type}</span>
              {distanceText && (
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                  📍 {distanceText}
                </span>
              )}
            </div>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          avail <= 0
            ? 'bg-red-100 text-red-800 border-red-200'
            : avail < (cap * 0.2)
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
        }`}>
          {avail <= 0 ? 'FULL' : avail < (cap * 0.2) ? 'LIMITED' : 'SAFE'}
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
            {occ} / {cap}{' '}
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
        {(safeZone.facilities || []).map((fac) => (
          <span
            key={fac}
            className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
          >
            ✓ {fac}
          </span>
        ))}
      </div>

      {/* Action footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1 font-mono">
          <Phone className="w-3 h-3 text-slate-400" />
          {safeZone.contactNumber || safeZone.phone || '+91 112'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onRouteTo) onRouteTo();
            else onSelect();
          }}
          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Navigation className="w-3 h-3" />
          Route to Safehouse
        </button>
      </div>
    </div>
  );
};
