import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Analyzing Environmental Conditions...',
  size = 'md',
  fullHeight = false,
}) => {
  const iconSize = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${
        fullHeight ? 'min-h-[400px]' : ''
      }`}
    >
      <Loader2 className={`${iconSize} text-blue-600 animate-spin mb-3`} />
      {message && (
        <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
      )}
    </div>
  );
};
