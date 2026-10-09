import React, { useState } from 'react';
import {
  ListFilter,
  Search,
  ArrowUpDown,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
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
import { SortOption, SortDirection, sortData } from '../../types/sorting';
import { SortingToolbar } from '../common/SortingToolbar';
import { useFeedback } from '../../context/FeedbackContext';

interface InspectionPriorityQueueProps {
  assessments: DamageAssessmentRecord[];
  selectedAssessmentId?: string;
  onSelectAssessment: (assessment: DamageAssessmentRecord) => void;
  onOpenVerifyModal: (assessment: DamageAssessmentRecord) => void;
  onOpenAssignModal: (assessment: DamageAssessmentRecord) => void;
  onOpenReportModal: (assessment: DamageAssessmentRecord) => void;
  onResetPresets: () => void;
}

const DAMAGE_RANK: Record<string, number> = {
  DESTROYED: 4,
  MAJOR_DAMAGE: 3,
  MODERATE_DAMAGE: 2,
  MINOR_DAMAGE: 1,
  UNAFFECTED: 0,
};

const QUEUE_SORT_OPTIONS: SortOption<DamageAssessmentRecord>[] = [
  {
    key: 'score',
    label: 'Priority Score',
    directionLabels: { asc: 'Lowest Priority first', desc: 'Highest Priority first' },
    getValue: (item) => item.scores?.compositePriorityScore ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'date',
    label: 'Assessment Date',
    directionLabels: { asc: 'Oldest Assessment first', desc: 'Newest Assessment first' },
    getValue: (item) => item.updatedAt || item.createdAt,
    defaultDirection: 'desc',
  },
  {
    key: 'location',
    label: 'Location Name',
    directionLabels: { asc: 'Location A–Z', desc: 'Location Z–A' },
    getValue: (item) => item.locationName,
    defaultDirection: 'asc',
  },
  {
    key: 'verification',
    label: 'Verification Status',
    directionLabels: { asc: 'Unverified first', desc: 'Verified first' },
    getValue: (item) =>
      item.verificationStatus === 'PENDING_REVIEW' ? 0 : 1,
    defaultDirection: 'asc',
  },
  {
    key: 'damage',
    label: 'Damage Severity',
    directionLabels: { asc: 'Lowest Damage first', desc: 'Highest Damage first' },
    getValue: (item) => DAMAGE_RANK[item.estimatedDamageCategory] ?? 0,
    defaultDirection: 'desc',
  },
  {
    key: 'uncertainty',
    label: 'AI Uncertainty',
    directionLabels: { asc: 'Lowest Uncertainty first', desc: 'Highest Uncertainty first' },
    getValue: (item) => item.scores?.uncertaintyScore ?? 0,
    defaultDirection: 'desc',
  },
];

export const InspectionPriorityQueue: React.FC<InspectionPriorityQueueProps> = ({
  assessments,
  selectedAssessmentId,
  onSelectAssessment,
  onOpenVerifyModal,
  onOpenAssignModal,
  onOpenReportModal,
  onResetPresets,
}) => {
  const { showSuccess, showInfo } = useFeedback();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [hazardFilter, setHazardFilter] = useState<string>('ALL');

  // Sorting state
  const [activeSortKey, setActiveSortKey] = useState<string>('score');
  const [activeDirection, setActiveDirection] = useState<SortDirection>('desc');

  const safeAssessments = Array.isArray(assessments) ? assessments : [];

  // Filter
  const filtered = safeAssessments.filter((item) => {
    if (!item) return false;
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.district || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || item.priorityTier === priorityFilter;
    const matchesVerification =
      verificationFilter === 'ALL' || item.verificationStatus === verificationFilter;
    const matchesHazard = hazardFilter === 'ALL' || item.disasterType === hazardFilter;

    return matchesSearch && matchesPriority && matchesVerification && matchesHazard;
  });

  // Sort using stable universal algorithm
  const currentOption =
    QUEUE_SORT_OPTIONS.find((opt) => opt.key === activeSortKey) || QUEUE_SORT_OPTIONS[0];
  const sorted = sortData(filtered, currentOption, activeDirection);

  const handleHeaderSortClick = (key: string) => {
    if (activeSortKey === key) {
      const nextDir: SortDirection = activeDirection === 'asc' ? 'desc' : 'asc';
      setActiveDirection(nextDir);
      const opt = QUEUE_SORT_OPTIONS.find((o) => o.key === key);
      const label = opt?.directionLabels?.[nextDir] || nextDir;
      showInfo(`Sorted by ${opt?.label || key} — ${label}`);
    } else {
      const opt = QUEUE_SORT_OPTIONS.find((o) => o.key === key);
      const initialDir = opt?.defaultDirection || 'desc';
      setActiveSortKey(key);
      setActiveDirection(initialDir);
      const label = opt?.directionLabels?.[initialDir] || initialDir;
      showInfo(`Sorted by ${opt?.label || key} — ${label}`);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setVerificationFilter('ALL');
    setHazardFilter('ALL');
    setActiveSortKey('score');
    setActiveDirection('desc');
    showInfo('All filters and sorting reset to default.');
  };

  const handleResetPresetsWithFeedback = () => {
    onResetPresets();
    showSuccess('Inspection priority scenarios reset to verified baseline records.');
  };

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

  const getVerificationIcon = (status: HumanVerificationStatus) => {
    switch (status) {
      case 'VERIFIED_CONFIRMED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'RE_INSPECTION_REQUESTED':
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'PENDING_REVIEW':
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetPresetsWithFeedback}
              className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="Restore pristine Indian disaster test scenarios"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Scenario Presets</span>
            </button>
          </div>
        </div>

        {/* Sorting Toolbar */}
        <SortingToolbar
          sortOptions={QUEUE_SORT_OPTIONS}
          activeSortKey={activeSortKey}
          activeDirection={activeDirection}
          onSortChange={(key, dir) => {
            setActiveSortKey(key);
            setActiveDirection(dir);
          }}
          defaultSortKey="score"
          defaultDirection="desc"
          onReset={handleResetFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search assessment ID, location, district..."
          totalCount={safeAssessments.length}
          filteredCount={sorted.length}
        />

        {/* Filter Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <ListFilter className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                showInfo(`Priority filter: ${e.target.value}`);
              }}
              className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priority Tiers</option>
              <option value="P1_URGENT">P1 URGENT (&lt; 2h SLA)</option>
              <option value="P2_HIGH">P2 HIGH (&lt; 6h SLA)</option>
              <option value="P3_MEDIUM">P3 MEDIUM (&lt; 24h SLA)</option>
              <option value="P4_LOW">P4 LOW (Routine Monitor)</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <ShieldCheck className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                showInfo(`Verification filter: ${e.target.value}`);
              }}
              className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Verification States</option>
              <option value="VERIFIED_CONFIRMED">Verified Confirmed</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="UNVERIFIED">Unverified Only</option>
              <option value="RE_INSPECTION_REQUESTED">Re-Inspection Requested</option>
            </select>
          </div>

          {/* Hazard Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <AlertTriangle className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={hazardFilter}
              onChange={(e) => {
                setHazardFilter(e.target.value);
                showInfo(`Hazard filter: ${e.target.value}`);
              }}
              className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Multi-Hazards</option>
              <option value="LANDSLIDE">Landslides / Debris Flow</option>
              <option value="FLOOD">Flash Floods</option>
              <option value="CYCLONE">Severe Cyclonic Storm</option>
              <option value="EARTHQUAKE">Seismic Ground Deformation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / Queue List */}
      <div className="overflow-x-auto max-h-[520px]">
        {sorted.length === 0 ? (
          <div className="p-10 text-center text-slate-400 space-y-2">
            <Layers className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No matching disaster damage assessments found.</p>
            <p className="text-[11px]">Try adjusting your search query, sorting, or reset filters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-100/90 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 select-none">
                <th
                  onClick={() => handleHeaderSortClick('score')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Click to sort by Priority Tier / Score"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    {activeSortKey === 'score' ? (
                      activeDirection === 'desc' ? (
                        <ArrowDownNarrowWide className="w-3 h-3 text-orange-600" />
                      ) : (
                        <ArrowUpNarrowWide className="w-3 h-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSortClick('date')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Click to sort by Assessment Date"
                >
                  <div className="flex items-center gap-1">
                    <span>Assessment ID & Event</span>
                    {activeSortKey === 'date' ? (
                      activeDirection === 'desc' ? (
                        <ArrowDownNarrowWide className="w-3 h-3 text-orange-600" />
                      ) : (
                        <ArrowUpNarrowWide className="w-3 h-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSortClick('location')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Click to sort by Location Name"
                >
                  <div className="flex items-center gap-1">
                    <span>Location</span>
                    {activeSortKey === 'location' ? (
                      activeDirection === 'desc' ? (
                        <ArrowDownNarrowWide className="w-3 h-3 text-orange-600" />
                      ) : (
                        <ArrowUpNarrowWide className="w-3 h-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSortClick('damage')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Click to sort by Physical Damage"
                >
                  <div className="flex items-center gap-1">
                    <span>Physical Damage</span>
                    {activeSortKey === 'damage' ? (
                      activeDirection === 'desc' ? (
                        <ArrowDownNarrowWide className="w-3 h-3 text-orange-600" />
                      ) : (
                        <ArrowUpNarrowWide className="w-3 h-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSortClick('uncertainty')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Click to sort by AI Confidence & Uncertainty"
                >
                  <div className="flex items-center gap-1">
                    <span>Confidence & Uncertainty</span>
                    {activeSortKey === 'uncertainty' ? (
                      activeDirection === 'desc' ? (
                        <ArrowDownNarrowWide className="w-3 h-3 text-orange-600" />
                      ) : (
                        <ArrowUpNarrowWide className="w-3 h-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSortClick('score')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Click to sort by Composite Priority Score"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority Score</span>
                    {activeSortKey === 'score' ? (
                      activeDirection === 'desc' ? (
                        <ArrowDownNarrowWide className="w-3 h-3 text-orange-600" />
                      ) : (
                        <ArrowUpNarrowWide className="w-3 h-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleHeaderSortClick('verification')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                  title="Click to sort by Verification Status"
                >
                  <div className="flex items-center gap-1">
                    <span>Verification</span>
                    {activeSortKey === 'verification' ? (
                      activeDirection === 'desc' ? (
                        <ArrowDownNarrowWide className="w-3 h-3 text-orange-600" />
                      ) : (
                        <ArrowUpNarrowWide className="w-3 h-3 text-blue-600" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((record) => {
                const isSelected = selectedAssessmentId === record.id;
                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelectAssessment(record)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-50/70 border-l-4 border-l-orange-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Priority Tier */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                          record.priorityTier
                        )}`}
                      >
                        {record.priorityTier.replace('_', ' ')}
                      </span>
                    </td>

                    {/* ID & Title */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-600">{record.id}</span>
                        {record.isPresetScenario && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            PRESET
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{record.title}</div>
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{record.locationName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {record.district}, {record.state}
                      </div>
                    </td>

                    {/* Physical Damage */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded border ${getDamageBadgeStyle(
                          record.estimatedDamageCategory
                        )}`}
                      >
                        {record.estimatedDamageCategory.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {(record.scores?.physicalDamageScore ?? 0).toFixed(0)}% score
                      </div>
                    </td>

                    {/* Confidence & Uncertainty */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden w-16">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.max(5, 100 - (record.scores?.uncertaintyScore ?? 20))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">
                          {Math.max(5, 100 - (record.scores?.uncertaintyScore ?? 20)).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Uncert: {(record.scores?.uncertaintyScore ?? 0).toFixed(0)}%
                      </div>
                    </td>

                    {/* Priority Score */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="text-base font-extrabold text-slate-900 font-mono">
                        {record.scores?.compositePriorityScore?.toFixed(1)}
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        SLA: {record.priorityTier === 'P1_URGENT' ? '2' : record.priorityTier === 'P2_HIGH' ? '6' : record.priorityTier === 'P3_MEDIUM' ? '24' : '72'}h
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        {getVerificationIcon(record.verificationStatus)}
                        <span className="text-[10px] font-mono">
                          {record.verificationStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {record.humanReview?.reviewerName && (
                        <div className="text-[9px] text-slate-400 truncate max-w-[100px]">
                          by {record.humanReview.reviewerName}
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenVerifyModal(record)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 transition-colors"
                          title="Verify or adjust damage assessment"
                          aria-label={`Verify assessment ${record.id}`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenAssignModal(record)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-blue-700 transition-colors"
                          title="Dispatch Field Inspection Team"
                          aria-label={`Dispatch team for assessment ${record.id}`}
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenReportModal(record)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-orange-700 transition-colors"
                          title="Generate official PS-53 dossier"
                          aria-label={`Generate report for assessment ${record.id}`}
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

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1.5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            P1: &lt; 2h SLA
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            P2: &lt; 6h SLA
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            P3: &lt; 24h SLA
          </span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          Showing {sorted.length} prioritized disaster site records
        </div>
      </div>
    </div>
  );
};
