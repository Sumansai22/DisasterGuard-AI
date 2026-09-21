import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 border-b border-slate-800 transition-all flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="text-amber-300 font-semibold">Decision-Support Notice:</strong>{' '}
          LandslideGuard AI provides estimated landslide probabilities and early-warning indicators for situational awareness. Tactical evacuation decisions must be verified with National Disaster Management Authority (NDMA) & state authorities.
        </span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-slate-400 hover:text-white p-1 rounded transition-colors"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
