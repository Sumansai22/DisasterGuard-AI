import React, { useState } from 'react';
import { DisasterMapLayersState, BaseMapStyle } from '../../types/map';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CloudRain,
  Droplets,
  Shield,
  Building2,
  Radio,
  Navigation,
  Users,
  Eye,
  RotateCcw,
  Map,
  Compass,
} from 'lucide-react';

interface DisasterLayerControlProps {
  layers: DisasterMapLayersState;
  onChange: (layers: DisasterMapLayersState) => void;
  onReset?: () => void;
}

export const DisasterLayerControl: React.FC<DisasterLayerControlProps> = ({
  layers,
  onChange,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>('hazards');

  const toggleHazard = (key: keyof DisasterMapLayersState['hazards']) => {
    onChange({
      ...layers,
      hazards: {
        ...layers.hazards,
        [key]: !layers.hazards[key],
      },
    });
  };

  const toggleWeather = (key: keyof DisasterMapLayersState['weather']) => {
    if (key === 'timeframe') return;
    onChange({
      ...layers,
      weather: {
        ...layers.weather,
        [key]: !layers.weather[key],
      },
    });
  };

  const setWeatherTimeframe = (timeframe: '1h' | '3h' | '24h') => {
    onChange({
      ...layers,
      weather: {
        ...layers.weather,
        timeframe,
      },
    });
  };

  const toggleWater = (key: keyof DisasterMapLayersState['water']) => {
    onChange({
      ...layers,
      water: {
        ...layers.water,
        [key]: !layers.water[key],
      },
    });
  };

  const toggleEmergency = (key: keyof DisasterMapLayersState['emergency']) => {
    onChange({
      ...layers,
      emergency: {
        ...layers.emergency,
        [key]: !layers.emergency[key],
      },
    });
  };

  const toggleInfra = (key: keyof DisasterMapLayersState['infrastructure']) => {
    onChange({
      ...layers,
      infrastructure: {
        ...layers.infrastructure,
        [key]: !layers.infrastructure[key],
      },
    });
  };

  const toggleSensors = (key: keyof DisasterMapLayersState['sensors']) => {
    onChange({
      ...layers,
      sensors: {
        ...layers.sensors,
        [key]: !layers.sensors[key],
      },
    });
  };

  const toggleEvacuation = (key: keyof DisasterMapLayersState['evacuation']) => {
    onChange({
      ...layers,
      evacuation: {
        ...layers.evacuation,
        [key]: !layers.evacuation[key],
      },
    });
  };

  const toggleVulnerability = () => {
    onChange({
      ...layers,
      vulnerability: {
        populationZones: !layers.vulnerability.populationZones,
      },
    });
  };

  const setBaseMap = (baseMap: BaseMapStyle) => {
    onChange({
      ...layers,
      baseMap,
    });
  };

  const toggleAccordion = (name: string) => {
    setActiveGroup(activeGroup === name ? null : name);
  };

  // Count active layers
  const activeCount =
    Object.values(layers.hazards).filter(Boolean).length +
    Object.values(layers.weather).filter((v) => typeof v === 'boolean' && v).length +
    Object.values(layers.water).filter(Boolean).length +
    Object.values(layers.emergency).filter(Boolean).length +
    Object.values(layers.infrastructure).filter(Boolean).length +
    Object.values(layers.sensors).filter(Boolean).length +
    Object.values(layers.evacuation).filter(Boolean).length +
    (layers.vulnerability.populationZones ? 1 : 0);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 hover:text-slate-950 shadow-md border border-slate-200 text-xs font-bold transition-all hover:bg-slate-50"
        title="Disaster GIS Multi-Layer Control"
      >
        <Layers className="w-4 h-4 text-orange-600" />
        <span>Layers ({activeCount})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown / Side Drawer Panel */}
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 md:w-96 max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 text-xs font-sans space-y-3 animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-slate-800" />
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Disaster GIS Layer Control
                </h4>
              </div>
              {onReset && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-orange-600 transition-colors"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* BASE MAP STYLES */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Map className="w-3 h-3 text-slate-600" />
                <span>Base Map Style</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['STANDARD', 'SATELLITE', 'TERRAIN'] as BaseMapStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setBaseMap(style)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                      layers.baseMap === style
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* GROUP 1: HAZARDS */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('hazards')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>GROUP 1 — HAZARDS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {Object.values(layers.hazards).filter(Boolean).length}
                  </span>
                  {activeGroup === 'hazards' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {activeGroup === 'hazards' && (
                <div className="p-3 space-y-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Landslide Risk Polygons</span>
                    <input
                      type="checkbox"
                      checked={layers.hazards.landslideRisk}
                      onChange={() => toggleHazard('landslideRisk')}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Active Disaster Incidents</span>
                    <input
                      type="checkbox"
                      checked={layers.hazards.activeIncidents}
                      onChange={() => toggleHazard('activeIncidents')}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Flood Risk Zones</span>
                    <input
                      type="checkbox"
                      checked={layers.hazards.floodRisk}
                      onChange={() => toggleHazard('floodRisk')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Flash Flood Corridors</span>
                    <input
                      type="checkbox"
                      checked={layers.hazards.flashFlood}
                      onChange={() => toggleHazard('flashFlood')}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Fire Hazards</span>
                    <input
                      type="checkbox"
                      checked={layers.hazards.fire}
                      onChange={() => toggleHazard('fire')}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Earthquake Epicenters</span>
                    <input
                      type="checkbox"
                      checked={layers.hazards.earthquake}
                      onChange={() => toggleHazard('earthquake')}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Road Blockages & Debris</span>
                    <input
                      type="checkbox"
                      checked={layers.hazards.roadBlockage}
                      onChange={() => toggleHazard('roadBlockage')}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* GROUP 2: WEATHER */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('weather')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                  <span>GROUP 2 — WEATHER</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {Object.values(layers.weather).filter((v) => typeof v === 'boolean' && v).length}
                  </span>
                  {activeGroup === 'weather' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {activeGroup === 'weather' && (
                <div className="p-3 space-y-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layers.weather.rainfall}
                        onChange={() => toggleWeather('rainfall')}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 font-medium">Live Rainfall (AWS)</span>
                    </label>

                    {/* Timeframe Selector */}
                    {layers.weather.rainfall && (
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-mono font-bold">
                        {(['1h', '3h', '24h'] as const).map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setWeatherTimeframe(tf)}
                            className={`px-1.5 py-0.5 rounded ${
                              layers.weather.timeframe === tf ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Rainfall Forecast Grid</span>
                    <input
                      type="checkbox"
                      checked={layers.weather.rainfallForecast}
                      onChange={() => toggleWeather('rainfallForecast')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">IMD Weather Warnings</span>
                    <input
                      type="checkbox"
                      checked={layers.weather.weatherWarnings}
                      onChange={() => toggleWeather('weatherWarnings')}
                      className="rounded text-yellow-600 focus:ring-yellow-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Wind Vectors & Gusts</span>
                    <input
                      type="checkbox"
                      checked={layers.weather.wind}
                      onChange={() => toggleWeather('wind')}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Surface Temperature</span>
                    <input
                      type="checkbox"
                      checked={layers.weather.temperature}
                      onChange={() => toggleWeather('temperature')}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* GROUP 3: WATER & FLOOD */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('water')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>GROUP 3 — WATER & FLOOD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {Object.values(layers.water).filter(Boolean).length}
                  </span>
                  {activeGroup === 'water' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {activeGroup === 'water' && (
                <div className="p-3 space-y-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Rivers & Streams</span>
                    <input
                      type="checkbox"
                      checked={layers.water.rivers}
                      onChange={() => toggleWater('rivers')}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Dams & Reservoirs</span>
                    <input
                      type="checkbox"
                      checked={layers.water.dams}
                      onChange={() => toggleWater('dams')}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">River Water Levels (CWC)</span>
                    <input
                      type="checkbox"
                      checked={layers.water.riverWaterLevels}
                      onChange={() => toggleWater('riverWaterLevels')}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Flood Inundation Zones</span>
                    <input
                      type="checkbox"
                      checked={layers.water.floodZones}
                      onChange={() => toggleWater('floodZones')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* GROUP 4: EMERGENCY INFRASTRUCTURE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('emergency')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GROUP 4 — EMERGENCY</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {Object.values(layers.emergency).filter(Boolean).length}
                  </span>
                  {activeGroup === 'emergency' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {activeGroup === 'emergency' && (
                <div className="p-3 space-y-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Emergency Shelters</span>
                    <input
                      type="checkbox"
                      checked={layers.emergency.emergencyShelters}
                      onChange={() => toggleEmergency('emergencyShelters')}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Hospitals & Trauma Centers</span>
                    <input
                      type="checkbox"
                      checked={layers.emergency.hospitals}
                      onChange={() => toggleEmergency('hospitals')}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Ambulance Stations (108)</span>
                    <input
                      type="checkbox"
                      checked={layers.emergency.ambulanceStations}
                      onChange={() => toggleEmergency('ambulanceStations')}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Fire & Rescue Stations (101)</span>
                    <input
                      type="checkbox"
                      checked={layers.emergency.fireStations}
                      onChange={() => toggleEmergency('fireStations')}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Police Stations</span>
                    <input
                      type="checkbox"
                      checked={layers.emergency.policeStations}
                      onChange={() => toggleEmergency('policeStations')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Emergency Ops Centers (EOC)</span>
                    <input
                      type="checkbox"
                      checked={layers.emergency.eoc}
                      onChange={() => toggleEmergency('eoc')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* GROUP 5: CRITICAL INFRASTRUCTURE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('infrastructure')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>GROUP 5 — INFRASTRUCTURE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {Object.values(layers.infrastructure).filter(Boolean).length}
                  </span>
                  {activeGroup === 'infrastructure' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {activeGroup === 'infrastructure' && (
                <div className="p-3 space-y-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Roads & Corridors</span>
                    <input
                      type="checkbox"
                      checked={layers.infrastructure.roads}
                      onChange={() => toggleInfra('roads')}
                      className="rounded text-slate-700 focus:ring-slate-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Bridges & Flyovers</span>
                    <input
                      type="checkbox"
                      checked={layers.infrastructure.bridges}
                      onChange={() => toggleInfra('bridges')}
                      className="rounded text-slate-700 focus:ring-slate-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Tunnels & Portals</span>
                    <input
                      type="checkbox"
                      checked={layers.infrastructure.tunnels}
                      onChange={() => toggleInfra('tunnels')}
                      className="rounded text-slate-700 focus:ring-slate-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Railways & Tracks</span>
                    <input
                      type="checkbox"
                      checked={layers.infrastructure.railways}
                      onChange={() => toggleInfra('railways')}
                      className="rounded text-slate-700 focus:ring-slate-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Airports & Helipads</span>
                    <input
                      type="checkbox"
                      checked={layers.infrastructure.airports}
                      onChange={() => toggleInfra('airports')}
                      className="rounded text-slate-700 focus:ring-slate-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Communication Towers</span>
                    <input
                      type="checkbox"
                      checked={layers.infrastructure.communicationTowers}
                      onChange={() => toggleInfra('communicationTowers')}
                      className="rounded text-slate-700 focus:ring-slate-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Power Sub-stations</span>
                    <input
                      type="checkbox"
                      checked={layers.infrastructure.powerInfra}
                      onChange={() => toggleInfra('powerInfra')}
                      className="rounded text-slate-700 focus:ring-slate-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* GROUP 6: SENSOR NETWORK */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('sensors')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-purple-600" />
                  <span>GROUP 6 — SENSORS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {Object.values(layers.sensors).filter(Boolean).length}
                  </span>
                  {activeGroup === 'sensors' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {activeGroup === 'sensors' && (
                <div className="p-3 space-y-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Rainfall Sensors (Tipping Bucket)</span>
                    <input
                      type="checkbox"
                      checked={layers.sensors.rainfallSensors}
                      onChange={() => toggleSensors('rainfallSensors')}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Soil Moisture Sensors (TDR)</span>
                    <input
                      type="checkbox"
                      checked={layers.sensors.soilMoistureSensors}
                      onChange={() => toggleSensors('soilMoistureSensors')}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Slope Inclinometer Nodes</span>
                    <input
                      type="checkbox"
                      checked={layers.sensors.slopeSensors}
                      onChange={() => toggleSensors('slopeSensors')}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">River Ultrasonic Level Nodes</span>
                    <input
                      type="checkbox"
                      checked={layers.sensors.riverSensors}
                      onChange={() => toggleSensors('riverSensors')}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Seismic Broadband Nodes</span>
                    <input
                      type="checkbox"
                      checked={layers.sensors.seismicSensors}
                      onChange={() => toggleSensors('seismicSensors')}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* GROUP 7: EVACUATION & VULNERABILITY */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('evacuation')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GROUP 7 — EVACUATION & VULN</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                    {Object.values(layers.evacuation).filter(Boolean).length + (layers.vulnerability.populationZones ? 1 : 0)}
                  </span>
                  {activeGroup === 'evacuation' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {activeGroup === 'evacuation' && (
                <div className="p-3 space-y-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Safe Evacuation Corridors</span>
                    <input
                      type="checkbox"
                      checked={layers.evacuation.safeEvacuationRoutes}
                      onChange={() => toggleEvacuation('safeEvacuationRoutes')}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Blocked Road Segments</span>
                    <input
                      type="checkbox"
                      checked={layers.evacuation.blockedRoads}
                      onChange={() => toggleEvacuation('blockedRoads')}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-700 font-medium">Alternative Pathways</span>
                    <input
                      type="checkbox"
                      checked={layers.evacuation.alternativeRoutes}
                      onChange={() => toggleEvacuation('alternativeRoutes')}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-100">
                    <span className="text-slate-700 font-medium">Population Vulnerability</span>
                    <input
                      type="checkbox"
                      checked={layers.vulnerability.populationZones}
                      onChange={toggleVulnerability}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
