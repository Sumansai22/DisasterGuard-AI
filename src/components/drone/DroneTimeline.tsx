import React from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { TrackedPersonDetection } from '../../types/droneRescue';

interface DroneTimelineProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  detections: TrackedPersonDetection[];
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const DroneTimeline: React.FC<DroneTimelineProps> = ({
  currentTime,
  duration,
  isPlaying,
  detections,
  onSeek,
  onTogglePlay,
  onReset,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const maxDuration = Math.max(duration || 1, 30);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-bold text-orange-400">FOOTAGE TIMELINE</span>
          <span className="text-slate-400 text-[11px]">
            {formatTime(currentTime)} / {formatTime(maxDuration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset to 00:00"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Play
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Timeline Bar */}
      <div className="relative w-full h-8 bg-slate-950 rounded-lg border border-slate-800 flex items-center px-2 cursor-pointer group">
        {/* Progress Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-orange-600/30 rounded-lg pointer-events-none transition-all"
          style={{ width: `${(currentTime / maxDuration) * 100}%` }}
        />

        {/* Base Track Line */}
        <div className="w-full h-1 bg-slate-800 rounded-full relative">
          {/* Progress Line */}
          <div
            className="h-full bg-orange-500 rounded-full"
            style={{ width: `${(currentTime / maxDuration) * 100}%` }}
          />

          {/* Current Scrubber Head */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-orange-500 rounded-full shadow-md pointer-events-none"
            style={{ left: `${(currentTime / maxDuration) * 100}%` }}
          />

          {/* Detection Markers on Timeline */}
          {detections.map((det) => {
            const leftPct = (Math.min(det.timestamp_sec, maxDuration) / maxDuration) * 100;
            const markerColor =
              det.priority === 'CRITICAL' || det.priority === 'HIGH'
                ? 'bg-red-500 ring-2 ring-red-400/50'
                : det.priority === 'MEDIUM'
                ? 'bg-amber-500 ring-2 ring-amber-400/50'
                : 'bg-emerald-500 ring-2 ring-emerald-400/50';

            return (
              <button
                key={det.detection_id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(det.timestamp_sec);
                }}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${markerColor} transition-transform hover:scale-150 z-10`}
                style={{ left: `${leftPct}%` }}
                title={`${det.person_id} (${det.priority} - Distress: ${(det.distress_score * 100).toFixed(0)}%) at ${det.timestamp_str}`}
              />
            );
          })}
        </div>

        {/* Invisible Click Surface */}
        <input
          type="range"
          min={0}
          max={maxDuration}
          step={0.5}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>00:00</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> High / Critical Distress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
          </span>
        </div>
        <span>{formatTime(maxDuration)}</span>
      </div>
    </div>
  );
};
