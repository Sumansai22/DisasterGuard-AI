import React from 'react';
import { EmergencyAlert } from '../../types/alerts';
import {
  AlertTriangle,
  Info,
  Radio,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface AlertCardProps {
  alert: EmergencyAlert;
  onAcknowledge?: (id: string) => void;
  onGenerateBroadcast?: (alert: EmergencyAlert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onGenerateBroadcast,
}) => {
  const navigate = useNavigate();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-red-300',
          bg: 'bg-red-50/40',
          headerBg: 'bg-red-100/70',
          text: 'text-red-900',
          badge: 'bg-red-600 text-white',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
        };
      case 'HIGH':
        return {
          border: 'border-orange-300',
          bg: 'bg-orange-50/40',
          headerBg: 'bg-orange-100/70',
          text: 'text-orange-900',
          badge: 'bg-orange-600 text-white',
          icon: AlertTriangle,
          iconColor: 'text-orange-600',
        };
      case 'MODERATE':
        return {
          border: 'border-amber-300',
          bg: 'bg-amber-50/40',
          headerBg: 'bg-amber-100/70',
          text: 'text-amber-900',
          badge: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
        };
      default:
        return {
          border: 'border-slate-200',
          bg: 'bg-white',
          headerBg: 'bg-slate-50',
          text: 'text-slate-900',
          badge: 'bg-slate-600 text-white',
          icon: Info,
          iconColor: 'text-slate-600',
        };
    }
  };

  const style = getSeverityStyle(alert.severity);
  const Icon = style.icon;

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.bg} overflow-hidden shadow-xs hover:shadow-md transition-all duration-200`}
    >
      {/* Card Header */}
      <div className={`px-5 py-3 ${style.headerBg} border-b ${style.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${style.iconColor}`} />
          <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">
            {alert.title}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
            {alert.severity} ({alert.riskScore}/100)
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {alert.issuedAt}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3 font-sans">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold text-slate-500">Target Location:</span>
          <span className="text-xs font-bold text-slate-900">{alert.locationName}</span>
        </div>

        <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-0.5">Trigger Condition & Reason:</span>
          {alert.reason}
        </div>

        <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-0.5">Recommended Tactical Action:</span>
          {alert.recommendedAction}
        </div>

        {/* Recipients list */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Recipients:
          </span>
          {alert.recipients.map((rec) => (
            <span
              key={rec}
              className="text-[10px] font-mono bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
            >
              {rec}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              to="/risk-map"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View Zone
            </Link>
            <Link
              to="/prediction"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-orange-600" />
              View Prediction
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {alert.status === 'ACTIVE' && onAcknowledge && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                Acknowledge
              </button>
            )}

            {onGenerateBroadcast && (
              <button
                onClick={() => onGenerateBroadcast(alert)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                Broadcast Alert
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
