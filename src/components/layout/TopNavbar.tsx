import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  MapPin,
  Bell,
  ChevronDown,
  User,
  Shield,
  Radio,
  X,
  Loader2,
  CheckCircle2,
  Compass,
  AlertCircle,
  Activity,
  Globe,
  AlertOctagon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MONITORED_STATIONS } from '../../utils/constants';
import { DemoModeToggle } from '../common/DemoModeToggle';
import { SystemStatusIndicator } from '../common/SystemStatus';
import { EmergencySOSModal } from '../common/EmergencySOSModal';
import { LanguageSelector } from '../common/LanguageSelector';
import { useTranslation } from '../../i18n';
import { Link, useNavigate } from 'react-router-dom';
import { geocodingService } from '../../services/geocodingService';
import { SearchedLocation, MonitoringStation } from '../../types/map';
import { HazardType, HAZARD_PROFILES } from '../../types/multiHazard';

interface TopNavbarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileDrawerOpen?: boolean;
  setMobileDrawerOpen?: (open: boolean) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  collapsed,
  setCollapsed,
  mobileDrawerOpen = false,
  setMobileDrawerOpen,
}) => {
  const {
    activeLocation,
    selectedStation,
    selectedHazardType,
    setSelectedHazardType,
    selectGlobalLocation,
    selectTelemetryStation,
    getNearestTelemetryStation,
    clearSearchedLocation,
  } = useApp();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showHazardDropdown, setShowHazardDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  // Global Location Search State
  const [inputQuery, setInputQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchedLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState<boolean>(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Nearest telemetry station calculation if active location is not monitored
  const nearestStn = !activeLocation.isMonitored
    ? getNearestTelemetryStation(activeLocation.lat, activeLocation.lng)
    : null;

  // Debounced geocoding search
  useEffect(() => {
    const trimmed = inputQuery.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    // If query matches currently active location name, don't re-trigger search
    if (activeLocation && activeLocation.name.toLowerCase() === trimmed.toLowerCase()) {
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await geocodingService.searchLocations(trimmed);
        setSuggestions(results);
        setShowSuggestionsDropdown(true);
        if (results.length === 0) {
          setSearchError(`No locations found for "${trimmed}"`);
        }
      } catch (err) {
        setSearchError('Location search temporarily unavailable');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputQuery, activeLocation]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestionsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (loc: SearchedLocation) => {
    selectGlobalLocation(loc);
    setInputQuery(loc.name);
    setShowSuggestionsDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const handleClear = () => {
    setInputQuery('');
    setSuggestions([]);
    setShowSuggestionsDropdown(false);
    clearSearchedLocation();
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-2xs w-full max-w-full min-w-0">
      {/* Left: Sidebar Toggle, Active Geographic Location Indicator & Global Place Search */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 max-w-3xl min-w-0">
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileDrawerOpen?.(!mobileDrawerOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          title="Toggle Navigation Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* ACTIVE GEOGRAPHIC LOCATION INDICATOR & TELEMETRY STATION SELECTOR */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowStationDropdown(!showStationDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              activeLocation.isMonitored
                ? 'border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-950'
                : 'border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-950'
            }`}
            title="Active Geographic Location / Switch Telemetry Station"
          >
            <MapPin className={`w-3.5 h-3.5 ${activeLocation.isMonitored ? 'text-orange-600' : 'text-blue-600'}`} />
            <span className="truncate max-w-[170px] font-bold">
              {activeLocation.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showStationDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowStationDropdown(false)}
              />
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
                {/* Active Geographic Location Header */}
                <div className="px-3.5 pb-2 mb-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Active Geographic Location
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${activeLocation.isMonitored ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {activeLocation.isMonitored ? <Radio className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{activeLocation.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{activeLocation.displayName}</p>
                    </div>
                  </div>
                  {!activeLocation.isMonitored && nearestStn && (
                    <div className="mt-2 p-1.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-mono">
                      <span>Nearest Telemetry: <strong>{nearestStn.station.name}</strong> ({nearestStn.distance_km} km away)</span>
                    </div>
                  )}
                </div>

                {/* Telemetry Stations Section */}
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Switch Telemetry Station</span>
                  <span className="font-mono text-emerald-600">IoT Grid</span>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {MONITORED_STATIONS.map((stn) => {
                    const isStationActive = activeLocation.isMonitored && activeLocation.name === stn.name;
                    return (
                      <button
                        key={stn.id}
                        onClick={() => {
                          selectTelemetryStation(stn);
                          setInputQuery('');
                          setShowStationDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors ${
                          isStationActive
                            ? 'bg-orange-50 text-orange-950 font-bold border-l-3 border-orange-600'
                            : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs">{stn.name}</p>
                          <p className="text-[10px] text-slate-400">{stn.region}, {stn.state}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            stn.riskLevel === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : stn.riskLevel === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {stn.riskScore}/100
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* MULTI-HAZARD MODE SELECTOR PILL */}
        <div className="relative hidden xl:block">
          <button
            onClick={() => setShowHazardDropdown(!showHazardDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            title="Switch Disaster Hazard Assessment Mode"
          >
            <span>{HAZARD_PROFILES[selectedHazardType]?.emoji || '🌐'}</span>
            <span className="truncate max-w-[130px]">
              {HAZARD_PROFILES[selectedHazardType]?.shortName || 'All Hazards'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showHazardDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowHazardDropdown(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Disaster Hazard Vectors
                  </span>
                  <span className="text-[10px] font-mono text-orange-600 font-bold">Multi-Hazard</span>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {(Object.keys(HAZARD_PROFILES) as HazardType[]).map((hzKey) => {
                    const profile = HAZARD_PROFILES[hzKey];
                    const isCurrent = selectedHazardType === hzKey;
                    return (
                      <button
                        key={hzKey}
                        onClick={() => {
                          setSelectedHazardType(hzKey);
                          setShowHazardDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors ${
                          isCurrent ? 'bg-orange-50/70 font-bold text-orange-950' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{profile.emoji}</span>
                          <div className="min-w-0">
                            <p className="text-xs truncate">{profile.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{profile.thresholdUnit}</p>
                          </div>
                        </div>
                        {isCurrent && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Global Geocoding Search Bar (Macherla, Manali, Chennai, Hyderabad, etc.) */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search any city, town, village (e.g. Macherla, Manali)..."
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                setShowSuggestionsDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0 || searchError) {
                  setShowSuggestionsDropdown(true);
                }
              }}
              className="w-full pl-9 pr-9 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400"
            />

            {/* Clear button or Spinner */}
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-orange-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            ) : inputQuery.length > 0 ? (
              <button
                onClick={handleClear}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestionsDropdown && (inputQuery.trim().length >= 2 || suggestions.length > 0 || isSearching) && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
              {isSearching && (
                <div className="px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                  <span>Searching geographic locations...</span>
                </div>
              )}

              {!isSearching && suggestions.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>Geographic Places (Click or Press Enter)</span>
                    <span className="font-mono">OpenStreetMap & GIS</span>
                  </div>

                  {suggestions.map((loc, idx) => (
                    <button
                      key={loc.placeId || idx}
                      onClick={() => handleSelectSuggestion(loc)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-start justify-between gap-2.5 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          loc.isMonitored ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {loc.name}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {loc.displayName || loc.address}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {loc.isMonitored ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            Telemetry Station ({loc.monitoredStation?.riskScore}/100)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            Geographic Place
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && suggestions.length === 0 && searchError && (
                <div className="px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0 justify-end">
        {/* Multilingual Selector */}
        <LanguageSelector />

        {/* Emergency SOS Quick Trigger */}
        <button
          onClick={() => setShowSosModal(true)}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/30 ring-2 ring-red-400/50 animate-pulse transition-all cursor-pointer"
          title={t('sos.title', 'Trigger Emergency Distress SOS')}
        >
          <AlertOctagon className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">{t('sos.trigger', 'EMERGENCY SOS')}</span>
          <span className="sm:hidden">SOS</span>
        </button>

        {/* Demo Mode Toggle */}
        <DemoModeToggle />

        {/* System Status */}
        <div className="hidden lg:block">
          <SystemStatusIndicator variant="badge" />
        </div>

        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title={t('app.notifications', 'Emergency Alerts')}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900">{t('app.activeWarningFeeds', 'Active Warning Feeds')}</span>
                  </div>
                  <Link
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
                  >
                    {t('app.viewAll', 'View All')}
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-red-600 uppercase">{t('severity.CRITICAL_ALERT', 'CRITICAL WARNING')}</span>
                      <span className="text-slate-400">12m ago</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Chooralmala Sector (Wayanad)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      Rainfall 148mm/24h exceeded saturation threshold. Immediate evacuation recommended.
                    </p>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-orange-600 uppercase">{t('severity.WARNING', 'HIGH RISK ADVISORY')}</span>
                      <span className="text-slate-400">45m ago</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Munnar Tea Estate Zone A
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      Continuous rainfall leading to toe erosion along riverbank.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs border border-orange-200">
            <Shield className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-none">{t('app.ndmaOperations', 'NDMA Operations')}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{t('app.controlCenter', 'Control Center 01')}</p>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
      />
    </header>
  );
};
