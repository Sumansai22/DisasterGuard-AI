import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskThresholdConfig } from '../../types/admin';
import { Sliders, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { DEFAULT_RISK_THRESHOLDS } from '../../utils/constants';

export const ThresholdConfig: React.FC = () => {
  const { riskThresholds, setRiskThresholds } = useApp();
  const [config, setConfig] = useState<RiskThresholdConfig>({ ...riskThresholds });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: keyof RiskThresholdConfig, val: number) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setRiskThresholds(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_RISK_THRESHOLDS });
    setRiskThresholds(DEFAULT_RISK_THRESHOLDS);
  };

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Risk Score & Early-Warning Threshold Configuration
            </h4>
            <p className="text-xs text-slate-500">
              Tune decision-support classification cutoffs for regional geology
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Default Thresholds
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span>Low Risk Upper Bound</span>
            <span className="font-mono text-emerald-600">{config.lowMax} / 100</span>
          </label>
          <input
            type="number"
            min="5"
            max="30"
            value={config.lowMax}
            onChange={(e) => handleChange('lowMax', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span>Moderate Risk Upper Bound</span>
            <span className="font-mono text-amber-600">{config.moderateMax} / 100</span>
          </label>
          <input
            type="number"
            min="20"
            max="50"
            value={config.moderateMax}
            onChange={(e) => handleChange('moderateMax', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span>Elevated Risk Upper Bound</span>
            <span className="font-mono text-orange-500">{config.elevatedMax} / 100</span>
          </label>
          <input
            type="number"
            min="40"
            max="70"
            value={config.elevatedMax}
            onChange={(e) => handleChange('elevatedMax', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span>High Risk Upper Bound</span>
            <span className="font-mono text-orange-600">{config.highMax} / 100</span>
          </label>
          <input
            type="number"
            min="60"
            max="90"
            value={config.highMax}
            onChange={(e) => handleChange('highMax', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span>Rainfall Warning Threshold</span>
            <span className="font-mono text-blue-600">{config.rainfallWarningMm} mm</span>
          </label>
          <input
            type="number"
            min="30"
            max="150"
            value={config.rainfallWarningMm}
            onChange={(e) => handleChange('rainfallWarningMm', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span>Rainfall Critical Trigger</span>
            <span className="font-mono text-red-600">{config.rainfallCriticalMm} mm</span>
          </label>
          <input
            type="number"
            min="80"
            max="300"
            value={config.rainfallCriticalMm}
            onChange={(e) => handleChange('rainfallCriticalMm', parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        {savedSuccess ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            Thresholds successfully updated.
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">
            Changes propagate dynamically to all decision-support gauges.
          </span>
        )}

        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      </div>
    </form>
  );
};
