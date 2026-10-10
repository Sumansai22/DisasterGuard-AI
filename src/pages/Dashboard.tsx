import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { usePrediction } from '../context/PredictionContext';
import { useAlerts } from '../hooks/useAlerts';
import { useTranslation } from '../i18n';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskFactorBar } from '../components/common/RiskFactorBar';
import { RiskMap } from '../components/map/RiskMap';
import { SearchedLocationBanner } from '../components/common/SearchedLocationBanner';
import { MultiHazardRiskMatrix } from '../components/dashboard/MultiHazardRiskMatrix';
import { CascadingHazardFlow } from '../components/dashboard/CascadingHazardFlow';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { ScenarioSimulatorModal } from '../components/common/ScenarioSimulatorModal';
import { multiHazardService } from '../services/multiHazardService';
import { disasterManagementService, ScenarioSimulationResult } from '../services/disasterManagementService';
import { MultiHazardAssessment, HazardType } from '../types/multiHazard';
import { EmergencyCopilot } from '../components/copilot/EmergencyCopilot';
import { WhyThisAlertModal } from '../components/explainability/WhyThisAlertModal';
import { RiskEvolutionTimeline } from '../components/timeline/RiskEvolutionTimeline';
import { DemoTourButton } from '../components/demo/DemoTourButton';
import {
  ShieldAlert,
  BellRing,
  AlertTriangle,
  CloudRain,
  Radio,
  Cpu,
  ArrowRight,
  TrendingUp,
  Building2,
  Navigation,
  BrainCircuit,
  ScanLine,
  Layers,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  Globe,
  Waves,
  Zap,
  Play,
  Activity,
  HeartHandshake,
  Ambulance,
  ShieldCheck,
  LifeBuoy,
  Crosshair,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateInputConditionFactors, encodeSoilType } from '../utils/riskLevel';
import { landScanService } from '../services/landScanService';

export const DashboardPage: React.FC = () => {
  const {
    activeLocation,
    selectedStation,
    selectTelemetryStation,
    selectedHazardType,
    setSelectedHazardType,
    searchedLocation,
    clearSearchedLocation,
    getNearestTelemetryStation,
  } = useApp();
  const { latestResult } = usePrediction();
  const { alerts } = useAlerts();
  const { t, formatNumber } = useTranslation();
  const navigate = useNavigate();
  const [landScanCount, setLandScanCount] = useState<number>(0);
  const [latestScanDetected, setLatestScanDetected] = useState<boolean>(false);
  const [multiHazardData, setMultiHazardData] = useState<MultiHazardAssessment | null>(null);
  const [isLoadingHazard, setIsLoadingHazard] = useState<boolean>(false);
  const [showWhyThisAlert, setShowWhyThisAlert] = useState<boolean>(false);

  useEffect(() => {
    landScanService.getScanHistory(5).then((res) => {
      setLandScanCount(res.total || 0);
      if (res.scans && res.scans.length > 0) {
        setLatestScanDetected(res.scans[0].landslide_detected);
      }
    }).catch(() => {});
  }, []);

  // Fetch Multi-Hazard Assessment whenever activeLocation or selectedStation changes
  useEffect(() => {
    let mounted = true;
    setIsLoadingHazard(true);

    const params = {
      lat: activeLocation.lat,
      lng: activeLocation.lng,
      locationName: activeLocation.name,
      rainfall_mm: selectedStation?.parameters.rainfall_mm ?? 55.0,
      slope_angle: selectedStation?.parameters.slope_angle ?? 28.0,
      soil_saturation: selectedStation?.parameters.soil_saturation ?? 65.0,
      vegetation_cover: selectedStation?.parameters.vegetation_cover ?? 50.0,
      earthquake_activity: selectedStation?.parameters.earthquake_activity ?? 0.15,
      proximity_to_water: selectedStation?.parameters.proximity_to_water ?? 300.0,
      is_monitored: Boolean(activeLocation.isMonitored && selectedStation),
    };

    multiHazardService
      .getAssessment(params)
      .then((res) => {
        if (mounted) setMultiHazardData(res);
      })
      .catch((err) => {
        console.error('Multi-Hazard Assessment fetch failed:', err);
      })
      .finally(() => {
        if (mounted) setIsLoadingHazard(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeLocation, selectedStation]);

  const isMonitored = Boolean(activeLocation.isMonitored && selectedStation);
  const nearestStn = !isMonitored
    ? getNearestTelemetryStation(activeLocation.lat, activeLocation.lng)
    : null;

  // Active risk factors from current station if available
  const activeInput = selectedStation
    ? {
        Rainfall_mm: selectedStation.parameters.rainfall_mm,
        Slope_Angle: selectedStation.parameters.slope_angle,
        Soil_Saturation: selectedStation.parameters.soil_saturation,
        Vegetation_Cover: selectedStation.parameters.vegetation_cover,
        Earthquake_Activity: selectedStation.parameters.earthquake_activity,
        Proximity_to_Water: selectedStation.parameters.proximity_to_water,
        ...encodeSoilType(selectedStation.parameters.soil_type),
      }
    : null;

  const factors = activeInput ? calculateInputConditionFactors(activeInput) : null;
  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeScenarioResult, setActiveScenarioResult] = useState<ScenarioSimulationResult | null>(null);

  // Dynamic hazard exposure calculations
  const currentExposure =
    multiHazardData?.hazardExposures?.[selectedHazardType] ||
    multiHazardData?.hazardExposures?.['ALL'] ||
    (multiHazardData?.hazardExposures ? Object.values(multiHazardData.hazardExposures)[0] : null);

  const topActiveHazards = multiHazardData?.hazards?.filter((h) => h.score >= 40) || [];
  const displayHazards =
    topActiveHazards.length > 0
      ? topActiveHazards.slice(0, 3)
      : (multiHazardData?.hazards?.slice(0, 3) || []);

  const totalIncidents = alerts.length;
  const highRiskZonesCount = multiHazardData?.hazards
    ? multiHazardData.hazards.filter((h) => h.level === 'HIGH' || h.level === 'CRITICAL').length
    : (isMonitored ? 2 : 0);

  return (
    <div className="space-y-6">
      {/* Dashboard Hero Header: Balanced Two-Column Responsive Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)] items-center gap-4 lg:gap-6 pb-4 border-b border-slate-200">
        {/* Left Column — Project Introduction */}
        <div className="min-w-0 flex flex-col justify-center">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200 tracking-wide shrink-0">
              {t('app.ndmaDss', 'NDMA DSS')}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200 tracking-wide shrink-0">
              {t('app.multiHazard', 'MULTI-HAZARD')}
            </span>
          </div>

          {/* Main Heading — Natural word wrapping, bold and prominent */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug sm:leading-tight">
            {t('app.title', 'DisasterGuard AI')} — {t('app.subtitle', 'Multi-Hazard Disaster Management & Early Warning System')}
          </h1>

          {/* Subtitle — Readable, comfortable line length */}
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
            {t('app.headerSubtitle', 'AI-Powered Multi-Hazard Disaster Risk, Warning & Response Platform')}
          </p>
        </div>

        {/* Right Column — Primary Actions */}
        <div className="flex flex-col gap-2.5 w-full justify-self-stretch lg:justify-self-end min-w-0">
          {/* Top Row: Start Project Demo (prominent) + Damage Prioritization (PS-53) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-2.5">
            <DemoTourButton
              variant="hero"
              className="w-full justify-center text-center shadow-md shadow-orange-600/25"
            />
            <Link
              to="/damage-assessment"
              className="px-3.5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-purple-900/20 hover:shadow-purple-900/30 transition-all active:scale-[0.98] border border-purple-500/40 text-center"
              title="Open PS-53 Disaster Damage Assessment and Inspection Prioritization Workspace"
            >
              <Building2 className="w-4 h-4 text-purple-200 shrink-0" />
              <span className="whitespace-nowrap">Damage Prioritization (PS-53)</span>
            </Link>
          </div>

          {/* Secondary Row: 4 Operational Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              title="Launch Dynamic Multi-Hazard Scenario Simulator"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="truncate">⚡ Scenario Simulator</span>
            </button>
            <Link
              to="/drone-rescue"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 shadow-xs transition-all active:scale-[0.98]"
              title="Open Aerial Drone Reconnaissance & Thermal Rescue Feed"
            >
              <Crosshair className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">{t('nav.droneRescue', 'Drone & Rescue')}</span>
            </Link>
            <Link
              to="/evacuation"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              title="View Safe Shelters & Intelligent Evacuation Routing"
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Evacuation Routes</span>
            </Link>
            <Link
              to="/prediction"
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
              title="Run AI Disaster Risk Prediction Engine"
            >
              <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">AI Predictor</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Scenario Simulator Modal */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        activeLocationName={activeLocation.name}
        onScenarioActivated={(sc) => {
          setActiveScenarioResult(sc);
          setIsSimulatorOpen(false);
        }}
      />

      {/* Integrated Command Center Operations & Impact Bar */}
      <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4 w-full min-w-0 box-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 truncate">
              {t('app.disasterCommandCenter')} | {activeLocation.name}
            </span>
            <DataProvenanceBadge
              status={isMonitored ? 'SENSOR' : 'LIVE'}
              source={isMonitored ? 'Telemetry Station' : 'Open-Meteo & IMD'}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono shrink-0 flex-wrap">
            <button
              onClick={() => setShowWhyThisAlert(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800/80 text-cyan-300 text-[11px] font-semibold transition"
              title="Inspect AI alert reasoning, feature attribution and model provenance"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Why This Alert?</span>
            </button>
            <span className="text-slate-400 text-[11px] sm:text-xs">
              {t('app.environmentalData')}:{' '}
              <strong className="text-emerald-400 font-bold">{t('app.available')}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px] sm:text-xs">
              {t('app.localSensor')}:{' '}
              <strong className={isMonitored ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {isMonitored ? t('app.online') : t('app.remoteMode')}
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {/* Active Hazards */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between min-w-0">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{t('dashboard.activeHazards')}</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {displayHazards.length > 0 ? (
                displayHazards.map((hz) => (
                  <span
                    key={hz.type}
                    className={`px-2 py-1 rounded-md text-xs font-bold border flex items-center gap-1 ${
                      hz.level === 'CRITICAL'
                        ? 'bg-red-950/80 text-red-400 border-red-800'
                        : hz.level === 'HIGH'
                        ? 'bg-orange-950/80 text-orange-400 border-orange-800'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800'
                    }`}
                  >
                    {hz.level === 'CRITICAL' ? '≡ƒö┤' : hz.level === 'HIGH' ? '≡ƒƒá' : '≡ƒƒí'}{' '}
                    {t(`hazards.${hz.type}`, hz.name)}
                  </span>
                ))
              ) : (
                <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  ≡ƒƒó Nominal Environmental Baseline
                </span>
              )}
            </div>
          </div>

          {/* Operations Overview */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between min-w-0">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t('dashboard.operations')}</span>
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('dashboard.incidents')}</span>
                <span className="text-white font-bold text-xs truncate block">
                  ≡ƒÜ¿ {totalIncidents > 0 ? `${totalIncidents} Active` : '0 Active'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('dashboard.rescueTargets')}</span>
                <span className="text-orange-400 font-bold text-xs truncate block">
                  ≡ƒÜü {currentExposure?.vulnerable_demographics
                    ? `${formatNumber(currentExposure.vulnerable_demographics.elderly + currentExposure.vulnerable_demographics.children)} Exposed`
                    : `${activeAlertsCount} Priority`}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('dashboard.safeShelters')}</span>
                <span className="text-emerald-400 font-bold text-xs truncate block">
                  ≡ƒ¢í {currentExposure?.verified_shelters_available ?? 4} Ready
                </span>
              </div>
            </div>
          </div>

          {/* Impact Exposure */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between min-w-0 md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{t('dashboard.impactExposure')}</span>
              </span>
              <DataProvenanceBadge status="ESTIMATED" source="GIS Matrix" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono text-center">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('dashboard.population')}</span>
                <span className="text-white font-bold text-xs truncate block">
                  {currentExposure?.population_exposed != null
                    ? formatNumber(currentExposure.population_exposed)
                    : isMonitored ? formatNumber(4800) : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('dashboard.buildings')}</span>
                <span className="text-white font-bold text-xs truncate block">
                  {currentExposure?.critical_facilities_exposed != null
                    ? formatNumber(currentExposure.critical_facilities_exposed * 18 + (currentExposure.schools_exposed || 0) * 8)
                    : isMonitored ? formatNumber(166) : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('dashboard.roads')}</span>
                <span className="text-white font-bold text-xs truncate block">
                  {currentExposure?.roads_exposed_km != null
                    ? `${currentExposure.roads_exposed_km} km`
                    : isMonitored ? '18.5 km' : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 min-w-0">
                <span className="text-[10px] text-slate-500 block truncate">{t('dashboard.hospitals')}</span>
                <span className="text-emerald-400 font-bold text-xs truncate block">
                  {currentExposure?.hospitals_exposed != null
                    ? currentExposure.hospitals_exposed
                    : isMonitored ? 2 : 'UNAVAILABLE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Searched Location Banner if active */}
      {searchedLocation && (
        <SearchedLocationBanner
          location={searchedLocation}
          onClear={clearSearchedLocation}
        />
      )}

      {/* AI Emergency Copilot Synthesis */}
      <EmergencyCopilot
        assessment={multiHazardData}
        rainfallMm={selectedStation?.parameters.rainfall_mm ?? null}
        activeIncidentsCount={totalIncidents}
        blockedRoadsCount={currentExposure?.roads_exposed_km ? Math.max(1, Math.round(currentExposure.roads_exposed_km / 8)) : 1}
        sheltersCount={currentExposure?.verified_shelters_available ?? 4}
        onOpenEvacuation={() => navigate('/evacuation')}
        onOpenShelters={() => navigate('/evacuation')}
        onOpenExplainability={() => setShowWhyThisAlert(true)}
        onOpenScenario={() => setIsSimulatorOpen(true)}
        onOpenMissionControl={() => navigate('/mission-control')}
      />

      {/* Top KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <StatCard
          title={t('dashboard.overallRisk')}
          value={isMonitored && selectedStation ? selectedStation.riskLevel : 'N/A'}
          subtitle={
            isMonitored && selectedStation
              ? `Score: ${selectedStation.riskScore}/100`
              : t('app.notMonitored')
          }
          icon={ShieldAlert}
          iconColor={isMonitored ? 'text-red-600' : 'text-slate-500'}
          iconBg={isMonitored ? 'bg-red-50' : 'bg-slate-100'}
          badge={
            isMonitored && selectedStation
              ? {
                  text: `${selectedStation.riskScore}/100`,
                  variant: selectedStation.riskScore > 75 ? 'danger' : 'warning',
                }
              : { text: t('app.notMonitored'), variant: 'neutral' }
          }
        />

        <StatCard
          title={t('dashboard.activeWarnings')}
          value={activeAlertsCount}
          subtitle="Critical & High bulletins"
          icon={BellRing}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          badge={{ text: 'Live Feeds', variant: 'danger' }}
        />

        <StatCard
          title={t('dashboard.highRiskZones')}
          value={highRiskZonesCount > 0 ? `${highRiskZonesCount}` : (isMonitored ? '0' : 'N/A')}
          subtitle="Monitored hazard sectors"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />

        <StatCard
          title={t('dashboard.currentRainfall')}
          value={
            isMonitored && selectedStation
              ? `${selectedStation.parameters.rainfall_mm} mm`
              : 'N/A'
          }
          subtitle={isMonitored ? '24-hr cumulative' : 'No local sensor'}
          icon={CloudRain}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title={t('dashboard.activeLocation')}
          value={activeLocation.name.split(' ')[0]}
          subtitle={activeLocation.state ? `${activeLocation.state}` : 'Geographic Node'}
          icon={MapPin}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          badge={{
            text: isMonitored ? 'Monitored' : 'Geographic',
            variant: isMonitored ? 'success' : 'neutral',
          }}
        />

        <StatCard
          title={t('dashboard.aiLandScans')}
          value={landScanCount}
          subtitle="U-Net 2D Vision"
          icon={ScanLine}
          iconColor="text-orange-500"
          iconBg="bg-orange-50"
          badge={{
            text: latestScanDetected ? 'Hazard Segmented' : 'Ready',
            variant: latestScanDetected ? 'danger' : 'success',
          }}
        />

        <StatCard
          title={t('dashboard.aiConfidence')}
          value={isMonitored && selectedStation ? `${selectedStation.confidence}%` : 'N/A'}
          subtitle={isMonitored ? 'RandomForest v2.4.1' : 'Awaiting Input'}
          icon={Cpu}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badge={{
            text: isMonitored ? 'High Precision' : 'Awaiting Input',
            variant: isMonitored ? 'success' : 'neutral',
          }}
        />
      </div>

      {/* Main Risk Overview (GIS Map + Telemetry Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full min-w-0">
        {/* Left: Interactive Risk Map (7 Columns on desktop, full width on mobile/tablet) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col min-w-0">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {t('dashboard.spatialGisTitle')}
              </h3>
            </div>
            <Link
              to="/risk-map"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 shrink-0"
            >
              <span>{t('dashboard.fullMap')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[360px] sm:min-h-[420px] lg:min-h-[460px]">
            <RiskMap
              height="460px"
              selectedStationId={selectedStation ? selectedStation.id : undefined}
              onStationSelect={(stn) => {
                selectTelemetryStation(stn);
              }}
            />
          </div>
        </div>

        {/* Right: Risk Assessment or Non-Monitored Info Panel (5 Columns on desktop, full width on mobile/tablet) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4 min-w-0">
          {!isMonitored ? (
            // Non-Monitored Searched Location State (e.g. Macherla, Chennai, Manali)
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('app.geographicSearchTarget')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {activeLocation.name}
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {t('app.notMonitored')}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">{t('app.selectedPlace')}:</span>
                  <span className="text-xs font-bold text-slate-900">{activeLocation.name}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">{t('app.addressRegion')}:</span>
                  <span className="text-xs font-medium text-slate-700 text-right max-w-[220px] truncate" title={activeLocation.displayName}>
                    {activeLocation.displayName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{t('app.coordinates')}:</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {activeLocation.lat.toFixed(4)}, {activeLocation.lng.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">{t('app.localTelemetry')}:</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    {t('app.noLocalTelemetry')}
                  </span>
                </div>

                {nearestStn && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-mono">
                    <span>{t('app.nearestStation')}:</span>
                    <strong className="text-slate-800">{nearestStn.station.name} ({nearestStn.distance_km} km)</strong>
                  </div>
                )}
              </div>

              {/* Notice that no fake data is generated */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>No automated sensors deployed at this specific site</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  No automated sensors or rainfall gauges are deployed in {activeLocation.name}. To calculate landslide hazard for this area, enter environmental parameters into the AI Predictor or run AI Land Scan.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/prediction')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <BrainCircuit className="w-4 h-4 text-orange-400" />
                  <span>Run AI Prediction with 9 Parameters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : selectedStation ? (
            // Monitored Station State (e.g. Munnar, Meppadi, Shimla)
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Active Station Telemetry
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedStation.name}
                  </h3>
                </div>
                <RiskBadge
                  level={selectedStation.riskLevel}
                  score={selectedStation.riskScore}
                  size="md"
                />
              </div>

              {/* Assessment Breakdown Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Location:</span>
                  <span className="text-xs font-bold text-slate-900">{selectedStation.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Risk Score:</span>
                  <span className="text-sm font-mono font-extrabold text-red-600">
                    {selectedStation.riskScore} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Prediction:</span>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded font-mono">
                    {selectedStation.riskScore >= 50
                      ? 'LANDSLIDE RISK DETECTED'
                      : 'SAFE - NO IMMEDIATE RISK'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Confidence:</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {selectedStation.confidence}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Timestamp:
                  </span>
                  <span className="font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Primary Risk Factors */}
              {factors && factors.length > 0 && selectedStation && (
                <div className="mt-5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                    <span>Primary Risk Factors</span>
                    <span className="text-slate-400 font-mono">Weight / Impact</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    {factors.slice(0, 3).map((f) => (
                      <RiskFactorBar
                        key={f.name}
                        label={f.name}
                        score={f.score}
                        valueDisplay={String(f.value)}
                        level={f.impact}
                        explanation={f.explanation}
                        direction={f.direction}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Multi-Hazard Decision Support Matrix */}
      <MultiHazardRiskMatrix
        assessment={multiHazardData}
        isLoading={isLoadingHazard}
        onSelectHazard={(hz) => setSelectedHazardType(hz)}
      />

      {/* Multi-Hazard Decision Pipeline Architecture Flow */}
      <CascadingHazardFlow assessment={multiHazardData} />

      {/* 24-Hour Risk Evolution Timeline */}
      <RiskEvolutionTimeline
        currentRiskScore={selectedStation?.riskScore ?? 65}
        currentRainfallMm={selectedStation?.parameters.rainfall_mm ?? 55}
        locationName={activeLocation.name}
      />

      {/* AI Trust Disclaimer & Data Provenance Footer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            DisasterGuard AI synthesized from IMD Doppler Radar, GSI geotechnical mapping, and local telemetry. Automated directives require incident commander verification before mandatory evacuation dispatch.
          </span>
        </div>
        <DataProvenanceBadge status="MODEL_ESTIMATE" label="AUDITED AI" size="sm" />
      </div>

      {/* Why This Alert Explainability Modal */}
      <WhyThisAlertModal
        isOpen={showWhyThisAlert}
        onClose={() => setShowWhyThisAlert(false)}
        riskLevel={selectedStation?.riskLevel || 'HIGH'}
        riskScore={selectedStation?.riskScore || 78}
        primaryContributor={factors?.[0]?.name ? `${factors[0].name} (${factors[0].impact} impact)` : 'Sustained Heavy Precipitation'}
        modelName="Random Forest Classifier v2.4 (landslide_model.pkl)"
        factors={factors?.map((f) => ({
          name: f.name,
          score: f.score,
          valueDisplay: String(f.value),
          impact: f.impact,
          explanation: f.explanation,
        }))}
      />
    </div>
  );
};
