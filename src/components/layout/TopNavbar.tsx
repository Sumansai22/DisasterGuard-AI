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
      {/* Primary Navigation Row */}
      <div className="h-14 sm:h-16 px-2 sm:px-3 md:px-4 lg:px-6 flex items-center justify-between gap-1.5 sm:gap-2 md:gap-3 w-full min-w-0 box-border">
        {/* ========================================================================= */}
        {/* LEFT SECTION: Hamburger, Brand (mobile), Location & Hazard Controls       */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 min-w-0 flex-1">
          {/* Hamburger Sidebar Trigger */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileDrawerOpen?.(!mobileDrawerOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            title="Toggle Navigation Sidebar"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Name */}
          <div className="flex items-center gap-1.5 md:hidden min-w-0 truncate">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-xs text-slate-900 tracking-tight truncate hidden xs:inline">
              DisasterGuard
            </span>
          </div>

          {/* ACTIVE GEOGRAPHIC LOCATION INDICATOR & TELEMETRY STATION SELECTOR (Desktop/Tablet) */}
          <div className="relative hidden sm:block shrink-0">
            <button
              onClick={() => {
                setShowStationDropdown(!showStationDropdown);
                setShowHazardDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                activeLocation.isMonitored
                  ? 'border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-950'
                  : 'border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-950'
              }`}
              title={`Active Geographic Location: ${activeLocation.name} (Click to Switch Station)`}
              aria-label="Active Geographic Location"
            >
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${activeLocation.isMonitored ? 'text-orange-600' : 'text-blue-600'}`} />
              <span className="truncate max-w-[90px] lg:max-w-[130px] xl:max-w-[170px] font-bold">
                {activeLocation.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

          {/* MULTI-HAZARD MODE SELECTOR PILL (Desktop/Laptop) */}
          <div className="relative hidden 2xl:block shrink-0">
            <button
              onClick={() => {
                setShowHazardDropdown(!showHazardDropdown);
                setShowStationDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs"
              title={`Active Hazard Assessment Mode: ${HAZARD_PROFILES[selectedHazardType]?.name || 'All Hazards'}`}
              aria-label="Multi-Hazard Assessment Mode"
            >
              <span className="shrink-0">{HAZARD_PROFILES[selectedHazardType]?.emoji || '🌐'}</span>
              <span className="truncate max-w-[80px] xl:max-w-[115px]">
                {HAZARD_PROFILES[selectedHazardType]?.shortName || 'All Hazards'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

          {/* Global Geocoding Search Bar (Collapsible on narrow screens) */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[140px] max-w-[200px] xl:max-w-[260px] hidden md:block">
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
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium placeholder:text-slate-400 truncate"
              />

              {/* Clear button or Spinner */}
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-orange-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
              ) : inputQuery.length > 0 ? (
                <button
                  onClick={handleClear}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 absolute right-2 top-1/2 -translate-y-1/2 transition-colors"
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
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-start justify-between gap-2 transition-colors border-b border-slate-100 last:border-0"
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
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SECTION: Language, SOS, Live API, System Status, Alerts, NDMA       */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
          {/* 1. Emergency SOS High-Priority Trigger (Always Visible) */}
          <button
            onClick={() => setShowSosModal(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-md shadow-red-600/30 ring-2 ring-red-400/50 animate-pulse transition-all cursor-pointer shrink-0"
            title={t('sos.title', 'Trigger Emergency Distress SOS')}
            aria-label="Emergency SOS Distress Signal"
          >
            <AlertOctagon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span className="hidden xl:inline whitespace-nowrap">{t('sos.trigger', 'EMERGENCY SOS')}</span>
            <span className="xl:hidden whitespace-nowrap">SOS</span>
          </button>

          {/* 2. Interactive Hackathon Demo Mode Walkthrough Trigger */}
          <div className="hidden sm:inline-flex shrink-0">
            <DemoTourButton variant="navbar" />
          </div>

          {/* 3. Inline Utilities (Desktop xl and 2xl) */}
          <div className="hidden xl:flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Multilingual Selector */}
            <LanguageSelector />

            {/* Demo Mode / Live API Toggle (Visible on 2xl) */}
            <div className="hidden 2xl:block shrink-0">
              <DemoModeToggle />
            </div>

            {/* System Status (Visible on 2xl) */}
            <div className="hidden 2xl:block shrink-0">
              <SystemStatusIndicator variant="badge" />
            </div>

            {/* NDMA Operations Badge -> Link to Mission Control */}
            <Link
              to="/mission-control"
              className="hidden lg:flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-200 shrink-0 hover:opacity-85 transition-opacity"
              title="Open NDMA Operations — Disaster Management Mission Control Center"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs border border-orange-200 shrink-0 shadow-2xs">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="hidden 2xl:block text-left min-w-0">
                <p className="text-xs font-bold text-slate-800 leading-none truncate">{t('app.ndmaOperations', 'NDMA Operations')}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{t('app.controlCenter', 'Mission Control')}</p>
              </div>
            </Link>
          </div>

          {/* 4. Compact Overflow Menu for Platform Tools (Visible on screens < 2xl) */}
          <div className="relative 2xl:hidden shrink-0">
            <button
              onClick={() => {
                setShowUtilityMenu(!showUtilityMenu);
                setShowNotifications(false);
                setShowStationDropdown(false);
                setShowHazardDropdown(false);
              }}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showUtilityMenu
                  ? 'bg-slate-200 border-slate-300 text-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
              }`}
              title="Platform Utilities: Language, Telemetry Mode, System Health & Mission Control"
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
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Language Selector (inside tools when < xl) */}
                  <div className="xl:hidden space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Language</span>
                    <LanguageSelector className="w-full" />
                  </div>

                  {/* Demo Mode Toggle */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Data Feed Mode</span>
                    <div>
                      <DemoModeToggle />
                    </div>
                  </div>

                  {/* Telemetry Status */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Telemetry Health</span>
                    <div>
                      <SystemStatusIndicator variant="badge" />
                    </div>
                  </div>

                  {/* Mission Control Link */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      to="/mission-control"
                      onClick={() => setShowUtilityMenu(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 font-bold text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-600" />
                        <span>NDMA Mission Control Center</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 5. Notifications Icon with Dropdown (Always Visible) */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowStationDropdown(false);
                setShowHazardDropdown(false);
                setShowUtilityMenu(false);
              }}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title={t('app.notifications', 'Emergency Alerts')}
              aria-label="Emergency Alerts Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
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

          {/* 6. Persona / RBAC Switcher for Judges (Always Visible) */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-colors shrink-0"
            title={`Active Persona: ${currentUser.name} (${currentUser.role}) — Click to switch RBAC Persona`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{currentUser.role}</span>
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
