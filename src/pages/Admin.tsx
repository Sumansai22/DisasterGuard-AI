import React, { useState } from 'react';
import { ThresholdConfig } from '../components/admin/ThresholdConfig';
import { StationManager } from '../components/admin/StationManager';
import { SystemStatusIndicator } from '../components/common/SystemStatus';
import {
  ShieldCheck,
  Server,
  Sliders,
  MapPin,
  FileText,
  Users,
  Activity,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'stations' | 'thresholds' | 'system' | 'logs' | 'users'
  >('stations');

  const logs = [
    { id: '1', time: '15:18:22', level: 'INFO', msg: 'POST /api/predict 200 OK — Munnar Sector inference (risk: 87)' },
    { id: '2', time: '15:15:04', level: 'INFO', msg: 'Rainfall telemetry ingest sync complete — 7 stations polled' },
    { id: '3', time: '15:10:19', level: 'WARN', msg: 'Pore-water pressure sensor STN-WAYANAD-02 crossed 85% threshold' },
    { id: '4', time: '15:02:45', level: 'INFO', msg: 'Automated health-check: ML model landslide_model.pkl verified' },
    { id: '5', time: '14:48:12', level: 'INFO', msg: 'Disaster SMS cell broadcast token dispatched to District Collectorate' },
  ];

  const adminUsers = [
    { name: 'Dr. R. K. Nair', role: 'Principal Geologist & Administrator', dept: 'Geological Survey of India', status: 'Active' },
    { name: 'Officer S. Sharma', role: 'Emergency Operations Lead', dept: 'State Disaster Management Authority (SDMA)', status: 'Active' },
    { name: 'Eng. P. Varma', role: 'Field Telemetry Engineer', dept: 'IMD Automated Sensor Grid', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Platform Administration & System Configuration
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Manage field telemetry stations, threshold parameters, model lifecycle, and access control
          </p>
        </div>

        <span className="px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          Admin Session: Root Authority
        </span>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'stations', label: 'Monitoring Locations', icon: MapPin },
          { key: 'thresholds', label: 'Alert Thresholds', icon: Sliders },
          { key: 'system', label: 'System Health & APIs', icon: Activity },
          { key: 'logs', label: 'Audit & Telemetry Logs', icon: FileText },
          { key: 'users', label: 'Authorized Operators', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'stations' && <StationManager />}

      {activeTab === 'thresholds' && <ThresholdConfig />}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <SystemStatusIndicator variant="full" />
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">System Telemetry & Audit Logs</h4>
              <p className="text-xs text-slate-500">Live stream of API inference calls, alert dispatches, and sensor syncs</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Live Stream Active
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3"
              >
                <span className="text-slate-400 font-bold">{log.time}</span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                    log.level === 'WARN'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-slate-800 font-sans flex-1">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Authorized Disaster Response Personnel</h4>
              <p className="text-xs text-slate-500">Role-based access control for early warning broadcasts</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {adminUsers.map((u) => (
              <div key={u.name} className="py-3 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{u.name}</h5>
                  <p className="text-[11px] text-slate-500">{u.role} • {u.dept}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
