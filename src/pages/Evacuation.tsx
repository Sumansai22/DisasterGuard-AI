import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { evacuationService } from '../services/evacuationService';
import {
  SafeZone,
  EvacuationRoutePlan,
  HazardZoneInfo,
  TravelMode,
  PlaceSearchResult,
  LocationPointData,
  EvaluatedRoute,
  RouteSafetyStatus,
} from '../types/evacuation';
import { SafeZoneCard } from '../components/evacuation/SafeZoneCard';
import { RouteDetailsCard } from '../components/evacuation/RouteDetailsCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SortOption, SortDirection, sortData } from '../types/sorting';
import { SortingToolbar } from '../components/common/SortingToolbar';
import { useFeedback } from '../context/FeedbackContext';
import {
  Navigation,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Route,
  ArrowRight,
  ArrowUpDown,
  Search,
  RotateCcw,
  Footprints,
  Bike,
  Car,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
  AlertTriangle,
  Layers,
  X,
  ShieldX,
  Activity,
  AlertOctagon,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  Polygon,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

const SHELTER_SORT_OPTIONS: SortOption<SafeZone>[] = [
  {
    key: 'availableCapacity',
    label: 'Available Capacity',
    directionLabels: { desc: 'Most Available', asc: 'Least Available' },
    getValue: (sz: SafeZone) => sz.availableCapacity ?? sz.available_capacity ?? (sz.capacityTotal - sz.capacityOccupied),
    defaultDirection: 'desc',
  },
  {
    key: 'capacityTotal',
    label: 'Total Capacity',
    directionLabels: { desc: 'Largest', asc: 'Smallest' },
    getValue: (sz: SafeZone) => sz.capacityTotal ?? sz.capacity ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'name',
    label: 'Shelter Name',
    directionLabels: { asc: 'A → Z', desc: 'Z → A' },
    getValue: (sz: SafeZone) => sz.name,
    defaultDirection: 'asc',
  },
  {
    key: 'distanceKm',
    label: 'Distance',
    directionLabels: { asc: 'Nearest First', desc: 'Farthest First' },
    getValue: (sz: SafeZone) => sz.distanceKm ?? sz.distance_km ?? 0,
    defaultDirection: 'asc',
  },
];

export const EvacuationPage: React.FC = () => {
  const { activeLocation } = useApp();
  const { showSuccess } = useFeedback();
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [hazardZones, setHazardZones] = useState<HazardZoneInfo[]>([]);
  const [isLoadingShelters, setIsLoadingShelters] = useState<boolean>(false);
  const [shelterSortKey, setShelterSortKey] = useState<string>('availableCapacity');
  const [shelterSortDirection, setShelterSortDirection] = useState<SortDirection>('desc');

  // Sorted safe zones memo
  const sortedSafeZones = useMemo(() => {
    const activeOption = SHELTER_SORT_OPTIONS.find((opt) => opt.key === shelterSortKey) || SHELTER_SORT_OPTIONS[0];
    return sortData(safeZones, activeOption, shelterSortDirection);
  }, [safeZones, shelterSortKey, shelterSortDirection]);

  // FROM & TO Search State
  const [fromQuery, setFromQuery] = useState<string>('');
  const [toQuery, setToQuery] = useState<string>('');
  const [fromLocation, setFromLocation] = useState<LocationPointData | null>(null);
  const [toLocation, setToLocation] = useState<LocationPointData | null>(null);

  // Autocomplete Suggestions
  const [fromSuggestions, setFromSuggestions] = useState<PlaceSearchResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<PlaceSearchResult[]>([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState<boolean>(false);
  const [isSearchingTo, setIsSearchingTo] = useState<boolean>(false);
  const [showFromDropdown, setShowFromDropdown] = useState<boolean>(false);
  const [showToDropdown, setShowToDropdown] = useState<boolean>(false);

  // Mode & Route State
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVE');
  const [routePlan, setRoutePlan] = useState<EvacuationRoutePlan | null>(null);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Load hazard zones on mount
  useEffect(() => {
    let mounted = true;
    evacuationService
      .getHazardZones()
      .then((hazards) => {
        if (mounted && hazards) setHazardZones(hazards);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Whenever FROM location changes, dynamically fetch location-based nearby shelters
  useEffect(() => {
    let mounted = true;
    async function updateSheltersForLocation() {
      if (!fromLocation) {
        setSafeZones([]);
        return;
      }
      setIsLoadingShelters(true);
      try {
        const shelters = await evacuationService.getSafeZones(
          fromLocation.latitude,
          fromLocation.longitude,
          120
        );
        if (mounted) {
          setSafeZones(shelters);
        }
      } catch (err) {
        console.error('Failed to fetch location-based shelters:', err);
      } finally {
        if (mounted) setIsLoadingShelters(false);
      }
    }
    updateSheltersForLocation();
    return () => {
      mounted = false;
    };
  }, [fromLocation]);

  // Synchronize initial FROM location with global activeLocation on mount/change
  useEffect(() => {
    if (!fromLocation) {
      const initialFrom: LocationPointData = {
        name: activeLocation.name,
        latitude: activeLocation.lat,
        longitude: activeLocation.lng,
        formatted_address: activeLocation.displayName || activeLocation.name,
      };
      setFromLocation(initialFrom);
      setFromQuery(activeLocation.name);
    }
  }, [activeLocation]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for FROM suggestions
  useEffect(() => {
    const trimmed = fromQuery.trim();
    if (trimmed.length < 2 || (fromLocation && fromLocation.name === trimmed)) {
      setFromSuggestions([]);
      setIsSearchingFrom(false);
      return;
    }
    setIsSearchingFrom(true);
    const timer = setTimeout(async () => {
      try {
        const results = await evacuationService.searchPlaces(trimmed);
        setFromSuggestions(results);
      } catch (e) {
        setFromSuggestions([]);
      } finally {
        setIsSearchingFrom(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [fromQuery, fromLocation]);

  // Debounced search for TO suggestions
  useEffect(() => {
    const trimmed = toQuery.trim();
    if (trimmed.length < 2 || (toLocation && toLocation.name === trimmed)) {
      setToSuggestions([]);
      setIsSearchingTo(false);
      return;
    }
    setIsSearchingTo(true);
    const timer = setTimeout(async () => {
      try {
        const results = await evacuationService.searchPlaces(trimmed);
        setToSuggestions(results);
      } catch (e) {
        setToSuggestions([]);
      } finally {
        setIsSearchingTo(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [toQuery, toLocation]);

  // Execute Route Calculation
  const executeCalculateRoute = async (
    origin: LocationPointData,
    destination: LocationPointData,
    mode: TravelMode,
    safehouseId?: string
  ) => {
    setIsLoadingRoute(true);
    setErrorMessage(null);
    try {
      const plan = await evacuationService.calculateRoute({
        origin: {
          name: origin.name,
          latitude: origin.latitude,
          longitude: origin.longitude,
          formatted_address: origin.formatted_address,
        },
        destination: {
          name: destination.name,
          latitude: destination.latitude,
          longitude: destination.longitude,
          formatted_address: destination.formatted_address,
        },
        travel_mode: mode,
        safehouse_id: safehouseId,
      });
      setRoutePlan(plan);
      setActiveRouteIndex(0); // select recommended route first
    } catch (err: any) {
      console.error('Evacuation Route calculation failed:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Failed to calculate evacuation route.';
      setErrorMessage(detail);
      setRoutePlan(null);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleSwap = () => {
    const tempLoc = fromLocation;
    const tempQ = fromQuery;
    setFromLocation(toLocation);
    setFromQuery(toQuery);
    setToLocation(tempLoc);
    setToQuery(tempQ);
    if (toLocation && tempLoc) {
      executeCalculateRoute(toLocation, tempLoc, travelMode);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: LocationPointData = {
            name: 'My Current GPS Location',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            formatted_address: `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          };
          setFromLocation(loc);
          setFromQuery(loc.name);
          setShowFromDropdown(false);
        },
        () => {
          // fallback to activeLocation
          const loc: LocationPointData = {
            name: activeLocation.name,
            latitude: activeLocation.lat,
            longitude: activeLocation.lng,
            formatted_address: activeLocation.displayName || activeLocation.name,
          };
          setFromLocation(loc);
          setFromQuery(loc.name);
        }
      );
    }
  };

  const handleSelectSafehouseAsDestination = (sz: SafeZone) => {
    const lat = sz.latitude || sz.location.lat;
    const lng = sz.longitude || sz.location.lng;
    const safehouseLoc: LocationPointData = {
      name: sz.name,
      latitude: lat,
      longitude: lng,
      formatted_address: sz.name,
    };
    setToLocation(safehouseLoc);
    setToQuery(sz.name);
    setShowToDropdown(false);

    const origin = fromLocation || {
      name: activeLocation.name,
      latitude: activeLocation.lat,
      longitude: activeLocation.lng,
    };
    if (!fromLocation) {
      setFromLocation(origin);
      setFromQuery(origin.name);
    }

    executeCalculateRoute(origin, safehouseLoc, travelMode, sz.id);
  };

  // Extract all evaluated routes
  const evaluatedRoutes: EvaluatedRoute[] = useMemo(() => {
    if (!routePlan) return [];
    if (routePlan.routes && routePlan.routes.length > 0) {
      return routePlan.routes;
    }
    // Fallback if backend returned flat structure
    const mainRoute: EvaluatedRoute = {
      route_id: 'primary',
      name: 'Primary Evacuation Corridor',
      geometry: routePlan.waypoints,
      waypoints: routePlan.waypoints,
      distance_km: routePlan.distanceKm || routePlan.distance_km || 0,
      duration_minutes: routePlan.estimatedTimeMin || routePlan.duration_minutes || 0,
      safety_score: routePlan.safetyScore || routePlan.safety_score || 90,
      status: (routePlan.routeSafety || routePlan.status || 'SAFE') as RouteSafetyStatus,
      status_label: routePlan.routeSafety === 'BLOCKED' ? 'BLOCKED — DO NOT TRAVEL' : routePlan.routeSafety === 'DANGEROUS' ? 'DANGEROUS — AVOID THIS ROUTE' : 'SAFE CORRIDOR',
      recommended: true,
      hazard_exposure_km: routePlan.hazard_exposure_km || 0,
      hazards: routePlan.hazards || [],
      navigation_steps: routePlan.steps || routePlan.navigation_steps || [],
    };
    const list = [mainRoute];
    if (routePlan.alternatives) {
      routePlan.alternatives.forEach((alt: any, idx: number) => {
        list.push({
          route_id: alt.route_id || `alt_${idx + 1}`,
          name: `Alternative Corridor #${idx + 1}`,
          geometry: alt.waypoints || alt.geometry || [],
          waypoints: alt.waypoints || alt.geometry || [],
          distance_km: alt.distanceKm || alt.distance_km || 0,
          duration_minutes: alt.estimatedTimeMin || alt.duration_minutes || 0,
          safety_score: alt.safetyScore || alt.safety_score || 90,
          status: (alt.routeSafety || alt.safety_status || alt.status || 'SAFE') as RouteSafetyStatus,
          status_label: (alt.routeSafety || alt.status) === 'BLOCKED' ? 'BLOCKED — DO NOT TRAVEL' : (alt.routeSafety || alt.status) === 'DANGEROUS' ? 'DANGEROUS — AVOID THIS ROUTE' : 'SAFE ALTERNATIVE',
          recommended: false,
          hazard_exposure_km: alt.hazard_exposure_km || 0,
          hazards: alt.hazards || [],
          navigation_steps: alt.steps || alt.navigation_steps || [],
        });
      });
    }
    return list;
  }, [routePlan]);

  const activeSelectedRoute = evaluatedRoutes[activeRouteIndex] || evaluatedRoutes[0] || null;

  // Check for dangerous routes to render warning banner
  const dangerousRoutesList = evaluatedRoutes.filter(
    (r) => r.status === 'DANGEROUS' || r.status === 'BLOCKED'
  );
  const hasDangerousRoutes = dangerousRoutesList.length > 0;
  const recommendedRoute = evaluatedRoutes.find((r) => r.recommended) || evaluatedRoutes[0];

  // Custom Map Pins
  const originPin = useMemo(
    () =>
      L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: #10b981;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">📍</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const safehousePin = useMemo(
    () =>
      L.divIcon({
        className: 'custom-safehouse-pin',
        html: `
          <div style="
            background: #059669;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.45);
          ">🛡️</div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34],
      }),
    []
  );

  const destinationPin = useMemo(
    () =>
      L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="
            background: #2563eb;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">🎯</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      }),
    []
  );

  const dangerWarningPin = useMemo(
    () =>
      L.divIcon({
        className: 'custom-danger-pin',
        html: `
          <div style="
            background: #dc2626;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 4px 10px rgba(220, 38, 38, 0.5);
            animation: pulse 1.5s infinite;
          ">⚠️</div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      }),
    []
  );

  const mapCenter: [number, number] = fromLocation
    ? [fromLocation.latitude, fromLocation.longitude]
    : [activeLocation.lat, activeLocation.lng];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
              NDMA DSS
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              MULTI-ROUTE SAFETY ENGINE
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Multi-Modal Evacuation & Multi-Hazard Route Safety System
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Calculates real multi-corridor routes, checks geometric hazard exposure, and highlights verified safe corridors vs dangerous routes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Safety Classification: GREEN=Safe | BLUE=Alt | RED=Dangerous
          </span>
        </div>
      </div>

      {/* Professional Route Planner Search Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Route className="w-4 h-4 text-emerald-600" />
            Evacuation / Route Planner
          </h3>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Use Current Location</span>
          </button>
        </div>

        {/* Search Input Row (FROM <-> TO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* FROM Search Box */}
          <div ref={fromRef} className="lg:col-span-5 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              FROM (Starting Location)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => {
                  setFromQuery(e.target.value);
                  setShowFromDropdown(true);
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Search starting location (e.g. Bhimavaram, Macherla, Chennai)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
              />
              {fromLocation && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </div>

            {/* FROM Autocomplete Dropdown */}
            {showFromDropdown && fromQuery.trim().length >= 2 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto">
                {isSearchingFrom ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Searching locations...</div>
                ) : fromSuggestions.length > 0 ? (
                  fromSuggestions.map((place, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFromLocation({
                          name: place.name,
                          latitude: place.latitude,
                          longitude: place.longitude,
                          formatted_address: place.formatted_address,
                        });
                        setFromQuery(place.name);
                        setShowFromDropdown(false);
                      }}
                      className="w-full text-left p-3 hover:bg-emerald-50/70 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                        <span>{place.name}</span>
                        {place.category && (
                          <span className="text-[10px] font-mono font-normal uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {place.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{place.formatted_address}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-500 text-center">No locations found.</div>
                )}
              </div>
            )}
          </div>

          {/* Swap Button (1 col) */}
          <div className="lg:col-span-1 flex items-center justify-center pt-5">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap From and To locations"
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* TO Search Box */}
          <div ref={toRef} className="lg:col-span-6 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              TO (Destination / Safehouse)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={toQuery}
                onChange={(e) => {
                  setToQuery(e.target.value);
                  setShowToDropdown(true);
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Search destination or nearby shelter..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
              />
              {toLocation && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>

            {/* TO Autocomplete Dropdown */}
            {showToDropdown && toQuery.trim().length >= 2 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto">
                {isSearchingTo ? (
                  <div className="p-3 text-xs text-slate-400 text-center">Searching locations...</div>
                ) : toSuggestions.length > 0 ? (
                  toSuggestions.map((place, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setToLocation({
                          name: place.name,
                          latitude: place.latitude,
                          longitude: place.longitude,
                          formatted_address: place.formatted_address,
                        });
                        setToQuery(place.name);
                        setShowToDropdown(false);
                      }}
                      className="w-full text-left p-3 hover:bg-emerald-50/70 border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                        <span>{place.name}</span>
                        {place.category && (
                          <span className="text-[10px] font-mono font-normal uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {place.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{place.formatted_address}</p>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-500 text-center">No locations found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Travel Mode Selector & Calculate Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-slate-100">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">Travel Mode:</span>
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setTravelMode('WALK');
                  if (fromLocation && toLocation) {
                    executeCalculateRoute(fromLocation, toLocation, 'WALK');
                  }
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  travelMode === 'WALK'
                    ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>🚶 WALK</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTravelMode('BICYCLE');
                  if (fromLocation && toLocation) {
                    executeCalculateRoute(fromLocation, toLocation, 'BICYCLE');
                  }
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  travelMode === 'BICYCLE'
                    ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>🚲 BIKE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTravelMode('DRIVE');
                  if (fromLocation && toLocation) {
                    executeCalculateRoute(fromLocation, toLocation, 'DRIVE');
                  }
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  travelMode === 'DRIVE'
                    ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>🚗 DRIVE / CAR</span>
              </button>
            </div>
          </div>

          {/* Calculate Route CTA */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={isLoadingRoute || !fromLocation}
              onClick={() => {
                if (!fromLocation) return;
                const dest =
                  toLocation ||
                  (safeZones.length > 0
                    ? {
                        name: safeZones[0].name,
                        latitude: safeZones[0].latitude || safeZones[0].location.lat,
                        longitude: safeZones[0].longitude || safeZones[0].location.lng,
                        formatted_address: safeZones[0].name,
                      }
                    : null);

                if (!dest) {
                  setErrorMessage('Please select a destination or safe shelter.');
                  return;
                }
                if (!toLocation) {
                  setToLocation(dest);
                  setToQuery(dest.name);
                }
                executeCalculateRoute(fromLocation, dest, travelMode);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isLoadingRoute ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-orange-400" />
                  <span>Evaluating Multi-Route Safety...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Calculate Road Evacuation Routes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error / Validation Banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* PROMINENT DANGEROUS ROUTE WARNING BANNER */}
      {hasDangerousRoutes && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 text-red-950 shadow-sm space-y-2 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-red-600 text-white">
                <AlertOctagon className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-black text-red-800 tracking-wide">
                  ⚠️ DANGEROUS / BLOCKED EVACUATION CORRIDOR DETECTED
                </h4>
                <p className="text-xs text-red-700">
                  {dangerousRoutesList.length} route corridor(s) pass directly through active disaster hazard zones.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const recIdx = evaluatedRoutes.findIndex((r) => r.recommended);
                setActiveRouteIndex(recIdx >= 0 ? recIdx : 0);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>View Recommended Safe Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div className="space-y-1">
              <span className="font-bold text-red-900 block">Identified Hazard Exposures:</span>
              {dangerousRoutesList.map((dr, drIdx) => (
                <p key={drIdx} className="text-[11px] text-red-800">
                  • <strong className="text-red-900">{dr.name}</strong>: Encountered{' '}
                  <span className="font-mono font-bold text-red-700">
                    {dr.hazards?.map((h) => `${h.type} (${h.affected_distance_km} km)`).join(', ') || `${dr.hazard_exposure_km} km`}
                  </span>{' '}
                  ({dr.status === 'BLOCKED' ? 'BLOCKED ROADWAY' : 'DANGEROUS TRAVEL'})
                </p>
              ))}
            </div>

            <div className="bg-red-100/70 p-2.5 rounded-xl border border-red-200 text-red-900 space-y-1">
              <span className="font-bold text-[11px] text-red-950 block">Actionable Evacuation Directive:</span>
              <p className="text-[11px] leading-relaxed">
                <strong>DO NOT TRAVEL THE RED CORRIDOR.</strong> Use the solid <strong>GREEN recommended corridor</strong> which bypasses active flood plains, debris breaches, and unstable slope zones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Location-Based Safehouse Cards & Route Details (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Emergency Safe Shelters {fromLocation ? `Near ${fromLocation.name}` : ''}
              </h4>
              {safeZones.length > 0 && (
                <span className="text-[10px] font-mono text-slate-400">
                  {safeZones.length} shelters found
                </span>
              )}
            </div>

            {/* Shelter Sorting Toolbar */}
            {safeZones.length > 1 && (
              <SortingToolbar<SafeZone>
                sortOptions={SHELTER_SORT_OPTIONS}
                activeSortKey={shelterSortKey}
                activeDirection={shelterSortDirection}
                onSortChange={(key, dir) => {
                  setShelterSortKey(key);
                  setShelterSortDirection(dir);
                }}
                defaultSortKey="availableCapacity"
                defaultDirection="desc"
                className="py-1"
              />
            )}

            {isLoadingShelters ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Finding nearby emergency shelters for {fromLocation?.name || 'location'}...
              </div>
            ) : !fromLocation ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
                <MapPin className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <span>Select a starting location to find nearby emergency shelters.</span>
              </div>
            ) : safeZones.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                <ShieldAlert className="w-5 h-5 text-amber-500 mx-auto" />
                <p>No emergency shelters found within primary search radius.</p>
                <button
                  type="button"
                  onClick={async () => {
                    if (fromLocation) {
                      const expanded = await evacuationService.getSafeZones(
                        fromLocation.latitude,
                        fromLocation.longitude,
                        250
                      );
                      setSafeZones(expanded);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors"
                >
                  Expand Search Radius (250 km)
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {sortedSafeZones.map((sz) => (
                  <SafeZoneCard
                    key={sz.id}
                    safeZone={sz}
                    isSelected={Boolean(
                      toLocation &&
                        Math.hypot(
                          (sz.latitude || sz.location.lat) - toLocation.latitude,
                          (sz.longitude || sz.location.lng) - toLocation.longitude
                        ) < 0.005
                    )}
                    onSelect={() => handleSelectSafehouseAsDestination(sz)}
                    onRouteTo={() => handleSelectSafehouseAsDestination(sz)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Route Details Card */}
          {routePlan && (
            <RouteDetailsCard
              route={routePlan}
              activeRoute={activeSelectedRoute}
              routesList={evaluatedRoutes}
              activeRouteIndex={activeRouteIndex}
              travelMode={travelMode}
              onSelectRoute={(r, idx) => setActiveRouteIndex(idx)}
              onSelectAlternative={(idx) => setActiveRouteIndex(idx)}
            />
          )}
        </div>

        {/* Right: Map with Multi-Route Polylines, Hazard Zones & Legend (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                {activeSelectedRoute?.status === 'DANGEROUS'
                  ? '🔴 DANGEROUS ROUTE (Active Hazard Intersection)'
                  : activeSelectedRoute?.status === 'BLOCKED'
                  ? '🔴 BLOCKED ROUTE (Critical Hazard Corridor)'
                  : activeSelectedRoute?.recommended
                  ? '🟢 Recommended Safe Evacuation Route'
                  : '🔵 Safe Alternative Evacuation Route'}
              </h4>
            </div>
            {fromLocation && toLocation && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-full">
                <span className="font-semibold text-slate-800 truncate">{fromLocation.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-emerald-700 truncate">{toLocation.name}</span>
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="flex-1 min-h-[520px] rounded-xl overflow-hidden border border-slate-200 relative">
            {isLoadingRoute ? (
              <div className="h-full w-full min-h-[520px] flex items-center justify-center bg-slate-50">
                <LoadingSpinner message={`Calculating Real Road Geometry & Hazard Intersections for ${travelMode}...`} />
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full min-h-[520px]"
              >
                <MapRecenter center={mapCenter} />

                {/* 1. Base Map Layer */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 2. Active Multi-Hazard Polygons */}
                {hazardZones.map((hz) => {
                  const isCritical = hz.severity === 'CRITICAL' || hz.riskLevel === 'CRITICAL';
                  const isHigh = hz.severity === 'HIGH' || hz.riskLevel === 'HIGH';
                  const hzType = hz.type || 'LANDSLIDE';

                  let polyColor = isCritical ? '#dc2626' : isHigh ? '#ea580c' : '#f59e0b';
                  if (hzType === 'FLOOD' || hzType === 'FLASH_FLOOD') {
                    polyColor = '#0284c7'; // Sky/Blue flood
                  } else if (hzType === 'ROAD_BLOCKAGE') {
                    polyColor = '#991b1b'; // Dark Crimson
                  } else if (hzType === 'CYCLONE') {
                    polyColor = '#7c3aed'; // Purple
                  }

                  return (
                    <React.Fragment key={hz.id}>
                      {hz.polygon && hz.polygon.length >= 3 ? (
                        <Polygon
                          positions={hz.polygon}
                          pathOptions={{
                            color: polyColor,
                            fillColor: polyColor,
                            fillOpacity: 0.22,
                            weight: 2.5,
                            dashArray: isCritical ? '6, 6' : undefined,
                          }}
                        >
                          <Popup>
                            <div className="p-2 text-xs font-sans space-y-1">
                              <span className="font-bold text-red-600 block uppercase">
                                ⚠️ ACTIVE {hz.type || 'DISASTER'} ZONE ({hz.severity || hz.riskLevel})
                              </span>
                              <p className="font-bold text-slate-900">{hz.name}</p>
                              {hz.source && <p className="text-[10px] text-slate-500">Source: {hz.source}</p>}
                            </div>
                          </Popup>
                        </Polygon>
                      ) : (
                        <Circle
                          center={[hz.center.lat, hz.center.lng]}
                          radius={hz.radiusMeters || 450}
                          pathOptions={{
                            color: polyColor,
                            fillColor: polyColor,
                            fillOpacity: 0.2,
                            weight: 2,
                          }}
                        >
                          <Popup>
                            <div className="p-2 text-xs font-sans">
                              <span className="font-bold text-red-600 block">
                                ⚠️ {hz.type || 'HAZARD'} EPICENTER
                              </span>
                              <span className="font-semibold text-slate-900">{hz.name}</span>
                            </div>
                          </Popup>
                        </Circle>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* 3. Nearby Shelter Markers on Map */}
                {safeZones.map((sz) => {
                  const sLat = sz.latitude || sz.location.lat;
                  const sLng = sz.longitude || sz.location.lng;
                  return (
                    <Marker key={sz.id} position={[sLat, sLng]} icon={safehousePin}>
                      <Popup className="custom-leaflet-popup">
                        <div className="p-3 text-xs font-sans">
                          <div className="font-bold text-emerald-700 mb-1">🛡️ EMERGENCY SAFE SHELTER</div>
                          <div className="font-bold text-slate-900">{sz.name}</div>
                          {sz.distanceKm && (
                            <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
                              Distance: {sz.distanceKm} km
                            </div>
                          )}
                          <div className="text-[11px] text-slate-600 mt-1">
                            Capacity: {sz.capacityTotal} | Available:{' '}
                            {sz.availableCapacity ?? (sz.capacityTotal - sz.capacityOccupied)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectSafehouseAsDestination(sz)}
                            className="mt-2 w-full py-1 px-2 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                          >
                            Route to this Safehouse
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* 4. Non-Active Routes (Background Layer) */}
                {evaluatedRoutes.map((r, idx) => {
                  if (idx === activeRouteIndex) return null; // render selected route on top
                  const isBlockedRoute = r.status === 'BLOCKED';
                  const isDangerousRoute = r.status === 'DANGEROUS';
                  const isCautionRoute = r.status === 'CAUTION';
                  const isSafeRoute = r.status === 'SAFE';

                  let routeColor = '#3b82f6'; // blue alt
                  if (isBlockedRoute || isDangerousRoute) routeColor = '#ef4444'; // red
                  else if (isCautionRoute) routeColor = '#f59e0b'; // amber
                  else if (r.recommended) routeColor = '#10b981'; // green

                  return (
                    <Polyline
                      key={r.route_id || idx}
                      positions={r.geometry || r.waypoints}
                      pathOptions={{
                        color: routeColor,
                        weight: 4.5,
                        opacity: isDangerousRoute || isBlockedRoute ? 0.75 : 0.65,
                        dashArray: isBlockedRoute ? '8, 8' : undefined,
                        lineCap: 'round',
                        lineJoin: 'round',
                      }}
                      eventHandlers={{
                        click: () => setActiveRouteIndex(idx),
                      }}
                    />
                  );
                })}

                {/* 5. Selected Active Route (Top Foreground Layer) */}
                {activeSelectedRoute && (activeSelectedRoute.geometry || activeSelectedRoute.waypoints) && (
                  <Polyline
                    positions={activeSelectedRoute.geometry || activeSelectedRoute.waypoints}
                    pathOptions={{
                      color:
                        activeSelectedRoute.status === 'BLOCKED' || activeSelectedRoute.status === 'DANGEROUS'
                          ? '#dc2626' // Solid Red / Red Dashed
                          : activeSelectedRoute.status === 'CAUTION'
                          ? '#ea580c' // Orange
                          : activeSelectedRoute.recommended
                          ? '#10b981' // Solid Green
                          : '#2563eb', // Solid Blue Alt
                      weight: 6.0,
                      opacity: 0.98,
                      dashArray: activeSelectedRoute.status === 'BLOCKED' ? '8, 8' : undefined,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                )}

                {/* 6. Danger Warning Markers along Dangerous Route */}
                {activeSelectedRoute &&
                  (activeSelectedRoute.status === 'DANGEROUS' || activeSelectedRoute.status === 'BLOCKED') &&
                  activeSelectedRoute.waypoints &&
                  activeSelectedRoute.waypoints.length > 4 && (
                    <Marker
                      position={
                        activeSelectedRoute.waypoints[
                          Math.floor(activeSelectedRoute.waypoints.length / 2)
                        ]
                      }
                      icon={dangerWarningPin}
                    >
                      <Popup>
                        <div className="p-2 text-xs font-sans">
                          <span className="font-bold text-red-600 block">
                            ⚠️ ACTIVE HAZARD EXPOSURE POINT
                          </span>
                          <p className="text-slate-800">
                            Route crosses active hazard zone ({activeSelectedRoute.hazard_exposure_km} km exposure).
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                {/* 7. Origin Marker (📍 START) */}
                {fromLocation && (
                  <Marker
                    position={[fromLocation.latitude, fromLocation.longitude]}
                    icon={originPin}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="p-3 text-xs font-sans">
                        <div className="font-bold text-emerald-700 mb-1">📍 EVACUATION START POINT</div>
                        <div className="font-bold text-slate-900">{fromLocation.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{fromLocation.formatted_address}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* 8. Destination Marker (🎯 DESTINATION) */}
                {toLocation && (
                  <Marker
                    position={[toLocation.latitude, toLocation.longitude]}
                    icon={destinationPin}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="p-3 text-xs font-sans">
                        <div className="font-bold text-blue-700 mb-1">🎯 DESTINATION SAFE REFUGE</div>
                        <div className="font-bold text-slate-900">{toLocation.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{toLocation.formatted_address}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            )}
          </div>

          {/* COMPREHENSIVE MAP LEGEND */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 text-xs border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-[11px] uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Evacuation Route & Disaster Hazard Legend
              </span>
              <span className="text-[10px] font-mono text-slate-400">NDMA GIS Standard</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {/* Route Types */}
              <div className="flex items-center gap-2">
                <span className="w-4 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>🟢 Recommended Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>🔵 Safe Alternative</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>🟠 Caution Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                <span>🔴 Dangerous — Avoid</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 border-t-2 border-dashed border-red-600 shrink-0"></span>
                <span>🔴 Dashed — Blocked</span>
              </div>

              {/* Hazard Zones */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-sky-500/30 border border-sky-500 shrink-0"></span>
                <span>🌊 Flood Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500 shrink-0"></span>
                <span>🏔️ Landslide Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-600/30 border border-red-600 shrink-0"></span>
                <span>🚧 Road Blockage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
