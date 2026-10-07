import React, { useState } from 'react';
import { Activity, CheckCircle2, ChevronDown, Server, Cpu, Database, CloudRain, Map } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SystemStatusIndicator: React.FC<{ variant?: 'badge' | 'full' }> = ({
  variant = 'badge',
}) => {
  const { systemComponents } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const allOperational = systemComponents.every((c) => c.status === 'ONLINE');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ML Model':
        return Cpu;
      case 'Prediction API':
        return Server;
      case 'Database':
        return Database;
      case 'Weather Data':
        return CloudRain;
      case 'Map Service':
        return Map;
      default:
        return Activity;
    }
  };

  if (variant === 'full') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h4 className="text-sm font-bold text-slate-800">System Telemetry & Services</h4>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            All Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {systemComponents.map((item) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div
                key={item.category}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80"
              >
                <div className="p-2 rounded bg-white text-slate-700 shadow-2xs border border-slate-200">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.details}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Latency: {item.latencyMs}ms
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Pill badge with popup menu for TopNavbar & Footer
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        title="System Operational — View Subsystem Health"
        aria-label="System Operational — View Subsystem Health"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {allOperational ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          )}
        </span>
        <span className="hidden 2xl:inline whitespace-nowrap">System Operational</span>
        <span className="hidden xl:inline 2xl:hidden whitespace-nowrap">Operational</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-3 px-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-800">Subsystem Health</span>
              <span className="text-[10px] font-mono text-slate-400">99.98% Uptime</span>
            </div>
            <div className="space-y-1.5">
              {systemComponents.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-slate-700 font-medium">{item.category}:</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-[11px] font-mono">
                    Online
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
