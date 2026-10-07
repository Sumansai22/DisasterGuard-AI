import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: {
    text: string;
    variant: 'danger' | 'warning' | 'success' | 'neutral';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  badge,
  onClick,
}) => {
  const getBadgeClasses = (variant: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-4 sm:p-4.5 shadow-xs hover:shadow-md transition-all duration-200 w-full min-w-0 box-border flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate" title={title}>
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap min-w-0">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono truncate">
              {value}
            </h3>
            {badge && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 font-mono ${getBadgeClasses(
                  badge.variant
                )}`}
              >
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-500 font-medium truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} shrink-0 mt-0.5`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};
