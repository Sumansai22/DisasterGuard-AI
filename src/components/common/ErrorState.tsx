import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Temporarily Unavailable',
  message = 'LandslideGuard prediction backend is currently unreachable. Operating in local decision-support fallback mode.',
  onRetry,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
        <span className="flex-1">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-2 py-1 bg-white hover:bg-red-50 text-red-700 font-semibold rounded border border-red-300"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-sm">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reconnect / Retry
        </button>
      )}
    </div>
  );
};
