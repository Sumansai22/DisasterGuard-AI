import React from 'react';
import { SoilType } from '../../types/prediction';
import { Layers, Info } from 'lucide-react';

interface SoilSelectorProps {
  value: SoilType;
  onChange: (soil: SoilType) => void;
  error?: string;
}

export const SoilSelector: React.FC<SoilSelectorProps> = ({ value, onChange, error }) => {
  const soilOptions: {
    type: SoilType;
    label: string;
    description: string;
    cohesionRisk: string;
    color: string;
  }[] = [
    {
      type: 'Gravel',
      label: 'Gravel (Coarse)',
      description: 'High porosity, high drainage permeability. Lowest pore pressure accumulation.',
      cohesionRisk: 'Low Sensitivity',
      color: 'hover:border-emerald-400 focus:border-emerald-500',
    },
    {
      type: 'Sand',
      label: 'Sand (Medium Coarse)',
      description: 'Moderate permeability. Susceptible to liquefaction and translational slides under heavy saturation.',
      cohesionRisk: 'Moderate Sensitivity',
      color: 'hover:border-amber-400 focus:border-amber-500',
    },
    {
      type: 'Silt',
      label: 'Silt (Fine / Clay-Rich)',
      description: 'Low permeability, high moisture retention. Highly prone to catastrophic debris flows and slope shear failure.',
      cohesionRisk: 'High Sensitivity (Critical)',
      color: 'hover:border-red-400 focus:border-red-500',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Select Soil Type Matrix
        </label>
        <span className="text-[11px] text-slate-400 font-mono">
          Auto-encoded to 3 model features
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {soilOptions.map((opt) => {
          const isSelected = value === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onChange(opt.type)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-orange-600 bg-orange-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mt-1">
                {opt.description}
              </p>
              <div className="mt-2 text-[10px] font-mono font-bold text-slate-600 flex items-center gap-1">
                <span>Risk:</span>
                <span
                  className={
                    opt.type === 'Silt'
                      ? 'text-red-600'
                      : opt.type === 'Sand'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }
                >
                  {opt.cohesionRisk}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Verification Encoding Preview */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          Model Vector:
        </span>
        <span className="space-x-3">
          <span>Soil_Type_Gravel: <strong>{value === 'Gravel' ? 1 : 0}</strong></span>
          <span>Soil_Type_Sand: <strong>{value === 'Sand' ? 1 : 0}</strong></span>
          <span>Soil_Type_Silt: <strong>{value === 'Silt' ? 1 : 0}</strong></span>
        </span>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
