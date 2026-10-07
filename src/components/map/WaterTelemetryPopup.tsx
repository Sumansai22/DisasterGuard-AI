import React from 'react';
import { WaterBodyTelemetry } from '../../types/map';
import { Droplets, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface WaterTelemetryPopupProps {
  waterBody: WaterBodyTelemetry;
}

export const WaterTelemetryPopup: React.FC<WaterTelemetryPopupProps> = ({ waterBody }) => {
  const getStatusColor = (st: string) => {
    switch (st) {
      case 'CRITICAL':
        return 'bg-red-500 text-white';
      case 'WARNING':
        return 'bg-orange-500 text-white';
      case 'WATCH':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="p-3 w-64 max-w-xs font-sans text-xs">
      <div className="flex items-start justify-between gap-1.5 pb-2 border-b border-slate-100 mb-2">
        <div>
          <div className="text-[10px] font-mono text-cyan-600 font-bold uppercase tracking-wider">
            {waterBody.type === 'RIVER' ? '🌊 River Level Sensor' : '🛡️ Dam Reservoir Telemetry'}
          </div>
          <h4 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
            {waterBody.name}
          </h4>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(waterBody.sensor_status)}`}>
          {waterBody.sensor_status}
        </span>
      </div>

      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 font-mono">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-500 font-sans">Current Water Level:</span>
          <strong className="text-slate-900 font-bold">{waterBody.current_level_m} m</strong>
        </div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-500 font-sans">Danger Level Mark:</span>
          <span className="text-red-600 font-bold">{waterBody.danger_level_m} m</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-sans">Capacity Utilization:</span>
          <span className={`font-bold ${waterBody.capacity_pct >= 100 ? 'text-red-600' : 'text-slate-700'}`}>
            {waterBody.capacity_pct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 bg-cyan-50/50 p-1.5 rounded border border-cyan-100 mb-2">
        <div className="flex items-center gap-1">
          <span>Trend:</span>
          <strong className="text-slate-800 flex items-center">
            {waterBody.trend === 'RISING' && <TrendingUp className="w-3 h-3 text-red-500 inline mr-0.5" />}
            {waterBody.trend === 'RECEDING' && <TrendingDown className="w-3 h-3 text-emerald-500 inline mr-0.5" />}
            {waterBody.trend === 'STEADY' && <Minus className="w-3 h-3 text-slate-500 inline mr-0.5" />}
            {waterBody.trend}
          </strong>
        </div>
        <div className="text-right">
          <span>Updated: </span>
          <span className="font-mono text-slate-700">{new Date(waterBody.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {waterBody.discharge_cusecs && (
        <div className="text-[10px] text-slate-500 font-mono">
          Spillway Discharge: <strong>{waterBody.discharge_cusecs} cusecs</strong>
        </div>
      )}
    </div>
  );
};
