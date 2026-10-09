import React from 'react';
import {
  ArrowUpDown,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  RotateCcw,
  SlidersHorizontal,
  Search,
  Filter,
} from 'lucide-react';
import { SortOption, SortDirection } from '../../types/sorting';
import { useFeedback } from '../../context/FeedbackContext';

interface SortingToolbarProps<T> {
  sortOptions: SortOption<T>[];
  activeSortKey: string;
  activeDirection: SortDirection;
  onSortChange: (sortKey: string, direction: SortDirection) => void;
  defaultSortKey: string;
  defaultDirection: SortDirection;
  onReset?: () => void;
  totalCount?: number;
  filteredCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  className?: string;
  showFeedbackNotice?: boolean;
}

export function SortingToolbar<T>({
  sortOptions,
  activeSortKey,
  activeDirection,
  onSortChange,
  defaultSortKey,
  defaultDirection,
  onReset,
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  className = '',
  showFeedbackNotice = true,
}: SortingToolbarProps<T>) {
  const { showInfo } = useFeedback();

  const currentOption =
    sortOptions.find((opt) => opt.key === activeSortKey) || sortOptions[0];

  const handleOptionChange = (newKey: string) => {
    const selected = sortOptions.find((opt) => opt.key === newKey);
    const newDirection = selected?.defaultDirection || 'desc';
    onSortChange(newKey, newDirection);

    if (showFeedbackNotice && selected) {
      const dirLabel =
        selected.directionLabels?.[newDirection] ||
        (newDirection === 'desc' ? 'Highest / Newest first' : 'Lowest / Oldest first');
      showInfo(`Sorted by ${selected.label} — ${dirLabel}`);
    }
  };

  const handleToggleDirection = () => {
    const nextDirection: SortDirection = activeDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(activeSortKey, nextDirection);

    if (showFeedbackNotice && currentOption) {
      const dirLabel =
        currentOption.directionLabels?.[nextDirection] ||
        (nextDirection === 'desc' ? 'Highest / Newest first' : 'Lowest / Oldest first');
      showInfo(`Sorted by ${currentOption.label} — ${dirLabel}`);
    }
  };

  const handleReset = () => {
    onSortChange(defaultSortKey, defaultDirection);
    onReset?.();
    if (showFeedbackNotice) {
      const defOpt = sortOptions.find((opt) => opt.key === defaultSortKey);
      showInfo(`Sort reset to default: ${defOpt?.label || 'Default'}`);
    }
  };

  const isModified =
    activeSortKey !== defaultSortKey ||
    activeDirection !== defaultDirection ||
    (searchQuery !== undefined && searchQuery !== '');

  const directionLabel =
    currentOption?.directionLabels?.[activeDirection] ||
    (activeDirection === 'desc' ? 'Descending' : 'Ascending');

  return (
    <div
      className={`bg-white/95 border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs ${className}`}
    >
      {/* Left: Search input if enabled */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium transition-all"
            />
          </div>
        )}

        {/* Count Badge */}
        {filteredCount !== undefined && (
          <span className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-bold">
            {filteredCount}
            {totalCount !== undefined && totalCount !== filteredCount ? ` / ${totalCount}` : ''} items
          </span>
        )}
      </div>

      {/* Right: Sort controls */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <label htmlFor="sort-by-select" className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Sort by:
          </label>
          <select
            id="sort-by-select"
            value={activeSortKey}
            onChange={(e) => handleOptionChange(e.target.value)}
            className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer pr-1"
          >
            {sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Direction toggle */}
        <button
          type="button"
          onClick={handleToggleDirection}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
          title={`Currently: ${directionLabel}. Click to switch.`}
          aria-label={`Toggle sort order: currently ${directionLabel}`}
        >
          {activeDirection === 'desc' ? (
            <ArrowDownNarrowWide className="w-3.5 h-3.5 text-orange-600" />
          ) : (
            <ArrowUpNarrowWide className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span className="hidden sm:inline font-mono text-[11px]">{directionLabel}</span>
        </button>

        {/* Reset button */}
        {isModified && (
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
            title="Reset to default sorting and clear search"
            aria-label="Reset sorting to default"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
