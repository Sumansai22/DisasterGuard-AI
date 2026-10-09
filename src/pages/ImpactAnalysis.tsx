import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { exposureService } from '../services/exposureService';
import { multiHazardService } from '../services/multiHazardService';
import { ExposureMetrics } from '../types/exposure';
import { MultiHazardAssessment, HazardSpecificExposure } from '../types/multiHazard';
import { CriticalInfrastructureCards } from '../components/exposure/CriticalInfrastructureCards';
import { RiskMap } from '../components/map/RiskMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import {
  Building2,
  Navigation,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Users,
  AlertTriangle,
  Hospital,
  School,
  Waves,
  Mountain,
  Wind,
  Flame,
  Sun,
  Activity,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ActiveHazardKey = 'COMPOSITE' | 'FLOOD' | 'LANDSLIDE' | 'CYCLONE' | 'EARTHQUAKE' | 'WILDFIRE' | 'HEATWAVE';

export const ImpactAnalysisPage: React.FC = () => {
  const { selectedStation, activeLocation } = useApp();
  const [data, setData] = useState<ExposureMetrics | null>(null);
  const [multiHazardData, setMultiHazardData] = useState<MultiHazardAssessment | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<ActiveHazardKey>('COMPOSITE');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeStationId = selectedStation?.id || 'munnar-zone-a';
  const centerLat = selectedStation?.coordinates.lat ?? activeLocation.lat;
  const centerLng = selectedStation?.coordinates.lng ?? activeLocation.lng;

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [expResult, multiResult] = await Promise.all([
          exposureService.getExposureData(activeStationId),
          multiHazardService.getAssessment({
            lat: centerLat,
            lng: centerLng,
            locationName: activeLocation.name,
            rainfall_mm: selectedStation?.parameters.rainfall_mm ?? 55,
            slope_angle: selectedStation?.parameters.slope_angle ?? 28,
            soil_saturation: selectedStation?.parameters.soil_saturation ?? 65,
            vegetation_cover: selectedStation?.parameters.vegetation_cover ?? 50,
            earthquake_activity: selectedStation?.parameters.earthquake_activity ?? 0.15,
            proximity_to_water: selectedStation?.parameters.proximity_to_water ?? 300,
            is_monitored: Boolean(activeLocation.isMonitored && selectedStation),
          }),
        ]);
        if (mounted) {
          setData(expResult);
          setMultiHazardData(multiResult);
        }
      } catch (err) {
        console.error('Impact analysis load failed:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [activeStationId, centerLat, centerLng, activeLocation.name, activeLocation.isMonitored, selectedStation]);

  if (isLoading || !data) {
    return <LoadingSpinner message="Calculating Geospatial Population & Multi-Hazard Exposure Matrix..." fullHeight />;
  }

  // Active exposure profile
  const exposureProfiles = multiHazardData?.hazardExposures;
  const currentHazardExposure: HazardSpecificExposure | undefined =
    exposureProfiles && exposureProfiles[selectedHazard]
      ? exposureProfiles[selectedHazard]
      : exposureProfiles?.['COMPOSITE'];

  const hazardTabs: { key: ActiveHazardKey; label: string; icon: any; color: string }[] = [
    { key: 'COMPOSITE', label: 'All Hazards (Composite)', icon: Layers, color: 'text-purple-400' },
    { key: 'FLOOD', label: 'Flood / Inundation', icon: Waves, color: 'text-blue-400' },
    { key: 'LANDSLIDE', label: 'Landslide', icon: Mountain, color: 'text-amber-400' },
    { key: 'CYCLONE', label: 'Cyclone / Storm', icon: Wind, color: 'text-cyan-400' },
    { key: 'EARTHQUAKE', label: 'Earthquake', icon: Activity, color: 'text-rose-400' },
    { key: 'WILDFIRE', label: 'Wildfire', icon: Flame, color: 'text-orange-400' },
    { key: 'HEATWAVE', label: 'Heatwave', icon: Sun, color: 'text-yellow-400' },
  ];

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'MANDATORY':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'RECOMMENDED':
      case 'PREPARE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'VOLUNTARY':
      case 'ADVISORY':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Multi-Hazard Impact & Exposure Analysis
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Dynamic demographic and infrastructure vulnerability modeling customized per hazard profile ({activeLocation.name})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/damage-assessment"
            className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all border border-purple-500/40"
          >
            <Building2 className="w-4 h-4 text-purple-200" />
            <span>Damage Prioritization (PS-53)</span>
          </Link>
          <Link
            to="/evacuation"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Navigation className="w-4 h-4" />
            <span>Plan Evacuation Corridor</span>
          </Link>
        </div>
      </div>

      {/* Hazard Selector Tabs */}
      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {hazardTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedHazard === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedHazard(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hazard-Specific Exposure Overview Card */}
      {currentHazardExposure && (
        <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider uppercase">
                  {currentHazardExposure.hazard_type} EXPOSURE PROFILE
                </span>
                <DataProvenanceBadge
                  status={currentHazardExposure.data_status as any}
                  source={currentHazardExposure.source}
                  size="sm"
                />
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{currentHazardExposure.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Evacuation SOP:</span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border tracking-wide uppercase ${getPriorityBadgeClass(
                  currentHazardExposure.evacuation_priority
                )}`}
              >
                {currentHazardExposure.evacuation_priority}
              </span>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Population at Risk</span>
              <span className="text-lg font-bold font-mono text-white mt-0.5 block">
                {currentHazardExposure.population_exposed.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">
                ({currentHazardExposure.vulnerable_demographics.elderly} elderly, {currentHazardExposure.vulnerable_demographics.children} kids)
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Affected Area</span>
              <span className="text-lg font-bold font-mono text-cyan-400 mt-0.5 block">
                {currentHazardExposure.affected_area_km2} km²
              </span>
              <span className="text-[10px] text-slate-400">Geospatial footprint</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Exposed Roads</span>
              <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">
                {currentHazardExposure.roads_exposed_km} km
              </span>
              <span className="text-[10px] text-slate-400">Transit corridors</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Hospitals / Trauma</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                {currentHazardExposure.hospitals_exposed}
              </span>
              <span className="text-[10px] text-slate-400">Healthcare nodes</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Schools & Centers</span>
              <span className="text-lg font-bold font-mono text-indigo-400 mt-0.5 block">
                {currentHazardExposure.schools_exposed}
              </span>
              <span className="text-[10px] text-slate-400">Assembly facilities</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Verified Shelters</span>
              <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                🛡 {currentHazardExposure.verified_shelters_available}
              </span>
              <span className="text-[10px] text-slate-400">Ready for intake</span>
            </div>
          </div>

          {/* Cascading Threat & Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-amber-400 block mb-1">Cascading Hazard Compound Threat:</span>
              <p className="text-slate-300 leading-relaxed">{currentHazardExposure.cascading_threat}</p>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-cyan-400 block mb-1">Standard Operating Action:</span>
              <p className="text-slate-300 leading-relaxed">{currentHazardExposure.recommended_action}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map & Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Exposure Map (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Exposure Zone Overlay & Safe Refuge Nodes
              </h4>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Red: Hazard | Green: Safe
            </span>
          </div>

          <div className="flex-1 min-h-[460px]">
            <RiskMap
              center={[centerLat, centerLng]}
              zoom={13}
              height="480px"
              selectedStationId={selectedStation?.id}
            />
          </div>
        </div>

        {/* Right: Critical Infrastructure & Facilities List (6 cols) */}
        <div className="lg:col-span-6">
          <CriticalInfrastructureCards assets={data.assets} />
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalysisPage;
