import React from 'react';

export const MapLegend: React.FC = () => {
  const levels = [
    { label: 'CRITICAL (>80)', color: 'bg-red-500', desc: 'Evacuation Alert' },
    { label: 'HIGH (61-80)', color: 'bg-orange-500', desc: 'Active Watch' },
    { label: 'ELEVATED (41-60)', color: 'bg-amber-500', desc: 'Precautionary' },
    { label: 'MODERATE (21-40)', color: 'bg-yellow-400', desc: 'Normal Watch' },
    { label: 'LOW (0-20)', color: 'bg-emerald-500', desc: 'Safe Terrain' },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 shadow-md text-xs font-sans">
      <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
        Hazard Risk Classification
      </h5>
      <div className="space-y-1.5">
        {levels.map((lvl) => (
          <div key={lvl.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${lvl.color} shrink-0`} />
            <span className="font-semibold text-slate-800 text-[11px]">{lvl.label}</span>
            <span className="text-[10px] text-slate-400 ml-auto">{lvl.desc}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
          <span>Infrastructure</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
          <span>Safe Relief Camp</span>
        </div>
      </div>
    </div>
  );
};
