import React from 'react';
import { DataProvenanceStatus } from '../../types/disasterManagement';

interface DataProvenanceBadgeProps {
  status: DataProvenanceStatus;
  source?: string;
  updatedAt?: string;
  confidence?: number;
  className?: string;
}

export const DataProvenanceBadge: React.FC<DataProvenanceBadgeProps> = ({
  status,
  source,
  updatedAt,
  confidence,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'LIVE':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-700/80';
      case 'FORECAST':
        return 'bg-blue-950/80 text-blue-400 border-blue-700/80';
      case 'MODEL_ESTIMATE':
        return 'bg-amber-950/80 text-amber-400 border-amber-700/80';
      case 'SATELLITE':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-700/80';
      case 'SENSOR':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'ESTIMATED':
        return 'bg-purple-950/80 text-purple-400 border-purple-700/80';
      case 'DEMO':
        return 'bg-amber-950/50 text-amber-300 border-amber-600/80';
      case 'UNAVAILABLE':
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'LIVE':
        return '● LIVE';
      case 'FORECAST':
        return 'FORECAST';
      case 'MODEL_ESTIMATE':
        return 'MODEL ESTIMATE';
      case 'SATELLITE':
        return 'SATELLITE';
      case 'SENSOR':
        return 'SENSOR TELEMETRY';
      case 'ESTIMATED':
        return 'ESTIMATED';
      case 'DEMO':
        return 'DEMO DATA';
      case 'UNAVAILABLE':
        return 'UNAVAILABLE';
      default:
        return status;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-[10px] ${className}`}>
      <span
        className={`px-2 py-0.5 rounded-full border font-bold tracking-wider uppercase transition-colors ${getBadgeStyle()}`}
        title={
          source || updatedAt
            ? `Source: ${source || 'System'}${updatedAt ? ` | Updated: ${updatedAt}` : ''}${
                confidence !== undefined ? ` | Confidence: ${Math.round(confidence * 100)}%` : ''
              }`
            : undefined
        }
      >
        {getLabel()}
      </span>
      {source && <span className="text-slate-500 text-[10px] hidden sm:inline truncate max-w-[120px]">{source}</span>}
    </div>
  );
};
