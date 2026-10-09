import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Radio, CheckCircle, Navigation, Hospital, Home } from 'lucide-react';
import { TrackedPersonDetection, DroneTelemetry } from '../../types/droneRescue';

interface RescueIncidentMapProps {
  detections: TrackedPersonDetection[];
  telemetry: DroneTelemetry | null;
  selectedDetection: TrackedPersonDetection | null;
  onSelectDetection: (detection: TrackedPersonDetection) => void;
  onOpenDispatchModal: (detection: TrackedPersonDetection) => void;
  onVerify: (detectionId: string) => void;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const RescueIncidentMap: React.FC<RescueIncidentMapProps> = ({
  detections,
  telemetry,
  selectedDetection,
  onSelectDetection,
  onOpenDispatchModal,
  onVerify,
}) => {
  // Determine center coordinates
  const safeDetections = Array.isArray(detections) ? detections : [];
  const gpsDetections = safeDetections.filter((d) => d && d.latitude && d.longitude);

  const defaultLat = telemetry?.latitude || (gpsDetections.length > 0 ? gpsDetections[0].latitude! : 16.5448);
  const defaultLng = telemetry?.longitude || (gpsDetections.length > 0 ? gpsDetections[0].longitude! : 81.5212);
  const center: [number, number] = [defaultLat, defaultLng];

  // Custom Leaflet Div Icons
  const createPersonIcon = (priority: string, isSelected: boolean) => {
    const isHighOrCrit = priority === 'CRITICAL' || priority === 'HIGH';
    const isMed = priority === 'MEDIUM';

    const bgClass = isHighOrCrit
      ? 'bg-red-600 ring-4 ring-red-400/50'
      : isMed
      ? 'bg-amber-500 ring-4 ring-amber-300/50'
      : 'bg-emerald-600 ring-4 ring-emerald-300/50';

    const pulseClass = isHighOrCrit ? 'animate-bounce' : '';

    return L.divIcon({
      className: 'custom-person-pin',
      html: `
        <div class="relative flex items-center justify-center ${pulseClass}">
          <div class="w-8 h-8 rounded-full ${bgClass} text-white flex items-center justify-center font-bold text-[11px] shadow-xl border-2 border-white">
            ${isHighOrCrit ? '🚨' : isMed ? '⚠️' : '👤'}
          </div>
          ${
            isSelected
              ? '<div class="absolute -inset-2 rounded-full border-2 border-orange-400 animate-ping"></div>'
              : ''
          }
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const droneIcon = L.divIcon({
    className: 'custom-drone-pin',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-10 h-10 rounded-full bg-slate-900 border-2 border-orange-500 text-white flex items-center justify-center font-bold text-base shadow-2xl">
          🚁
        </div>
        <div class="absolute -inset-1 rounded-full border-2 border-orange-500/60 animate-pulse"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  const shelterIcon = L.divIcon({
    className: 'custom-shelter-pin',
    html: `
      <div class="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
        🏠
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  // Example nearby response facilities based on center
  const nearbyFacilities = [
    {
      name: 'Primary Relief High Ground Shelter',
      type: 'shelter',
      lat: defaultLat + 0.0062,
      lng: defaultLng - 0.0051,
      capacity: '450 Persons',
    },
    {
      name: 'District Hospital & Trauma Center',
      type: 'hospital',
      lat: defaultLat - 0.0055,
      lng: defaultLng + 0.0068,
      capacity: 'Emergency Triage Ready',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-orange-600" />
          <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
            📍 RESCUE INCIDENT MAP & GEO-REFERENCING
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-red-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> 🔴 Critical / High
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 🟠 Medium
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> 🟢 Normal
          </span>
          <span className="flex items-center gap-1 text-slate-700">
            <span>🚁</span> UAV Nadir
          </span>
        </div>
      </div>

      {/* Map Body */}
      <div className="h-[420px] w-full relative">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <MapController center={center} zoom={14} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Drone Location Nadir Marker & Scan Radius */}
          {telemetry?.latitude && telemetry?.longitude && (
            <>
              <Marker
                position={[telemetry.latitude, telemetry.longitude]}
                icon={droneIcon}
              >
                <Popup>
                  <div className="p-1 space-y-1 font-sans text-xs">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                      <span>🚁</span> {telemetry.drone_id} (Active Recon UAV)
                    </div>
                    <p className="text-slate-600">
                      Altitude: {telemetry.altitude_m || 48}m • Heading: 142°
                    </p>
                    <p className="font-mono text-[11px] text-orange-600 font-bold">
                      Scan Sector: {telemetry.active_hazard || 'FLASH FLOOD'}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[telemetry.latitude, telemetry.longitude]}
                radius={450}
                pathOptions={{ color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.08, dashArray: '4, 4' }}
              />
            </>
          )}

          {/* Detected Person Markers */}
          {gpsDetections.map((det) => {
            const isSelected = selectedDetection?.detection_id === det.detection_id;
            return (
              <Marker
                key={det.detection_id}
                position={[det.latitude!, det.longitude!]}
                icon={createPersonIcon(det.priority, isSelected)}
                eventHandlers={{
                  click: () => onSelectDetection(det),
                }}
              >
                <Popup>
                  <div className="p-2 space-y-2 font-sans max-w-xs text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="font-extrabold text-slate-900 text-sm font-mono">
                        {det.person_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          det.priority === 'CRITICAL' || det.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {det.priority}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-700">
                      <p>
                        <strong>Status:</strong> {det.status.replace('_', ' ')}
                      </p>
                      <p>
                        <strong>Distress Score:</strong>{' '}
                        <span className="font-bold text-red-600 font-mono">
                          {(det.distress_score * 100).toFixed(0)}%
                        </span>
                      </p>
                      <p>
                        <strong>AI Confidence:</strong> {(det.confidence * 100).toFixed(0)}%
                      </p>
                      <p>
                        <strong>Detected:</strong> {det.timestamp_str}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">
                        {det.latitude?.toFixed(6)}° N, {det.longitude?.toFixed(6)}° E
                      </p>
                    </div>

                    {det.indicators.length > 0 && (
                      <div className="pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          Indicators:
                        </span>
                        <ul className="text-[11px] text-slate-600 list-disc pl-3">
                          {det.indicators.slice(0, 3).map((ind, idx) => (
                            <li key={idx}>{ind}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-1.5">
                      {det.status === 'AI_DETECTED' || det.status === 'PENDING_VERIFICATION' ? (
                        <button
                          onClick={() => onVerify(det.detection_id)}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] text-center"
                        >
                          Verify
                        </button>
                      ) : null}
                      <button
                        onClick={() => onOpenDispatchModal(det)}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] text-center shadow-sm"
                      >
                        Alert Rescue Team
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Emergency Safe Shelters & Facilities */}
          {nearbyFacilities.map((fac, idx) => (
            <Marker
              key={idx}
              position={[fac.lat, fac.lng]}
              icon={shelterIcon}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="font-bold text-blue-900 block">{fac.name}</span>
                  <span className="text-[11px] text-slate-600">{fac.capacity}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {gpsDetections.length === 0 && (
          <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl backdrop-blur-xs font-mono shadow-xl">
            ℹ️ Video GPS is image-relative (Pixel coords available)
          </div>
        )}
      </div>
    </div>
  );
};
