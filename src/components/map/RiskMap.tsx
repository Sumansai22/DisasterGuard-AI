import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  MonitoringStation,
  RiskZonePolygon,
  SearchedLocation,
  DisasterIncident,
  RainfallStationTelemetry,
  WaterBodyTelemetry,
  EmergencyInfrastructureItem,
  CriticalInfrastructureItem,
  SensorNodeItem,
  PopulationVulnerabilityItem,
  DisasterMapLayersState,
  DEFAULT_MAP_LAYERS,
} from '../../types/map';
import { SafeZone } from '../../types/evacuation';
import { LocationPopup } from './LocationPopup';
import { SearchedLocationPopup } from './SearchedLocationPopup';
import { IncidentPopup } from './IncidentPopup';
import { WaterTelemetryPopup } from './WaterTelemetryPopup';
import { RainfallStationPopup } from './RainfallStationPopup';
import { EmergencyInfraPopup } from './EmergencyInfraPopup';
import { CriticalInfraPopup, SensorNodePopup } from './CriticalInfraPopup';
import { DynamicDisasterLegend } from './DynamicDisasterLegend';
import { DisasterLayerControl } from './DisasterLayerControl';
import { getRiskColor } from '../../utils/riskLevel';
import { Maximize2, Shield, AlertTriangle, Info, Navigation } from 'lucide-react';
import { MONITORED_STATIONS, RISK_ZONES, SAFE_ZONES } from '../../utils/constants';
import { useApp } from '../../context/AppContext';
import { damageAssessmentService } from '../../services/damageAssessmentService';
import { DamageAssessmentRecord } from '../../types/damageAssessment';

// Recenter map when center/zoom changes
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.8,
    });
  }, [center, zoom, map]);
  return null;
}

// ----------------------------------------------------------------------
// CUSTOM LEAFLET DIV ICONS
// ----------------------------------------------------------------------

// 1. Monitoring Station Icon
const createStationIcon = (riskScore: number, riskLevel: string) => {
  const color = getRiskColor(riskLevel as any);
  const isCritical = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  return L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        ${
          isCritical
            ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: ${color}; opacity: 0.35;" class="pulse-marker"></div>`
            : ''
        }
        <div style="width: 22px; height: 22px; border-radius: 9999px; background-color: ${color}; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 10px; font-family: monospace;">
          ${riskScore}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// 2. Disaster Incident Icon
const createIncidentIcon = (type: string, severity: string, status: string) => {
  let iconChar = '⚠️';
  let bgColor = '#ef4444';

  if (type === 'LANDSLIDE') {
    iconChar = '⛰️';
    bgColor = '#dc2626';
  } else if (type === 'FLOOD' || type === 'FLASH_FLOOD') {
    iconChar = '🌊';
    bgColor = '#0284c7';
  } else if (type === 'FIRE') {
    iconChar = '🔥';
    bgColor = '#ea580c';
  } else if (type === 'EARTHQUAKE') {
    iconChar = '⚡';
    bgColor = '#d97706';
  } else if (type === 'ROAD_BLOCKAGE') {
    iconChar = '🚫';
    bgColor = '#e11d48';
  } else if (type === 'STRUCTURAL_DAMAGE') {
    iconChar = '🏚️';
    bgColor = '#b91c1c';
  }

  const isPulse = severity === 'CRITICAL' || status === 'ACTIVE';

  return L.divIcon({
    className: 'custom-incident-pin',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        ${isPulse ? `<div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background-color: ${bgColor}; opacity: 0.35;" class="pulse-marker"></div>` : ''}
        <div style="width: 26px; height: 26px; border-radius: 8px; background-color: ${bgColor}; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 13px;">
          ${iconChar}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// 3. Rainfall Station Icon
const createRainfallIcon = (rain24h: number) => {
  return L.divIcon({
    className: 'custom-rain-pin',
    html: `
      <div style="background-color: #2563eb; color: white; border: 2px solid white; border-radius: 6px; padding: 2px 5px; font-weight: 800; font-size: 10px; font-family: monospace; box-shadow: 0 3px 6px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 3px;">
        <span>🌧️</span>
        <span>${rain24h}mm</span>
      </div>
    `,
    iconSize: [58, 22],
    iconAnchor: [29, 11],
    popupAnchor: [0, -11],
  });
};

// 4. Water Body / Dam Icon
const createWaterIcon = (type: string, status: string) => {
  const isCrit = status === 'CRITICAL' || status === 'WARNING';
  const color = isCrit ? '#ef4444' : '#0ea5e9';
  const iconEmoji = type === 'DAM_RESERVOIR' ? '🛡️' : '🌊';

  return L.divIcon({
    className: 'custom-water-pin',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 9999px; background-color: ${color}; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white;">
        ${iconEmoji}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// 5. Emergency Infrastructure Icon
const createEmergencyInfraIcon = (type: string) => {
  let emoji = '🏥';
  let bg = '#dc2626';

  if (type === 'HOSPITAL') {
    emoji = '🏥';
    bg = '#dc2626';
  } else if (type === 'AMBULANCE_STATION') {
    emoji = '🚑';
    bg = '#d97706';
  } else if (type === 'FIRE_STATION') {
    emoji = '🚒';
    bg = '#e11d48';
  } else if (type === 'POLICE_STATION') {
    emoji = '👮';
    bg = '#2563eb';
  } else if (type === 'EMERGENCY_OPERATION_CENTER') {
    emoji = '🏛️';
    bg = '#4f46e5';
  }

  return L.divIcon({
    className: 'custom-emergency-pin',
    html: `
      <div style="width: 26px; height: 26px; border-radius: 6px; background-color: ${bg}; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 13px;">
        ${emoji}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

// 6. Critical Infrastructure Icon
const createCriticalInfraIcon = (type: string, status: string) => {
  let emoji = '🏗️';
  if (type === 'BRIDGES') emoji = '🌉';
  else if (type === 'TUNNELS') emoji = '🚇';
  else if (type === 'AIRPORTS') emoji = '✈️';
  else if (type === 'COMMUNICATION_TOWERS') emoji = '📡';
  else if (type === 'POWER_INFRASTRUCTURE') emoji = '⚡';
  else if (type === 'RAILWAYS') emoji = '🚆';
  else if (type === 'ROADS') emoji = '🛣️';

  const isBlocked = status === 'BLOCKED' || status === 'DAMAGED';
  const borderCol = isBlocked ? '#ef4444' : '#64748b';

  return L.divIcon({
    className: 'custom-infra-pin',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #f8fafc; border: 2px solid ${borderCol}; box-shadow: 0 3px 6px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 12px;">
        ${emoji}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// 7. Sensor Node Icon
const createSensorIcon = (type: string, status: string) => {
  let color = '#10b981'; // online
  if (status === 'WARNING') color = '#f59e0b';
  if (status === 'OFFLINE') color = '#94a3b8';

  return L.divIcon({
    className: 'custom-sensor-pin',
    html: `
      <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: ${color}; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25);"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

// 8. Safe Zone Shelter Icon
const safeZoneIcon = L.divIcon({
  className: 'custom-safe-pin',
  html: `
    <div style="width: 26px; height: 26px; border-radius: 7px; background-color: #059669; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
      🏠
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

// 9. Searched Location Icon
const createSearchedIcon = () => {
  return L.divIcon({
    className: 'custom-searched-pin',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 42px; height: 42px; border-radius: 9999px; background-color: #2563eb; opacity: 0.25;" class="pulse-marker"></div>
        <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #2563eb; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

// 10. PS-53 Damage Assessment Pin Icon
const createDamagePinIcon = (tier: string) => {
  const color = tier === 'P1_URGENT' ? '#dc2626' : tier === 'P2_HIGH' ? '#ea580c' : '#d97706';
  return L.divIcon({
    className: 'custom-damage-assessment-pin',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background-color: ${color}; opacity: 0.35;" class="pulse-marker"></div>
        <div style="width: 26px; height: 26px; border-radius: 8px; background-color: ${color}; border: 2.5px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px;">
          🏢
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// ----------------------------------------------------------------------
// COMPONENT PROPS & MAIN IMPLEMENTATION
// ----------------------------------------------------------------------

interface RiskMapProps {
  stations?: MonitoringStation[];
  riskZones?: RiskZonePolygon[];
  safeZones?: SafeZone[];
  incidents?: DisasterIncident[];
  rainfallStations?: RainfallStationTelemetry[];
  waterBodies?: WaterBodyTelemetry[];
  emergencyInfrastructure?: EmergencyInfrastructureItem[];
  criticalInfrastructure?: CriticalInfrastructureItem[];
  sensors?: SensorNodeItem[];
  vulnerabilityZones?: PopulationVulnerabilityItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedStationId?: string;
  onStationSelect?: (station: MonitoringStation) => void;
  showLegend?: boolean;
  showControls?: boolean;
  activeLayers?: DisasterMapLayersState;
  onLayersChange?: (layers: DisasterMapLayersState) => void;
  activeIncidentCoordinates?: { lat: number; lng: number; label?: string };
}

export const RiskMap: React.FC<RiskMapProps> = ({
  stations = MONITORED_STATIONS,
  riskZones = RISK_ZONES,
  safeZones = SAFE_ZONES,
  incidents = [],
  rainfallStations = [],
  waterBodies = [],
  emergencyInfrastructure = [],
  criticalInfrastructure = [],
  sensors = [],
  vulnerabilityZones = [],
  center,
  zoom,
  height = '620px',
  selectedStationId,
  onStationSelect,
  showLegend = true,
  showControls = true,
  activeLayers,
  onLayersChange,
  activeIncidentCoordinates,
}) => {
  const { mapCenter, mapZoom, searchedLocation } = useApp();
  const [damageAssessments, setDamageAssessments] = useState<DamageAssessmentRecord[]>([]);

  useEffect(() => {
    setDamageAssessments(damageAssessmentService.getAllAssessments());
  }, []);

  const safeStations = Array.isArray(stations) ? stations : MONITORED_STATIONS;
  const safeRiskZones = Array.isArray(riskZones) ? riskZones : RISK_ZONES;
  const safeSafeZones = Array.isArray(safeZones) ? safeZones : SAFE_ZONES;
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const safeRainfallStations = Array.isArray(rainfallStations) ? rainfallStations : [];
  const safeWaterBodies = Array.isArray(waterBodies) ? waterBodies : [];
  const safeEmergencyInfrastructure = Array.isArray(emergencyInfrastructure) ? emergencyInfrastructure : [];
  const safeCriticalInfrastructure = Array.isArray(criticalInfrastructure) ? criticalInfrastructure : [];
  const safeSensors = Array.isArray(sensors) ? sensors : [];
  const safeVulnerabilityZones = Array.isArray(vulnerabilityZones) ? vulnerabilityZones : [];

  const activeCenter = center || mapCenter;
  const activeZoom = zoom || mapZoom;

  const [localLayers, setLocalLayers] = useState<DisasterMapLayersState>(
    activeLayers || DEFAULT_MAP_LAYERS
  );

  useEffect(() => {
    if (activeLayers) {
      setLocalLayers(activeLayers);
    }
  }, [activeLayers]);

  const handleLayersChange = (newLayers: DisasterMapLayersState) => {
    setLocalLayers(newLayers);
    if (onLayersChange) {
      onLayersChange(newLayers);
    }
  };

  // Base Tile Provider
  const getTileUrl = () => {
    switch (localLayers.baseMap) {
      case 'SATELLITE':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'TERRAIN':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'STANDARD':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getTileAttribution = () => {
    switch (localLayers.baseMap) {
      case 'SATELLITE':
        return '&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP';
      case 'TERRAIN':
        return '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (&copy; OSM contributors)';
      case 'STANDARD':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }
  };

  // Evacuation Corridors & Hazard Intersections
  const demoEvacSafeRoute: [number, number][] = [
    [activeCenter[0] - 0.015, activeCenter[1] - 0.02],
    [activeCenter[0] - 0.008, activeCenter[1] - 0.012],
    [activeCenter[0] - 0.002, activeCenter[1] - 0.005],
    [activeCenter[0] + 0.012, activeCenter[1] + 0.018],
    [activeCenter[0] + 0.025, activeCenter[1] + 0.035],
  ];

  const demoEvacBlockedRoute: [number, number][] = [
    [activeCenter[0] + 0.005, activeCenter[1] - 0.015],
    [activeCenter[0] + 0.008, activeCenter[1] - 0.008],
    [activeCenter[0] + 0.012, activeCenter[1] + 0.002],
  ];

  const demoEvacAltRoute: [number, number][] = [
    [activeCenter[0] - 0.015, activeCenter[1] - 0.02],
    [activeCenter[0] - 0.022, activeCenter[1] - 0.005],
    [activeCenter[0] - 0.018, activeCenter[1] + 0.02],
    [activeCenter[0] + 0.025, activeCenter[1] + 0.035],
  ];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900" style={{ height }}>
      {/* Route Hazard Intersection Warning Banner */}
      {localLayers.evacuation.blockedRoads && (
        <div className="absolute top-3 left-3 z-[1000] bg-rose-900/90 text-rose-100 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-700/80 shadow-lg text-xs font-sans flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
          <span className="font-bold">⚠️ ROUTE HAZARD DETECTED:</span>
          <span className="text-[11px] text-rose-200">Slope Instability Corridor Blocked • Rerouting active</span>
        </div>
      )}

      {/* Main Leaflet Map */}
      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ChangeMapView center={activeCenter} zoom={activeZoom} />

        {/* Dynamic Tile Layer */}
        <TileLayer
          key={localLayers.baseMap}
          attribution={getTileAttribution()}
          url={getTileUrl()}
        />

        {/* 1. HAZARDS: Landslide Risk Polygons */}
        {localLayers.hazards.landslideRisk &&
          safeRiskZones.map((zone) => {
            const color = getRiskColor(zone.riskLevel);
            return (
              <Polygon
                key={zone.id}
                positions={zone.polygon}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.35,
                  weight: 2.5,
                  dashArray: zone.riskLevel === 'CRITICAL' ? '4, 4' : undefined,
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 text-xs font-sans">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                        {zone.riskLevel}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">Score: {zone.riskScore}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs mb-1">{zone.name}</div>
                    <div className="text-[11px] text-slate-500 mb-2">
                      Area: {zone.areaSqKm} km² • Risk Level: <strong>{zone.riskLevel}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[11px]">
                      Landslide Probability: {Math.round(zone.landslideProbability * 100)}%
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* 1. HAZARDS: Active Disaster Incidents */}
        {localLayers.hazards.activeIncidents &&
          safeIncidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.latitude, inc.longitude]}
              icon={createIncidentIcon(inc.type, inc.severity, inc.status)}
            >
              <Popup className="custom-leaflet-popup">
                <IncidentPopup incident={inc} />
              </Popup>
            </Marker>
          ))}

        {/* 2. WEATHER: Live Rainfall Stations */}
        {localLayers.weather.rainfall &&
          safeRainfallStations.map((rainStn) => (
            <Marker
              key={rainStn.id}
              position={[rainStn.latitude, rainStn.longitude]}
              icon={createRainfallIcon(rainStn.rainfall_24h_mm)}
            >
              <Popup className="custom-leaflet-popup">
                <RainfallStationPopup station={rainStn} />
              </Popup>
            </Marker>
          ))}

        {/* 3. WATER: Rivers & Reservoirs */}
        {localLayers.water.rivers &&
          safeWaterBodies.map((wb) => (
            <React.Fragment key={wb.id}>
              {wb.poly_line && (
                <Polyline
                  positions={wb.poly_line}
                  pathOptions={{
                    color: wb.sensor_status === 'CRITICAL' ? '#ef4444' : '#0284c7',
                    weight: 3.5,
                    opacity: 0.85,
                  }}
                />
              )}
              <Marker
                position={[wb.latitude, wb.longitude]}
                icon={createWaterIcon(wb.type, wb.sensor_status)}
              >
                <Popup className="custom-leaflet-popup">
                  <WaterTelemetryPopup waterBody={wb} />
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

        {/* 4. EMERGENCY: Safe Relief Shelters */}
        {localLayers.emergency.emergencyShelters &&
          safeSafeZones.map((sz) => (
            <Marker
              key={sz.id}
              position={[sz.location.lat, sz.location.lng]}
              icon={safeZoneIcon}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-xs font-sans">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>EMERGENCY SAFE SHELTER</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{sz.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Capacity: <strong>{sz.capacityOccupied} / {sz.capacityTotal}</strong> (Available: {sz.capacityTotal - sz.capacityOccupied})
                  </div>
                  {sz.facilities && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {sz.facilities.slice(0, 3).map((f) => (
                        <span key={f} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-medium border border-emerald-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {sz.contactNumber && (
                    <div className="text-[10px] text-slate-600 font-mono mt-1.5">
                      Phone: <strong>{sz.contactNumber}</strong>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 4. EMERGENCY: Hospitals, Ambulance, Fire, Police, EOC */}
        {(localLayers.emergency.hospitals ||
          localLayers.emergency.ambulanceStations ||
          localLayers.emergency.fireStations ||
          localLayers.emergency.policeStations ||
          localLayers.emergency.eoc) &&
          safeEmergencyInfrastructure
            .filter((item) => {
              if (item.type === 'HOSPITAL' && localLayers.emergency.hospitals) return true;
              if (item.type === 'AMBULANCE_STATION' && localLayers.emergency.ambulanceStations) return true;
              if (item.type === 'FIRE_STATION' && localLayers.emergency.fireStations) return true;
              if (item.type === 'POLICE_STATION' && localLayers.emergency.policeStations) return true;
              if (item.type === 'EMERGENCY_OPERATION_CENTER' && localLayers.emergency.eoc) return true;
              return false;
            })
            .map((em) => (
              <Marker
                key={em.id}
                position={[em.latitude, em.longitude]}
                icon={createEmergencyInfraIcon(em.type)}
              >
                <Popup className="custom-leaflet-popup">
                  <EmergencyInfraPopup item={em} />
                </Popup>
              </Marker>
            ))}

        {/* 5. INFRASTRUCTURE: Roads, Bridges, Tunnels, Power, Telecom */}
        {Object.values(localLayers.infrastructure).some(Boolean) &&
          safeCriticalInfrastructure
            .filter((item) => {
              if (item.type === 'ROADS' && localLayers.infrastructure.roads) return true;
              if (item.type === 'BRIDGES' && localLayers.infrastructure.bridges) return true;
              if (item.type === 'TUNNELS' && localLayers.infrastructure.tunnels) return true;
              if (item.type === 'RAILWAYS' && localLayers.infrastructure.railways) return true;
              if (item.type === 'AIRPORTS' && localLayers.infrastructure.airports) return true;
              if (item.type === 'COMMUNICATION_TOWERS' && localLayers.infrastructure.communicationTowers) return true;
              if (item.type === 'POWER_INFRASTRUCTURE' && localLayers.infrastructure.powerInfra) return true;
              return false;
            })
            .map((inf) => (
              <Marker
                key={inf.id}
                position={[inf.latitude, inf.longitude]}
                icon={createCriticalInfraIcon(inf.type, inf.status)}
              >
                <Popup className="custom-leaflet-popup">
                  <CriticalInfraPopup item={inf} />
                </Popup>
              </Marker>
            ))}

        {/* 6. SENSORS: Multi-parameter IoT Nodes */}
        {Object.values(localLayers.sensors).some(Boolean) &&
          safeSensors
            .filter((s) => {
              if (s.sensor_type === 'RAIN_GAUGE' && localLayers.sensors.rainfallSensors) return true;
              if (s.sensor_type === 'SOIL_MOISTURE' && localLayers.sensors.soilMoistureSensors) return true;
              if (s.sensor_type === 'SLOPE_SENSOR' && localLayers.sensors.slopeSensors) return true;
              if (s.sensor_type === 'RIVER_LEVEL' && localLayers.sensors.riverSensors) return true;
              if (s.sensor_type === 'SEISMIC' && localLayers.sensors.seismicSensors) return true;
              return false;
            })
            .map((sensor) => (
              <Marker
                key={sensor.id}
                position={[sensor.latitude, sensor.longitude]}
                icon={createSensorIcon(sensor.sensor_type, sensor.status)}
              >
                <Popup className="custom-leaflet-popup">
                  <SensorNodePopup sensor={sensor} />
                </Popup>
              </Marker>
            ))}

        {/* 7. EVACUATION: Recommended Route (Green Solid), Alternative (Blue Solid), Blocked (Red Dashed) */}
        {localLayers.evacuation.safeEvacuationRoutes && (
          <Polyline
            positions={demoEvacSafeRoute}
            pathOptions={{
              color: '#10b981',
              weight: 5.5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
        {localLayers.evacuation.alternativeRoutes && (
          <Polyline
            positions={demoEvacAltRoute}
            pathOptions={{
              color: '#3b82f6',
              weight: 4.5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
        {localLayers.evacuation.blockedRoads && (
          <Polyline
            positions={demoEvacBlockedRoute}
            pathOptions={{
              color: '#ef4444',
              weight: 5,
              opacity: 0.95,
              dashArray: '8, 8',
            }}
          />
        )}

        {/* 8. POPULATION VULNERABILITY ZONES */}
        {localLayers.vulnerability.populationZones &&
          safeVulnerabilityZones.map((vz) => (
            <Circle
              key={vz.id}
              center={[vz.latitude, vz.longitude]}
              radius={600}
              pathOptions={{
                color: '#6366f1',
                fillColor: '#6366f1',
                fillOpacity: 0.25,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-xs font-sans">
                  <div className="text-[10px] font-mono text-indigo-700 font-bold uppercase">
                    👥 Population Vulnerability Area
                  </div>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{vz.name}</div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Est. Population: <strong>{vz.estimated_population}</strong>
                  </div>
                  <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded mt-1 font-mono">
                    {vz.note}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* 9. Core Monitoring Stations */}
        {safeStations.map((stn) => (
          <Marker
            key={stn.id}
            position={[stn.coordinates.lat, stn.coordinates.lng]}
            icon={createStationIcon(stn.riskScore, stn.riskLevel)}
            eventHandlers={{
              click: () => {
                if (onStationSelect) onStationSelect(stn);
              },
            }}
          >
            <Popup className="custom-leaflet-popup">
              <LocationPopup station={stn} onSelect={() => onStationSelect && onStationSelect(stn)} />
            </Popup>
          </Marker>
        ))}

        {/* Searched Location Marker */}
        {searchedLocation && !searchedLocation.isMonitored && (
          <Marker
            position={[searchedLocation.lat, searchedLocation.lng]}
            icon={createSearchedIcon()}
          >
            <Popup className="custom-leaflet-popup" autoPan={true}>
              <SearchedLocationPopup location={searchedLocation} />
            </Popup>
          </Marker>
        )}

        {/* 10. PS-53 DAMAGE PRIORITIZATION ASSESSMENTS */}
        {(Array.isArray(damageAssessments) ? damageAssessments : []).map((asmt) => (
          <Marker
            key={asmt.id}
            position={[asmt.coordinates.lat, asmt.coordinates.lng]}
            icon={createDamagePinIcon(asmt.priorityTier)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-3 text-xs font-sans max-w-xs space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black bg-red-100 text-red-800 border border-red-200">
                    {asmt.priorityTier.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 font-bold">
                    {asmt.estimatedDamageCategory}
                  </span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs leading-snug">
                  {asmt.title}
                </div>
                <div className="text-[11px] text-slate-600">
                  {asmt.locationName} ({asmt.district}, {asmt.state})
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700 italic">
                  "{asmt.priorityRationale}"
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] font-mono">
                  <span>Priority: <strong>{asmt.scores.compositePriorityScore}/100</strong></span>
                  <span className="text-emerald-700 font-bold">{asmt.verificationStatus}</span>
                </div>
                <a
                  href="/damage-assessment"
                  className="block w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-center font-bold rounded-lg text-[11px] shadow-xs"
                >
                  Open in Damage Workspace →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Incident Coordinate Pin */}
        {activeIncidentCoordinates && (
          <Marker
            position={[activeIncidentCoordinates.lat, activeIncidentCoordinates.lng]}
            icon={createDamagePinIcon('P1_URGENT')}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-2.5 text-xs font-sans">
                <div className="font-bold text-slate-900">{activeIncidentCoordinates.label || 'Active Assessment Area'}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {activeIncidentCoordinates.lat.toFixed(4)}°N, {activeIncidentCoordinates.lng.toFixed(4)}°E
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating GIS Layer Controls (Top Right) */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
          <DisasterLayerControl
            layers={localLayers}
            onChange={handleLayersChange}
            onReset={() => handleLayersChange(DEFAULT_MAP_LAYERS)}
          />
        </div>
      )}

      {/* Floating Dynamic Legend (Bottom Left) */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-[1000] max-w-xs hidden sm:block">
          <DynamicDisasterLegend layers={localLayers} />
        </div>
      )}
    </div>
  );
};
