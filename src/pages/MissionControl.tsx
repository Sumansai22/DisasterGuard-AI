import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Radio,
  CheckCircle2,
  Truck,
  Users,
  Building2,
  RefreshCw,
  PlusCircle,
  LifeBuoy,
  ChevronRight,
  Filter,
  Check,
  Send,
  Archive,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { disasterManagementService } from '../services/disasterManagementService';
import { IncidentModel, IncidentStatus, IncidentPriority } from '../types/disasterManagement';
import { RiskMap } from '../components/map/RiskMap';
import { EmergencyActionChecklist } from '../components/checklist/EmergencyActionChecklist';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { InfrastructureStatusPanel } from '../components/infrastructure/InfrastructureStatusPanel';
import { ReportIncidentModal } from '../components/incidents/ReportIncidentModal';
import { ScenarioSimulatorModal } from '../components/common/ScenarioSimulatorModal';
import { EmergencySOSModal } from '../components/common/EmergencySOSModal';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const MissionControlPage: React.FC = () => {
  const { activeLocation, selectedStation } = useApp();

  const [incidents, setIncidents] = useState<IncidentModel[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState<boolean>(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentModel | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'checklist' | 'timeline' | 'infrastructure' | 'teams'>('checklist');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignIncidentTarget, setAssignIncidentTarget] = useState<IncidentModel | null>(null);
  const [selectedAssignTeam, setSelectedAssignTeam] = useState<string>('NDRF 10th Battalion');
  const [selectedAssignType, setSelectedAssignType] = useState<string>('NDRF');

  // Digital live clock
  const [currentTime, setCurrentTime] = useState<string>(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const data = await disasterManagementService.getIncidents();
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch {
      setIncidents([]);
    } finally {
      setLoadingIncidents(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && inc.priority !== priorityFilter) return false;
    return true;
  });

  // Action handlers
  const handleAcknowledge = async (id: string) => {
    try {
      const updated = await disasterManagementService.acknowledgeIncident({ incidentId: id });
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const updated = await disasterManagementService.verifyIncident(id);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to verify:', err);
    }
  };

  const openAssignModal = (inc: IncidentModel) => {
    setAssignIncidentTarget(inc);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignIncidentTarget) return;
    try {
      const updated = await disasterManagementService.assignIncident({
        incidentId: assignIncidentTarget.id,
        teamName: selectedAssignTeam,
        teamType: selectedAssignType,
      });
      setIncidents((prev) => prev.map((inc) => (inc.id === assignIncidentTarget.id ? updated : inc)));
      if (selectedIncident?.id === assignIncidentTarget.id) setSelectedIncident(updated);
      setIsAssignModalOpen(false);
      setAssignIncidentTarget(null);
    } catch (err) {
      console.error('Failed to assign team:', err);
    }
  };

  const handleDispatch = async (id: string) => {
    try {
      const res = await disasterManagementService.dispatchIncident({
        incidentId: id,
        teamName: selectedIncident?.assigned_team || 'NDRF Quick Response Team #2',
        teamType: selectedIncident?.assigned_team_type || 'NDRF',
      });
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? res.incident : inc)));
      if (selectedIncident?.id === id) setSelectedIncident(res.incident);
    } catch (err) {
      console.error('Failed to dispatch:', err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const updated = await disasterManagementService.resolveIncident(id);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  };

  const handleClose = async (id: string) => {
    try {
      const updated = await disasterManagementService.closeIncident(id);
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
      if (selectedIncident?.id === id) setSelectedIncident(updated);
    } catch (err) {
      console.error('Failed to close incident:', err);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'DETECTED':
      case 'CREATED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'PENDING_VERIFICATION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ACKNOWLEDGED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'ASSIGNED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'DISPATCHED':
      case 'RESPONDING':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CLOSED':
        return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  const getPriorityBadge = (p: IncidentPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'LOW':
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  };

  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const criticalCount = incidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'CLOSED').length;
  const dispatchedCount = incidents.filter((i) => i.status === 'DISPATCHED' || i.status === 'RESPONDING').length;

  return (
    <div className="space-y-5 animate-fadeIn min-w-0">
      {/* Top Banner / Mission Command Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                NDMA TACTICAL DISPATCH
              </span>
              <DataProvenanceBadge status="LIVE" label="COMMAND OPS" size="sm" />
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {currentTime}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
              <Radio className="w-6 h-6 text-cyan-400" />
              DisasterGuard Mission Control Center
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              Central operational interface orchestrating multi-hazard incident lifecycle, NDRF/SDRF unit dispatch, and field situational intelligence.
            </p>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-950/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Incident</span>
            </button>

            <button
              onClick={() => setIsSOSOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-950/40 animate-pulse"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Emergency SOS</span>
            </button>

            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Scenario Sim</span>
            </button>

            <button
              onClick={fetchIncidents}
              disabled={loadingIncidents}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Refresh incidents"
            >
              <RefreshCw className={`w-4 h-4 ${loadingIncidents ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Operational Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Active Incidents</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-white">{activeCount}</span>
              <span className="text-[11px] font-medium text-rose-400">({criticalCount} Critical)</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Dispatched Units</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-orange-400">{dispatchedCount}</span>
              <span className="text-[11px] text-slate-400">NDRF / SDRF</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Safe Shelters Ready</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-emerald-400">8</span>
              <span className="text-[11px] text-slate-400">Tier 1 & 2</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Avg Dispatch Time</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-cyan-400">3.8 min</span>
              <DataProvenanceBadge status="LIVE" label="REALTIME" size="sm" />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Target Location</span>
            <div className="flex items-center gap-1.5 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200 truncate">{activeLocation.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Command Center Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        {/* Left Column: Active Incidents Operations Queue (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3.5 shadow-lg min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="font-bold text-white text-sm md:text-base">Operations Queue</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-mono text-slate-300">
                {filteredIncidents.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Status</option>
                <option value="DETECTED">Detected</option>
                <option value="PENDING_VERIFICATION">Pending Verif</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Priority</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Incident List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {loadingIncidents && incidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading incident queue...</div>
            ) : filteredIncidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No incidents matching filter.</div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800/90 hover:bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-cyan-400">{inc.id}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${getPriorityBadge(
                              inc.priority
                            )}`}
                          >
                            {inc.priority}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${getStatusBadge(
                              inc.status
                            )}`}
                          >
                            {inc.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">
                          {inc.location_name}
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {inc.hazard_type || 'HAZARD'}
                      </span>
                    </div>

                    {inc.indicators && inc.indicators.length > 0 && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {inc.indicators[0]}
                      </p>
                    )}

                    {inc.assigned_team && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Truck className="w-3 h-3 text-amber-400" />
                        <span>Assigned: {inc.assigned_team}</span>
                      </div>
                    )}

                    {/* Operational Lifecycle Action Buttons */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/70 overflow-x-auto">
                      {(inc.status === 'DETECTED' || inc.status === 'CREATED') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(inc.id);
                          }}
                          className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition"
                        >
                          Acknowledge
                        </button>
                      )}

                      {inc.status === 'PENDING_VERIFICATION' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerify(inc.id);
                            }}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition"
                          >
                            Verify Incident
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcknowledge(inc.id);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition border border-slate-700"
                          >
                            Acknowledge
                          </button>
                        </>
                      )}

                      {(inc.status === 'ACKNOWLEDGED' || inc.status === 'VERIFIED') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAssignModal(inc);
                          }}
                          className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition"
                        >
                          Assign Team
                        </button>
                      )}

                      {inc.status === 'ASSIGNED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatch(inc.id);
                          }}
                          className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-semibold transition"
                        >
                          Dispatch Team
                        </button>
                      )}

                      {(inc.status === 'DISPATCHED' || inc.status === 'RESPONDING') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(inc.id);
                          }}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition"
                        >
                          Mark Resolved
                        </button>
                      )}

                      {inc.status === 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClose(inc.id);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition border border-slate-700 flex items-center gap-1"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Close / Archive</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Tactical Map & Tabbed Intelligence (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          {/* Tactical GIS Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col min-w-0">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Tactical Operations GIS Map</h3>
                <DataProvenanceBadge status="LIVE" label="GEO MAP" size="sm" />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Lat: {activeLocation.lat.toFixed(3)}, Lng: {activeLocation.lng.toFixed(3)}
              </span>
            </div>

            <div className="min-h-[380px] rounded-xl overflow-hidden border border-slate-800">
              <RiskMap height="380px" />
            </div>
          </div>

          {/* Tabbed Operations Intelligence */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg min-w-0">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2.5 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab('checklist')}
                className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                  activeTab === 'checklist'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                NDMA SOP Checklist
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                  activeTab === 'timeline'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Audit Timeline
              </button>

              <button
                onClick={() => setActiveTab('infrastructure')}
                className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                  activeTab === 'infrastructure'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Roads & Infrastructure
              </button>

              <button
                onClick={() => setActiveTab('teams')}
                className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                  activeTab === 'teams'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Response Assets
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-3">
              {activeTab === 'checklist' && (
                <EmergencyActionChecklist
                  incidentId={selectedIncident?.id}
                  hazardType={selectedIncident?.hazard_type || 'LANDSLIDE'}
                />
              )}

              {activeTab === 'timeline' && (
                <IncidentTimeline incidentId={selectedIncident?.id} maxEvents={15} />
              )}

              {activeTab === 'infrastructure' && (
                <InfrastructureStatusPanel
                  centerLat={activeLocation.lat}
                  centerLng={activeLocation.lng}
                  radiusKm={120}
                />
              )}

              {activeTab === 'teams' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="text-slate-300 font-semibold">Field Battalions & Relief Squads</span>
                    <DataProvenanceBadge status="DEMO" label="ROSTER" size="sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">NDRF 10th Battalion</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            STANDBY (DEPLOYABLE)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Specialized Heavy Collapse & Swift Water Rescue unit stationed at Vijayawada Base.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">Personnel: 45 | Boats: 8 | VHF: Ch-16</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">AP SDRF Strike Unit #3</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ACTIVE IN FIELD
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Engaged in Godavari embankment reinforcement and low-lying perimeter evacuation.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">Personnel: 28 | Vehicles: 4 | ETA: 12 min</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Aerial Drone Fleet (YOLOv8)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            AIRBORNE RECON
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Live infrared & optical survivor scanning corridor across 12 sq km radius.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">UAVs: 3 Active | Battery: 78% | Link: 5.8 GHz</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">District EMS Trauma Fleet</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            OPERATIONAL
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Advanced life support ambulances coordinated with Bhimavaram Area Hospital.
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">Ambulances: 6 Available | Trauma Beds: 32</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Team Assignment Modal */}
      {isAssignModalOpen && assignIncidentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Assign Response Unit</h3>
              </div>
              <span className="font-mono text-xs text-cyan-400">{assignIncidentTarget.id}</span>
            </div>

            <p className="text-xs text-slate-300">
              Assign tactical response team for <strong>{assignIncidentTarget.location_name}</strong> (
              {assignIncidentTarget.hazard_type}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Response Unit</label>
                <select
                  value={selectedAssignTeam}
                  onChange={(e) => {
                    setSelectedAssignTeam(e.target.value);
                    if (e.target.value.includes('NDRF')) setSelectedAssignType('NDRF');
                    else if (e.target.value.includes('SDRF')) setSelectedAssignType('SDRF');
                    else if (e.target.value.includes('Medical')) setSelectedAssignType('EMS');
                    else setSelectedAssignType('FIRE_RESCUE');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="NDRF 10th Battalion Strike Alpha">NDRF 10th Battalion Strike Alpha</option>
                  <option value="AP SDRF Water Rescue Unit #2">AP SDRF Water Rescue Unit #2</option>
                  <option value="District Fire & Rescue Brigade">District Fire & Rescue Brigade</option>
                  <option value="Emergency Medical Trauma EMS Squad">Emergency Medical Trauma EMS Squad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Unit Classification</label>
                <input
                  type="text"
                  readOnly
                  value={selectedAssignType}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-400 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-900/30"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Report Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialLocation={{ name: activeLocation.name, lat: activeLocation.lat, lng: activeLocation.lng }}
        onIncidentReported={() => {
          fetchIncidents();
        }}
      />

      {/* Scenario Simulator Modal */}
      <ScenarioSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onScenarioApplied={() => {
          fetchIncidents();
        }}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        locationName={activeLocation.name}
        hazardType="COMPOSITE"
        affectedRadiusKm={15}
      />
    </div>
  );
};

export default MissionControlPage;
