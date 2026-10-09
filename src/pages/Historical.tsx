import React, { useState, useEffect } from 'react';
import { historicalService } from '../services/historicalService';
import {
  HistoricalLandslideEvent,
  YearlyTrend,
  MonthlyDistribution,
} from '../types/historical';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  History,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SortOption, SortDirection, sortData } from '../types/sorting';
import { SortingToolbar } from '../components/common/SortingToolbar';
import { useFeedback } from '../context/FeedbackContext';

const HISTORICAL_SORT_OPTIONS: SortOption<HistoricalLandslideEvent>[] = [
  {
    key: 'date',
    label: 'Incident Date',
    directionLabels: { asc: 'Oldest Event first', desc: 'Newest Event first' },
    getValue: (item) => item.date,
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
    key: 'fatalities',
    label: 'Casualties / Impact',
    directionLabels: { asc: 'Lowest Casualties first', desc: 'Highest Casualties first' },
    getValue: (item) => item.fatalities,
    defaultDirection: 'desc',
  },
  {
    key: 'rainfall',
    label: 'Monsoonal Rainfall',
    directionLabels: { asc: 'Lowest Rainfall first', desc: 'Highest Rainfall first' },
    getValue: (item) => item.rainfallRecordedMm,
    defaultDirection: 'desc',
  },
  {
    key: 'evacuated',
    label: 'Evacuated Population',
    directionLabels: { asc: 'Lowest Evacuated first', desc: 'Highest Evacuated first' },
    getValue: (item) => item.evacuatedCount,
    defaultDirection: 'desc',
  },
  {
    key: 'aiScore',
    label: 'AI Model Score',
    directionLabels: { asc: 'Lowest AI Score first', desc: 'Highest AI Score first' },
    getValue: (item) => item.aiPredictedRiskScore,
    defaultDirection: 'desc',
  },
];

export const HistoricalPage: React.FC = () => {
  const { showInfo } = useFeedback();
  const [events, setEvents] = useState<HistoricalLandslideEvent[]>([]);
  const [yearlyTrends, setYearlyTrends] = useState<YearlyTrend[]>([]);
  const [monthlyDist, setMonthlyDist] = useState<MonthlyDistribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<string>('ALL');

  // Sorting and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSortKey, setActiveSortKey] = useState<string>('date');
  const [activeDirection, setActiveDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [evs, yt, md] = await Promise.all([
          historicalService.getEvents(),
          historicalService.getYearlyTrends(),
          historicalService.getMonthlyDistribution(),
        ]);
        if (mounted) {
          setEvents(evs);
          setYearlyTrends(yt);
          setMonthlyDist(md);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving Multi-Decadal GSI Geological Records..." fullHeight />;
  }

  const safeEvents = Array.isArray(events) ? events : [];

  // Filter
  const filteredEvents = safeEvents.filter((e) => {
    if (!e) return false;
    const matchesState = selectedState === 'ALL' || e.state === selectedState;
    const matchesSearch =
      (e.locationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.triggerCause || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.state || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  // Sort
  const currentOption =
    HISTORICAL_SORT_OPTIONS.find((opt) => opt.key === activeSortKey) || HISTORICAL_SORT_OPTIONS[0];
  const sortedEvents = sortData(filteredEvents, currentOption, activeDirection);

  const handleHeaderSort = (key: string) => {
    if (activeSortKey === key) {
      const nextDir: SortDirection = activeDirection === 'asc' ? 'desc' : 'asc';
      setActiveDirection(nextDir);
      const opt = HISTORICAL_SORT_OPTIONS.find((o) => o.key === key);
      const label = opt?.directionLabels?.[nextDir] || nextDir;
      showInfo(`Sorted by ${opt?.label || key} — ${label}`);
    } else {
      const opt = HISTORICAL_SORT_OPTIONS.find((o) => o.key === key);
      const initialDir = opt?.defaultDirection || 'desc';
      setActiveSortKey(key);
      setActiveDirection(initialDir);
      const label = opt?.directionLabels?.[initialDir] || initialDir;
      showInfo(`Sorted by ${opt?.label || key} — ${label}`);
    }
  };

  const handleResetFilters = () => {
    setSelectedState('ALL');
    setSearchQuery('');
    setActiveSortKey('date');
    setActiveDirection('desc');
    showInfo('Historical reports filters and sorting reset to default.');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Historical Analysis & Multi-Decadal Trends
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Retrospective analysis of documented major landslide events, monsoonal correlations, and AI model verification
          </p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              showInfo(`Region filtered: ${e.target.value}`);
            }}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="ALL">All States / Regions</option>
            <option value="Kerala">Kerala</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
          </select>
        </div>
      </div>

      {/* Dual Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Year Landslide Events & Rainfall Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Landslide Incidents vs Annual Precipitation Trend (2020-2025)
              </h4>
              <p className="text-xs text-slate-500">Yearly disaster events vs average monsoonal rainfall</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={yearlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} unit="mm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="eventsCount" name="Landslide Events" fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgRainfall" name="Avg Rainfall (mm)" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Event Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Monthly Landslide Distribution & Monsoonal Seasonality
              </h4>
              <p className="text-xs text-slate-500">Peak frequency spikes aligned with SW & NE Monsoon months</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyDist} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Recorded Incidents"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Disasters Table Card with Sorting Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4 sm:p-5">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Documented Major Geological Disaster Events (GSI / NDMA Repository)</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {sortedEvents.length} Events
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical ground truth validations demonstrating AI retrospective accuracy
          </p>
        </div>

        {/* Sorting Toolbar */}
        <SortingToolbar
          sortOptions={HISTORICAL_SORT_OPTIONS}
          activeSortKey={activeSortKey}
          activeDirection={activeDirection}
          onSortChange={(key, dir) => {
            setActiveSortKey(key);
            setActiveDirection(dir);
          }}
          defaultSortKey="date"
          defaultDirection="desc"
          onReset={handleResetFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search event location, trigger cause..."
          totalCount={safeEvents.length}
          filteredCount={sortedEvents.length}
        />

        {/* Events Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => handleHeaderSort('date')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Click to sort by date"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
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
                  onClick={() => handleHeaderSort('location')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Click to sort by location"
                >
                  <div className="flex items-center gap-1">
                    <span>Location & State</span>
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
                  onClick={() => handleHeaderSort('rainfall')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Click to sort by rainfall recorded"
                >
                  <div className="flex items-center gap-1">
                    <span>Rainfall / Slope</span>
                    {activeSortKey === 'rainfall' ? (
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
                <th className="py-3 px-4">Trigger & Cause</th>
                <th
                  onClick={() => handleHeaderSort('fatalities')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Click to sort by impact"
                >
                  <div className="flex items-center gap-1">
                    <span>Impact / Evacuated</span>
                    {activeSortKey === 'fatalities' ? (
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
                  onClick={() => handleHeaderSort('aiScore')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Click to sort by AI concordance"
                >
                  <div className="flex items-center gap-1">
                    <span>AI Concordance</span>
                    {activeSortKey === 'aiScore' ? (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No historical disaster records match the active criteria.
                  </td>
                </tr>
              ) : (
                sortedEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {ev.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ev.locationName}</div>
                      <div className="text-[10px] text-slate-500">{ev.state}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <div>{ev.rainfallRecordedMm} mm rain</div>
                      <div className="text-[10px] text-slate-400">{ev.slopeAngleDeg}° slope</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      {ev.triggerCause}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-red-600 font-mono">{ev.fatalities} Fatalities</div>
                      <div className="text-[10px] text-slate-500">{ev.evacuatedCount.toLocaleString()} Evacuated</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-mono font-bold text-slate-900">{ev.aiPredictedRiskScore}/100</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Match
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Central Emergency Response Performance & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Response Time Lifecycle Milestones (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>⏱️ Emergency Response Time Metrics</span>
            </h4>
            <p className="text-xs text-slate-500">NDRF & SDRF deployment lifecycle intervals</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Detection → Verification:</span>
              <strong className="text-slate-900 font-bold">52 sec</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Verification → Dispatch:</span>
              <strong className="text-slate-900 font-bold">18 sec</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Dispatch → On-Scene Arrival:</span>
              <strong className="text-slate-900 font-bold">8.5 min</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-300 flex items-center justify-between">
              <span className="text-emerald-900 font-bold">TOTAL AVERAGE RESPONSE:</span>
              <strong className="text-emerald-700 text-sm font-extrabold">22 min</strong>
            </div>
          </div>
        </div>

        {/* Right: Operational Audit Trail (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Central Disaster Incident Audit Trail
              </h4>
              <p className="text-xs text-slate-500">Immutable chronological log of human and AI actions</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Active Logger
            </span>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-emerald-600">●</span>
                  <span>INC-DRONE-8823 Verified by Supervisor</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Human operator verified high-distress stranded individual on railway footing.
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">21:43:10Z</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-orange-600">●</span>
                  <span>Drone-01 Detection: Person #12 Logged</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Inundation zone exposure detected with 94% confidence.
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">21:42:10Z</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-blue-600">●</span>
                  <span>Early Warning Broadcast: Flash Flood Advisory</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Civil defense alert sent to West Godavari District EOC.
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">21:35:00Z</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
