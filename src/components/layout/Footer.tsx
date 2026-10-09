import React from 'react';
import { ShieldCheck, Cpu, HardDriveDownload, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-xs text-slate-500 w-full min-w-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full min-w-0">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 text-center md:text-left min-w-0">
          <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="font-semibold text-slate-800 shrink-0">
            DisasterGuard AI — Ai Verse (Team Heroshi)
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500">Disaster Damage Prioritization System</span>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-4 text-[11px] font-mono shrink-0">
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
