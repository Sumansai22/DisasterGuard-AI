import React from 'react';
import { ShieldCheck, Cpu, HardDriveDownload, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { isDemoMode } = useApp();

  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span className="font-semibold text-slate-800">
            DisasterGuard AI — SIH26001
          </span>
          <span className="text-slate-300">•</span>
          <span>Multi-Hazard Disaster Management & Early Warning System</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-orange-500" />
            Model: <strong className="text-slate-800">landslide_model.pkl</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>9 Features RandomForest</span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Telemetry Synced
          </span>
        </div>
      </div>
    </footer>
  );
};
