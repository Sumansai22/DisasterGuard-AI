import React from 'react';
import { RiskLevel } from '../../types/prediction';
import { getRiskColor } from '../../utils/riskLevel';

interface RiskGaugeProps {
  score: number; // 0-100
  riskLevel: RiskLevel;
  size?: number;
  strokeWidth?: number;
  showDetails?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  riskLevel,
  size = 200,
  strokeWidth = 14,
  showDetails = true,
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use 240 degree arc for gauge effect or full circle
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = getRiskColor(riskLevel);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 transition-all duration-700 ease-out drop-shadow-sm"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
          {score}
        </span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
          Score / 100
        </span>
        {showDetails && (
          <span
            className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${color}15`,
              color: color,
            }}
          >
            {riskLevel} RISK
          </span>
        )}
      </div>
    </div>
  );
};
