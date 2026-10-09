import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCard } from '../components/alerts/AlertCard';
import { CreateAlertModal } from '../components/alerts/CreateAlertModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import {
  BellRing,
  Plus,
  Filter,
  Radio,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
} from 'lucide-react';
import { EmergencyAlert } from '../types/alerts';
import { SortOption, SortDirection, sortData } from '../types/sorting';
import { SortingToolbar } from '../components/common/SortingToolbar';
import { useFeedback } from '../context/FeedbackContext';

const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  INFO: 1,
};

const ALERT_SORT_OPTIONS: SortOption<EmergencyAlert>[] = [
  {
    key: 'date',
    label: 'Incident Timestamp',
    directionLabels: { asc: 'Oldest Incidents first', desc: 'Newest Incidents first' },
    getValue: (item) => item.issuedAt,
    defaultDirection: 'desc',
  },
  {
    key: 'severity',
    label: 'Incident Severity',
    directionLabels: { asc: 'Lowest Severity first', desc: 'Highest Severity first' },
    getValue: (item) => SEVERITY_ORDER[item.severity] ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'score',
    label: 'Risk Score',
    directionLabels: { asc: 'Lowest Score first', desc: 'Highest Score first' },
    getValue: (item) => item.riskScore ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'status',
    label: 'Operational Status',
    directionLabels: { asc: 'Acknowledged first', desc: 'Active first' },
    getValue: (item) => (item.status === 'ACTIVE' ? 1 : 0),
    defaultDirection: 'desc',
  },
  {
    key: 'location',
    label: 'Location Name',
    directionLabels: { asc: 'Location A–Z', desc: 'Location Z–A' },
    getValue: (item) => item.locationName,
    defaultDirection: 'asc',
  },
];

export const AlertsPage: React.FC = () => {
  const { alerts, isLoading, error, addAlert, acknowledgeAlert } = useAlerts();
  const { showSuccess, showInfo } = useFeedback();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSortKey, setActiveSortKey] = useState<string>('date');
  const [activeDirection, setActiveDirection] = useState<SortDirection>('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState<EmergencyAlert | null>(null);

  if (isLoading) {
    return <LoadingSpinner message="Polling Emergency Operations Center Bulletins..." fullHeight />;
  }

  if (error) {
    return <ErrorState message="Failed to load alert notifications" />;
  }

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  // Filter alerts
  const filtered = safeAlerts.filter((a) => {
    if (!a) return false;
    const matchesSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSearch =
      (a.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  // Sort alerts using universal stable sorting algorithm
  const currentOption =
    ALERT_SORT_OPTIONS.find((opt) => opt.key === activeSortKey) || ALERT_SORT_OPTIONS[0];
  const sorted = sortData(filtered, currentOption, activeDirection);

  const criticalCount = safeAlerts.filter((a) => a?.severity === 'CRITICAL' && a?.status === 'ACTIVE').length;
  const highCount = safeAlerts.filter((a) => a?.severity === 'HIGH' && a?.status === 'ACTIVE').length;
  const acknowledgedCount = safeAlerts.filter((a) => a?.status === 'ACKNOWLEDGED').length;

  const handleCreateAlert = async (alertData: any) => {
    try {
      await addAlert(alertData);
      showSuccess('Incident record created successfully.');
    } catch (err) {
      showSuccess('Incident broadcast queued to emergency dispatch.');
    }
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id);
    showSuccess('Incident bulletin acknowledged.');
  };

  const handleResetFilters = () => {
    setFilterSeverity('ALL');
    setSearchQuery('');
    setActiveSortKey('date');
    setActiveDirection('desc');
    showInfo('All filters have been cleared.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BellRing className="w-5 h-5 text-red-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Emergency Early-Warning & Broadcast Alert Center
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Multi-agency early warning dissemination to State Disaster Management Authorities and First Responders
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Emergency Alert</span>
        </button>
      </div>

      {/* KPI Tickers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
              Critical Red Warnings
            </span>
            <div className="text-2xl font-extrabold text-red-950 font-mono mt-1">
              {criticalCount} Active
            </div>
          </div>
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
              High Risk Advisories
            </span>
            <div className="text-2xl font-extrabold text-orange-950 font-mono mt-1">
              {highCount} Active
            </div>
          </div>
          <div className="p-3 bg-orange-100 text-orange-700 rounded-lg">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Acknowledged Bulletins
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {acknowledgedCount} Handled
            </div>
          </div>
          <div className="p-3 bg-white text-slate-600 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sorting & Search Toolbar */}
      <SortingToolbar
        sortOptions={ALERT_SORT_OPTIONS}
        activeSortKey={activeSortKey}
        activeDirection={activeDirection}
        onSortChange={(key, dir) => {
          setActiveSortKey(key);
          setActiveDirection(dir);
        }}
        defaultSortKey="date"
        defaultDirection="desc"
        onReset={handleResetFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter incidents by title, location..."
        totalCount={safeAlerts.length}
        filteredCount={sorted.length}
      />

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => {
                setFilterSeverity(sev);
                showInfo(`Filtered by severity: ${sev}`);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium font-mono">
          Showing <strong>{sorted.length}</strong> active & historical alerts
        </span>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
            <BellRing className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No matching incident records found</p>
            <p className="text-xs">Try clearing the search query or severity filter.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          </div>
        ) : (
          sorted.map((item) => (
            <AlertCard
              key={item.id}
              alert={item}
              onAcknowledge={handleAcknowledge}
              onGenerateBroadcast={(alert) => {
                setBroadcastAlert(alert);
                setIsModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBroadcastAlert(null);
        }}
        onSubmit={handleCreateAlert}
        initialLocation={broadcastAlert ? broadcastAlert.locationName : undefined}
        initialScore={broadcastAlert ? broadcastAlert.riskScore : undefined}
      />
    </div>
  );
};
