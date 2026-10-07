import React, { useState } from 'react';
import { Radio, X, Wifi, ShieldAlert, Navigation, Activity, CheckCircle } from 'lucide-react';
import { DroneTelemetry } from '../../types/droneRescue';

interface LiveDroneFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: DroneTelemetry | null;
  onConnect: (params: {
    streamUrl: string;
    droneId: string;
    hazardContext: string;
    locationName: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
  }) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export const LiveDroneFeedModal: React.FC<LiveDroneFeedModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onConnect,
  onDisconnect,
}) => {
  const [streamUrl, setStreamUrl] = useState(
    telemetry?.stream_url || 'rtsp://drone01.ops.ndma.gov.in:8554/live/thermal_rgb'
  );
  const [droneId, setDroneId] = useState(telemetry?.drone_id || 'DRONE-01');
  const [hazardContext, setHazardContext] = useState(telemetry?.active_hazard || 'FLASH FLOOD');
  const [locationName, setLocationName] = useState('Bhimavaram Canal Sector');
  const [latitude, setLatitude] = useState('16.5448');
  const [longitude, setLongitude] = useState('81.5212');
  const [altitude, setAltitude] = useState('48');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isConnected = !!telemetry?.connected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) {
      setErrorMsg('Please enter an RTSP, WebRTC, or HLS stream URL');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    try {
      await onConnect({
        streamUrl: streamUrl.trim(),
        droneId,
        hazardContext,
        locationName,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        altitude: altitude ? parseFloat(altitude) : 45.0,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect stream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-orange-950 text-orange-400 border border-orange-800'}`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight">
                Live Drone Stream Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Connect RTSP / WebRTC / HLS UAV reconnaissance feed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Connection Status Card */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                }`}
              />
              <span className="text-xs font-mono font-bold text-slate-300">
                STATUS: {isConnected ? '● CONNECTED' : '○ NOT CONNECTED'}
              </span>
            </div>
            {isConnected && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                UAV ONLINE
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              RTSP / WebRTC / HLS Stream Endpoint *
            </label>
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="rtsp://192.168.1.100:8554/live or https://domain/stream.m3u8"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-hidden focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Drone Unit ID
              </label>
              <input
                type="text"
                value={droneId}
                onChange={(e) => setDroneId(e.target.value)}
                placeholder="DRONE-01"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Active Hazard
              </label>
              <select
                value={hazardContext}
                onChange={(e) => setHazardContext(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-orange-500"
              >
                <option value="FLASH FLOOD">🌊 Flash Flood / Inundation</option>
                <option value="LANDSLIDE">🏔️ Landslide / Debris Flow</option>
                <option value="CYCLONE">🌪️ Cyclone / Storm Surge</option>
                <option value="EARTHQUAKE">⚡ Earthquake / Collapse</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Latitude (GPS)
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="16.5448"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Longitude (GPS)
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="81.5212"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Altitude (m)
              </label>
              <input
                type="text"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="45"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Coordinates and altitude georeference camera detections to real-world GIS coordinates. If left empty, location will be marked as image-relative without fabricating coordinates.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-red-800 text-red-400 hover:bg-red-950/60 text-xs font-bold transition-all"
              >
                Disconnect Stream
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-900/30 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <span>Connecting...</span>
              ) : (
                <>
                  <Wifi className="w-4 h-4" /> Connect Live Feed
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
