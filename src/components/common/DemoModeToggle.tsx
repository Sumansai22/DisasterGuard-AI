import React from 'react';
import { Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoModeToggle: React.FC = () => {
  const { isDemoMode, setIsDemoMode } = useApp();

  return (
    <button
      onClick={() => setIsDemoMode(!isDemoMode)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 shadow-2xs ${
        isDemoMode
          ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      }`}
      title="Toggle between Live API and SIH Demo Mode Simulation"
    >
      <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-600' : 'text-slate-400'}`} />
      <span className="font-bold tracking-tight">
        {isDemoMode ? 'DEMO MODE ACTIVE' : 'LIVE API MODE'}
      </span>
      {isDemoMode ? (
        <ToggleRight className="w-4 h-4 text-amber-600" />
      ) : (
        <ToggleLeft className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
};
