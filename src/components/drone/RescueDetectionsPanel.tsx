import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  XCircle,
  Radio,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  PlayCircle,
} from 'lucide-react';
import { TrackedPersonDetection } from '../../types/droneRescue';

interface RescueDetectionsPanelProps {
  detections: TrackedPersonDetection[];
  selectedDetectionId: string | null;
  currentTime?: number;
  onSelectDetection: (detection: TrackedPersonDetection) => void;
  onVerify: (detectionId: string) => void;
  onMarkFalsePositive: (detectionId: string) => void;
  onOpenDispatchModal: (detection: TrackedPersonDetection) => void;
  onFocusMap: (detection: TrackedPersonDetection) => void;
  onSeekTimestamp?: (time: number) => void;
}

export const RescueDetectionsPanel: React.FC<RescueDetectionsPanelProps> = ({
  detections,
  selectedDetectionId,
  currentTime = 0,
  onSelectDetection,
  onVerify,
  onMarkFalsePositive,
  onOpenDispatchModal,
  onFocusMap,
  onSeekTimestamp,
}) => {
  // Sort detections: Critical & High first, then medium, then low
  const priorityRank: Record<string, number> = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  const sortedDetections = [...detections].sort((a, b) => {
    const rankDiff = (priorityRank[a.priority] || 5) - (priorityRank[b.priority] || 5);
    if (rankDiff !== 0) return rankDiff;
    return b.distress_score - a.distress_score;
  });

  const highPriorityList = sortedDetections.filter((d) => d.priority === 'CRITICAL' || d.priority === 'HIGH');
  const mediumPriorityList = sortedDetections.filter((d) => d.priority === 'MEDIUM');
  const lowPriorityList = sortedDetections.filter((d) => d.priority === 'LOW');

  const renderDetectionCard = (det: TrackedPersonDetection) => {
    const isSelected = selectedDetectionId === det.detection_id;
    const isHighOrCrit = det.priority === 'CRITICAL' || det.priority === 'HIGH';
    const isMed = det.priority === 'MEDIUM';
    const isCurrentlyActiveInFrame =
      currentTime >= det.timestamp_sec - 3 && currentTime <= det.timestamp_sec + 8;
    const hasBeenScanned = currentTime >= det.timestamp_sec - 1;

    const priorityBadge =
      det.priority === 'CRITICAL'
        ? 'bg-red-950 text-red-400 border-red-800'
        : det.priority === 'HIGH'
        ? 'bg-orange-950 text-orange-400 border-orange-800'
        : det.priority === 'MEDIUM'
        ? 'bg-amber-950 text-amber-400 border-amber-800'
        : 'bg-emerald-950 text-emerald-400 border-emerald-800';

    const statusBadge =
      det.status === 'DISPATCHED'
        ? 'bg-blue-900/60 text-blue-300 border-blue-700'
        : det.status === 'VERIFIED'
        ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
        : det.status === 'FALSE_POSITIVE'
        ? 'bg-slate-800 text-slate-400 border-slate-700 line-through'
        : 'bg-amber-900/40 text-amber-300 border-amber-700';

    return (
      <div
        key={det.detection_id}
        onClick={() => {
          onSelectDetection(det);
          if (onSeekTimestamp) {
            onSeekTimestamp(det.timestamp_sec);
          }
        }}
        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
          isCurrentlyActiveInFrame
            ? 'bg-slate-800/95 border-orange-500 ring-2 ring-orange-500/40 shadow-xl'
            : isSelected
            ? 'bg-slate-800/80 border-slate-600 shadow-md'
            : isHighOrCrit
            ? 'bg-slate-900/90 border-red-900/60 hover:border-red-600'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCurrentlyActiveInFrame
                  ? 'bg-orange-400 animate-ping'
                  : isHighOrCrit
                  ? 'bg-red-500'
                  : isMed
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="font-mono font-extrabold text-white text-sm">
              {det.person_id}
            </span>
            {isCurrentlyActiveInFrame && (
              <span className="px-1.5 py-0.2 rounded bg-orange-600 text-white text-[9px] font-mono font-bold animate-pulse">
                IN FRAME
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${priorityBadge}`}>
              {det.priority}
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${statusBadge}`}>
              {det.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Possible Distress:</span>
            <span
              className={`font-mono font-bold text-sm ${
                isHighOrCrit ? 'text-red-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {(det.distress_score * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">AI Confidence:</span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {(det.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Indicators List */}
        {det.indicators && det.indicators.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Observed Indicators:
            </span>
            <ul className="space-y-0.5 text-xs text-slate-300">
              {det.indicators.map((ind, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-orange-400">•</span>
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Location & Timestamp Bar */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1 truncate max-w-[180px]" title={det.location_label}>
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{det.location_label || 'Image-relative'}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSeekTimestamp) onSeekTimestamp(det.timestamp_sec);
            }}
            className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors"
            title="Jump to footage timestamp"
          >
            <Clock className="w-3 h-3" />
            <span className="underline">{det.timestamp_str}</span>
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFocusMap(det);
            }}
            className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 border border-slate-700"
            title="Locate on GIS Map"
          >
            <MapPin className="w-3 h-3 text-cyan-400" /> View Map
          </button>

          {det.status === 'AI_DETECTED' || det.status === 'PENDING_VERIFICATION' ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVerify(det.detection_id);
                }}
                className="px-2 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold transition-colors border border-emerald-800 flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Verify
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDispatchModal(det);
                }}
                className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                <Radio className="w-3 h-3" /> Alert
              </button>
            </>
          ) : det.status === 'VERIFIED' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDispatchModal(det);
              }}
              className="col-span-2 px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-colors shadow-sm flex items-center justify-center gap-1"
            >
              <Radio className="w-3 h-3" /> ALERT RESCUE TEAM
            </button>
          ) : (
            <div className="col-span-2 text-center py-1 text-[10px] font-mono text-slate-400">
              {det.status === 'DISPATCHED' ? '✓ Dispatched' : 'Marked False Positive'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
          <h3 className="font-extrabold text-white text-base tracking-tight font-mono">
            🚨 RESCUE DETECTIONS
          </h3>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
          {detections.length} Target{detections.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Detections Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[640px]">
        {detections.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <UserCheck className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">No active person detections yet.</p>
            <p className="text-[11px] text-slate-600">
              Upload drone footage or run a sample scan to initiate rescue detections.
            </p>
          </div>
        ) : (
          <>
            {/* HIGH & CRITICAL PRIORITY SECTION */}
            {highPriorityList.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-red-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> HIGH PRIORITY ({highPriorityList.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">URGENT ACTION</span>
                </div>
                <div className="space-y-2.5">
                  {highPriorityList.map(renderDetectionCard)}
                </div>
              </div>
            )}

            {/* MEDIUM PRIORITY SECTION */}
            {mediumPriorityList.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> MEDIUM PRIORITY ({mediumPriorityList.length})
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">REVIEW REQUIRED</span>
                </div>
                <div className="space-y-2.5">
                  {mediumPriorityList.map(renderDetectionCard)}
                </div>
              </div>
            )}

            {/* LOW PRIORITY / NORMAL SECTION */}
            {lowPriorityList.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400">
                  <span>NORMAL DETECTIONS ({lowPriorityList.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">STANDBY</span>
                </div>
                <div className="space-y-2.5">
                  {lowPriorityList.map(renderDetectionCard)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
