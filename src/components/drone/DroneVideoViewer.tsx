import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Radio,
  Film,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Layers,
  Crosshair,
  Compass,
  AlertTriangle,
  RotateCcw,
  Camera,
} from 'lucide-react';
import { TrackedPersonDetection, DroneTelemetry, PresetDroneScenario } from '../../types/droneRescue';

interface DroneVideoViewerProps {
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | 'live_stream';
  mode: 'DEMO' | 'LIVE' | 'USER FOOTAGE';
  detections: TrackedPersonDetection[];
  selectedDetectionId: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  telemetry: DroneTelemetry | null;
  presets: PresetDroneScenario[];
  activeHazard: string;
  locationName: string;
  isAnalyzing: boolean;
  onSelectDetection: (detection: TrackedPersonDetection) => void;
  onFileUpload: (file: File) => void;
  onSelectPreset: (preset: PresetDroneScenario) => void;
  onOpenLiveModal: () => void;
  onTogglePlay: () => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
}

export const DroneVideoViewer: React.FC<DroneVideoViewerProps> = ({
  mediaUrl,
  mediaType,
  mode,
  detections,
  selectedDetectionId,
  currentTime,
  duration,
  isPlaying,
  telemetry,
  presets,
  activeHazard,
  locationName,
  isAnalyzing,
  onSelectDetection,
  onFileUpload,
  onSelectPreset,
  onOpenLiveModal,
  onTogglePlay,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logging for video load
  useEffect(() => {
    if (mediaUrl && mediaType === 'video') {
      console.log('[DRONE DEMO] video source:', mediaUrl);
      setVideoError(null);
    }
  }, [mediaUrl, mediaType]);

  // Sync video element playback with parent state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || mediaType !== 'video') return;

    if (isPlaying && video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[DRONE DEMO] Autoplay notice:', err.message);
        });
      }
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, mediaType]);

  // Handle external seek
  useEffect(() => {
    const video = videoRef.current;
    if (!video || mediaType !== 'video') return;

    if (Math.abs(video.currentTime - currentTime) > 0.8) {
      video.currentTime = currentTime;
    }
  }, [currentTime, mediaType]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.log('[DRONE DEMO] video loaded metadata:', {
      duration: video.duration,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      currentSrc: video.currentSrc,
    });
    setVideoError(null);
    if (onDurationChange && video.duration && !isNaN(video.duration)) {
      onDurationChange(video.duration);
    }
    // Attempt auto-play when loaded
    video.play().catch(() => {});
  };

  const handleNativeTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime);
    }
  };

  const handleNativePlay = () => {
    if (onPlayStateChange) onPlayStateChange(true);
  };

  const handleNativePause = () => {
    if (onPlayStateChange) onPlayStateChange(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const err = video.error;
    console.error('[DRONE DEMO] video failed to load:', {
      error: err,
      code: err?.code,
      message: err?.message,
      networkState: video.networkState,
      readyState: video.readyState,
      currentSrc: video.currentSrc,
      attemptedUrl: mediaUrl,
    });
    setVideoError(
      err?.message ||
        `Could not load video from '${mediaUrl}'. Please check that the file exists and is encoded in browser-compatible H.264/WebM format.`
    );
  };

  const handleRetryVideo = () => {
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  // Filter visible detections around current time for video/demo, or all if static image
  const visibleDetections = detections.filter((d) => {
    if (mediaType === 'image') return true;
    const startWindow = Math.max(0, d.timestamp_sec - 3);
    const endWindow = d.timestamp_sec + 8;
    return currentTime >= startWindow && currentTime <= endWindow;
  });

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const modeBadgeColor =
    mode === 'DEMO'
      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
      : mode === 'LIVE'
      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
      : 'bg-blue-950/80 text-blue-400 border-blue-800';

  return (
    <div
      ref={containerRef}
      className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col relative shadow-xl min-h-[520px]"
    >
      {/* HUD Top Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xs border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs font-mono z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-extrabold text-white">
            <span className="text-orange-500">🚁</span>
            <span>{telemetry?.drone_id || 'DRONE-01'}</span>
          </div>

          <span className="text-slate-600">|</span>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                telemetry?.connected || mode === 'DEMO' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-[11px] text-slate-300 font-bold">
              {mode === 'DEMO' ? 'FEED: DEMO ONLINE' : telemetry?.connected ? 'FEED: ONLINE' : 'FEED: STANDBY'}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <span className="text-[11px] text-orange-400 font-bold hidden sm:inline">
            MISSION: {activeHazard} SEARCH
          </span>

          <span className="text-slate-600">|</span>

          {/* Explicit Mode Indicator */}
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${modeBadgeColor}`}>
            MODE: {mode}
          </span>
        </div>

        {/* Telemetry Chips */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span className="hidden md:flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>ALT: {telemetry?.altitude_m ? `${telemetry.altitude_m}m` : '48m'}</span>
          </span>

          <span className="hidden lg:flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              GPS:{' '}
              {telemetry?.latitude && telemetry?.longitude
                ? `${telemetry.latitude.toFixed(4)}°, ${telemetry.longitude.toFixed(4)}°`
                : '16.5448°, 81.5212°'}
            </span>
          </span>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className={`p-1.5 rounded-lg border transition-colors ${
                showOverlays
                  ? 'bg-orange-600/30 border-orange-500 text-orange-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle AI Bounding Box Overlays"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Viewport Area */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-950 min-h-[420px] overflow-hidden">
        {mediaUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {mediaType === 'image' ? (
              <img
                src={mediaUrl}
                alt="Drone aerial scan"
                className="max-h-[500px] w-auto max-w-full object-contain select-none z-1"
              />
            ) : (
              <video
                ref={videoRef}
                src={mediaUrl}
                className="max-h-[500px] w-full object-contain cursor-pointer z-1 bg-black"
                playsInline
                autoPlay
                loop
                muted
                preload="auto"
                onClick={onTogglePlay}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleNativeTimeUpdate}
                onPlay={handleNativePlay}
                onPause={handleNativePause}
                onError={handleVideoError}
              />
            )}

            {/* Error Overlay if Video Fails to Load */}
            {videoError && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
                <div className="w-14 h-14 rounded-full bg-red-950 border border-red-700 text-red-400 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h4 className="text-base font-extrabold text-white">
                  ⚠ VIDEO UNAVAILABLE
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  {videoError}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={handleRetryVideo}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry Playback
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all"
                  >
                    Upload Other Video
                  </button>
                </div>
              </div>
            )}

            {/* AI Bounding Boxes Overlay (z-index 2) */}
            {showOverlays && !videoError && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {visibleDetections.map((det) => {
                  const isSelected = selectedDetectionId === det.detection_id;
                  const isHighOrCrit = det.priority === 'CRITICAL' || det.priority === 'HIGH';
                  const isMed = det.priority === 'MEDIUM';

                  const borderColor = isHighOrCrit
                    ? 'border-red-500 bg-red-500/15 ring-2 ring-red-500/50'
                    : isMed
                    ? 'border-orange-500 bg-orange-500/15 ring-2 ring-orange-500/50'
                    : 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/50';

                  const badgeBg = isHighOrCrit
                    ? 'bg-red-600 text-white'
                    : isMed
                    ? 'bg-orange-500 text-slate-950'
                    : 'bg-emerald-600 text-white';

                  const leftPct = det.bbox.x * 100;
                  const topPct = det.bbox.y * 100;
                  const widthPct = Math.max(det.bbox.width * 100, 6);
                  const heightPct = Math.max(det.bbox.height * 100, 6);

                  return (
                    <div
                      key={det.detection_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDetection(det);
                      }}
                      className={`absolute border-2 rounded-lg pointer-events-auto cursor-pointer transition-all duration-200 ${borderColor} ${
                        isSelected ? 'scale-105 z-30 shadow-2xl' : 'z-20'
                      }`}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                    >
                      {/* Bounding Box Floating Label */}
                      <div
                        className={`absolute -top-7 left-0 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1.5 ${badgeBg}`}
                      >
                        <span>{det.person_id}</span>
                        <span>• {(det.confidence * 100).toFixed(0)}%</span>
                        {det.distress_score >= 0.5 && (
                          <span className="bg-black/30 px-1 py-0.2 rounded text-[9px]">
                            DISTRESS {(det.distress_score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      {/* Corner Target Markers */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Analyzing Indicator Spinner */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-40 space-y-3">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-center font-mono">
                  <p className="font-extrabold text-sm text-orange-400 tracking-wider">
                    ANALYZING DRONE FOOTAGE
                  </p>
                  <p className="text-xs text-slate-400">
                    Running Frame Sampling, YOLO Person Detector & Distress Scoring...
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Upload State Dropzone */
          <div className="p-8 text-center text-slate-400 max-w-xl space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 text-orange-500 flex items-center justify-center mx-auto shadow-xl shadow-orange-950/20">
              <Film className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                🚁 DRONE DISASTER FOOTAGE
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                Drag & drop aerial disaster video (MP4 / MOV / AVI) or high-resolution drone photographs to initiate AI person detection and distress scoring.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-900/40 transition-all flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" /> Upload Drone Footage
              </button>

              <button
                onClick={() => imageInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4" /> Upload Image
              </button>

              <button
                onClick={onOpenLiveModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-cyan-400" /> Connect Live Drone Feed
              </button>
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Or Test Instant UAV Disaster Missions:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-[11px] text-slate-300 transition-all font-medium flex items-center gap-1.5"
                  >
                    <span>{preset.hazard === 'FLASH FLOOD' ? '🌊' : preset.hazard === 'LANDSLIDE' ? '🏔️' : '🌪️'}</span>
                    <span className="font-bold text-white">{preset.location}</span>
                    <span className="text-slate-500 font-mono">({preset.hazard})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls / Status */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-300">
            {visibleDetections.length} Target{visibleDetections.length === 1 ? '' : 's'} in Current Frame
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-400">
            Location: <span className="text-slate-200 font-bold">{locationName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/mkv,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-orange-400" /> Replace Footage
          </button>
        </div>
      </div>
    </div>
  );
};
