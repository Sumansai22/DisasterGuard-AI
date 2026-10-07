import React from 'react';
import { EmergencyInfrastructureItem } from '../../types/map';
import { Building2, Phone, Shield, Bed, Activity, Radio, Truck } from 'lucide-react';

interface EmergencyInfraPopupProps {
  item: EmergencyInfrastructureItem;
}

export const EmergencyInfraPopup: React.FC<EmergencyInfraPopupProps> = ({ item }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'HOSPITAL':
        return '🏥';
      case 'AMBULANCE_STATION':
        return '🚑';
      case 'FIRE_STATION':
        return '🚒';
      case 'POLICE_STATION':
        return '👮';
      case 'EMERGENCY_OPERATION_CENTER':
        return '🏛️';
    }
  };

  return (
    <div className="p-3 w-68 max-w-xs font-sans text-xs">
      <div className="flex items-start justify-between gap-1 pb-2 border-b border-slate-100 mb-2">
        <div>
          <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">
            {getIcon()} {item.type.replace(/_/g, ' ')}
          </span>
          <h4 className="font-bold text-slate-900 text-xs mt-0.5 leading-snug">
            {item.name}
          </h4>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
          {item.status}
        </span>
      </div>

      <div className="space-y-1.5 text-[11px] text-slate-600 mb-2">
        {item.total_beds !== undefined && (
          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
            <span>Total Bed Capacity:</span>
            <strong className="text-slate-900 font-mono">{item.total_beds}</strong>
          </div>
        )}
        {item.icu_available !== undefined && (
          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
            <span>ICU Beds Available:</span>
            <strong className="text-emerald-700 font-mono font-bold">{item.icu_available}</strong>
          </div>
        )}
        {item.fleet_on_duty !== undefined && (
          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
            <span>Ambulances on Duty:</span>
            <strong className="text-slate-900 font-mono">{item.fleet_on_duty}</strong>
          </div>
        )}
        {item.engines_ready !== undefined && (
          <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-100">
            <span>Fire Engines Ready:</span>
            <strong className="text-slate-900 font-mono">{item.engines_ready}</strong>
          </div>
        )}
        {item.lead_officer && (
          <div className="bg-indigo-50/70 p-1.5 rounded border border-indigo-100 text-[10px] text-indigo-900">
            <span>Incident Commander: <strong>{item.lead_officer}</strong></span>
          </div>
        )}
      </div>

      {item.phone && (
        <a
          href={`tel:${item.phone}`}
          className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Dispatch: {item.phone}</span>
        </a>
      )}
    </div>
  );
};
