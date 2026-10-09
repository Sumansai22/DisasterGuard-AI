import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowUpDown,
  User,
  ShieldAlert,
  CheckCircle,
  Truck,
  Archive,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import disasterManagementService from '../../services/disasterManagementService';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';

export interface AuditEvent {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  incident_id?: string;
  details: string;
}

interface IncidentTimelineProps {
  incidentId?: string;
  maxEvents?: number;
  showFilters?: boolean;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  incidentId,
  maxEvents,
  showFilters = true,
}) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewestFirst, setIsNewestFirst] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('ALL');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const logs = await disasterManagementService.getAuditLogs();
      setEvents(logs || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events
  const safeEvents = Array.isArray(events) ? events : [];
  let filtered = safeEvents.filter((ev) => {
    if (!ev) return false;
    if (incidentId && ev.incident_id && ev.incident_id !== incidentId) {
      return false;
    }
    if (selectedActionFilter !== 'ALL' && !ev.action.includes(selectedActionFilter)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${ev.action} ${ev.details} ${ev.operator} ${ev.incident_id || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return isNewestFirst ? timeB - timeA : timeA - timeB;
  });

  if (maxEvents && maxEvents > 0) {
    filtered = filtered.slice(0, maxEvents);
  }

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('RESOLV') || action.includes('CLOSED')) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('DISPATCH') || action.includes('ASSIGN')) {
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
    if (action.includes('VERIF') || action.includes('ACKNOWLEDGED')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
    if (action.includes('DETECT') || action.includes('REPORT')) {
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
    return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('RESOLV')) return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
    if (action.includes('CLOSED')) return <Archive className="w-3.5 h-3.5 text-slate-400" />;
    if (action.includes('DISPATCH') || action.includes('ASSIGN')) return <Truck className="w-3.5 h-3.5 text-amber-400" />;
    if (action.includes('VERIF') || action.includes('ACKNOWLEDGED')) return <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />;
    return <Clock className="w-3.5 h-3.5 text-rose-400" />;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-slate-100 text-sm md:text-base">
            Incident Audit Timeline
            {incidentId && <span className="text-xs font-mono text-cyan-400 ml-2">({incidentId})</span>}
          </h3>
          <DataProvenanceBadge status="LIVE" label="AUDIT TRAIL" size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewestFirst(!isNewestFirst)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Toggle chronological direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isNewestFirst ? 'Newest First' : 'Oldest First'}</span>
          </button>

          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Optional Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-slate-800/60 text-xs">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by action, detail or operator..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Actions</option>
              <option value="DETECT">Detections / Reports</option>
              <option value="VERIF">Verifications</option>
              <option value="ACKNOWLEDGE">Acknowledge</option>
              <option value="ASSIGN">Assignments</option>
              <option value="DISPATCH">Dispatches</option>
              <option value="RESOLV">Resolutions</option>
              <option value="CLOSED">Closures</option>
            </select>
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      <div className="mt-3 relative pl-4 border-l-2 border-slate-800 space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {loading && events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading audit trail events...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No audit events found matching query.</div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline marker icon */}
              <div className="absolute -left-[23px] top-1 p-1 rounded-full bg-slate-900 border border-slate-700 group-hover:border-cyan-400 transition">
                {getActionIcon(item.action)}
              </div>

              <div className="bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 rounded-lg p-2.5 transition">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${getActionBadgeColor(
                        item.action
                      )}`}
                    >
                      {item.action.replace(/_/g, ' ')}
                    </span>
                    {item.incident_id && (
                      <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {item.incident_id}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{formatTimestamp(item.timestamp)}</span>
                </div>

                <p className="text-xs text-slate-200 mt-1 leading-relaxed">{item.details}</p>

                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="font-medium text-slate-300">{item.operator || 'System'}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncidentTimeline;
