import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Loader2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useFeedback } from '../../context/FeedbackContext';
import { FeedbackItem, FeedbackType } from '../../types/feedback';

const ICONS: Record<FeedbackType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
  error: <AlertOctagon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
  info: <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />,
  loading: <Loader2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 animate-spin" />,
};

const BORDER_STYLES: Record<FeedbackType, string> = {
  success: 'border-l-4 border-l-emerald-500 border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-emerald-950/10',
  error: 'border-l-4 border-l-red-500 border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-red-950/15',
  warning: 'border-l-4 border-l-amber-500 border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-amber-950/10',
  info: 'border-l-4 border-l-cyan-500 border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-cyan-950/10',
  loading: 'border-l-4 border-l-orange-500 border-slate-200 bg-white/95 text-slate-900 shadow-lg shadow-orange-950/10',
};

const BADGE_STYLES: Record<FeedbackType, string> = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  loading: 'bg-orange-50 text-orange-800 border-orange-200',
};

const ToastItem: React.FC<{
  item: FeedbackItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const isAlert = item.type === 'error' || item.type === 'warning';

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      className={`pointer-events-auto w-full max-w-sm sm:max-w-md rounded-xl border p-3.5 backdrop-blur-md transition-all duration-300 ease-out transform translate-y-0 opacity-100 flex items-start gap-3 relative ${BORDER_STYLES[item.type]}`}
    >
      {ICONS[item.type]}

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono ${BADGE_STYLES[item.type]}`}
          >
            {item.type}
          </span>
          {item.title && (
            <span className="text-xs font-bold text-slate-900 truncate">
              {item.title}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-700 leading-snug break-words font-medium">
          {item.message}
        </p>

        {item.details && (
          <p className="mt-1 text-[11px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded border border-slate-100 break-words">
            {item.details}
          </p>
        )}

        {item.action && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => {
                item.action?.onClick();
                onDismiss(item.id);
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              {item.action.label}
            </button>
          </div>
        )}
      </div>

      {item.dismissible && (
        <button
          onClick={() => onDismiss(item.id)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const FeedbackToastContainer: React.FC = () => {
  const { feedbacks, dismissFeedback } = useFeedback();

  if (feedbacks.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed top-18 right-4 sm:right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-full sm:max-w-md w-full"
    >
      {feedbacks.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={dismissFeedback} />
      ))}
    </div>
  );
};
