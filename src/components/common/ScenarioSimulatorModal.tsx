import React, { useState } from 'react';
import { Play, Flame, Waves, Wind, Activity, Mountain, CheckCircle2, X } from 'lucide-react';
import { disasterManagementService, ScenarioSimulationResult } from '../../services/disasterManagementService';

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLocationName: string;
  onScenarioActivated?: (scenario: ScenarioSimulationResult) => void;
}

const SCENARIOS = [
  {
    id: 'FLASH_FLOOD',
    title: 'Flash Flood & River Inundation',
    icon: Waves,
    color: 'border-blue-500/60 bg-blue-950/40 text-blue-400',
    description: 'Cloudburst surcharge (168mm/24h) leading to canal breach and submerged residential wards.',
    severity: 'CRITICAL',
  },
  {
    id: 'LANDSLIDE',
    title: 'Debris Flow & Slope Failure',
    icon: Mountain,
    color: 'border-amber-500/60 bg-amber-950/40 text-amber-400',
    description: 'Pore-pressure saturation causing toe shear along hill roads and isolated settlements.',
    severity: 'CRITICAL',
  },
  {
    id: 'CYCLONE',
    title: 'Category 4 Cyclone & Storm Surge',
    icon: Wind,
    color: 'border-purple-500/60 bg-purple-950/40 text-purple-400',
    description: 'High-velocity gale (140 km/h) with 2.5m storm surge inundating coastal highways.',
    severity: 'CRITICAL',
  },
  {
    id: 'EARTHQUAKE',
    title: 'Magnitude 6.2 Seismic Event',
    icon: Activity,
    color: 'border-rose-500/60 bg-rose-950/40 text-rose-400',
    description: 'Structural micro-cracks and bridge masonry damage along key arterial lifelines.',
    severity: 'HIGH',
  },
  {
    id: 'WILDFIRE',
    title: 'Canopy Wildfire & Smoke Plume',
    icon: Flame,
    color: 'border-orange-500/60 bg-orange-950/40 text-orange-400',
    description: 'Fast-moving valley fire corridor threatening forest fringe settlements.',
    severity: 'HIGH',
  },
];

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  activeLocationName,
  onScenarioActivated,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('FLASH_FLOOD');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);

  if (!isOpen) return null;

  const handleRunScenario = async () => {
    setIsRunning(true);
    try {
      const res = await disasterManagementService.simulateScenario(selectedScenario, activeLocationName);
      setResult(res);
      if (onScenarioActivated) {
        onScenarioActivated(res);
      }
    } catch (err) {
      console.error('Scenario simulation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="p-2 bg-red-950/80 border border-red-800 text-red-400 rounded-xl shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap truncate">
                <span>Multi-Hazard Scenario Simulator</span>
                <span className="text-[10px] font-mono bg-red-900/60 text-red-300 px-2 py-0.5 rounded-full border border-red-700 shrink-0">
                  DEMO MODE
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                Target Sector: <span className="text-white font-semibold">{activeLocationName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-300 leading-relaxed">
            Select a disaster scenario to simulate cascading hazards, impact exposure metrics, road blockage
            corridors, safe evacuation routes, and drone distress rescue targets for{' '}
            <strong className="text-white">{activeLocationName}</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((sc) => {
              const Icon = sc.icon;
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc.id);
                    setResult(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? `${sc.color} ring-2 ring-orange-500/50`
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-white">
                      <Icon className="w-4 h-4 text-orange-400" />
                      <span>{sc.title}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        sc.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {sc.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">{sc.description}</p>
                </button>
              );
            })}
          </div>

          {result && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-2 animate-fade-in text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Scenario Active: {result.event.title}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-slate-300">
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Rainfall Surcharge</span>
                  <span className="font-bold text-white">{result.event.rainfall_mm} mm</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Population Exposed</span>
                  <span className="font-bold text-white">{result.event.affected_population.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Buildings at Risk</span>
                  <span className="font-bold text-white">{result.event.affected_buildings.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Active Targets</span>
                  <span className="font-bold text-white">{result.event.active_incidents_count} Detections</span>
                </div>
              </div>
              <p className="text-slate-400 pt-1">
                <strong>Recommended Action:</strong> {result.event.recommended_action}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleRunScenario}
            disabled={isRunning}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Activating Scenario...' : 'Run Scenario Simulation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
