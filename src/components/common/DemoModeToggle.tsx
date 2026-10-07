import React from 'react';
import { Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoModeToggle: React.FC = () => {
  const { isDemoMode, setIsDemoMode } = useApp();

  return (
    <button
      onClick={() => setIsDemoMode(!isDemoMode)}
      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer ${
        isDemoMode
          ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      }`}
      title={isDemoMode ? "Active: SIH Demo Mode Simulation (Click for Live API Mode)" : "Active: Live API Mode (Click for Demo Mode)"}
      aria-label="Toggle between Live API Mode and SIH Demo Mode Simulation"
    >
      <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isDemoMode ? 'text-amber-600' : 'text-slate-400'}`} />
      <span className="font-bold tracking-tight hidden 2xl:inline whitespace-nowrap">
        {isDemoMode ? 'DEMO MODE ACTIVE' : 'LIVE API MODE'}
      </span>
      <span className="font-bold tracking-tight hidden md:inline 2xl:hidden whitespace-nowrap">
        {isDemoMode ? 'DEMO' : 'LIVE'}
      </span>
      {isDemoMode ? (
        <ToggleRight className="w-4 h-4 text-amber-600 shrink-0" />
      ) : (
        <ToggleLeft className="w-4 h-4 text-slate-400 shrink-0" />
      )}
    </button>
  );
};
