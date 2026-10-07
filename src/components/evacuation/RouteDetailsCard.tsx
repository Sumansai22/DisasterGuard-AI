import React from 'react';
import {
  EvacuationRoutePlan,
  TravelMode,
  EvaluatedRoute,
  RouteSafetyStatus,
} from '../../types/evacuation';
import {
  Navigation,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ShieldX,
  Footprints,
  Bike,
  Car,
  AlertCircle,
  XCircle,
  Layers,
  MapPin,
} from 'lucide-react';

interface RouteDetailsCardProps {
  route: EvacuationRoutePlan;
  activeRoute?: EvaluatedRoute | null;
  routesList?: EvaluatedRoute[];
  activeRouteIndex?: number;
  travelMode?: TravelMode;
  onSelectRoute?: (route: EvaluatedRoute, index: number) => void;
  onSelectAlternative?: (index: number) => void;
}

export const RouteDetailsCard: React.FC<RouteDetailsCardProps> = ({
  route,
  activeRoute,
  routesList = [],
  activeRouteIndex = 0,
  travelMode = 'DRIVE',
  onSelectRoute,
  onSelectAlternative,
}) => {
  const currentMode = route.travelMode || route.travel_mode || travelMode;

  // Determine current active route details
  const displayRoute: EvaluatedRoute = activeRoute || (routesList && routesList[activeRouteIndex]) || {
    route_id: 'primary',
    name: route.affectedZoneName || 'Primary Evacuation Corridor',
    geometry: route.waypoints,
    waypoints: route.waypoints,
    distance_km: route.distanceKm || route.distance_km || 0,
    duration_minutes: route.estimatedTimeMin || route.duration_minutes || 0,
    safety_score: route.safetyScore || route.safety_score || 90,
    status: (route.routeSafety || route.status || 'SAFE') as RouteSafetyStatus,
    status_label: (route.routeSafety || route.status) === 'BLOCKED' ? 'BLOCKED — DO NOT TRAVEL' : (route.routeSafety || route.status) === 'DANGEROUS' ? 'DANGEROUS — AVOID THIS ROUTE' : 'SAFE CORRIDOR',
    recommended: true,
    hazard_exposure_km: route.hazard_exposure_km || (route.hazardExposureMeters ? route.hazardExposureMeters / 1000 : 0),
    hazards: route.hazards || [],
    navigation_steps: route.steps || route.navigation_steps || [],
  };

  const status = displayRoute.status;
  const isDangerous = status === 'DANGEROUS';
  const isBlocked = status === 'BLOCKED';
  const isCaution = status === 'CAUTION';
  const isSafe = status === 'SAFE';

  const getSafetyBadge = (st: RouteSafetyStatus) => {
    switch (st) {
      case 'BLOCKED':
        return {
          bg: 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-500/20',
          dot: 'bg-red-600',
          label: 'BLOCKED — DO NOT TRAVEL',
          headerTitle: 'BLOCKED EVACUATION CORRIDOR',
          icon: ShieldX,
          color: 'text-red-700',
        };
      case 'DANGEROUS':
        return {
          bg: 'bg-red-50 text-red-800 border-red-300 ring-2 ring-red-500/20',
          dot: 'bg-red-500',
          label: 'DANGEROUS — AVOID THIS ROUTE',
          headerTitle: 'DANGEROUS ROUTE — ACTIVE HAZARD INTERSECTION',
          icon: AlertOctagon,
          color: 'text-red-700',
        };
      case 'CAUTION':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20',
          dot: 'bg-amber-500',
          label: 'CAUTION — ELEVATED HAZARD BUFFER',
          headerTitle: 'CAUTION EVACUATION ROUTE',
          icon: AlertTriangle,
          color: 'text-amber-700',
        };
      case 'SAFE':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20',
          dot: 'bg-emerald-500',
          label: displayRoute.recommended ? 'RECOMMENDED SAFE CORRIDOR' : 'SAFE ALTERNATIVE CORRIDOR',
          headerTitle: displayRoute.recommended ? 'RECOMMENDED SAFE EVACUATION ROUTE' : 'SAFE ALTERNATIVE EVACUATION ROUTE',
          icon: ShieldCheck,
          color: 'text-emerald-700',
        };
    }
  };

  const badge = getSafetyBadge(status);
  const BadgeIcon = badge.icon;

  const getModeInfo = (mode: TravelMode) => {
    switch (mode) {
      case 'WALK':
        return {
          title: '🚶 WALKING EVACUATION ROUTE',
          icon: Footprints,
          etaLabel: 'Estimated Walking Time',
          corridorType: 'Pedestrian Footway Network',
        };
      case 'BICYCLE':
        return {
          title: '🚲 BICYCLE EVACUATION ROUTE',
          icon: Bike,
          etaLabel: 'Estimated Cycling Time',
          corridorType: 'Bicycle Paths & Cycleways',
        };
      case 'DRIVE':
      default:
        return {
          title: '🚗 DRIVING EVACUATION ROUTE',
          icon: Car,
          etaLabel: 'Estimated Driving Time',
          corridorType: 'Road Network & Highways',
        };
    }
  };

  const modeInfo = getModeInfo(currentMode);
  const ModeIcon = modeInfo.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isDangerous || isBlocked
                ? 'bg-red-600 text-white'
                : isCaution
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            <ModeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              {badge.headerTitle}
            </h4>
            <p className="text-xs text-slate-500">
              {displayRoute.name} • {modeInfo.corridorType}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[11px] font-mono font-extrabold border flex items-center gap-1.5 self-start sm:self-auto ${badge.bg}`}
        >
          <BadgeIcon className="w-3.5 h-3.5" />
          {badge.label}
        </span>
      </div>

      {/* DANGEROUS / BLOCKED WARNING BANNER */}
      {(isDangerous || isBlocked) && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-xs text-red-950 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-black text-red-700 uppercase tracking-wide">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{isBlocked ? 'BLOCKED — DO NOT TRAVEL THIS CORRIDOR' : 'DANGEROUS — AVOID THIS ROUTE'}</span>
          </div>
          <p className="text-red-900 leading-relaxed font-medium">
            This route intersects active disaster hazard zones with a total hazard exposure of{' '}
            <strong className="text-red-950 font-bold">{displayRoute.hazard_exposure_km} km</strong>. Transit via this path creates severe danger of entrapment, road washouts, or slope collapse.
          </p>
          {displayRoute.hazards && displayRoute.hazards.length > 0 && (
            <div className="mt-2 pt-2 border-t border-red-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                Encountered Multi-Hazard Barriers:
              </span>
              {displayRoute.hazards.map((hz, hIdx) => (
                <div key={hIdx} className="flex items-center justify-between text-[11px] text-red-900 font-sans">
                  <span>
                    • <strong>{hz.name}</strong> ({hz.type})
                  </span>
                  <span className="font-mono font-bold text-red-700">
                    {hz.affected_distance_km} km ({hz.severity})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAFE ROUTE CLEARANCE BANNER */}
      {isSafe && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">
              {displayRoute.recommended
                ? 'Verified Safe Evacuation Corridor: 0 km hazard exposure along route.'
                : 'Safe Alternative Route: Clear of all active hazard zones.'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            PASSED SAFETY ENGINE
          </span>
        </div>
      )}

      {/* Multi-Route Selector Tabs */}
      {routesList && routesList.length > 1 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Evaluated Route Alternatives ({routesList.length})</span>
            <span className="font-mono text-slate-500">Click Route or Map Line</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {routesList.map((r, rIdx) => {
              const isSelected = activeRouteIndex === rIdx;
              const rStatus = r.status;
              const isRBlocked = rStatus === 'BLOCKED';
              const isRDanger = rStatus === 'DANGEROUS';
              const isRCaution = rStatus === 'CAUTION';

              return (
                <button
                  key={r.route_id || rIdx}
                  type="button"
                  onClick={() => {
                    if (onSelectRoute) onSelectRoute(r, rIdx);
                    if (onSelectAlternative) onSelectAlternative(rIdx);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? isRDanger || isRBlocked
                        ? 'bg-red-50 border-red-400 ring-2 ring-red-400/30 shadow-xs'
                        : 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-700 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>{r.recommended ? '🟢' : isRDanger || isRBlocked ? '🔴' : isRCaution ? '🟠' : '🔵'}</span>
                      <span className="truncate">{r.recommended ? 'Recommended Safe' : isRDanger ? 'Dangerous — Avoid' : isRBlocked ? 'Blocked — Avoid' : `Alternative #${rIdx + 1}`}</span>
                    </div>
                    <p className={`text-[10px] font-mono mt-0.5 truncate ${isSelected && !isRDanger && !isRBlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {r.distance_km} km • ~{r.duration_minutes} min
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold shrink-0 ${
                      r.safety_score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.safety_score >= 55
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {r.safety_score}/100
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Route KPI Bar */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Distance
          </span>
          <span className="text-sm md:text-base font-black text-slate-900 font-mono">
            {displayRoute.distance_km} km
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Duration
          </span>
          <span className="text-sm md:text-base font-black text-slate-900 font-mono">
            ~{displayRoute.duration_minutes} min
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Hazard Exp.
          </span>
          <span
            className={`text-sm md:text-base font-black font-mono ${
              displayRoute.hazard_exposure_km > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {displayRoute.hazard_exposure_km} km
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Safety Score
          </span>
          <span
            className={`text-sm md:text-base font-black font-mono ${
              displayRoute.safety_score < 50
                ? 'text-red-600'
                : displayRoute.safety_score < 80
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {displayRoute.safety_score} / 100
          </span>
        </div>
      </div>

      {/* Origin -> Destination Breadcrumbs */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Origin:</span>
          <strong className="text-slate-900 truncate max-w-[220px]">
            {route.origin?.name || route.affectedZoneName || 'Selected Origin'}
          </strong>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Destination:</span>
          <strong className="text-emerald-700 truncate max-w-[220px]">
            {route.destination?.name || route.targetSafeZone?.name || 'Emergency Shelter'}
          </strong>
        </div>
      </div>

      {/* Turn-by-Turn Navigation Steps */}
      <div className="space-y-2 pt-1">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Turn-by-Turn Navigation Protocol ({currentMode})</span>
          <span className="text-[10px] font-mono text-slate-400">
            {(displayRoute.navigation_steps || displayRoute.steps || []).length} steps
          </span>
        </h5>

        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {(displayRoute.navigation_steps || displayRoute.steps || []).map((step, sIdx) => (
            <div
              key={step.stepNumber || sIdx}
              className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs transition-colors ${
                step.status === 'DANGER'
                  ? 'bg-red-50/70 border-red-200 text-red-900'
                  : step.status === 'CAUTION'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${
                  step.status === 'DANGER'
                    ? 'bg-red-600 text-white'
                    : step.status === 'CAUTION'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {step.stepNumber || sIdx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold leading-snug">{step.instruction}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono flex-wrap">
                  <span>Distance: {step.distanceMeters}m</span>
                  {step.hazardNote && (
                    <span
                      className={`font-sans font-bold flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] ${
                        step.status === 'DANGER'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {step.hazardNote}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Verification Footer Note */}
      <p className="text-[10px] text-slate-400 leading-snug border-t border-slate-100 pt-2.5">
        ⚠️ <strong>Disaster Safety Engine Verification:</strong> Routing success does not guarantee zero risk. Always monitor real-time NDMA bulletins and follow instructions from civil defense rescue teams.
      </p>
    </div>
  );
};
