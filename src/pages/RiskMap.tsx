import React, { useState, useEffect, useCallback } from 'react';
import { RiskMap } from '../components/map/RiskMap';
import { DisasterCommandSummary } from '../components/map/DisasterCommandSummary';
import { useApp } from '../context/AppContext';
import { MONITORED_STATIONS } from '../utils/constants';
import {
  MonitoringStation,
  DisasterIncident,
  RainfallStationTelemetry,
  WaterBodyTelemetry,
  EmergencyInfrastructureItem,
  CriticalInfrastructureItem,
  SensorNodeItem,
  PopulationVulnerabilityItem,
  CommandSummaryStats,
  DisasterMapLayersState,
  DEFAULT_MAP_LAYERS,
} from '../types/map';
import { RiskBadge } from '../components/common/RiskBadge';
import { SearchedLocationBanner } from '../components/common/SearchedLocationBanner';
import { mapService } from '../services/mapService';
import {
  MapPin,
  Search,
  Shield,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '../context/PredictionContext';
import { useFeedback } from '../context/FeedbackContext';
import { useTranslation } from '../i18n';

const DEFAULT_COMMAND_STATS: CommandSummaryStats = {
  active_incidents: 12,
  critical_zones: 4,
  high_risk_zones: 8,
  active_alerts: 6,
  sensors_online_pct: 94,
  safe_shelters: 7,
  blocked_roads: 3,
  geo_filtered_radius_km: 120,
};

export const RiskMapPage: React.FC = () => {
  const {
    activeLocation,
    selectedStation,
    selectTelemetryStation,
    searchedLocation,
    clearSearchedLocation,
    setMapCenter,
  } = useApp();
  const { setFormValues } = usePrediction();
  const { showInfo } = useFeedback();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [stationListSearch, setStationListSearch] = useState<string>('');
  const [activeLayers, setActiveLayers] = useState<DisasterMapLayersState>(DEFAULT_MAP_LAYERS);
  const [loadingTelemetry, setLoadingTelemetry] = useState<boolean>(false);

  // Disaster Management GIS State
  const [incidents, setIncidents] = useState<DisasterIncident[]>([]);
  const [rainfallStations, setRainfallStations] = useState<RainfallStationTelemetry[]>([]);
  const [waterBodies, setWaterBodies] = useState<WaterBodyTelemetry[]>([]);
  const [emergencyInfra, setEmergencyInfra] = useState<EmergencyInfrastructureItem[]>([]);
  const [criticalInfra, setCriticalInfra] = useState<CriticalInfrastructureItem[]>([]);
  const [sensorNodes, setSensorNodes] = useState<SensorNodeItem[]>([]);
  const [vulnerabilityZones, setVulnerabilityZones] = useState<PopulationVulnerabilityItem[]>([]);
  const [commandStats, setCommandStats] = useState<CommandSummaryStats>(DEFAULT_COMMAND_STATS);

  const activeLat = activeLocation.lat;
  const activeLng = activeLocation.lng;
  const activeLocationName = activeLocation.displayName;

  // Fetch geographic disaster management context whenever active location coordinates change
  const fetchDisasterContext = useCallback(async (lat: number, lng: number) => {
    setLoadingTelemetry(true);
    try {
      const data = await mapService.getDisasterMapContext(lat, lng, 120);
      if (data && typeof data === 'object') {
        if (data.summary && typeof data.summary === 'object') {
          setCommandStats((prev) => ({
            active_incidents: typeof data.summary.active_incidents === 'number' ? data.summary.active_incidents : prev.active_incidents,
            critical_zones: typeof data.summary.critical_zones === 'number' ? data.summary.critical_zones : prev.critical_zones,
            high_risk_zones: typeof data.summary.high_risk_zones === 'number' ? data.summary.high_risk_zones : prev.high_risk_zones,
            active_alerts: typeof data.summary.active_alerts === 'number' ? data.summary.active_alerts : prev.active_alerts,
            sensors_online_pct: typeof data.summary.sensors_online_pct === 'number' ? data.summary.sensors_online_pct : prev.sensors_online_pct,
            safe_shelters: typeof data.summary.safe_shelters === 'number' ? data.summary.safe_shelters : prev.safe_shelters,
            blocked_roads: typeof data.summary.blocked_roads === 'number' ? data.summary.blocked_roads : prev.blocked_roads,
            geo_filtered_radius_km: typeof data.summary.geo_filtered_radius_km === 'number' ? data.summary.geo_filtered_radius_km : 120,
          }));
        }
        setIncidents(Array.isArray(data.incidents) ? data.incidents : []);
        setRainfallStations(Array.isArray(data.rainfall_stations) ? data.rainfall_stations : []);
        setWaterBodies(Array.isArray(data.water_bodies) ? data.water_bodies : []);
        setEmergencyInfra(Array.isArray(data.emergency_infrastructure) ? data.emergency_infrastructure : []);
        setCriticalInfra(Array.isArray(data.critical_infrastructure) ? data.critical_infrastructure : []);
        setSensorNodes(Array.isArray(data.sensors) ? data.sensors : []);
        setVulnerabilityZones(Array.isArray(data.vulnerability_zones) ? data.vulnerability_zones : []);
      }
    } catch (err) {
      console.warn('Failed to load disaster context, retaining safe fallback statistics', err);
    } finally {
      setLoadingTelemetry(false);
    }
  }, []);

  useEffect(() => {
    fetchDisasterContext(activeLat, activeLng);
  }, [activeLat, activeLng, fetchDisasterContext]);

  const filteredStations = MONITORED_STATIONS.filter((s) => {
    const matchesRisk = filterRisk === 'ALL' || s.riskLevel === filterRisk;
    const matchesSearch =
      s.name.toLowerCase().includes(stationListSearch.toLowerCase()) ||
      s.region.toLowerCase().includes(stationListSearch.toLowerCase()) ||
      s.state.toLowerCase().includes(stationListSearch.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handleStationClick = (station: MonitoringStation) => {
    selectTelemetryStation(station);
    showInfo(`GIS View centered on ${station.name} (${station.riskLevel})`);
  };

  const handleRunPrediction = (station: MonitoringStation) => {
    selectTelemetryStation(station);
    setFormValues({
      Rainfall_mm: station.parameters.rainfall_mm,
      Slope_Angle: station.parameters.slope_angle,
      Soil_Saturation: station.parameters.soil_saturation,
      Vegetation_Cover: station.parameters.vegetation_cover,
      Earthquake_Activity: station.parameters.earthquake_activity,
      Proximity_to_Water: station.parameters.proximity_to_water,
      soilType: station.parameters.soil_type,
    });
    navigate('/prediction');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Shield className="w-5 h-5 text-orange-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Disaster Management Command & Risk Map
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Multi-layered GIS tactical command interface for hazards, weather telemetry, water levels, and emergency response
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {['ALL', 'CRITICAL', 'HIGH', 'ELEVATED', 'MODERATE', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterRisk === lvl
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Searched Location Banner if active */}
      {searchedLocation && (
        <SearchedLocationBanner
          location={searchedLocation}
          onClear={clearSearchedLocation}
        />
      )}

      {/* Disaster Command Summary Stats Strip */}
      <DisasterCommandSummary
        stats={commandStats}
        locationName={activeLocationName}
        loading={loadingTelemetry}
        onRefresh={() => fetchDisasterContext(activeLat, activeLng)}
      />

      {/* Main Grid: Map (8 cols) + Stations List (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col">
          <RiskMap
            height="640px"
            center={[activeLat, activeLng]}
            stations={filteredStations}
            incidents={incidents}
            rainfallStations={rainfallStations}
            waterBodies={waterBodies}
            emergencyInfrastructure={emergencyInfra}
            criticalInfrastructure={criticalInfra}
            sensors={sensorNodes}
            vulnerabilityZones={vulnerabilityZones}
            selectedStationId={selectedStation ? selectedStation.id : undefined}
            onStationSelect={handleStationClick}
            activeLayers={activeLayers}
            onLayersChange={setActiveLayers}
          />
        </div>

        {/* Tactical Telemetry Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Search Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stationListSearch}
                onChange={(e) => setStationListSearch(e.target.value)}
                placeholder="Filter sensor stations by name, state..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing <strong>{filteredStations.length}</strong> active sensor nodes</span>
              <span className="font-mono text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-500" />
                Live Telemetry
              </span>
            </div>
          </div>

          {/* List of Stations */}
          <div className="space-y-2.5 max-h-[530px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredStations.map((stn) => {
              const isSelected = selectedStation && selectedStation.id === stn.id;
              return (
                <div
                  key={stn.id}
                  onClick={() => handleStationClick(stn)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/80 border-orange-400 ring-2 ring-orange-400/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        {stn.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {stn.region}, {stn.state}
                      </p>
                    </div>
                    <RiskBadge level={stn.riskLevel} score={stn.riskScore} size="sm" />
                  </div>

                  {/* Environmental Snapshot */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] my-2 bg-slate-50/90 p-2 rounded-lg border border-slate-100 font-mono">
                    <span className="text-slate-600">Rain: <strong className="text-slate-900">{stn.parameters.rainfall_mm}mm</strong></span>
                    <span className="text-slate-600">Slope: <strong className="text-slate-900">{stn.parameters.slope_angle}°</strong></span>
                    <span className="text-slate-600">Soil: <strong className="text-slate-900">{stn.parameters.soil_saturation}%</strong></span>
                    <span className="text-slate-600">Type: <strong className="text-slate-900">{stn.parameters.soil_type}</strong></span>
                  </div>

                  {/* Action Link */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunPrediction(stn);
                    }}
                    className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-1.5 shadow-2xs"
                  >
                    <span>Analyze in AI Predictor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
