import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  Hospital,
  Radio,
  Droplets,
  Construction,
} from 'lucide-react';
import disasterManagementService from '../../services/disasterManagementService';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';

interface InfrastructureItem {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  status: string;
  condition_note?: string;
  distance_km?: number;
  is_demo?: boolean;
}

interface InfrastructureStatusPanelProps {
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
  onItemSelect?: (item: InfrastructureItem) => void;
}

export const InfrastructureStatusPanel: React.FC<InfrastructureStatusPanelProps> = ({
  centerLat = 16.5448,
  centerLng = 81.5212,
  radiusKm = 150,
  onItemSelect,
}) => {
  const [items, setItems] = useState<InfrastructureItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchInfrastructure = async () => {
    setLoading(true);
    try {
      const data = await disasterManagementService.getInfrastructure(centerLat, centerLng, radiusKm);
      setItems(data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfrastructure();
  }, [centerLat, centerLng, radiusKm]);

  // Aggregate stats
  const operationalCount = items.filter(
    (i) => i.status === 'OPERATIONAL' || i.status === 'NORMAL' || i.status === 'CLEAR'
  ).length;
  const atRiskCount = items.filter(
    (i) =>
      i.status === 'PARTIALLY_OPERATIONAL' ||
      i.status === 'WATCH' ||
      i.status === 'WARNING' ||
      i.status === 'MONITORING'
  ).length;
  const blockedOrDamagedCount = items.filter(
    (i) => i.status === 'DAMAGED' || i.status === 'BLOCKED' || i.status === 'CRITICAL'
  ).length;

  const filteredItems = items.filter((item) => {
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'OPERATIONAL' && item.status !== 'OPERATIONAL' && item.status !== 'NORMAL')
        return false;
      if (
        selectedStatus === 'AT_RISK' &&
        item.status !== 'PARTIALLY_OPERATIONAL' &&
        item.status !== 'WATCH' &&
        item.status !== 'WARNING'
      )
        return false;
      if (
        selectedStatus === 'BLOCKED' &&
        item.status !== 'BLOCKED' &&
        item.status !== 'DAMAGED' &&
        item.status !== 'CRITICAL'
      )
        return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${item.name} ${item.type} ${item.condition_note || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BRIDGE':
        return <Construction className="w-4 h-4 text-amber-400" />;
      case 'ROADS':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'POWER_INFRASTRUCTURE':
      case 'POWER':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'TELECOM':
        return <Radio className="w-4 h-4 text-indigo-400" />;
      case 'WATER_SUPPLY':
      case 'WATER':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'HOSPITAL':
      case 'HOSPITALS':
        return <Hospital className="w-4 h-4 text-emerald-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
      case 'NORMAL':
      case 'CLEAR':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            OPERATIONAL
          </span>
        );
      case 'PARTIALLY_OPERATIONAL':
      case 'WATCH':
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            AT RISK / RESTRICTED
          </span>
        );
      case 'DAMAGED':
      case 'BLOCKED':
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            BLOCKED / DAMAGED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700/30 text-slate-300 border border-slate-600/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-sm md:text-base">
              Road & Critical Infrastructure Status
            </h3>
            <DataProvenanceBadge status="LIVE" label="GIS NETWORK" size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time operational status of bridges, corridors, power grids and relief links
          </p>
        </div>

        <button
          onClick={fetchInfrastructure}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          title="Refresh infrastructure telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-950/70 border border-emerald-900/40 rounded-lg p-2.5 text-center">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wide">Operational</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{operationalCount}</div>
          <div className="text-[10px] text-slate-400">All corridors clear</div>
        </div>

        <div className="bg-slate-950/70 border border-amber-900/40 rounded-lg p-2.5 text-center">
          <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wide">Restricted / At Risk</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{atRiskCount}</div>
          <div className="text-[10px] text-slate-400">Speed / lane limits</div>
        </div>

        <div className="bg-slate-950/70 border border-rose-900/40 rounded-lg p-2.5 text-center">
          <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wide">Blocked / Damaged</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{blockedOrDamagedCount}</div>
          <div className="text-[10px] text-slate-400">Reroute active</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bridge, route, power grid..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Types</option>
            <option value="BRIDGE">Bridges</option>
            <option value="ROADS">Roads & Corridors</option>
            <option value="POWER_INFRASTRUCTURE">Power Grid</option>
            <option value="TELECOM">Telecom</option>
            <option value="WATER_SUPPLY">Water Supply</option>
            <option value="HOSPITAL">Hospitals</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="AT_RISK">At Risk / Restricted</option>
            <option value="BLOCKED">Blocked / Damaged</option>
          </select>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {loading && items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading critical infrastructure network...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No infrastructure assets found.</div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemSelect && onItemSelect(item)}
              className={`p-3 rounded-lg border bg-slate-950/70 transition flex flex-col gap-1.5 ${
                onItemSelect ? 'cursor-pointer hover:border-cyan-500/60' : ''
              } ${
                item.status === 'DAMAGED' || item.status === 'BLOCKED'
                  ? 'border-rose-900/40 hover:bg-rose-950/20'
                  : item.status === 'PARTIALLY_OPERATIONAL' || item.status === 'WATCH'
                  ? 'border-amber-900/40 hover:bg-amber-950/20'
                  : 'border-slate-800 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{item.name}</h4>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-cyan-400">{item.id}</span>
                      <span>•</span>
                      <span>Type: {item.type.replace(/_/g, ' ')}</span>
                      {typeof item.distance_km === 'number' && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{item.distance_km.toFixed(1)} km away</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>{getStatusBadge(item.status)}</div>
              </div>

              {item.condition_note && (
                <div className="text-[11px] text-slate-300 bg-slate-900/80 rounded px-2.5 py-1 border border-slate-800/80 mt-1">
                  {item.condition_note}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InfrastructureStatusPanel;
