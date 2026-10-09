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
} from 'lucide-react';
import { EmergencyAlert } from '../types/alerts';

export const AlertsPage: React.FC = () => {
  const { alerts, isLoading, error, addAlert, acknowledgeAlert } = useAlerts();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState<EmergencyAlert | null>(null);

  if (isLoading) {
    return <LoadingSpinner message="Polling Emergency Operations Center Bulletins..." fullHeight />;
  }

  if (error) {
    return <ErrorState message="Failed to load alert notifications" />;
  }

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const filtered = safeAlerts.filter(
    (a) => a && (filterSeverity === 'ALL' || a.severity === filterSeverity)
  );

  const criticalCount = safeAlerts.filter((a) => a?.severity === 'CRITICAL' && a?.status === 'ACTIVE').length;
  const highCount = safeAlerts.filter((a) => a?.severity === 'HIGH' && a?.status === 'ACTIVE').length;
  const acknowledgedCount = safeAlerts.filter((a) => a?.status === 'ACKNOWLEDGED').length;

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
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
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

      {/* Severity Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{filtered.length}</strong> alerts
        </span>
      </div>

      {/* Alert Cards Feed */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <AlertCard
            key={item.id}
            alert={item}
            onAcknowledge={acknowledgeAlert}
            onGenerateBroadcast={(alert) => {
              setBroadcastAlert(alert);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBroadcastAlert(null);
        }}
        onSubmit={addAlert}
        initialLocation={broadcastAlert ? broadcastAlert.locationName : undefined}
        initialScore={broadcastAlert ? broadcastAlert.riskScore : undefined}
      />
    </div>
  );
};
