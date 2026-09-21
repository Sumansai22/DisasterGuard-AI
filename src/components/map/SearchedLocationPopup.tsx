import React from 'react';
import { SearchedLocation } from '../../types/map';
import { MapPin, Info, ArrowRight, ShieldCheck, Compass, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchedLocationPopupProps {
  location: SearchedLocation;
  onClose?: () => void;
}

export const SearchedLocationPopup: React.FC<SearchedLocationPopupProps> = ({
  location,
  onClose,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 w-72 max-w-xs font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
        <div className="flex items-start gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 leading-tight">
              {location.name}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
              {location.state ? `${location.state}, ` : ''}{location.country || 'India'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
          Geographic
        </span>
      </div>

      {/* Coordinates & Status */}
      <div className="bg-slate-50 p-3 rounded-xl mb-3 border border-slate-200/80 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Coordinates:
          </span>
          <span className="font-mono font-bold text-slate-700">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
          <span className="text-slate-500">Monitoring Status:</span>
          <span className="font-semibold text-slate-700 bg-slate-200/70 px-1.5 py-0.2 rounded text-[10px]">
            Not Monitored
          </span>
        </div>
      </div>

      {/* Non-Monitored Transparent Information Notice */}
      <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 mb-3 text-[11px] text-amber-900 leading-snug flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Monitoring Data Unavailable</span>
          <span>
            Telemetry IoT sensors are not installed here. Live risk scores are not fabricated.
          </span>
        </div>
      </div>

      {/* Action Button: Run AI Prediction */}
      <button
        onClick={() => {
          navigate('/prediction');
        }}
        className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <span>Run AI Prediction</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
