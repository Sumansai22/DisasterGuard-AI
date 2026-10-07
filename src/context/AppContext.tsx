import React, { createContext, useContext, useState, useEffect } from 'react';
import { MonitoringStation, SearchedLocation } from '../types/map';
import { HazardType } from '../types/multiHazard';
import { MONITORED_STATIONS, DEFAULT_RISK_THRESHOLDS } from '../utils/constants';
import { RiskThresholdConfig, SystemHealthComponent } from '../types/admin';

export interface ActiveLocationContext {
  name: string;
  displayName: string;
  address?: string;
  lat: number;
  lng: number;
  latitude: number;
  longitude: number;
  placeId?: string | number;
  source: 'geocoding' | 'telemetry_station';
  isMonitored: boolean;
  monitoredStation?: MonitoringStation | null;
  state?: string;
  country?: string;
}

interface AppContextType {
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;
  activeLocation: ActiveLocationContext;
  setActiveLocation: (loc: ActiveLocationContext) => void;
  selectedStation: MonitoringStation | null;
  setSelectedStation: (station: MonitoringStation | null) => void;
  selectedHazardType: HazardType;
  setSelectedHazardType: (type: HazardType) => void;
  searchedLocation: SearchedLocation | null;
  setSearchedLocation: (loc: SearchedLocation | null) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  riskThresholds: RiskThresholdConfig;
  setRiskThresholds: (thresholds: RiskThresholdConfig) => void;
  systemComponents: SystemHealthComponent[];
  isOnline: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectGlobalLocation: (loc: SearchedLocation | ActiveLocationContext) => void;
  selectSearchedLocation: (loc: SearchedLocation) => void;
  selectTelemetryStation: (stn: MonitoringStation) => void;
  clearSearchedLocation: () => void;
  refreshSystemHealth: () => void;
  getNearestTelemetryStation: (lat: number, lng: number) => { station: MonitoringStation; distance_km: number } | null;
}

const DEFAULT_COMPONENTS: SystemHealthComponent[] = [
  { name: 'RandomForest Inference Engine', category: 'ML Model', status: 'ONLINE', latencyMs: 24, lastChecked: 'Just now', details: 'landslide_model.pkl loaded' },
  { name: 'FastAPI Telemetry Gateway', category: 'Prediction API', status: 'ONLINE', latencyMs: 18, lastChecked: 'Just now', details: 'Serving /api/predict' },
  { name: 'PostgreSQL Geospatial Store', category: 'Database', status: 'ONLINE', latencyMs: 12, lastChecked: 'Just now', details: 'PostGIS spatial extensions ready' },
  { name: 'IMD Automatic Weather Ingestion', category: 'Weather Data', status: 'ONLINE', latencyMs: 110, lastChecked: '1 min ago', details: 'Real-time precipitation stream sync' },
  { name: 'Leaflet OpenStreetMap Tiles', category: 'Map Service', status: 'ONLINE', latencyMs: 45, lastChecked: 'Just now', details: 'CartoDB / OSM basemap active' }
];

const INITIAL_DEFAULT_LOCATION: ActiveLocationContext = {
  name: MONITORED_STATIONS[0].name,
  displayName: `${MONITORED_STATIONS[0].name}, ${MONITORED_STATIONS[0].region}, ${MONITORED_STATIONS[0].state}, India`,
  address: `${MONITORED_STATIONS[0].name}, ${MONITORED_STATIONS[0].region}, ${MONITORED_STATIONS[0].state}, India`,
  lat: MONITORED_STATIONS[0].coordinates.lat,
  lng: MONITORED_STATIONS[0].coordinates.lng,
  latitude: MONITORED_STATIONS[0].coordinates.lat,
  longitude: MONITORED_STATIONS[0].coordinates.lng,
  placeId: MONITORED_STATIONS[0].id,
  source: 'telemetry_station',
  isMonitored: true,
  monitoredStation: MONITORED_STATIONS[0],
  state: MONITORED_STATIONS[0].state,
  country: 'India',
};

// Calculate geodesic distance in KM
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('disasterguard_demo_mode') || localStorage.getItem('landslideguard_demo_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [activeLocation, setActiveLocation] = useState<ActiveLocationContext>(INITIAL_DEFAULT_LOCATION);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(MONITORED_STATIONS[0]);
  const [selectedHazardType, setSelectedHazardType] = useState<HazardType>('ALL');
  const [searchedLocation, setSearchedLocation] = useState<SearchedLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    INITIAL_DEFAULT_LOCATION.lat,
    INITIAL_DEFAULT_LOCATION.lng,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskThresholds, setRiskThresholds] = useState<RiskThresholdConfig>(DEFAULT_RISK_THRESHOLDS);
  const [systemComponents] = useState<SystemHealthComponent[]>(DEFAULT_COMPONENTS);
  const [isOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    localStorage.setItem('disasterguard_demo_mode', String(isDemoMode));
  }, [isDemoMode]);

  const getNearestTelemetryStation = (lat: number, lng: number): { station: MonitoringStation; distance_km: number } | null => {
    if (!MONITORED_STATIONS.length) return null;
    let nearest = MONITORED_STATIONS[0];
    let minD = haversineKm(lat, lng, nearest.coordinates.lat, nearest.coordinates.lng);
    for (const stn of MONITORED_STATIONS) {
      const d = haversineKm(lat, lng, stn.coordinates.lat, stn.coordinates.lng);
      if (d < minD) {
        minD = d;
        nearest = stn;
      }
    }
    return { station: nearest, distance_km: minD };
  };

  /**
   * Select an arbitrary global geographic location (e.g. Macherla, Chennai, Manali)
   * Decoupled from predefined telemetry station.
   */
  const selectGlobalLocation = (loc: SearchedLocation | ActiveLocationContext) => {
    const lat = loc.lat ?? loc.latitude;
    const lng = loc.lng ?? loc.longitude;

    const newLoc: ActiveLocationContext = {
      name: loc.name,
      displayName: loc.displayName || loc.address || loc.name,
      address: loc.address || loc.displayName || loc.name,
      lat,
      lng,
      latitude: lat,
      longitude: lng,
      placeId: loc.placeId,
      source: loc.source || 'geocoding',
      isMonitored: Boolean(loc.isMonitored),
      monitoredStation: loc.monitoredStation || null,
      state: loc.state,
      country: loc.country || 'India',
    };

    setActiveLocation(newLoc);
    setSearchedLocation(loc as SearchedLocation);
    setSearchQuery(loc.name);
    setMapCenter([lat, lng]);
    setMapZoom(13);

    // If this place is an actual telemetry station, sync telemetry station; otherwise clear/set null
    if (loc.isMonitored && loc.monitoredStation) {
      setSelectedStation(loc.monitoredStation);
    } else {
      setSelectedStation(null);
    }
  };

  const selectSearchedLocation = (loc: SearchedLocation) => {
    selectGlobalLocation(loc);
  };

  /**
   * Select a specific IoT telemetry sensor station (e.g. Munnar, Meppadi, Shimla)
   */
  const selectTelemetryStation = (stn: MonitoringStation) => {
    setSelectedStation(stn);
    const newLoc: ActiveLocationContext = {
      name: stn.name,
      displayName: `${stn.name}, ${stn.region}, ${stn.state}, India`,
      address: `${stn.name}, ${stn.region}, ${stn.state}, India`,
      lat: stn.coordinates.lat,
      lng: stn.coordinates.lng,
      latitude: stn.coordinates.lat,
      longitude: stn.coordinates.lng,
      placeId: stn.id,
      source: 'telemetry_station',
      isMonitored: true,
      monitoredStation: stn,
      state: stn.state,
      country: 'India',
    };
    setActiveLocation(newLoc);
    setSearchedLocation(null);
    setSearchQuery('');
    setMapCenter([stn.coordinates.lat, stn.coordinates.lng]);
    setMapZoom(12);
  };

  const clearSearchedLocation = () => {
    setSearchedLocation(null);
    setSearchQuery('');
    selectTelemetryStation(MONITORED_STATIONS[0]);
  };

  const refreshSystemHealth = () => {
    // Health refresh handler
  };

  return (
    <AppContext.Provider
      value={{
        isDemoMode,
        setIsDemoMode,
        activeLocation,
        setActiveLocation,
        selectedStation,
        setSelectedStation,
        selectedHazardType,
        setSelectedHazardType,
        searchedLocation,
        setSearchedLocation,
        mapCenter,
        setMapCenter,
        mapZoom,
        setMapZoom,
        searchQuery,
        setSearchQuery,
        riskThresholds,
        setRiskThresholds,
        systemComponents,
        isOnline,
        activeTab,
        setActiveTab,
        selectGlobalLocation,
        selectSearchedLocation,
        selectTelemetryStation,
        clearSearchedLocation,
        refreshSystemHealth,
        getNearestTelemetryStation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
