import React, { createContext, useContext, useState, useEffect } from 'react';
import { MonitoringStation, SearchedLocation } from '../types/map';
import { MONITORED_STATIONS, DEFAULT_RISK_THRESHOLDS } from '../utils/constants';
import { RiskThresholdConfig, SystemHealthComponent } from '../types/admin';

interface AppContextType {
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;
  selectedStation: MonitoringStation;
  setSelectedStation: (station: MonitoringStation) => void;
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
  selectSearchedLocation: (loc: SearchedLocation) => void;
  clearSearchedLocation: () => void;
  refreshSystemHealth: () => void;
}

const DEFAULT_COMPONENTS: SystemHealthComponent[] = [
  { name: 'RandomForest Inference Engine', category: 'ML Model', status: 'ONLINE', latencyMs: 24, lastChecked: 'Just now', details: 'landslide_model.pkl loaded' },
  { name: 'FastAPI Telemetry Gateway', category: 'Prediction API', status: 'ONLINE', latencyMs: 18, lastChecked: 'Just now', details: 'Serving /api/predict' },
  { name: 'PostgreSQL Geospatial Store', category: 'Database', status: 'ONLINE', latencyMs: 12, lastChecked: 'Just now', details: 'PostGIS spatial extensions ready' },
  { name: 'IMD Automatic Weather Ingestion', category: 'Weather Data', status: 'ONLINE', latencyMs: 110, lastChecked: '1 min ago', details: 'Real-time precipitation stream sync' },
  { name: 'Leaflet OpenStreetMap Tiles', category: 'Map Service', status: 'ONLINE', latencyMs: 45, lastChecked: 'Just now', details: 'CartoDB / OSM basemap active' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('landslideguard_demo_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [selectedStation, setSelectedStation] = useState<MonitoringStation>(MONITORED_STATIONS[0]);
  const [searchedLocation, setSearchedLocation] = useState<SearchedLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    MONITORED_STATIONS[0].coordinates.lat,
    MONITORED_STATIONS[0].coordinates.lng,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(11);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskThresholds, setRiskThresholds] = useState<RiskThresholdConfig>(DEFAULT_RISK_THRESHOLDS);
  const [systemComponents] = useState<SystemHealthComponent[]>(DEFAULT_COMPONENTS);
  const [isOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    localStorage.setItem('landslideguard_demo_mode', String(isDemoMode));
  }, [isDemoMode]);

  // When station changes, sync map center
  useEffect(() => {
    if (!searchedLocation) {
      setMapCenter([selectedStation.coordinates.lat, selectedStation.coordinates.lng]);
    }
  }, [selectedStation, searchedLocation]);

  const selectSearchedLocation = (loc: SearchedLocation) => {
    setSearchedLocation(loc);
    setMapCenter([loc.lat, loc.lng]);
    setMapZoom(13);

    // If it is an active monitored station, also update the active selectedStation
    if (loc.isMonitored && loc.monitoredStation) {
      setSelectedStation(loc.monitoredStation);
    }
  };

  const clearSearchedLocation = () => {
    setSearchedLocation(null);
    setSearchQuery('');
    setMapCenter([selectedStation.coordinates.lat, selectedStation.coordinates.lng]);
    setMapZoom(11);
  };

  const refreshSystemHealth = () => {
    // Health refresh handler
  };

  return (
    <AppContext.Provider
      value={{
        isDemoMode,
        setIsDemoMode,
        selectedStation,
        setSelectedStation,
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
        selectSearchedLocation,
        clearSearchedLocation,
        refreshSystemHealth,
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
