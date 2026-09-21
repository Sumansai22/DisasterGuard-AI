import React from 'react';
import { MonitoringStation } from '../../types/map';
import { RiskBadge } from '../common/RiskBadge';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Mountain, Droplets, Trees, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePrediction } from '../../context/PredictionContext';
import { useApp } from '../../context/AppContext';

interface LocationPopupProps {
  station: MonitoringStation;
  onSelect?: () => void;
}

export const LocationPopup: React.FC<LocationPopupProps> = ({ station, onSelect }) => {
  const navigate = useNavigate();
  const { setFormValues } = usePrediction();
  const { setSelectedStation } = useApp();

  const handleDetailedAnalysis = () => {
    setSelectedStation(station);
    // Pre-populate prediction form with this station's telemetry
    setFormValues({
      Rainfall_mm: station.parameters.rainfall_mm,
      Slope_Angle: station.parameters.slope_angle,
      Soil_Saturation: station.parameters.soil_saturation,
      Vegetation_Cover: station.parameters.vegetation_cover,
      Earthquake_Activity: station.parameters.earthquake_activity,
      Proximity_to_Water: station.parameters.proximity_to_water,
      soilType: station.parameters.soil_type,
    });
    if (onSelect) onSelect();
    navigate('/prediction');
  };

  return (
    <div className="p-4 w-72 max-w-xs font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-sm text-slate-900 leading-tight">
            {station.name}
          </h4>
          <p className="text-[11px] text-slate-500 font-medium">
            {station.region}, {station.state}
          </p>
        </div>
        <RiskBadge level={station.riskLevel} score={station.riskScore} size="sm" />
      </div>

      {/* Prediction Status */}
      <div className="bg-slate-50 p-2.5 rounded-lg mb-3 border border-slate-200/80">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          AI Risk Assessment
        </div>
        <p className="text-xs font-bold text-slate-800 mt-0.5">
          {station.prediction}
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
          <span>Model Confidence:</span>
          <span className="font-mono font-bold text-slate-700">{station.confidence}%</span>
        </div>
      </div>

      {/* Environmental Parameters Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3.5">
        <div className="flex items-center gap-1.5 text-slate-600 bg-white p-1.5 rounded border border-slate-100">
          <CloudRain className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>Rain: <strong className="font-mono text-slate-800">{station.parameters.rainfall_mm}mm</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 bg-white p-1.5 rounded border border-slate-100">
          <Mountain className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Slope: <strong className="font-mono text-slate-800">{station.parameters.slope_angle}°</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 bg-white p-1.5 rounded border border-slate-100">
          <Droplets className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span>Soil Sat: <strong className="font-mono text-slate-800">{station.parameters.soil_saturation}%</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 bg-white p-1.5 rounded border border-slate-100">
          <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Veg: <strong className="font-mono text-slate-800">{station.parameters.vegetation_cover}%</strong></span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleDetailedAnalysis}
        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <span>View Detailed Analysis</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
