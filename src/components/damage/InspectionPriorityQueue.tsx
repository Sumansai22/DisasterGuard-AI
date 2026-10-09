import React, { useState } from 'react';
import {
  ListFilter,
  Search,
  ArrowUpDown,
  Eye,
  ShieldCheck,
  UserCheck,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  DamageAssessmentRecord,
  InspectionPriorityTier,
  PhysicalDamageCategory,
  HumanVerificationStatus,
} from '../../types/damageAssessment';

interface InspectionPriorityQueueProps {
  assessments: DamageAssessmentRecord[];
  selectedAssessmentId?: string;
  onSelectAssessment: (assessment: DamageAssessmentRecord) => void;
  onOpenVerifyModal: (assessment: DamageAssessmentRecord) => void;
  onOpenAssignModal: (assessment: DamageAssessmentRecord) => void;
  onOpenReportModal: (assessment: DamageAssessmentRecord) => void;
  onResetPresets: () => void;
}

export const InspectionPriorityQueue: React.FC<InspectionPriorityQueueProps> = ({
  assessments,
  selectedAssessmentId,
  onSelectAssessment,
  onOpenVerifyModal,
  onOpenAssignModal,
  onOpenReportModal,
  onResetPresets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [hazardFilter, setHazardFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'uncertainty'>('score');

  // Filter and sort
  const safeAssessments = Array.isArray(assessments) ? assessments : [];
  const filtered = safeAssessments.filter((item) => {
    if (!item) return false;
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.district || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || item.priorityTier === priorityFilter;
    const matchesVerification = verificationFilter === 'ALL' || item.verificationStatus === verificationFilter;
    const matchesHazard = hazardFilter === 'ALL' || item.disasterType === hazardFilter;

    return matchesSearch && matchesPriority && matchesVerification && matchesHazard;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') {
      return b.scores.compositePriorityScore - a.scores.compositePriorityScore;
    }
    if (sortBy === 'uncertainty') {
      return b.scores.uncertaintyScore - a.scores.uncertaintyScore;
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getPriorityBadgeStyle = (tier: InspectionPriorityTier) => {
    switch (tier) {
      case 'P1_URGENT':
        return 'bg-red-100 text-red-800 border-red-300 font-black animate-pulse';
      case 'P2_HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
      case 'P3_MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'P4_LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
    }
  };

  const getDamageBadgeStyle = (category: PhysicalDamageCategory) => {
    switch (category) {
      case 'DESTROYED':
        return 'bg-purple-900 text-purple-200 border-purple-700 font-mono font-bold';
      case 'MAJOR_DAMAGE':
        return 'bg-red-900 text-red-200 border-red-700 font-mono font-bold';
      case 'MODERATE_DAMAGE':
        return 'bg-amber-900 text-amber-200 border-amber-700 font-mono font-medium';
      case 'MINOR_DAMAGE':
        return 'bg-blue-900 text-blue-200 border-blue-700 font-mono font-medium';
      case 'UNAFFECTED':
        return 'bg-emerald-900 text-emerald-200 border-emerald-700 font-mono';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden text-xs">
      {/* Top Controls Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
              <span>Inspection Priority Queue (PS-53 Engine)</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                {sorted.length} Records
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ranked by weighted structural damage, population exposure, and access criticality
            </p>
          </div>

          <button
            type="button"
            onClick={onResetPresets}
            className="self-start sm:self-auto px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 transition-colors"
            title="Restore pristine Indian disaster test scenarios"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Scenario Presets</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assessment ID, location, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="P1_URGENT">P1 URGENT (&lt; 2h)</option>
              <option value="P2_HIGH">P2 HIGH (&lt; 6h)</option>
              <option value="P3_MEDIUM">P3 MEDIUM (&lt; 24h)</option>
              <option value="P4_LOW">P4 LOW (Routine)</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Verification</option>
              <option value="VERIFIED_CONFIRMED">Verified Confirmed</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="RE_INSPECTION_REQUESTED">Re-Scan Requested</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium text-slate-700"
            >
              <option value="score">Sort by Priority Score</option>
              <option value="uncertainty">Sort by Uncertainty</option>
              <option value="date">Sort by Last Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / Queue List */}
      <div className="overflow-x-auto max-h-[500px]">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1">
            <Layers className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold">No matching disaster damage assessments found.</p>
            <p className="text-[11px]">Try adjusting your search criteria or reset to scenario presets.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-100/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Assessment ID & Event</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Physical Damage</th>
                <th className="py-2.5 px-3">Evidence & Confidence</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Assigned Inspector</th>
                <th className="py-2.5 px-3">Verification</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((item) => {
                const isSelected = item.id === selectedAssessmentId;
                const evidenceCount = item.visualEvidence?.length || 0;
                const modelConfidence = item.visualEvidence?.[0]?.confidence
                  ? Math.round(item.visualEvidence[0].confidence * 100)
                  : 92;
                const assignedUnit = item.assignedTeam?.teamName || 'Unassigned';

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectAssessment(item)}
                    className={`transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-orange-50/70 border-l-4 border-orange-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Priority Tier */}
                    <td className="py-3 px-3 shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getPriorityBadgeStyle(
                          item.priorityTier
                        )}`}
                      >
                        {item.priorityTier.replace('_', ' ')}
                      </span>
                    </td>

                    {/* ID & Title */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.id} • {item.disasterType}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 truncate max-w-[150px]">
                        {item.locationName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.district}, {item.state}
                      </div>
                    </td>

                    {/* Damage Category */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] border ${getDamageBadgeStyle(
                          item.estimatedDamageCategory
                        )}`}
                      >
                        {item.estimatedDamageCategory}
                      </span>
                    </td>

                    {/* Evidence & Confidence */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-slate-800 font-bold">
                        {evidenceCount} visual {evidenceCount === 1 ? 'cue' : 'cues'}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        {modelConfidence}% AI Conf ({item.postImage.sourcePlatform})
                      </div>
                    </td>

                    {/* Score & Formula Rationale */}
                    <td className="py-3 px-3">
                      <div className="font-black text-slate-900 font-mono text-sm">
                        {item.scores.compositePriorityScore}
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </div>
                      <div className="text-[9px] text-slate-500 max-w-[140px] truncate" title={item.priorityRationale}>
                        {item.priorityRationale}
                      </div>
                    </td>

                    {/* Assigned Inspector / Team */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-slate-800 font-semibold truncate max-w-[120px]" title={assignedUnit}>
                        {assignedUnit}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {item.assignedTeam ? `${item.assignedTeam.teamType} (ETA ${item.assignedTeam.etaMinutes}m)` : 'Awaiting Dispatch'}
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.verificationStatus === 'VERIFIED_CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.verificationStatus === 'PENDING_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.verificationStatus === 'VERIFIED_CONFIRMED' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        )}
                        {item.verificationStatus === 'PENDING_REVIEW' && (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{item.verificationStatus.replace('_', ' ')}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectAssessment(item)}
                          className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 transition-colors"
                          title="Inspect Evidence & Rationale"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenVerifyModal(item)}
                          className="p-1 rounded hover:bg-emerald-100 text-emerald-700"
                          title="Verify or Adjust Priority"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenAssignModal(item)}
                          className="p-1 rounded hover:bg-orange-100 text-orange-700"
                          title="Dispatch Inspection Unit"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenReportModal(item)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-700"
                          title="Generate NDMA PDF Report"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
