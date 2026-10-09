import React, { useState, useRef, useCallback } from 'react';
import { Layers, ZoomIn, ZoomOut, RotateCcw, Maximize2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { ImageMetadata, VisualDamageEvidence } from '../../types/damageAssessment';

interface ImageComparisonSliderProps {
  preImage: ImageMetadata;
  postImage: ImageMetadata;
  visualEvidence?: VisualDamageEvidence[];
  showAiOverlayDefault?: boolean;
  className?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  preImage,
  postImage,
  visualEvidence = [],
  showAiOverlayDefault = true,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showAiOverlay, setShowAiOverlay] = useState<boolean>(showAiOverlayDefault);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(1, z - 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className={`flex flex-col space-y-2 select-none ${className}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            Bitemporal Satellite / Drone Inspection
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
            Split: {Math.round(sliderPosition)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowAiOverlay(!showAiOverlay)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showAiOverlay
                ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle AI damage evidence detection bounding boxes and masks"
          >
            {showAiOverlay ? <Eye className="w-3.5 h-3.5 text-orange-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>AI Damage Overlay</span>
          </button>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-100 text-slate-600 transition-colors border-l border-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 hover:bg-slate-100 text-slate-600 transition-colors border-l border-slate-200"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Curtain Slider Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative w-full h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden shadow-xl border border-slate-300 bg-slate-950 cursor-ew-resize select-none"
      >
        {/* POST-DISASTER IMAGE (Full Background) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden transition-transform duration-100 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={postImage.url}
            alt="Post-Disaster Imagery"
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* AI Evidence Bounding Overlays */}
          {showAiOverlay && (
            <div className="absolute inset-0 pointer-events-none">
              {visualEvidence.map((ev, idx) => (
                <div
                  key={ev.featureId || idx}
                  className="absolute border-2 border-red-500 bg-red-500/20 rounded-md animate-pulse"
                  style={{
                    top: `${20 + (idx * 25) % 60}%`,
                    left: `${52 + (idx * 15) % 40}%`,
                    width: '32%',
                    height: '24%',
                  }}
                >
                  <div className="bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm inline-block shadow">
                    ⚠ {ev.type.replace(/_/g, ' ')} ({Math.round(ev.confidence * 100)}%)
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Post-Disaster Label Pill */}
          <div className="absolute top-3 right-3 bg-red-950/85 text-red-200 backdrop-blur-md px-3 py-1 rounded-xl border border-red-700/80 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>POST-DISASTER ({postImage.sourcePlatform})</span>
          </div>
        </div>

        {/* PRE-DISASTER IMAGE (Clipped by slider position) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden transition-transform duration-100 origin-center"
          style={{
            width: `${sliderPosition}%`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          <div
            className="absolute inset-0 w-full h-full"
            style={{ width: `${containerRef.current?.clientWidth || 800}px` }}
          >
            <img
              src={preImage.url}
              alt="Pre-Disaster Baseline Imagery"
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          {/* Pre-Disaster Label Pill */}
          <div className="absolute top-3 left-3 bg-emerald-950/85 text-emerald-200 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-700/80 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PRE-DISASTER ({preImage.sourcePlatform})</span>
          </div>
        </div>

        {/* Vertical Divider Line with Draggable Handle */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20 flex items-center justify-center pointer-events-auto"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl border border-slate-300 flex items-center justify-center font-bold text-xs active:scale-110 transition-transform">
            ⇄
          </div>
        </div>

        {/* Bottom Metadata Summary Ticker */}
        <div className="absolute bottom-2 inset-x-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 text-white text-[11px] font-mono flex items-center justify-between pointer-events-none z-10 flex-wrap gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-400">Pre:</span>
            <span className="text-emerald-400 truncate">{new Date(preImage.captureDate).toLocaleDateString()}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Post:</span>
            <span className="text-red-400 truncate">{new Date(postImage.captureDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Res:</span>
            <span className="text-orange-400 font-bold">{postImage.resolutionMeters}m/px</span>
          </div>
        </div>
      </div>
    </div>
  );
};
