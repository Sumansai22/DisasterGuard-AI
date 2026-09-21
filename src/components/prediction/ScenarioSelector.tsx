import React from 'react';
import { PRESET_SCENARIOS } from '../../utils/constants';
import { PresetScenario } from '../../types/prediction';
import { Zap, CloudLightning, ShieldCheck, Activity } from 'lucide-react';

interface ScenarioSelectorProps {
  onSelect: (scenario: PresetScenario) => void;
  activePresetId?: string;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  onSelect,
  activePresetId,
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Monsoon Extreme':
        return CloudLightning;
      case 'Seismic Trigger':
        return Activity;
      case 'Safe Lowland':
        return ShieldCheck;
      default:
        return Zap;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-orange-500" />
          Quick Test Scenarios (SIH Demo)
        </span>
        <span className="text-[11px] text-slate-400">1-Click Telemetry Load</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PRESET_SCENARIOS.map((scenario) => {
          const Icon = getIcon(scenario.category);
          const isActive = activePresetId === scenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelect(scenario)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-400/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded bg-slate-100 text-slate-700">
                  <Icon className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <h5 className="font-bold text-xs text-slate-900 truncate">
                  {scenario.name}
                </h5>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                {scenario.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
