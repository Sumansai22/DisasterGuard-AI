import React from 'react';
import { CommandSummaryStats } from '../../types/map';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Activity,
  Radio,
  Slash,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface DisasterCommandSummaryProps {
  stats: CommandSummaryStats;
  locationName?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export const DisasterCommandSummary: React.FC<DisasterCommandSummaryProps> = ({
  stats,
  locationName,
  loading = false,
  onRefresh,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-3.5 md:p-4 border border-slate-800 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute"></span>
            <span className="w-2 h-2 rounded-full bg-red-500 relative"></span>
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold tracking-wide uppercase text-slate-200 flex items-center gap-2">
              <span>Disaster Command Telemetry</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                LIVE GIS SYNC
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {locationName ? `Tactical Area: ${locationName}` : 'National Early Warning Grid'} • {stats.geo_filtered_radius_km} km radius
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            IMD • GSI • CWC Integrated
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 disabled:opacity-50"
              title="Refresh Disaster Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Active Incidents */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>ACTIVE INCIDENTS</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl md:text-2xl font-black text-red-400 font-mono">
              {stats.active_incidents}
            </span>
            <span className="text-[10px] text-red-300 font-medium">Critical</span>
          </div>
        </div>

        {/* Critical Zones */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>CRITICAL ZONES</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl md:text-2xl font-black text-orange-400 font-mono">
              {stats.critical_zones}
            </span>
            <span className="text-[10px] text-orange-300 font-medium">Polygon</span>
          </div>
        </div>

        {/* High Risk Zones */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>HIGH RISK ZONES</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl md:text-2xl font-black text-amber-400 font-mono">
              {stats.high_risk_zones}
            </span>
            <span className="text-[10px] text-amber-300 font-medium">Alert</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>ACTIVE ALERTS</span>
            <Activity className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl md:text-2xl font-black text-yellow-400 font-mono">
              {stats.active_alerts}
            </span>
            <span className="text-[10px] text-yellow-300 font-medium">Dispatched</span>
          </div>
        </div>

        {/* Sensors Online % */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>SENSORS ONLINE</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
              {stats.sensors_online_pct}%
            </span>
            <span className="text-[10px] text-emerald-300 font-medium">Mesh</span>
          </div>
        </div>

        {/* Safe Shelters */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>SAFE SHELTERS</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl md:text-2xl font-black text-teal-400 font-mono">
              {stats.safe_shelters}
            </span>
            <span className="text-[10px] text-teal-300 font-medium">Available</span>
          </div>
        </div>

        {/* Blocked Roads */}
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>BLOCKED ROADS</span>
            <Slash className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl md:text-2xl font-black text-rose-400 font-mono">
              {stats.blocked_roads}
            </span>
            <span className="text-[10px] text-rose-300 font-medium">Corridors</span>
          </div>
        </div>
      </div>
    </div>
  );
};
