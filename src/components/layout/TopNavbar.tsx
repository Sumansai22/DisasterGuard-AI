import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  MapPin,
  Bell,
  ChevronDown,
  Shield,
  Radio,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  AlertOctagon,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MONITORED_STATIONS } from '../../utils/constants';
import { DemoModeToggle } from '../common/DemoModeToggle';
import { SystemStatusIndicator } from '../common/SystemStatus';
import { EmergencySOSModal } from '../common/EmergencySOSModal';
import { LanguageSelector } from '../common/LanguageSelector';
import { DemoTourButton } from '../demo/DemoTourButton';
import { useTranslation } from '../../i18n';
import { Link } from 'react-router-dom';
import { geocodingService } from '../../services/geocodingService';
import { SearchedLocation } from '../../types/map';
import { HazardType, HAZARD_PROFILES } from '../../types/multiHazard';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcherModal } from '../common/RoleSwitcherModal';

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
    selectedHazardType,
    setSelectedHazardType,
    selectGlobalLocation,
    selectTelemetryStation,
    getNearestTelemetryStation,
    clearSearchedLocation,
  } = useApp();

  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showHazardDropdown, setShowHazardDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUtilityMenu, setShowUtilityMenu] = useState(false);


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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs w-full max-w-full min-w-0">
      {/* Primary Navigation Row: 4 Clean Semantic Flexbox Groups */}
      <div className="h-14 sm:h-16 px-2.5 sm:px-4 lg:px-6 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4 w-full min-w-0 box-border">

        {/* ========================================================================= */}
        {/* GROUP 1: Menu and Location                                                */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
          {/* Hamburger Sidebar Trigger */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileDrawerOpen?.(!mobileDrawerOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Toggle Navigation Sidebar"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Name */}
          <div className="flex items-center gap-1.5 md:hidden min-w-0 truncate">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-black text-xs text-slate-900 tracking-tight truncate hidden xs:inline">
              DisasterGuard
            </span>
          </div>

          {/* Location Selector (Desktop/Tablet) */}
          <div className="relative hidden sm:block shrink-0">
            <button
              onClick={() => {
                setShowStationDropdown(!showStationDropdown);
                setShowHazardDropdown(false);
                setShowNotifications(false);
                setShowUtilityMenu(false);
              }}
              className={`flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                activeLocation.isMonitored
                  ? 'border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-950'
                  : 'border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-950'
              }`}
              title={`Active Geographic Location: ${activeLocation.name} (Click to Switch Station)`}
              aria-label="Active Geographic Location"
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${activeLocation.isMonitored ? 'text-orange-600' : 'text-blue-600'}`} />
              <span className="truncate max-w-[100px] md:max-w-[140px] lg:max-w-[180px] xl:max-w-[210px]">
                {activeLocation.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showStationDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showStationDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowStationDropdown(false)}
                />
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans max-w-[calc(100vw-2rem)]">
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
                          className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer ${
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
        </div>

        {/* ========================================================================= */}
        {/* GROUP 2: Search and Language                                              */}
        {/* ========================================================================= */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md min-w-0">
          {/* Global Geocoding Search Bar */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[140px]">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder={t('app.searchPlaceholder', 'Search city or town (e.g. Munnar, Manali)...')}
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
                className="w-full h-9 pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400 truncate"
              />

              {/* Clear button or Spinner */}
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-orange-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
              ) : inputQuery.length > 0 ? (
                <button
                  onClick={handleClear}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 absolute right-2 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestionsDropdown && (inputQuery.trim().length >= 2 || suggestions.length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto min-w-[260px]">
                {isSearching && (
                  <div className="px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                    <span>Searching geographic locations...</span>
                  </div>
                )}

                {!isSearching && suggestions.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span>Geographic Places</span>
                      <span className="font-mono text-[9px]">OpenStreetMap & GIS</span>
                    </div>

                    {suggestions.map((loc, idx) => (
                      <button
                        key={loc.placeId || idx}
                        onClick={() => handleSelectSuggestion(loc)}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-start justify-between gap-2 transition-colors border-b border-slate-100 last:border-0 cursor-pointer"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <div className={`p-1 rounded-md shrink-0 mt-0.5 ${
                            loc.isMonitored ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                          }`}>
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {loc.name}
                            </p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">
                              {loc.displayName || loc.address}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {loc.isMonitored ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                              IoT ({loc.monitoredStation?.riskScore})
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              GIS
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

          {/* Language Selector (Always visible on desktop lg+) */}
          <div className="hidden lg:block shrink-0">
            <LanguageSelector />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 3: System Status and Control-Center Branding                        */}
        {/* ========================================================================= */}
        <div className="hidden xl:flex items-center gap-3 shrink-0">
          {/* System Operational Status Dropdown */}
          <SystemStatusIndicator variant="badge" />

          {/* NDMA Operations / Control Center 01 Branding */}
          <Link
            to="/mission-control"
            className="flex items-center gap-2 pl-3 border-l border-slate-200 hover:opacity-85 transition-opacity"
            title="Open NDMA Operations — Disaster Management Mission Control Center"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs border border-orange-200 shrink-0 shadow-2xs">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-none truncate">{t('app.ndmaOperations', 'NDMA Operations')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">{t('app.controlCenter', 'Control Center 01')}</p>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* GROUP 4: Emergency SOS, Notifications, and Admin Profile                  */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
          {/* 1. Emergency SOS Button (Replaces DEMO MODE ACTIVE, Always Visible) */}
          <button
            onClick={() => setShowSosModal(true)}
            className="h-9 px-2.5 sm:px-3 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-md shadow-red-600/30 ring-2 ring-red-400/40 hover:ring-red-400/70 transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            title={t('sos.title', 'Trigger Emergency Distress SOS Signal')}
            aria-label="Emergency SOS Distress Signal"
          >
            <AlertOctagon className="w-4 h-4 text-white shrink-0 animate-pulse" />
            <span className="hidden sm:inline whitespace-nowrap">{t('sos.trigger', 'EMERGENCY SOS')}</span>
            <span className="sm:hidden whitespace-nowrap">SOS</span>
          </button>

          {/* 2. Platform Utilities Overflow Menu (For < xl or mobile) */}
          <div className="relative xl:hidden shrink-0">
            <button
              onClick={() => {
                setShowUtilityMenu(!showUtilityMenu);
                setShowNotifications(false);
                setShowStationDropdown(false);
                setShowHazardDropdown(false);
              }}
              className={`h-9 px-2 sm:px-2.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                showUtilityMenu
                  ? 'bg-slate-200 border-slate-300 text-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
              }`}
              title="Platform Utilities: Language, Telemetry Health, Demo Tools & Mission Control"
              aria-label="Platform Utilities Menu"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="hidden md:inline font-semibold text-xs">Tools</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUtilityMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUtilityMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUtilityMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3 max-w-[calc(100vw-1.5rem)] font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Platform Utilities
                      </span>
                    </div>
                    <button
                      onClick={() => setShowUtilityMenu(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Language Selector (inside tools when < lg) */}
                  <div className="lg:hidden space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Language</span>
                    <LanguageSelector className="w-full" />
                  </div>

                  {/* System Telemetry Status (inside tools when < xl) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Telemetry Health</span>
                    <div>
                      <SystemStatusIndicator variant="badge" />
                    </div>
                  </div>

                  {/* Demo Mode Toggle (Moved out of header to tools) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulation Data Feed</span>
                    <div>
                      <DemoModeToggle />
                    </div>
                  </div>

                  {/* Start Project Demo walkthrough button */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interactive Walkthrough</span>
                    <div>
                      <DemoTourButton variant="compact" className="w-full justify-center" />
                    </div>
                  </div>

                  {/* Mission Control Link (inside tools when < xl) */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      to="/mission-control"
                      onClick={() => setShowUtilityMenu(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 font-bold text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-600" />
                        <span>NDMA Control Center 01</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. Notifications Icon with Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowStationDropdown(false);
                setShowHazardDropdown(false);
                setShowUtilityMenu(false);
              }}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              title={t('app.notifications', 'Emergency Alerts')}
              aria-label="Emergency Alerts Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in duration-150 max-w-[calc(100vw-1.5rem)]">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">{t('app.activeWarningFeeds', 'Active Warning Feeds')}</span>
                    </div>
                    <Link
                      to="/alerts"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 shrink-0"
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

          {/* 4. Admin Profile Dropdown (RBAC Switcher) */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="h-9 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-colors shrink-0 cursor-pointer"
            title={`Active Persona: ${currentUser.name} (${currentUser.role}) — Click to switch RBAC Persona`}
            aria-label="Admin Profile Dropdown"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE COMPACT SUB-BAR (< 768px): Direct Location & Hazard Access         */}
      {/* ========================================================================= */}
      <div className="md:hidden flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-50/95 border-t border-slate-200/80 w-full min-w-0 text-xs">
        {/* Mobile Location Picker Trigger */}
        <button
          onClick={() => {
            setShowStationDropdown(!showStationDropdown);
            setShowHazardDropdown(false);
          }}
          className={`flex-1 flex items-center justify-between gap-1 px-2 py-1 rounded-md border text-[11px] font-bold min-w-0 truncate ${
            activeLocation.isMonitored
              ? 'border-orange-200 bg-orange-50 text-orange-950'
              : 'border-blue-200 bg-blue-50 text-blue-950'
          }`}
          title="Switch Active Location / Telemetry Station"
        >
          <div className="flex items-center gap-1 min-w-0 truncate">
            <MapPin className={`w-3 h-3 shrink-0 ${activeLocation.isMonitored ? 'text-orange-600' : 'text-blue-600'}`} />
            <span className="truncate">{activeLocation.name}</span>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>

        {/* Mobile Hazard Selector Trigger */}
        <button
          onClick={() => {
            setShowHazardDropdown(!showHazardDropdown);
            setShowStationDropdown(false);
          }}
          className="flex-1 flex items-center justify-between gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-800 text-[11px] font-bold min-w-0 truncate"
          title="Switch Hazard Mode"
        >
          <div className="flex items-center gap-1 min-w-0 truncate">
            <span className="shrink-0">{HAZARD_PROFILES[selectedHazardType]?.emoji || '🌐'}</span>
            <span className="truncate">{HAZARD_PROFILES[selectedHazardType]?.shortName || 'All Hazards'}</span>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
      />

      {/* RBAC Persona Switcher Modal for Judges */}
      <RoleSwitcherModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </header>
  );
};
