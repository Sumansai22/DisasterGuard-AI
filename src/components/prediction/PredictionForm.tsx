import React, { useState } from 'react';
import { PredictionFormValues } from '../../types/prediction';
import { SoilSelector } from './SoilSelector';
import { ScenarioSelector } from './ScenarioSelector';
import { validatePredictionInput } from '../../utils/validation';
import {
  CloudRain,
  Mountain,
  Droplets,
  Trees,
  Activity,
  Waves,
  ArrowRight,
  RotateCcw,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';

interface PredictionFormProps {
  initialValues: PredictionFormValues;
  onSubmit: (values: PredictionFormValues) => Promise<void>;
  isLoading: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const [formValues, setFormValues] = useState<PredictionFormValues>(initialValues);
  const [activePresetId, setActivePresetId] = useState<string | undefined>();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validation = validatePredictionInput(formValues);

  const handleChange = (field: keyof PredictionFormValues, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleScenarioSelect = (scenario: any) => {
    setFormValues({ ...scenario.input });
    setActivePresetId(scenario.id);
  };

  const handleReset = () => {
    setFormValues({
      Rainfall_mm: 85,
      Slope_Angle: 32,
      Soil_Saturation: 75,
      Vegetation_Cover: 40,
      Earthquake_Activity: 0.1,
      Proximity_to_Water: 180,
      soilType: 'Sand',
    });
    setActivePresetId(undefined);
    setTouched({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.isValid && !isLoading) {
      onSubmit(formValues);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preset Scenarios Header */}
      <ScenarioSelector
        onSelect={handleScenarioSelect}
        activePresetId={activePresetId}
      />

      {/* Environmental Parameters Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Environmental & Geological Input Features
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly maps to 9 input parameters of <code className="text-orange-600 font-mono">landslide_model.pkl</code>
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>

        {/* 2 Column Parameters Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Rainfall (mm) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-500" />
                Rainfall (mm)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Rainfall_mm</span>
            </div>
            <input
              type="number"
              min="0"
              max="1000"
              step="1"
              value={formValues.Rainfall_mm}
              onChange={(e) => handleChange('Rainfall_mm', parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-medium"
              placeholder="e.g. 120"
              required
            />
            {touched.Rainfall_mm && validation.errors.Rainfall_mm && (
              <p className="text-xs text-red-600 font-medium">{validation.errors.Rainfall_mm}</p>
            )}
          </div>

          {/* Slope Angle (degrees) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-amber-600" />
                Slope Angle (degrees)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Slope_Angle</span>
            </div>
            <input
              type="number"
              min="0"
              max="90"
              step="0.5"
              value={formValues.Slope_Angle}
              onChange={(e) => handleChange('Slope_Angle', parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-medium"
              placeholder="e.g. 35"
              required
            />
            {touched.Slope_Angle && validation.errors.Slope_Angle && (
              <p className="text-xs text-red-600 font-medium">{validation.errors.Slope_Angle}</p>
            )}
          </div>

          {/* Soil Saturation (%) - Slider & Numeric Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-600" />
                Soil Saturation (%)
              </label>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {formValues.Soil_Saturation}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formValues.Soil_Saturation}
              onChange={(e) => handleChange('Soil_Saturation', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Dry)</span>
              <span>50% (Moist)</span>
              <span>100% (Saturated)</span>
            </div>
          </div>

          {/* Vegetation Cover (%) - Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-emerald-600" />
                Vegetation Cover (%)
              </label>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {formValues.Vegetation_Cover}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formValues.Vegetation_Cover}
              onChange={(e) => handleChange('Vegetation_Cover', parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Barren)</span>
              <span>50% (Shrubland)</span>
              <span>100% (Dense Forest)</span>
            </div>
          </div>

          {/* Earthquake Activity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-500" />
                Earthquake Activity (PGA / Mag)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Earthquake_Activity</span>
            </div>
            <input
              type="number"
              min="0"
              max="10"
              step="0.05"
              value={formValues.Earthquake_Activity}
              onChange={(e) => handleChange('Earthquake_Activity', parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-medium"
              placeholder="e.g. 0.2"
              required
            />
          </div>

          {/* Proximity to Water (meters) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-sky-600" />
                Proximity to Water (meters)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Proximity_to_Water</span>
            </div>
            <input
              type="number"
              min="0"
              max="5000"
              step="10"
              value={formValues.Proximity_to_Water}
              onChange={(e) => handleChange('Proximity_to_Water', parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-medium"
              placeholder="e.g. 150"
              required
            />
          </div>
        </div>

        {/* Soil Type Selection Component */}
        <div className="pt-2 border-t border-slate-100">
          <SoilSelector
            value={formValues.soilType}
            onChange={(soil) => handleChange('soilType', soil)}
            error={touched.soilType ? validation.errors.soilType : undefined}
          />
        </div>

        {/* Submission Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={!validation.isValid || isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md ${
              validation.isValid && !isLoading
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-orange-950/20 cursor-pointer active:scale-[0.99]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing Environmental Conditions...</span>
              </>
            ) : (
              <>
                <span>Analyze Landslide Risk</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
