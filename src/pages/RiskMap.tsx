import React, { useState } from 'react';
import { RiskMap } from '../components/map/RiskMap';
import { useApp } from '../context/AppContext';
import { MONITORED_STATIONS, RISK_ZONES, SAFE_ZONES } from '../utils/constants';
import { MonitoringStation } from '../types/map';
import { RiskBadge } from '../components/common/RiskBadge';
import { SearchedLocationBanner } from '../components/common/SearchedLocationBanner';
import {
  MapPin,
  Search,
  Layers,
  Shield,
  CloudRain,
  Mountain,
  Droplets,
  Trees,
  Crosshair,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '../context/PredictionContext';

export const RiskMapPage: React.FC = () => {
  const {
    selectedStation,
    setSelectedStation,
    searchedLocation,
    clearSearchedLocation,
  } = useApp();
  const { setFormValues } = usePrediction();
  const navigate = useNavigate();
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [stationListSearch, setStationListSearch] = useState<string>('');

  const filteredStations = MONITORED_STATIONS.filter((s) => {
    const matchesRisk = filterRisk === 'ALL' || s.riskLevel === filterRisk;
    const matchesSearch =
      s.name.toLowerCase().includes(stationListSearch.toLowerCase()) ||
      s.region.toLowerCase().includes(stationListSearch.toLowerCase()) ||
      s.state.toLowerCase().includes(stationListSearch.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handleStationClick = (station: MonitoringStation) => {
    setSelectedStation(station);
    clearSearchedLocation();
  };

  const handleRunPrediction = (station: MonitoringStation) => {
    setSelectedStation(station);
    clearSearchedLocation();
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Interactive Geospatial Risk & Terrain Map
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Multi-layered GIS mapping of slope instability, hydrological features, and safe zones
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

      {/* Main Grid: Map (8 cols) + Stations List (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
          <RiskMap
            height="620px"
            stations={filteredStations}
            selectedStationId={selectedStation.id}
            onStationSelect={handleStationClick}
          />
        </div>

        {/* Stations Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stationListSearch}
                onChange={(e) => setStationListSearch(e.target.value)}
                placeholder="Filter sensor stations by name, state..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing <strong>{filteredStations.length}</strong> active sensor nodes</span>
              <span className="font-mono text-[11px]">Real-time Telemetry</span>
            </div>
          </div>

          {/* List of Stations */}
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredStations.map((stn) => {
              const isSelected = selectedStation.id === stn.id && !searchedLocation;
              return (
                <div
                  key={stn.id}
                  onClick={() => handleStationClick(stn)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-400/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        {stn.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {stn.region}, {stn.state}
                      </p>
                    </div>
                    <RiskBadge level={stn.riskLevel} score={stn.riskScore} size="sm" />
                  </div>

                  {/* Environmental Snapshot */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] my-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100 font-mono">
                    <span className="text-slate-600">Rain: <strong>{stn.parameters.rainfall_mm}mm</strong></span>
                    <span className="text-slate-600">Slope: <strong>{stn.parameters.slope_angle}°</strong></span>
                    <span className="text-slate-600">Soil: <strong>{stn.parameters.soil_saturation}%</strong></span>
                    <span className="text-slate-600">Type: <strong>{stn.parameters.soil_type}</strong></span>
                  </div>

                  {/* Action Link */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunPrediction(stn);
                    }}
                    className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-2"
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
