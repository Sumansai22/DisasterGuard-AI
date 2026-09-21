import React from 'react';
import { RiskLevel } from '../../types/prediction';
import { getRiskBadgeClasses } from '../../utils/riskLevel';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showDot = true,
}) => {
  const classes = getRiskBadgeClasses(level);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${classes.bg} ${classes.text} ${classes.border} ${sizeClasses}`}
    >
      {showDot && (
        <span
          className={`h-2 w-2 rounded-full ${classes.dot} ${
            level === 'CRITICAL' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{level}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono text-[11px]">({score}/100)</span>
      )}
    </span>
  );
};
