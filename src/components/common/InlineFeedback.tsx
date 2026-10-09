import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { FeedbackType } from '../../types/feedback';

interface InlineFeedbackProps {
  type: FeedbackType;
  message: string;
  title?: string;
  details?: string;
  onRetry?: () => void;
  className?: string;
}

const ICONS: Record<FeedbackType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
  error: <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
  info: <Info className="w-4 h-4 text-cyan-600 shrink-0" />,
  loading: <Loader2 className="w-4 h-4 text-orange-600 shrink-0 animate-spin" />,
};

const CONTAINER_STYLES: Record<FeedbackType, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-amber-50 border-amber-200 text-amber-900',
  info: 'bg-cyan-50 border-cyan-200 text-cyan-900',
  loading: 'bg-orange-50 border-orange-200 text-orange-900',
};

export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  type,
  message,
  title,
  details,
  onRetry,
  className = '',
}) => {
  const isAlert = type === 'error' || type === 'warning';

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={`rounded-xl border p-3 flex items-start gap-2.5 text-xs font-medium ${CONTAINER_STYLES[type]} ${className}`}
    >
      <div className="mt-0.5">{ICONS[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <span className="block font-bold mb-0.5">{title}</span>}
        <span className="leading-relaxed">{message}</span>
        {details && (
          <p className="mt-1 text-[11px] font-mono opacity-80 break-words">
            {details}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 px-2 py-1 rounded bg-white/80 hover:bg-white text-slate-800 font-bold border border-current/20 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
