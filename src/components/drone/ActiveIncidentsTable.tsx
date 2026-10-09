import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Radio,
  MapPin,
  Clock,
  Filter,
} from 'lucide-react';
import { TrackedPersonDetection } from '../../types/droneRescue';
import { SortOption, SortDirection, sortData } from '../../types/sorting';
import { SortingToolbar } from '../common/SortingToolbar';

interface ActiveIncidentsTableProps {
  detections: TrackedPersonDetection[];
  onVerify: (detectionId: string) => void;
  onMarkFalsePositive: (detectionId: string) => void;
  onOpenDispatchModal: (detection: TrackedPersonDetection) => void;
  onSelectDetection: (detection: TrackedPersonDetection) => void;
}

const DRONE_INCIDENT_SORT_OPTIONS: SortOption<TrackedPersonDetection>[] = [
  {
    key: 'distress_score',
    label: 'Distress Score',
    directionLabels: { desc: 'Highest Distress', asc: 'Lowest Distress' },
    getValue: (d: TrackedPersonDetection) => d.distress_score ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'priority',
    label: 'Priority Tier',
    directionLabels: { desc: 'Critical → Low', asc: 'Low → Critical' },
    getValue: (d: TrackedPersonDetection) => (d.priority === 'CRITICAL' ? 3 : d.priority === 'HIGH' ? 2 : d.priority === 'MEDIUM' ? 1 : 0),
    defaultDirection: 'desc',
  },
  {
    key: 'confidence',
    label: 'AI Confidence',
    directionLabels: { desc: 'Highest Conf', asc: 'Lowest Conf' },
    getValue: (d: TrackedPersonDetection) => d.confidence ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'timestamp_sec',
    label: 'Scan Timestamp',
    directionLabels: { desc: 'Latest First', asc: 'Earliest First' },
    getValue: (d: TrackedPersonDetection) => d.timestamp_sec ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'status',
    label: 'Status',
    directionLabels: { asc: 'A → Z', desc: 'Z → A' },
    getValue: (d: TrackedPersonDetection) => d.status ?? '',
    defaultDirection: 'asc',
  },
];

export const ActiveIncidentsTable: React.FC<ActiveIncidentsTableProps> = ({
  detections,
  onVerify,
  onMarkFalsePositive,
  onOpenDispatchModal,
  onSelectDetection,
}) => {
  const [sortKey, setSortKey] = useState<string>('distress_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedDetections = useMemo(() => {
    const activeOpt = DRONE_INCIDENT_SORT_OPTIONS.find((o) => o.key === sortKey) || DRONE_INCIDENT_SORT_OPTIONS[0];
    return sortData(detections, activeOpt, sortDirection);
  }, [detections, sortKey, sortDirection]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-2">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
            ACTIVE RESCUE INCIDENTS & DISPATCH LEDGER
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700">
            {detections.length} Incident Record{detections.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Sorting Toolbar */}
      {detections.length > 1 && (
        <div className="px-4">
          <SortingToolbar<TrackedPersonDetection>
            sortOptions={DRONE_INCIDENT_SORT_OPTIONS}
            activeSortKey={sortKey}
            activeDirection={sortDirection}
            onSortChange={(key, dir) => {
              setSortKey(key);
              setSortDirection(dir);
            }}
            defaultSortKey="distress_score"
            defaultDirection="desc"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-100 text-slate-600 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Person / Target</th>
              <th className="px-4 py-3">Hazard Context</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Distress Score</th>
              <th className="px-4 py-3">Location / Coords</th>
              <th className="px-4 py-3">Incident Status</th>
              <th className="px-4 py-3 text-right">Operator Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {detections.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No active rescue detections in current mission scan.
                </td>
              </tr>
            ) : (
              sortedDetections.map((det) => {
                const isHighOrCrit = det.priority === 'CRITICAL' || det.priority === 'HIGH';
                const isMed = det.priority === 'MEDIUM';

                const priorityBadge =
                  det.priority === 'CRITICAL'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : det.priority === 'HIGH'
                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                    : det.priority === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                const statusBadge =
                  det.status === 'DISPATCHED'
                    ? 'bg-blue-100 text-blue-800 font-bold'
                    : det.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                    : det.status === 'FALSE_POSITIVE'
                    ? 'bg-slate-100 text-slate-500 line-through'
                    : 'bg-amber-50 text-amber-800';

                return (
                  <tr
                    key={det.detection_id}
                    onClick={() => onSelectDetection(det)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {/* Priority */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${priorityBadge}`}>
                        {det.priority === 'CRITICAL' ? '🔴 CRITICAL' : det.priority === 'HIGH' ? '🟠 HIGH' : det.priority === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                      </span>
                    </td>

                    {/* Person */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono">
                        <span>{det.person_id}</span>
                        <span className="text-slate-400 font-normal text-[10px]">({det.timestamp_str})</span>
                      </div>
                    </td>

                    {/* Hazard Context */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">
                        {det.hazard_context || 'DISASTER'}
                      </span>
                    </td>

                    {/* AI Confidence */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-slate-700">
                      {(det.confidence * 100).toFixed(0)}%
                    </td>

                    {/* Distress Score */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                      <span className={`font-extrabold ${isHighOrCrit ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {(det.distress_score * 100).toFixed(0)}%
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono truncate max-w-xs" title={det.location_label}>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{det.location_label || 'Image-relative (X, Y)'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase ${statusBadge}`}>
                        {det.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {det.status === 'AI_DETECTED' || det.status === 'PENDING_VERIFICATION' ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onVerify(det.detection_id);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-bold transition-all"
                            >
                              Verify
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkFalsePositive(det.detection_id);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 text-[11px] font-medium transition-all"
                            >
                              False Pos.
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDispatchModal(det);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                            >
                              <Radio className="w-3 h-3" /> Alert
                            </button>
                          </>
                        ) : det.status === 'VERIFIED' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDispatchModal(det);
                            }}
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <Radio className="w-3 h-3" /> Dispatch Rescue
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400 italic">
                            {det.status === 'DISPATCHED' ? 'Dispatched' : 'Closed'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
