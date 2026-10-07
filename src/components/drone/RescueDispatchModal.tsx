import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  X,
  Send,
  CheckCircle2,
  Building,
  Ambulance,
  Flame,
  Shield,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { TrackedPersonDetection, RescueAlertDispatchPayload } from '../../types/droneRescue';

interface RescueDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  detection: TrackedPersonDetection | null;
  onDispatch: (payload: RescueAlertDispatchPayload) => Promise<void>;
}

const DESTINATION_TEAMS = [
  {
    id: 'NDRF Search & Rescue Battalion (Unit 10)',
    label: 'NDRF Search & Rescue Team (Inflatable Boats & Extrication)',
    icon: Shield,
    badge: 'PRIMARY RESCUE',
  },
  {
    id: 'State Disaster Response Force (SDRF Field Unit 4)',
    label: 'SDRF Rapid Response Field Unit',
    icon: Building,
    badge: 'FIRST RESPONDER',
  },
  {
    id: 'District Emergency Operations Center (DEOC Control Desk)',
    label: 'DEOC Central Command & Logistics Desk',
    icon: ShieldAlert,
    badge: 'COMMAND',
  },
  {
    id: 'Emergency Medical Service & Paramedic Ambulance Base',
    label: 'EMS Paramedic & Critical Triage Medical Team',
    icon: Ambulance,
    badge: 'MEDICAL',
  },
  {
    id: 'Fire & Disaster Rescue Operations Wing',
    label: 'Fire & Disaster Rescue Station',
    icon: Flame,
    badge: 'WATER / DEBRIS',
  },
];

export const RescueDispatchModal: React.FC<RescueDispatchModalProps> = ({
  isOpen,
  onClose,
  detection,
  onDispatch,
}) => {
  const [selectedDestination, setSelectedDestination] = useState(DESTINATION_TEAMS[0].id);
  const [notes, setNotes] = useState('Urgent extraction required based on UAV distress video assessment.');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Safe close handler that resets local states
  const handleClose = useCallback(() => {
    setErrorMessage(null);
    setIsLoading(false);
    setIsSuccess(false);
    onClose();
  }, [onClose]);

  // ESC Key Listener and Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleClose]);

  if (!isOpen || !detection) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await onDispatch({
        incident_id: detection.detection_id,
        person_id: detection.person_id,
        priority: detection.priority,
        distress_score: detection.distress_score,
        confidence: detection.confidence,
        hazard: detection.hazard_context || 'DISASTER',
        destination: selectedDestination,
        notes,
        latitude: detection.latitude,
        longitude: detection.longitude,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Dispatch alert failed:', err);
      setErrorMessage(
        err?.message || 'Unable to contact the selected response unit. Please check network connectivity or retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-red-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-900/60 text-red-400 border border-red-700">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 font-mono">
                🚨 RESCUE ALERT DISPATCH
              </h3>
              <p className="text-xs text-red-300 font-mono">
                {detection.person_id} • Priority: {detection.priority}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-extrabold text-white">
                ✓ RESCUE TEAM ALERT SENT
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Dispatched emergency rescue order to <span className="font-bold text-slate-200">{selectedDestination}</span>. Incident ledger updated to <span className="font-bold text-emerald-400">DISPATCHED</span>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Failure Warning Box */}
              {errorMessage && (
                <div className="p-3.5 bg-red-950/80 border border-red-700 rounded-xl text-xs text-red-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>⚠ ALERT FAILED</span>
                  </div>
                  <p className="text-[11px] text-red-300/90 leading-relaxed">
                    {errorMessage}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <RotateCcw className="w-3 h-3" /> Retry Dispatch
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Detection Summary Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Incident Target:</span>
                  <span className="font-bold text-white font-mono text-sm">{detection.person_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Possible Distress Score:</span>
                  <span className="font-extrabold text-red-400 font-mono text-sm">
                    {(detection.distress_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">AI Model Confidence:</span>
                  <span className="font-bold text-slate-200 font-mono">
                    {(detection.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">Hazard Context:</span>
                  <span className="font-bold text-amber-400">{detection.hazard_context || 'FLASH FLOOD'}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-mono block mb-0.5">Location:</span>
                  <span className="text-slate-200 font-mono text-[11px]">
                    {detection.location_label || (detection.latitude ? `${detection.latitude}° N, ${detection.longitude}° E` : 'GPS unavailable — image relative')}
                  </span>
                </div>
                {detection.indicators && detection.indicators.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-mono block mb-1">Observed Indicators:</span>
                    <div className="flex flex-wrap gap-1">
                      {detection.indicators.map((ind, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                        >
                          ✓ {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Target Destination Team */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Dispatch Destination Unit:
                </label>
                <div className="space-y-1.5">
                  {DESTINATION_TEAMS.map((team) => {
                    const Icon = team.icon;
                    const isSelected = selectedDestination === team.id;
                    return (
                      <label
                        key={team.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-orange-950/40 border-orange-600 text-white shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="radio"
                            name="destination_team"
                            value={team.id}
                            checked={isSelected}
                            onChange={() => setSelectedDestination(team.id)}
                            className="text-orange-600 focus:ring-0"
                          />
                          <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                          <span className="text-xs font-medium truncate">{team.label}</span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                          {team.badge}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dispatch Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Field Dispatch Instructions / Notes:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-orange-500"
                  placeholder="Special instructions for field squad..."
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Sending Alert...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> SEND RESCUE ALERT
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
