import React, { useState } from 'react';
import { Play, Flame, Waves, Wind, Activity, Mountain, CheckCircle2, X, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { disasterManagementService, ScenarioSimulationResult } from '../../services/disasterManagementService';
import { DataProvenanceBadge } from './DataProvenanceBadge';

interface ScenarioSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLocationName?: string;
  onScenarioActivated?: (scenario: ScenarioSimulationResult | null) => void;
  onScenarioApplied?: () => void;
}

const SCENARIOS = [
  {
    id: 'FLASH_FLOOD',
    title: 'Flash Flood & River Inundation',
    icon: Waves,
    color: 'border-blue-500/60 bg-blue-950/40 text-blue-400',
    description: 'Cloudburst surcharge leading to canal breach and submerged residential wards.',
    defaultRainfallIncrease: 30,
    durationHours: 6,
    severity: 'CRITICAL',
  },
  {
    id: 'LANDSLIDE',
    title: 'Debris Flow & Slope Failure',
    icon: Mountain,
    color: 'border-amber-500/60 bg-amber-950/40 text-amber-400',
    description: 'Pore-pressure saturation causing toe shear along hill roads and isolated settlements.',
    defaultRainfallIncrease: 45,
    durationHours: 12,
    severity: 'CRITICAL',
  },
  {
    id: 'CYCLONE',
    title: 'Category 4 Cyclone & Storm Surge',
    icon: Wind,
    color: 'border-purple-500/60 bg-purple-950/40 text-purple-400',
    description: 'High-velocity gale (140 km/h) with 2.5m storm surge inundating coastal highways.',
    defaultRainfallIncrease: 60,
    durationHours: 18,
    severity: 'CRITICAL',
  },
  {
    id: 'EARTHQUAKE',
    title: 'Magnitude 6.2 Seismic Event',
    icon: Activity,
    color: 'border-rose-500/60 bg-rose-950/40 text-rose-400',
    description: 'Structural micro-cracks and bridge masonry damage along key arterial lifelines.',
    defaultRainfallIncrease: 0,
    durationHours: 2,
    severity: 'HIGH',
  },
  {
    id: 'WILDFIRE',
    title: 'Canopy Wildfire & Smoke Plume',
    icon: Flame,
    color: 'border-orange-500/60 bg-orange-950/40 text-orange-400',
    description: 'Fast-moving valley fire corridor threatening forest fringe settlements.',
    defaultRainfallIncrease: 0,
    durationHours: 24,
    severity: 'HIGH',
  },
];

export const ScenarioSimulatorModal: React.FC<ScenarioSimulatorModalProps> = ({
  isOpen,
  onClose,
  activeLocationName,
  onScenarioActivated,
  onScenarioApplied,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('FLASH_FLOOD');
  const [severity, setSeverity] = useState<string>('High');
  const [rainfallIncreasePct, setRainfallIncreasePct] = useState<number>(30);
  const [durationHours, setDurationHours] = useState<number>(6);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);

  if (!isOpen) return null;

  const handleRunScenario = async () => {
    setIsRunning(true);
    try {
      const res = await disasterManagementService.simulateScenario(selectedScenario, activeLocationName || 'Active Sector');
      setResult(res);
      if (onScenarioActivated) {
        onScenarioActivated(res);
      }
      if (onScenarioApplied) {
        onScenarioApplied();
      }
    } catch (err) {
      console.error('Scenario simulation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearScenario = () => {
    setResult(null);
    if (onScenarioActivated) {
      onScenarioActivated(null);
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
                  SIMULATION
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                Target Sector: <span className="text-white font-semibold">{activeLocationName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Controls: Hazard Type */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              1. Select Hazard Scenario
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SCENARIOS.map((sc) => {
                const Icon = sc.icon;
                const isSelected = selectedScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setSelectedScenario(sc.id);
                      setRainfallIncreasePct(sc.defaultRainfallIncrease);
                      setDurationHours(sc.durationHours);
                      setResult(null);
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? `${sc.color} ring-2 ring-orange-500/50 shadow-sm`
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
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
                    <p className="text-[11px] text-slate-400 leading-relaxed">{sc.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Scenario Sliders */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Severity Parameter</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              >
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Rainfall Surcharge: <strong className="text-orange-400">+{rainfallIncreasePct}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={rainfallIncreasePct}
                onChange={(e) => setRainfallIncreasePct(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Duration: <strong className="text-blue-400">{durationHours} Hours</strong>
              </label>
              <input
                type="range"
                min="1"
                max="48"
                step="1"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* SIMULATION RESULT */}
          {result && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-3 animate-fade-in text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="uppercase tracking-wide">SIMULATION RESULT: {result.event.title}</span>
                </div>
                <DataProvenanceBadge status="SIMULATION" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-300">
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Rainfall Surcharge</span>
                  <span className="font-bold text-white text-xs">{result.event.rainfall_mm} mm</span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Exposed Population</span>
                  <span className="font-bold text-white text-xs">{result.event.affected_population.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Buildings at Risk</span>
                  <span className="font-bold text-white text-xs">{result.event.affected_buildings.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Blocked Corridors</span>
                  <span className="font-bold text-amber-400 text-xs">{result.event.blocked_roads?.length || 1} Routes</span>
                </div>
              </div>

              {result.event.blocked_roads && result.event.blocked_roads.length > 0 && (
                <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/60 text-red-300 text-[11px] space-y-1">
                  <strong className="block text-red-400 uppercase">Potentially Blocked / Unsafe Roadways:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {result.event.blocked_roads.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-slate-300 pt-1 text-[11px] leading-relaxed">
                <strong className="text-white">Recommended Action:</strong> {result.event.recommended_action}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            {result && (
              <button
                type="button"
                onClick={handleClearScenario}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CLEAR SCENARIO</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleRunScenario}
              disabled={isRunning}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Simulating...' : 'RUN SIMULATION'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
