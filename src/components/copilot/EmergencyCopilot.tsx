import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { MultiHazardAssessment } from '../../types/multiHazard';
import { PredictionResultData } from '../../types/prediction';

interface EmergencyCopilotProps {
  assessment: MultiHazardAssessment | null;
  predictionResult?: PredictionResultData | null;
  rainfallMm?: number | null;
  activeIncidentsCount?: number;
  blockedRoadsCount?: number;
  sheltersCount?: number;
  onOpenEvacuation?: () => void;
  onOpenShelters?: () => void;
  onOpenExplainability?: () => void;
  onOpenScenario?: () => void;
  onOpenMissionControl?: () => void;
}

export const EmergencyCopilot: React.FC<EmergencyCopilotProps> = ({
  assessment,
  predictionResult,
  rainfallMm,
  activeIncidentsCount = 0,
  blockedRoadsCount = 0,
  sheltersCount = 0,
  onOpenEvacuation,
  onOpenShelters,
  onOpenExplainability,
  onOpenScenario,
  onOpenMissionControl,
}) => {
  const { t } = useTranslation();
  const [showEvidence, setShowEvidence] = useState(false);

  // Analyze ONLY data actually available from the application
  const hasAssessment = Boolean(assessment && assessment.compositeRiskScore !== undefined);
  const compositeScore = assessment?.compositeRiskScore ?? (predictionResult ? predictionResult.risk_score : null);
  const compositeLevel = assessment?.compositeRiskLevel ?? (predictionResult ? predictionResult.risk_level : null);
  const dominantHazard = assessment?.dominantHazard ?? (predictionResult ? 'LANDSLIDE' : null);

  const rainfallVal = rainfallMm ?? assessment?.hazards?.find((h) => h.type === 'FLASH_FLOOD' || h.type === 'LANDSLIDE')?.keyMetrics?.Rainfall ?? null;

  // Evidence synthesis without fabricating
  const evidenceItems: { label: string; value: string; provenance: any }[] = [];

  if (compositeScore !== null) {
    evidenceItems.push({
      label: 'Composite Multi-Hazard Risk',
      value: `${compositeScore}/100 (${compositeLevel || 'EVALUATED'})`,
      provenance: 'MODEL_ESTIMATE',
    });
  }
  if (dominantHazard) {
    evidenceItems.push({
      label: 'Dominant Threat Vector',
      value: dominantHazard.replace('_', ' '),
      provenance: 'MODEL_ESTIMATE',
    });
  }
  if (rainfallVal !== null) {
    evidenceItems.push({
      label: 'Rainfall Precipitation Telemetry',
      value: typeof rainfallVal === 'number' ? `${rainfallVal} mm` : String(rainfallVal),
      provenance: 'SENSOR',
    });
  }
  if (blockedRoadsCount > 0) {
    evidenceItems.push({
      label: 'Compromised Transit Corridors',
      value: `${blockedRoadsCount} road segment(s) obstructed`,
      provenance: 'FIELD REPORT',
    });
  }
  if (sheltersCount > 0) {
    evidenceItems.push({
      label: 'Verified Refuge Safehouses',
      value: `${sheltersCount} shelter(s) operational in radius`,
      provenance: 'EXTERNAL API',
    });
  }
  if (activeIncidentsCount > 0) {
    evidenceItems.push({
      label: 'Active Logged Incidents',
      value: `${activeIncidentsCount} ongoing field/drone event(s)`,
      provenance: 'LIVE',
    });
  }

  // Generate grounded, non-hallucinated operational recommendations
  const recommendations: { text: string; action?: () => void; actionLabel?: string }[] = [];

  if (!hasAssessment && !predictionResult) {
    // Insufficient data per prompt requirement
  } else {
    if (compositeScore !== null && compositeScore >= 60) {
      recommendations.push({
        text: 'Review active evacuation corridors bypassing hazard breach zones.',
        action: onOpenEvacuation,
        actionLabel: 'Evacuation Routes',
      });
    }
    if (blockedRoadsCount > 0) {
      recommendations.push({
        text: `Inspect ${blockedRoadsCount} reported blocked transit corridor(s) for emergency clearance.`,
        action: onOpenMissionControl,
        actionLabel: 'Mission Control',
      });
    }
    if (sheltersCount > 0) {
      recommendations.push({
        text: `Verify intake capacity for ${sheltersCount} operational high-ground shelters.`,
        action: onOpenShelters,
        actionLabel: 'Shelters',
      });
    }
    if (rainfallVal !== null) {
      recommendations.push({
        text: 'Monitor real-time radar and 6-hour rainfall precipitation accumulation trend.',
      });
    }
    if (compositeScore !== null && compositeScore >= 40) {
      recommendations.push({
        text: 'Audit contributing factor breakdown to verify sensor vs topographic weights.',
        action: onOpenExplainability,
        actionLabel: 'Why This Alert?',
      });
    }
    if (recommendations.length < 3) {
      recommendations.push({
        text: 'Simulate scenario impact under +30% intensified rainfall surge.',
        action: onOpenScenario,
        actionLabel: 'Run Simulation',
      });
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-white shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-2 truncate">
              <span>{t('copilot.title', 'AI Emergency Copilot')}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700 shrink-0">
                DECISION SUPPORT
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {t('copilot.subtitle', 'Operational decision-support synthesizing telemetry, GIS & ML layers')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DataProvenanceBadge status="MODEL_ESTIMATE" source="Telemetry Engine" />
        </div>
      </div>

      {/* Main Content Area */}
      {!hasAssessment && !predictionResult ? (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
          <Info className="w-4 h-4 mx-auto mb-1 text-slate-500" />
          {t('copilot.insufficientData', 'Insufficient telemetry or hazard data available for recommendation.')}
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Situation Synthesis Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block truncate">Risk Level</span>
              <span
                className={`font-black text-sm truncate block ${
                  compositeScore && compositeScore >= 75
                    ? 'text-red-400'
                    : compositeScore && compositeScore >= 50
                    ? 'text-orange-400'
                    : 'text-emerald-400'
                }`}
              >
                {compositeLevel || (compositeScore ? `${compositeScore}/100` : 'N/A')}
              </span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block truncate">Precipitation</span>
              <span className="font-bold text-slate-200 text-sm truncate block">
                {rainfallVal !== null ? `${rainfallVal} mm` : 'UNAVAILABLE'}
              </span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block truncate">Road Obstacles</span>
              <span className="font-bold text-amber-400 text-sm truncate block">
                {blockedRoadsCount > 0 ? `${blockedRoadsCount} Blocked` : 'All Clear'}
              </span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block truncate">Refuge Shelters</span>
              <span className="font-bold text-emerald-400 text-sm truncate block">
                {sheltersCount > 0 ? `${sheltersCount} Ready` : '0 in Radius'}
              </span>
            </div>
          </div>

          {/* Recommended Operational Directives */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              {t('copilot.recommendedDirectives', 'Recommended Operational Directives')}
            </span>
            <div className="space-y-1.5">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-200 leading-snug">{rec.text}</span>
                  </div>

                  {rec.action && rec.actionLabel && (
                    <button
                      type="button"
                      onClick={rec.action}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 text-[11px] font-bold shrink-0 flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <span>{rec.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* View Evidence Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs font-mono font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{showEvidence ? 'Hide Supporting Evidence' : '[ View Evidence Base ]'}</span>
              {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showEvidence && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 animate-in fade-in">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Underlying Telemetry & Model Evidence
                </div>
                <div className="space-y-1 text-xs font-mono">
                  {evidenceItems.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                      <span className="text-slate-400">{ev.label}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{ev.value}</span>
                        <DataProvenanceBadge status={ev.provenance} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compliance / Guardrail Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-600" />
          <span>Evaluation Timestamp: {new Date().toLocaleTimeString()}</span>
        </span>
        <span className="text-slate-400">
          AI Decision Support — Non-Autonomous Protocol
        </span>
      </div>
    </div>
  );
};
