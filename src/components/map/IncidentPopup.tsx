import React from 'react';
import { DisasterIncident } from '../../types/map';
import {
  AlertTriangle,
  Flame,
  Clock,
  MapPin,
  ShieldAlert,
  Activity,
  ArrowRight,
  Radio,
} from 'lucide-react';

interface IncidentPopupProps {
  incident: DisasterIncident;
}

export const IncidentPopup: React.FC<IncidentPopupProps> = ({ incident }) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ELEVATED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-500 text-white';
      case 'MONITORING':
        return 'bg-amber-500 text-white';
      case 'CONTAINED':
        return 'bg-blue-500 text-white';
      case 'RESOLVED':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="p-3.5 w-72 max-w-xs font-sans text-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(incident.severity)}`}>
            {incident.severity}
          </span>
          <h4 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
            {incident.title}
          </h4>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getStatusBadge(incident.status)}`}>
          {incident.status}
        </span>
      </div>

      {/* Incident Details */}
      <div className="space-y-2 mb-3">
        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
          {incident.description}
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {incident.distance_km !== undefined && (
            <div className="flex items-center gap-1 justify-end">
              <MapPin className="w-3 h-3 text-orange-500" />
              <span>{incident.distance_km} km away</span>
            </div>
          )}
        </div>

        {incident.action_taken && (
          <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-[10px] text-amber-900">
            <span className="font-bold uppercase tracking-wider block text-[9px] text-amber-700">Action Deployed:</span>
            {incident.action_taken}
          </div>
        )}

        <div className="text-[10px] font-mono text-slate-400 pt-1">
          Coords: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
