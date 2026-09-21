import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Layers,
  Eye,
  CheckCircle2,
  AlertOctagon,
  Percent,
  BrainCircuit,
  Info,
  Sparkles,
  HelpCircle,
  Check,
  ListChecks,
} from 'lucide-react';
import { LandScanResponse, SeverityLevel } from '../../types/landScan';

interface SegmentationResultProps {
  result: LandScanResponse;
  onScanAgain: () => void;
}

type ViewMode = 'side-by-side' | 'overlay' | 'mask' | 'original';

export const SegmentationResult: React.FC<SegmentationResultProps> = ({
  result,
  onScanAgain,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');

  const {
    landslide_detected,
    landslide_percentage,
    hazard_area_percent,
    severity,
    confidence,
    gemini_confidence,
    hazard_status,
    reason,
    evidence,
    original_image,
    segmentation_mask,
    overlay_image,
    message,
    filename,
    image_valid_for_landslide_analysis,
    model_name,
  } = result;

  const isImageInvalid = image_valid_for_landslide_analysis === false;
  const effectiveArea = hazard_area_percent ?? landslide_percentage ?? 0;
  const effectiveConfidence = gemini_confidence ?? confidence ?? 0;

  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-red-500/10 text-red-700 border-red-300',
          dot: 'bg-red-500',
          label: 'HIGH RISK',
          barColor: 'bg-red-500',
        };
      case 'ELEVATED':
        return {
          bg: 'bg-orange-500/10 text-orange-700 border-orange-300',
          dot: 'bg-orange-500',
          label: 'ELEVATED RISK',
          barColor: 'bg-orange-500',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/10 text-amber-700 border-amber-300',
          dot: 'bg-amber-500',
          label: 'MODERATE RISK',
          barColor: 'bg-amber-500',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'LOW RISK',
          barColor: 'bg-emerald-500',
        };
    }
  };

  const badgeInfo = getSeverityBadge(severity);

  const getGuidance = (level: SeverityLevel, detected: boolean, isInvalid: boolean) => {
    if (isInvalid) {
      return {
        summary: 'Image Unsuitable for Terrain Analysis',
        details: reason || 'The uploaded file does not appear to be an outdoor terrain or slope photograph. Optical geohazard feature extraction could not be reliably conducted.',
        action: 'Please upload a clear, high-resolution satellite, drone, or landscape photograph of a hillside or slope.',
      };
    }

    if (!detected || level === 'LOW') {
      return {
        summary: 'Terrain Stability Intact',
        details: reason || 'AI visual assessment detected no significant slope failure signatures, debris accumulation, or fresh scarps in the analyzed imagery. Slope surfaces appear stable under current conditions.',
        action: 'Routine surveillance recommended. No immediate structural or evacuation alerts required.',
      };
    }

    if (level === 'MODERATE') {
      return {
        summary: 'Localized Slope Instability & Erosion Detected',
        details: reason || `Visual geohazard assessment identified approx. ${effectiveArea}% of the slope showing signs of tension cracks, soil displacement, or active erosion.`,
        action: 'Deploy ground surveillance verification and inspect hillside drainage channels in adjacent sectors.',
      };
    }

    if (level === 'ELEVATED') {
      return {
        summary: 'Significant Slope Destabilization & Debris Movement',
        details: reason || `High-density landslide indicators observed across approx. ${effectiveArea}% of the terrain. Active shearing and vegetative displacement present substantial geological vulnerability.`,
        action: 'Issue Level-2 Advisory to local disaster management teams. Restrict heavy traffic on adjacent hillside roads.',
      };
    }

    return {
      summary: 'Critical High-Hazard Landslide Slope Failure',
      details: reason || `Severe landslide rupture zone identified encompassing approx. ${effectiveArea}% of the analyzed terrain. Severe mass movement with high potential for debris flow.`,
      action: 'Trigger IMMEDIATE evacuation protocol for downstream settlements and initiate emergency response staging.',
    };
  };

  const guidance = getGuidance(severity, landslide_detected, isImageInvalid);

  const displayStatus = isImageInvalid
    ? 'IMAGE NOT SUITABLE'
    : landslide_detected
    ? (hazard_status || 'LANDSLIDE DETECTED')
    : 'NO SIGNIFICANT LANDSLIDE DETECTED';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
          isImageInvalid
            ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/30 text-white'
            : landslide_detected
            ? 'bg-gradient-to-r from-red-950/30 via-orange-950/20 to-slate-900 border-red-500/40 text-white'
            : 'bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/30 text-white'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isImageInvalid
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : landslide_detected
                ? 'bg-red-500 text-white shadow-lg shadow-red-900/40 animate-pulse'
                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
            }`}
          >
            {isImageInvalid ? (
              <HelpCircle className="w-6 h-6" />
            ) : landslide_detected ? (
              <AlertOctagon className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${badgeInfo.bg}`}
              >
                {badgeInfo.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Image: {filename}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {model_name || 'Gemini Vision AI'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
              {isImageInvalid
                ? 'IMAGE NOT SUITABLE FOR LANDSLIDE ANALYSIS'
                : landslide_detected
                ? 'LANDSLIDE DETECTED'
                : 'NO SIGNIFICANT LANDSLIDE DETECTED'}
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              {message}
            </p>
          </div>
        </div>

        {/* Scan Again Action Button */}
        <button
          type="button"
          onClick={onScanAgain}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-orange-400" />
          <span>Scan Another Image</span>
        </button>
      </div>

      {/* 2. Key Metrics Grid (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Severity */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Severity Level
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {severity}
            </span>
            <div className={`w-3 h-3 rounded-full ${badgeInfo.dot} animate-ping`} />
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className={`h-full ${badgeInfo.barColor}`}
              style={{
                width:
                  severity === 'HIGH'
                    ? '100%'
                    : severity === 'ELEVATED'
                    ? '75%'
                    : severity === 'MODERATE'
                    ? '50%'
                    : '25%',
              }}
            />
          </div>
        </div>

        {/* Metric 2: AI-Estimated Hazard Area */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            AI-Estimated Hazard Area
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {effectiveArea}%
            </span>
            <Percent className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-[10px] text-slate-400">
            Estimated visual terrain impact
          </p>
        </div>

        {/* Metric 3: Gemini AI Confidence */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Gemini AI Confidence
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {Math.round(effectiveConfidence * 100)}%
            </span>
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-[10px] text-slate-400">
            Vision certainty score
          </p>
        </div>

        {/* Metric 4: Hazard Status */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Hazard Status
          </span>
          <div className="flex items-center justify-between">
            <span
              className={`text-sm sm:text-base font-black ${
                isImageInvalid
                  ? 'text-amber-600'
                  : landslide_detected
                  ? 'text-red-600'
                  : 'text-emerald-600'
              }`}
            >
              {displayStatus}
            </span>
            {isImageInvalid ? (
              <HelpCircle className="w-4 h-4 text-amber-600" />
            ) : landslide_detected ? (
              <ShieldAlert className="w-4 h-4 text-red-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <p className="text-[10px] text-slate-400">
            Engine: Google Gemini Vision
          </p>
        </div>
      </div>

      {/* 3. Visual Evidence & Gemini Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Evidence Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ListChecks className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black tracking-wide uppercase text-slate-900">
              Visual Evidence
            </h3>
          </div>

          {evidence && evidence.length > 0 ? (
            <ul className="space-y-2">
              {evidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {landslide_detected ? 'Evidence extracted from geotechnical vision analysis.' : 'No visible slope failure evidence detected.'}
            </p>
          )}
        </div>

        {/* Gemini Analysis Reason Card */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black tracking-wide uppercase text-indigo-950">
                Gemini Analysis
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700">
              Reasoning
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Reason:
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {reason || 'Visual terrain assessment performed.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Image Visualization (Left: Original, Right: Mask / Overlay) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Visualizer Header with View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-600" />
              <span>Multi-Layer Geological Hazard Visualizer</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive pixel comparison between raw optical terrain and AI visual geohazard assessment
            </p>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'overlay'
                  ? 'bg-white text-orange-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overlay View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mask')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'mask'
                  ? 'bg-white text-red-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hazard Mask
            </button>
            <button
              type="button"
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'original'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original
            </button>
          </div>
        </div>

        {/* View Mode Display Panels */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Left: Original Terrain Image */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  LEFT: Original Terrain Image
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Optical RGB
                </span>
              </div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-inner">
                <img
                  src={original_image}
                  alt="Original Terrain"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right: AI Visual Assessment / Highlighted Result */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-orange-600" />
                  RIGHT: Gemini AI Visual Assessment
                </span>
                <span className={`text-[10px] font-mono font-bold ${landslide_detected ? 'text-red-600' : 'text-emerald-600'}`}>
                  {landslide_detected ? 'Red/Orange = Landslide Hazard Area' : 'No Hazard Detected'}
                </span>
              </div>
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-inner">
                <img
                  src={overlay_image}
                  alt="AI Visual Assessment"
                  className="w-full h-full object-contain"
                />
                <span className={`absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono font-bold border ${landslide_detected ? 'text-red-400 border-red-500/30' : 'text-emerald-400 border-emerald-500/30'}`}>
                  {effectiveArea}% Hazard Area
                </span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'overlay' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                Composite Hazard Overlay (Optical Terrain + AI Region Boundary)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Visual Highlight Layer
              </span>
            </div>
            <div className="relative aspect-video max-h-[480px] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-inner">
              <img
                src={overlay_image}
                alt="Overlay View"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {viewMode === 'mask' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                Isolated Binary Hazard Mask
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Extracted Spatial Bounding Mask
              </span>
            </div>
            <div className="relative aspect-video max-h-[480px] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-inner">
              <img
                src={segmentation_mask}
                alt="Hazard Mask"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {viewMode === 'original' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Original Unprocessed Imagery
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Source Dimensions
              </span>
            </div>
            <div className="relative aspect-video max-h-[480px] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 flex items-center justify-center shadow-inner">
              <img
                src={original_image}
                alt="Original Image"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Geological Interpretation & Operational Recommendations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Geological Interpretation & Operational Guidance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-xs block">
              Hazard Assessment: {guidance.summary}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {guidance.details}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
            <span className="font-bold text-orange-900 text-xs block">
              Recommended Emergency Protocol
            </span>
            <p className="text-orange-800 leading-relaxed font-medium">
              {guidance.action}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
