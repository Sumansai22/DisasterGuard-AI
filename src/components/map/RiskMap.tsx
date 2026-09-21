import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { MonitoringStation, RiskZonePolygon, SearchedLocation } from '../../types/map';
import { SafeZone } from '../../types/evacuation';
import { LocationPopup } from './LocationPopup';
import { SearchedLocationPopup } from './SearchedLocationPopup';
import { MapLegend } from './MapLegend';
import { getRiskColor } from '../../utils/riskLevel';
import { Layers, Maximize2, Shield, Eye, EyeOff } from 'lucide-react';
import { MONITORED_STATIONS, RISK_ZONES, SAFE_ZONES } from '../../utils/constants';
import { useApp } from '../../context/AppContext';

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

// Create custom colored DivIcon for Stations
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

// Neutral Blue/Slate Icon for Non-Monitored Searched Locations
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

// Safe Zone Icon
const safeZoneIcon = L.divIcon({
  className: 'custom-safe-pin',
  html: `
    <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #059669; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

interface RiskMapProps {
  stations?: MonitoringStation[];
  riskZones?: RiskZonePolygon[];
  safeZones?: SafeZone[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedStationId?: string;
  onStationSelect?: (station: MonitoringStation) => void;
  showLegend?: boolean;
  showControls?: boolean;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  stations = MONITORED_STATIONS,
  riskZones = RISK_ZONES,
  safeZones = SAFE_ZONES,
  center,
  zoom,
  height = '540px',
  selectedStationId,
  onStationSelect,
  showLegend = true,
  showControls = true,
}) => {
  const { mapCenter, mapZoom, searchedLocation } = useApp();
  const activeCenter = center || mapCenter;
  const activeZoom = zoom || mapZoom;

  const [showZonesLayer, setShowZonesLayer] = useState(true);
  const [showStationsLayer, setShowStationsLayer] = useState(true);
  const [showSafeZonesLayer, setShowSafeZonesLayer] = useState(true);
  const [layerDropdownOpen, setLayerDropdownOpen] = useState(false);

  // Demo road line & river path vectors for Wayanad region
  const demoRoad: [number, number][] = [
    [11.515, 76.120],
    [11.530, 76.128],
    [11.5362, 76.1308],
    [11.545, 76.140],
    [11.565, 76.155],
  ];

  const demoRiver: [number, number][] = [
    [11.510, 76.115],
    [11.528, 76.125],
    [11.534, 76.129],
    [11.552, 76.138],
    [11.570, 76.160],
  ];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100" style={{ height }}>
      {/* Map Container */}
      <MapContainer
        center={activeCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ChangeMapView center={activeCenter} zoom={activeZoom} />

        {/* Base Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Roads & Rivers Overlays */}
        <Polyline
          positions={demoRoad}
          pathOptions={{ color: '#475569', weight: 3, dashArray: '4, 4' }}
        />
        <Polyline
          positions={demoRiver}
          pathOptions={{ color: '#38bdf8', weight: 2.5, opacity: 0.8 }}
        />

        {/* Risk Zone Polygons */}
        {showZonesLayer &&
          riskZones.map((zone) => {
            const color = getRiskColor(zone.riskLevel);
            return (
              <Polygon
                key={zone.id}
                positions={zone.polygon}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.35,
                  weight: 2,
                  dashArray: zone.riskLevel === 'CRITICAL' ? '2, 4' : undefined,
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 text-xs font-sans">
                    <div className="font-bold text-slate-900 mb-1">{zone.name}</div>
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

        {/* Safe Zones Markers */}
        {showSafeZonesLayer &&
          safeZones.map((sz) => (
            <Marker
              key={sz.id}
              position={[sz.location.lat, sz.location.lng]}
              icon={safeZoneIcon}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-xs font-sans">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>SAFE RELIEF ZONE</span>
                  </div>
                  <div className="font-bold text-slate-900">{sz.name}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Capacity: <strong>{sz.capacityOccupied} / {sz.capacityTotal}</strong>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                    ✓ Verified High Elevation Safety
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Monitoring Stations Markers */}
        {showStationsLayer &&
          stations.map((stn) => (
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

        {/* Neutral Marker for Searched Non-Monitored Location */}
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
      </MapContainer>

      {/* Floating Controls Bar */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          {/* Layer Selector */}
          <div className="relative">
            <button
              onClick={() => setLayerDropdownOpen(!layerDropdownOpen)}
              className="p-2.5 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 hover:text-slate-900 shadow-md border border-slate-200 transition-colors"
              title="Toggle Map Layers"
            >
              <Layers className="w-4 h-4" />
            </button>

            {layerDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLayerDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2 animate-in fade-in duration-150 font-sans">
                  <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider pb-1.5 border-b border-slate-100">
                    Map Layers
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showZonesLayer}
                      onChange={(e) => setShowZonesLayer(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>Risk Zone Polygons</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showStationsLayer}
                      onChange={(e) => setShowStationsLayer(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>Monitoring Stations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showSafeZonesLayer}
                      onChange={(e) => setShowSafeZonesLayer(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Safe Relief Zones</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Recenter / Focus Button */}
          <button
            onClick={() => {
              // Recenter to active station or searched location
              if (searchedLocation) {
                // Keep searched location
              }
            }}
            className="p-2.5 rounded-xl bg-white/95 backdrop-blur-xs text-slate-700 hover:text-slate-900 shadow-md border border-slate-200 transition-colors"
            title="Map Views"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 z-[1000] max-w-xs hidden sm:block">
          <MapLegend />
        </div>
      )}
    </div>
  );
};
