import React from 'react';
import { CriticalInfrastructureItem, SensorNodeItem } from '../../types/map';
import { Building2, AlertTriangle, CheckCircle, XCircle, Info, Radio, Battery, Clock } from 'lucide-react';

export const CriticalInfraPopup: React.FC<{ item: CriticalInfrastructureItem }> = ({ item }) => {
  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'OPERATIONAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DAMAGED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BLOCKED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'PARTIALLY_OPERATIONAL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="p-3 w-68 max-w-xs font-sans text-xs">
      <div className="pb-2 border-b border-slate-100 mb-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            {item.type}
          </span>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
            {item.status.replace(/_/g, ' ')}
          </span>
        </div>
        <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
          {item.name}
        </h4>
      </div>

      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] text-slate-700 mb-2">
        {item.condition_note}
      </div>

      {item.is_demo && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded text-[9px] font-mono text-slate-500">
          <Info className="w-3 h-3 text-slate-400" />
          <span>SIMULATED INFRASTRUCTURE TELEMETRY</span>
        </div>
      )}
    </div>
  );
};

export const SensorNodePopup: React.FC<{ sensor: SensorNodeItem }> = ({ sensor }) => {
  const getStatusColor = (st: string) => {
    switch (st) {
      case 'ONLINE':
        return 'bg-emerald-500 text-white';
      case 'WARNING':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="p-3 w-68 max-w-xs font-sans text-xs">
      <div className="pb-2 border-b border-slate-100 mb-2 flex items-start justify-between gap-1">
        <div>
          <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider">
            📡 {sensor.sensor_type.replace(/_/g, ' ')}
          </span>
          <h4 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
            {sensor.name}
          </h4>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(sensor.status)}`}>
          {sensor.status}
        </span>
      </div>

      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 font-mono">
        <div className="text-[9px] text-slate-500 font-sans uppercase">Current Reading</div>
        <div className="text-sm font-black text-slate-900 mt-0.5">{sensor.reading}</div>
        <div className="text-[10px] text-slate-500 font-sans mt-1">
          Alert Threshold: <strong className="text-red-600 font-mono">{sensor.threshold}</strong>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 mb-1">
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-100">
          <Battery className="w-3 h-3 text-emerald-600" />
          <span>Battery: <strong>{sensor.battery_pct}%</strong></span>
        </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-100">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{sensor.last_update}</span>
        </div>
      </div>
    </div>
  );
};
