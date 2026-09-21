import React from 'react';
import { SearchedLocation } from '../../types/map';
import { MapPin, X, AlertCircle, CheckCircle2, Compass, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchedLocationBannerProps {
  location: SearchedLocation;
  onClear: () => void;
}

export const SearchedLocationBanner: React.FC<SearchedLocationBannerProps> = ({
  location,
  onClear,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className={`p-3 rounded-xl shrink-0 ${
          location.isMonitored ? 'bg-orange-50 text-orange-600 border border-orange-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
        }`}>
          <MapPin className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-tight">
              {location.name}
            </h3>
            {location.isMonitored ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                <CheckCircle2 className="w-3 h-3" />
                ACTIVE MONITORING STATION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                LOCATION FOUND • NOT CURRENTLY MONITORED
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {location.displayName}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </span>
            <span>•</span>
            <span>
              {location.isMonitored
                ? `Telemetry Active (${location.monitoredStation?.riskScore}/100 Risk Score)`
                : 'Monitoring data unavailable for this location (No fake risk fabricated)'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center">
        {!location.isMonitored && (
          <button
            onClick={() => navigate('/prediction')}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Run AI Prediction</span>
          </button>
        )}

        <button
          onClick={onClear}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
          title="Clear search and return to default map"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
