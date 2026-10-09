import React from 'react';
import { Play, Sparkles } from 'lucide-react';
import { useDemoTour } from '../../context/DemoTourContext';

interface DemoTourButtonProps {
  variant?: 'navbar' | 'hero' | 'compact';
  className?: string;
}

export const DemoTourButton: React.FC<DemoTourButtonProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { openDemoTour, isOpen } = useDemoTour();

  if (variant === 'hero') {
    return (
      <button
        onClick={() => openDemoTour(0)}
        className={`group relative inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-orange-400/40 cursor-pointer overflow-hidden ${className}`}
        title="Launch Interactive Hackathon Jury Demo Walkthrough"
      >
        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
        <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-current shrink-0" />
        <span className="tracking-wide uppercase font-extrabold whitespace-nowrap">
          ▶ Start Project Demo
        </span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={() => openDemoTour(0)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/20 hover:scale-[1.02] transition-all border border-orange-400/30 ${className}`}
        title="Launch Interactive Hackathon Jury Demo Walkthrough"
      >
        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
        <span className="whitespace-nowrap">Demo</span>
      </button>
    );
  }

  // Default navbar variant
  return (
    <button
      onClick={() => openDemoTour(0)}
      className={`group relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 shadow-md shadow-orange-600/25 hover:shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-orange-400/50 cursor-pointer shrink-0 animate-pulse hover:animate-none ${className}`}
      title="Launch Interactive Hackathon Jury Demo Walkthrough"
      aria-label="Start DisasterGuard AI Project Demo"
    >
      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Play className="w-2.5 h-2.5 text-white fill-current translate-x-0.2" />
      </div>
      <span className="hidden md:inline whitespace-nowrap tracking-wide uppercase font-extrabold">
        ▶ Start Project Demo
      </span>
      <span className="md:hidden whitespace-nowrap tracking-wide font-extrabold">
        ▶ Demo
      </span>
    </button>
  );
};

export default DemoTourButton;
