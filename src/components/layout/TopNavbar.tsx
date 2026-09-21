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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MONITORED_STATIONS } from '../../utils/constants';
import { DemoModeToggle } from '../common/DemoModeToggle';
import { SystemStatusIndicator } from '../common/SystemStatus';
import { Link, useNavigate } from 'react-router-dom';
import { geocodingService } from '../../services/geocodingService';
import { SearchedLocation } from '../../types/map';

interface TopNavbarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ collapsed, setCollapsed }) => {
  const {
    selectedStation,
    setSelectedStation,
    searchedLocation,
    selectSearchedLocation,
    clearSearchedLocation,
  } = useApp();

  const navigate = useNavigate();

  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Location Search State
  const [inputQuery, setInputQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SearchedLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState<boolean>(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync input query if searchedLocation is set
  useEffect(() => {
    if (searchedLocation) {
      setInputQuery(searchedLocation.name);
    }
  }, [searchedLocation]);

  // Debounced geocoding search
  useEffect(() => {
    const trimmed = inputQuery.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    // If query matches currently selected searchedLocation name, don't re-trigger search
    if (searchedLocation && searchedLocation.name.toLowerCase() === trimmed.toLowerCase()) {
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await geocodingService.searchLocations(trimmed, MONITORED_STATIONS);
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
    }, 380);

    return () => clearTimeout(timer);
  }, [inputQuery, searchedLocation]);

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
    selectSearchedLocation(loc);
    setInputQuery(loc.name);
    setShowSuggestionsDropdown(false);
  };

  const handleClear = () => {
    setInputQuery('');
    setSuggestions([]);
    setShowSuggestionsDropdown(false);
    clearSearchedLocation();
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Sidebar Toggle, Monitored Station Selector & Global Geocoding Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-3xl">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Existing Monitored Station Selector Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setShowStationDropdown(!showStationDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
            title="Switch Monitored Telemetry Station"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span className="truncate max-w-[160px]">{selectedStation.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showStationDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowStationDropdown(false)}
              />
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Select Active Telemetry Station
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {MONITORED_STATIONS.map((stn) => (
                    <button
                      key={stn.id}
                      onClick={() => {
                        setSelectedStation(stn);
                        clearSearchedLocation();
                        setShowStationDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                        selectedStation.id === stn.id && !searchedLocation
                          ? 'bg-orange-50 text-orange-900 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{stn.name}</p>
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
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Global Geocoding Search Bar (Macherla, Hyderabad, Manali, Shimla, etc.) */}
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
                    <span>Geographic Search Results</span>
                    <span className="font-mono">OpenStreetMap Nominatim</span>
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
                            {loc.displayName}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {loc.isMonitored ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            Monitored ({loc.monitoredStation?.riskScore}/100)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            Geographic
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
      <div className="flex items-center gap-2.5 md:gap-3">
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
            title="Emergency Alerts (4 Active)"
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
                    <span className="text-xs font-bold text-slate-900">Active Warning Feeds</span>
                  </div>
                  <Link
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-red-600 uppercase">CRITICAL WARNING</span>
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
                      <span className="font-bold text-orange-600 uppercase">HIGH RISK ADVISORY</span>
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
            <p className="text-xs font-bold text-slate-800 leading-none">NDMA Operations</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Control Center 01</p>
          </div>
        </div>
      </div>
    </header>
  );
};
