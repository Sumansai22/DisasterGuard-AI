import React from 'react';
import { History, ShieldAlert, ShieldCheck, Clock, FileText } from 'lucide-react';
import { ScanHistoryRecord, SeverityLevel } from '../../types/landScan';

interface ScanHistoryProps {
  history: ScanHistoryRecord[];
  isLoading: boolean;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({ history, isLoading }) => {
  const getSeverityBadge = (level: SeverityLevel) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ELEVATED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-orange-600" />
          <span>Recent Land Image Scans</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {history.length} record(s) recorded in database
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading scan records...
        </div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 space-y-1">
          <FileText className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-500">No previous scan records found.</p>
          <p className="text-[11px] text-slate-400">Upload a terrain image above to execute your first U-Net scan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Landslide Area %</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {history.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 max-w-[180px] truncate" title={scan.filename}>
                    {scan.filename}
                  </td>
                  <td className="py-3 px-3 text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(scan.created_at)}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {scan.landslide_percentage}%
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(scan.severity)}`}>
                      {scan.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {Math.round(scan.confidence * 100)}%
                  </td>
                  <td className="py-3 px-3">
                    {scan.landslide_detected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                        <ShieldAlert className="w-3.5 h-3.5" /> LANDSLIDE RISK DETECTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" /> CLEAR
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
