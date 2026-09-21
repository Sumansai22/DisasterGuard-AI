import React from 'react';
import { useApp } from '../context/AppContext';
import { usePrediction } from '../context/PredictionContext';
import { useAlerts } from '../hooks/useAlerts';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskFactorBar } from '../components/common/RiskFactorBar';
import { RiskMap } from '../components/map/RiskMap';
import { SearchedLocationBanner } from '../components/common/SearchedLocationBanner';
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
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateInputConditionFactors } from '../utils/riskLevel';
import { encodeSoilType } from '../utils/riskLevel';
import { landScanService } from '../services/landScanService';

export const DashboardPage: React.FC = () => {
  const {
    selectedStation,
    setSelectedStation,
    searchedLocation,
    clearSearchedLocation,
  } = useApp();
  const { latestResult, formValues } = usePrediction();
  const { alerts } = useAlerts();
  const navigate = useNavigate();
  const [landScanCount, setLandScanCount] = React.useState<number>(0);
  const [latestScanDetected, setLatestScanDetected] = React.useState<boolean>(false);

  React.useEffect(() => {
    landScanService.getScanHistory(5).then((res) => {
      setLandScanCount(res.total || 0);
      if (res.scans && res.scans.length > 0) {
        setLatestScanDetected(res.scans[0].landslide_detected);
      }
    }).catch(() => {});
  }, []);

  // Active risk factors from current station or latest prediction
  const activeInput = {
    Rainfall_mm: selectedStation.parameters.rainfall_mm,
    Slope_Angle: selectedStation.parameters.slope_angle,
    Soil_Saturation: selectedStation.parameters.soil_saturation,
    Vegetation_Cover: selectedStation.parameters.vegetation_cover,
    Earthquake_Activity: selectedStation.parameters.earthquake_activity,
    Proximity_to_Water: selectedStation.parameters.proximity_to_water,
    ...encodeSoilType(selectedStation.parameters.soil_type),
  };

  const factors = calculateInputConditionFactors(activeInput);
  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  const isNonMonitoredSearched = Boolean(searchedLocation && !searchedLocation.isMonitored);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
              SIH26001
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Early-Warning Landslide Risk Monitoring
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Real-time environmental intelligence, multispectral U-Net terrain segmentation, and AI-powered landslide risk assessment
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/ai-land-scan"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-sm transition-all active:scale-[0.98]"
          >
            <ScanLine className="w-4 h-4 text-orange-400" />
            <span>AI Land Scan</span>
          </Link>
          <Link
            to="/prediction"
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Run AI Prediction</span>
          </Link>
        </div>
      </div>

      {/* Searched Location Banner if active */}
      {searchedLocation && (
        <SearchedLocationBanner
          location={searchedLocation}
          onClear={clearSearchedLocation}
        />
      )}

      {/* Top KPI Cards (Requirement 4) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard
          title="Overall Risk"
          value={isNonMonitoredSearched ? 'N/A' : selectedStation.riskLevel}
          subtitle={
            isNonMonitoredSearched
              ? 'Non-monitored place'
              : `Score: ${selectedStation.riskScore}/100`
          }
          icon={ShieldAlert}
          iconColor={isNonMonitoredSearched ? 'text-slate-500' : 'text-red-600'}
          iconBg={isNonMonitoredSearched ? 'bg-slate-100' : 'bg-red-50'}
          badge={
            isNonMonitoredSearched
              ? { text: 'Not Monitored', variant: 'neutral' }
              : {
                  text: `${selectedStation.riskScore}/100`,
                  variant: selectedStation.riskScore > 75 ? 'danger' : 'warning',
                }
          }
        />

        <StatCard
          title="Active Warnings"
          value={activeAlertsCount}
          subtitle="Critical & High bulletins"
          icon={BellRing}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          badge={{ text: 'Live Feeds', variant: 'danger' }}
        />

        <StatCard
          title="High-Risk Zones"
          value="12"
          subtitle="Saturated slope sectors"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />

        <StatCard
          title="Current Rainfall"
          value={
            isNonMonitoredSearched
              ? 'N/A'
              : `${selectedStation.parameters.rainfall_mm} mm`
          }
          subtitle={isNonMonitoredSearched ? 'No sensor node' : '24-hr cumulative'}
          icon={CloudRain}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Monitored Locations"
          value="148"
          subtitle="Telemetry stations"
          icon={Radio}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />

        <StatCard
          title="AI Land Scans"
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
          title="AI Confidence"
          value={isNonMonitoredSearched ? 'N/A' : `${selectedStation.confidence}%`}
          subtitle="RandomForest v2.4.1"
          icon={Cpu}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badge={{
            text: isNonMonitoredSearched ? 'Awaiting Input' : 'High Precision',
            variant: isNonMonitoredSearched ? 'neutral' : 'success',
          }}
        />
      </div>

      {/* Main Risk Overview (Requirement 5 & Requirement 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Risk Map (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Spatial Landslide Hazard Map & Terrain Exploration
              </h3>
            </div>
            <Link
              to="/risk-map"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Full Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[420px]">
            <RiskMap
              height="440px"
              selectedStationId={selectedStation.id}
              onStationSelect={(stn) => {
                setSelectedStation(stn);
                clearSearchedLocation();
              }}
            />
          </div>
        </div>

        {/* Right: Risk Assessment or Non-Monitored Info Panel (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-5">
          {isNonMonitoredSearched && searchedLocation ? (
            // Non-Monitored Searched Location State (Requirement 5B & 11)
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Geographic Search Target
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Location Overview
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Non-Monitored
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">Location:</span>
                  <span className="text-xs font-bold text-slate-900">{searchedLocation.name}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500">Region:</span>
                  <span className="text-xs font-medium text-slate-700 text-right max-w-[200px] truncate">
                    {searchedLocation.state ? `${searchedLocation.state}, ` : ''}{searchedLocation.country || 'India'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Coordinates:</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {searchedLocation.lat.toFixed(4)}, {searchedLocation.lng.toFixed(4)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Monitoring Status:</span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    Not currently monitored
                  </span>
                </div>
              </div>

              {/* Notice that no fake data is generated */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Monitoring data unavailable for this location</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  No automated sensors or rainfall gauges are deployed at this specific site. To calculate landslide hazard for this area, enter or obtain the 9 environmental parameters in the AI Predictor.
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
          ) : (
            // Monitored Station State (Requirement 5A)
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Active Station Telemetry
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Current Risk Assessment
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

              {/* Primary Risk Factors (Requirement 5) */}
              <div className="mt-5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                  <span>Primary Risk Factors</span>
                  <span>Impact</span>
                </div>

                {factors.slice(0, 5).map((factor) => (
                  <RiskFactorBar
                    key={factor.name}
                    label={factor.name.split(' ')[0]}
                    valueDisplay={String(factor.value)}
                    level={factor.impact}
                    score={factor.score}
                    direction={factor.direction}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          {!isNonMonitoredSearched && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
              <Link
                to="/impact-analysis"
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Impact Analysis</span>
              </Link>

              <Link
                to="/evacuation"
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Evacuation Plan</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
