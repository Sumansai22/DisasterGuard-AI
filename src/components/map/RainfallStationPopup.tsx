import React from 'react';
import { RainfallStationTelemetry } from '../../types/map';
import { CloudRain, Wind, Thermometer, Droplets, Info } from 'lucide-react';

interface RainfallStationPopupProps {
  station: RainfallStationTelemetry;
}

export const RainfallStationPopup: React.FC<RainfallStationPopupProps> = ({ station }) => {
  return (
    <div className="p-3 w-68 max-w-xs font-sans text-xs">
      {/* Header */}
      <div className="pb-2 border-b border-slate-100 mb-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
            {station.warning_level}
          </span>
          <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
            ● {station.sensor_status}
          </span>
        </div>
        <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
          {station.station_name}
        </h4>
      </div>

      {/* 1h, 3h, 24h Rain Matrix */}
      <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 font-mono">
        <div className="p-1 rounded bg-white border border-slate-100">
          <span className="text-[9px] text-slate-400 block">1 Hour</span>
          <strong className="text-xs text-blue-600 font-bold">{station.rainfall_1h_mm}mm</strong>
        </div>
        <div className="p-1 rounded bg-white border border-slate-100">
          <span className="text-[9px] text-slate-400 block">3 Hours</span>
          <strong className="text-xs text-blue-700 font-bold">{station.rainfall_3h_mm}mm</strong>
        </div>
        <div className="p-1 rounded bg-white border border-slate-100">
          <span className="text-[9px] text-slate-400 block">24 Hours</span>
          <strong className="text-xs text-blue-900 font-bold">{station.rainfall_24h_mm}mm</strong>
        </div>
      </div>

      {/* Telemetry metrics */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 mb-2">
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-100">
          <Thermometer className="w-3 h-3 text-amber-500" />
          <span>Temp: <strong>{station.temperature_c}°C</strong></span>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-100">
          <Droplets className="w-3 h-3 text-cyan-500" />
          <span>Humidity: <strong>{station.humidity_pct}%</strong></span>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-100 col-span-2">
          <Wind className="w-3 h-3 text-teal-500" />
          <span>Wind: <strong>{station.wind_speed_kmh} km/h ({station.wind_direction})</strong></span>
        </div>
      </div>

      {/* Simulated/Demo indicator as strictly required */}
      {station.is_simulated && (
        <div className="flex items-center gap-1 p-1.5 bg-amber-50 rounded border border-amber-200 text-[9px] font-mono text-amber-800">
          <Info className="w-3 h-3 shrink-0 text-amber-600" />
          <span>SIMULATED / DEMO DATA (IMD API Fallback)</span>
        </div>
      )}
    </div>
  );
};
