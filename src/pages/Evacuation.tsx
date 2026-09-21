import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { evacuationService } from '../services/evacuationService';
import { SafeZone, EvacuationRoutePlan } from '../types/evacuation';
import { SafeZoneCard } from '../components/evacuation/SafeZoneCard';
import { RouteDetailsCard } from '../components/evacuation/RouteDetailsCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Navigation,
  MapPin,
  ShieldCheck,
  Sparkles,
  Route,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { SAFE_ZONES } from '../utils/constants';

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export const EvacuationPage: React.FC = () => {
  const { selectedStation } = useApp();
  const [safeZones, setSafeZones] = useState<SafeZone[]>(SAFE_ZONES);
  const [selectedSafeZoneId, setSelectedSafeZoneId] = useState<string>(SAFE_ZONES[0].id);
  const [routePlan, setRoutePlan] = useState<EvacuationRoutePlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function initEvacuation() {
      setIsLoading(true);
      try {
        const zones = await evacuationService.getSafeZones();
        if (mounted) {
          setSafeZones(zones);
          const route = await evacuationService.calculateRoute(
            selectedStation.coordinates.lat,
            selectedStation.coordinates.lng,
            selectedSafeZoneId || zones[0].id
          );
          setRoutePlan(route);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    initEvacuation();
    return () => { mounted = false; };
  }, [selectedStation, selectedSafeZoneId]);

  const originPin = L.divIcon({
    className: 'origin-pin',
    html: `
      <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #ef4444; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
        !
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const destinationPin = L.divIcon({
    className: 'destination-pin',
    html: `
      <div style="width: 28px; height: 28px; border-radius: 8px; background-color: #059669; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
        ✓
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  if (isLoading || !routePlan) {
    return <LoadingSpinner message="Calculating Topographical Lowest-Hazard Evacuation Route..." fullHeight />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Evacuation Route Planning
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Dynamic terrain routing avoiding slope failure zones, saturated gullies, and inundated passes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI Simulation Corridor
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Safe Zone Selector & Route Directions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Available Emergency Safe Zones
            </h4>
            <div className="space-y-2.5">
              {safeZones.map((sz) => (
                <SafeZoneCard
                  key={sz.id}
                  safeZone={sz}
                  isSelected={sz.id === selectedSafeZoneId}
                  onSelect={() => setSelectedSafeZoneId(sz.id)}
                />
              ))}
            </div>
          </div>

          <RouteDetailsCard route={routePlan} />
        </div>

        {/* Right: Map with Route Polyline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Evacuation Route Trajectory
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-red-600 font-bold">Origin: {selectedStation.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-700 font-bold">{routePlan.targetSafeZone.name}</span>
            </div>
          </div>

          <div className="flex-1 min-h-[520px] rounded-xl overflow-hidden border border-slate-200">
            <MapContainer
              center={[selectedStation.coordinates.lat, selectedStation.coordinates.lng]}
              zoom={12}
              scrollWheelZoom={true}
              className="h-full w-full min-h-[520px]"
            >
              <MapRecenter center={[selectedStation.coordinates.lat, selectedStation.coordinates.lng]} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Origin Marker */}
              <Marker
                position={[selectedStation.coordinates.lat, selectedStation.coordinates.lng]}
                icon={originPin}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 text-xs font-sans">
                    <div className="font-bold text-red-600 mb-1">DANGER / ORIGIN ZONE</div>
                    <div className="font-bold text-slate-900">{selectedStation.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Risk Score: {selectedStation.riskScore}/100</div>
                  </div>
                </Popup>
              </Marker>

              {/* Target Safe Zone Marker */}
              <Marker
                position={[routePlan.targetSafeZone.location.lat, routePlan.targetSafeZone.location.lng]}
                icon={destinationPin}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-3 text-xs font-sans">
                    <div className="font-bold text-emerald-700 mb-1">SAFE ZONE DESTINATION</div>
                    <div className="font-bold text-slate-900">{routePlan.targetSafeZone.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{routePlan.targetSafeZone.facilities.join(', ')}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Colored Evacuation Route Polyline */}
              <Polyline
                positions={routePlan.waypoints}
                pathOptions={{
                  color: '#10b981', // Emerald safe color
                  weight: 5,
                  opacity: 0.9,
                }}
              />
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
