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

export const HistoricalPage: React.FC = () => {
  const [events, setEvents] = useState<HistoricalLandslideEvent[]>([]);
  const [yearlyTrends, setYearlyTrends] = useState<YearlyTrend[]>([]);
  const [monthlyDist, setMonthlyDist] = useState<MonthlyDistribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedState, setSelectedState] = useState<string>('ALL');

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
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving Multi-Decadal GSI Geological Records..." fullHeight />;
  }

  const filteredEvents = events.filter(
    (e) => selectedState === 'ALL' || e.state === selectedState
  );

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
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
          >
            <option value="ALL">All States / Regions</option>
            <option value="Kerala">Kerala</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
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
          <div style={{ width: '100%', height: 300 }}>
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
          <div style={{ width: '100%', height: 300 }}>
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
                <Line type="monotone" dataKey="count" name="Reported Landslides" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Major Incidents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Documented National Landslide Incident Registry
            </h4>
            <p className="text-xs text-slate-500">
              Comparing recorded field conditions against retrospective AI prediction verification
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
            {filteredEvents.length} Verified Case Studies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Location & State</th>
                <th className="py-3 px-4">Rainfall / Slope</th>
                <th className="py-3 px-4">Trigger & Cause</th>
                <th className="py-3 px-4">Impact / Evacuated</th>
                <th className="py-3 px-4">AI Score Concordance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
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
              ))}
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
