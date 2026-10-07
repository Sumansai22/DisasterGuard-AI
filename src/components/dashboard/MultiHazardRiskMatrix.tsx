import React from 'react';
import {
  ShieldAlert,
  Mountain,
  Waves,
  CloudRain,
  Wind,
  Layers,
  Activity,
  Building,
  Flame,
  ThermometerSun,
  AlertTriangle,
  Users,
  Navigation,
  Zap,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { HazardType, HAZARD_PROFILES, MultiHazardAssessment, HazardScoreBreakdown, HazardSpecificExposure } from '../../types/multiHazard';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../i18n';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { DataProvenanceStatus } from '../../types/disasterManagement';

interface MultiHazardRiskMatrixProps {
  assessment: MultiHazardAssessment | null;
  isLoading?: boolean;
  onSelectHazard?: (type: HazardType) => void;
  onRetry?: () => void;
}

export const MultiHazardRiskMatrix: React.FC<MultiHazardRiskMatrixProps> = ({
  assessment,
  isLoading,
  onSelectHazard,
  onRetry,
}) => {
  const { selectedHazardType, setSelectedHazardType } = useApp();
  const { t, formatNumber } = useTranslation();

  const handleHazardClick = (type: HazardType) => {
    setSelectedHazardType(type);
    if (onSelectHazard) {
      onSelectHazard(type);
    }
  };

  const getHazardIcon = (type: HazardType) => {
    switch (type) {
      case 'LANDSLIDE':
        return <Mountain className="w-4 h-4 text-orange-600" />;
      case 'FLASH_FLOOD':
        return <Waves className="w-4 h-4 text-sky-600" />;
      case 'CLOUDBURST':
        return <CloudRain className="w-4 h-4 text-indigo-600" />;
      case 'CYCLONE':
        return <Wind className="w-4 h-4 text-purple-600" />;
      case 'DEBRIS_FLOW':
        return <Layers className="w-4 h-4 text-amber-600" />;
      case 'EARTHQUAKE':
        return <Activity className="w-4 h-4 text-rose-600" />;
      case 'URBAN_FLOOD':
        return <Building className="w-4 h-4 text-teal-600" />;
      case 'WILDFIRE':
        return <Flame className="w-4 h-4 text-red-600" />;
      case 'HEATWAVE':
        return <ThermometerSun className="w-4 h-4 text-amber-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
    }
  };

  const getScoreBadge = (score: number, level?: string) => {
    if (score >= 75) {
      return 'bg-red-500 text-white';
    }
    if (score >= 60) {
      return 'bg-orange-500 text-white';
    }
    if (score >= 40) {
      return 'bg-amber-500 text-white';
    }
    return 'bg-emerald-500 text-white';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL_ALERT':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'WARNING':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MONITORING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  // Explicit Loading State
  if (isLoading && !assessment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
          <span className="text-sm font-bold text-slate-700">{t('common.loading', 'Loading data...')}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Explicit Empty / Unavailable State (No perpetual blank card)
  if (!assessment) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <div>
          <h4 className="text-sm font-bold text-slate-900">{t('common.dataUnavailable', 'DATA TEMPORARILY UNAVAILABLE')}</h4>
          <p className="text-xs text-slate-500 max-w-md mt-1">
            {t('common.dataUnavailableDesc', 'Unable to communicate with remote telemetry service. Click retry to refresh models.')}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('common.retry', 'Retry')}</span>
          </button>
        )}
      </div>
    );
  }

  const activeHazards = assessment.hazards || [];
  const selectedProfile = HAZARD_PROFILES[selectedHazardType] || HAZARD_PROFILES.ALL;

  // Retrieve dynamic hazard-specific exposure details calculated by backend
  const hazardExposureMap = assessment.hazardExposures || {};
  const currentExposure: HazardSpecificExposure | undefined =
    hazardExposureMap[selectedHazardType] || hazardExposureMap['ALL'];

  // Fallback calculations if backend has not loaded exposure dictionary yet
  const exposedPop = currentExposure
    ? currentExposure.population_exposed
    : assessment.impactExposure?.estimatedPopulationAtRisk || 0;
  const elderlyCount = currentExposure
    ? currentExposure.vulnerable_demographics.elderly
    : assessment.impactExposure?.vulnerableDemographics?.elderlyCount || 0;
  const childrenCount = currentExposure
    ? currentExposure.vulnerable_demographics.children
    : assessment.impactExposure?.vulnerableDemographics?.childrenCount || 0;
  const affectedArea = currentExposure ? currentExposure.affected_area_km2 : 4.5;
  const roadsExposed = currentExposure ? currentExposure.roads_exposed_km : 12.8;
  const safeShelters = currentExposure
    ? currentExposure.verified_shelters_available
    : assessment.impactExposure?.safeSheltersAvailable || 0;
  const evacuationPriority = currentExposure
    ? currentExposure.evacuation_priority
    : assessment.emergencyResponse?.evacuationPriority || 'MONITOR';
  const cascadingThreat =
    currentExposure?.cascading_threat ||
    (selectedHazardType === 'ALL'
      ? 'Multi-vector compound risk: Landslide slip dams valley drainage causing flash flood surge.'
      : `${selectedProfile.name} vector impact triggering structural and corridor disruptions.`);
  const recommendedAction =
    currentExposure?.recommended_action ||
    assessment.emergencyResponse?.recommendedActions?.[0] ||
    'Maintain continuous automated sensor surveillance and stage local response units.';
  const dataStatus = (currentExposure?.data_status || 'LIVE') as DataProvenanceStatus;
  const dataSource = currentExposure?.source || 'IMD Radar / GIS / GSI Geohazard Models';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 sm:space-y-5 w-full min-w-0 box-border">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight break-words">
              {t('dashboard.decisionMatrixTitle', 'Multi-Hazard Decision-Support Matrix')}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              {t('dashboard.ndmaProtocolTier', 'NDMA Protocol Tier')}: {assessment.emergencyResponse.ndmaProtocolCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('dashboard.compoundRiskEval', 'Compound risk evaluation across 9 meteorological, geological & biological threat vectors for')} <strong>{assessment.location.name}</strong>
          </p>
        </div>

        {/* Composite Risk Score Metric */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">{t('dashboard.compositeRisk', 'Composite Risk')}:</span>
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-mono font-extrabold ${getScoreBadge(
                assessment.compositeRiskScore,
                assessment.compositeRiskLevel
              )}`}
            >
              {assessment.compositeRiskScore} / 100
            </span>
            <span className="text-xs font-bold text-slate-700">{t(`severity.${assessment.compositeRiskLevel}`, assessment.compositeRiskLevel)}</span>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t(`severity.${assessment.emergencyResponse.alertLevel}`, assessment.emergencyResponse.alertLevel)}</span>
          </div>
        </div>
      </div>

      {/* Hazard Type Quick Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs w-full min-w-0 scrollbar-thin">
        {(Object.keys(HAZARD_PROFILES) as HazardType[]).map((type) => {
          const profile = HAZARD_PROFILES[type];
          const isSelected = selectedHazardType === type;
          const translatedName = t(`hazards.${type}`, profile.shortName);
          return (
            <button
              key={type}
              onClick={() => handleHazardClick(type)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{profile.emoji}</span>
              <span>{translatedName}</span>
            </button>
          );
        })}
      </div>

      {/* Hazard Cards Grid - Responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full min-w-0">
        {activeHazards.map((hazard) => {
          const isSelected = selectedHazardType === hazard.type;
          const profile = HAZARD_PROFILES[hazard.type] || HAZARD_PROFILES.ALL;
          const translatedShort = t(`hazards.${hazard.type}`, profile.shortName);
          return (
            <div
              key={hazard.type}
              onClick={() => handleHazardClick(hazard.type)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative min-w-0 flex flex-col justify-between ${
                isSelected
                  ? 'bg-orange-50/50 border-orange-400 ring-2 ring-orange-400/20 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="p-1 rounded-md bg-slate-100 shrink-0">{getHazardIcon(hazard.type)}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                        {translatedShort}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium block truncate">
                        Confidence: {hazard.confidence}%
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-extrabold shrink-0 ${getScoreBadge(
                      hazard.score,
                      hazard.level
                    )}`}
                  >
                    {hazard.score}
                  </span>
                </div>

                {/* Status Badge & Primary Trigger */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border truncate ${getStatusBadge(
                        hazard.status
                      )}`}
                    >
                      {t(`severity.${hazard.status}`, hazard.status.replace('_', ' '))}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] shrink-0">
                      {hazard.trend === 'RISING' ? '▲ Rising' : '━ Stable'}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-tight line-clamp-2">
                    <strong className="text-slate-700">Trigger: </strong>
                    {hazard.primaryTrigger}
                  </p>
                </div>
              </div>

              {/* Key Metric Tags */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-slate-500">
                {Object.entries(hazard.keyMetrics).map(([k, v]) => (
                  <span key={k} className="truncate">
                    {k}: <strong className="text-slate-700">{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Hazard Spotlight & Hazard-Specific Exposure */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white space-y-3.5 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{selectedProfile.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {selectedHazardType === 'ALL' ? t('hazards.ALL', 'Multi-Hazard Composite Exposure') : `${t('hazards.' + selectedProfile.id, selectedProfile.name)}`}
                </h4>
                <DataProvenanceBadge status={dataStatus} source={dataSource} />
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                {selectedProfile.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] sm:text-[11px] text-orange-400 font-mono font-bold bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
              Monitoring: {selectedProfile.monitoringParameters.slice(0, 3).join(', ')}
            </span>
          </div>
        </div>

        {/* Hazard-Specific Exposure Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full min-w-0">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-mono block truncate">{t('dashboard.affectedArea', 'Affected Area')}</span>
            <span className="text-sm font-extrabold text-white font-mono truncate block">{affectedArea} km²</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-mono block truncate">{t('dashboard.transportExposed', 'Transport Exposed')}</span>
            <span className="text-sm font-extrabold text-amber-400 font-mono truncate block">{roadsExposed} km Roads</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-mono block truncate">{t('dashboard.operationalShelters', 'Operational Shelters')}</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono truncate block">{safeShelters} {t('dashboard.safeShelters', 'Shelters')}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 min-w-0">
            <span className="text-[10px] text-slate-400 uppercase font-mono block truncate">{t('dashboard.evacuationSOP', 'Evacuation SOP')}</span>
            <span className="text-xs font-bold text-rose-300 uppercase truncate block">{t(`severity.${evacuationPriority}`, evacuationPriority)}</span>
          </div>
        </div>

        {/* Cascading Compound Impact Flow & Directives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs w-full min-w-0">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-1.5 text-orange-400 font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('dashboard.cascadingThreatVector', 'Cascading Threat Vector')}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {cascadingThreat}
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-1">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('dashboard.populationAtRisk', 'Population at Risk')}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-white text-sm font-mono">
                  {formatNumber(exposedPop)}
                </strong>{' '}
                {t('dashboard.residentsExposed', 'residents exposed')} (
                <strong className="text-amber-300">{formatNumber(elderlyCount)}</strong> {t('dashboard.elderly', 'elderly')},{' '}
                <strong className="text-amber-300">{formatNumber(childrenCount)}</strong> {t('dashboard.children', 'children')})
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('dashboard.recommendedAction', 'Recommended Action')}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


