import React, { useState } from 'react';
import { useRainfall } from '../hooks/useRainfall';
import { useApp } from '../context/AppContext';
import { RainfallStatCards } from '../components/rainfall/RainfallStatCards';
import { RainfallTrendChart } from '../components/rainfall/RainfallTrendChart';
import { RainfallVsRiskChart } from '../components/rainfall/RainfallVsRiskChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { MONITORED_STATIONS } from '../utils/constants';
import { CloudRain, Droplets, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';

export const RainfallPage: React.FC = () => {
  const { selectedStation, setSelectedStation } = useApp();
  const { data, isLoading, error } = useRainfall(selectedStation.id);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  if (isLoading) {
    return <LoadingSpinner message="Ingesting Doppler Radar & Rain Gauge Telemetry..." fullHeight />;
  }

  if (error || !data) {
    return <ErrorState message="Failed to sync IMD hydrological precipitation data" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CloudRain className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Precipitation & Rainfall Monitoring Center
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Real-time pluviometer telemetry, multi-interval cumulative tracking, and trigger thresholds
          </p>
        </div>

        {/* Selected Station Indicator */}
        <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <MapPin className="w-4 h-4 text-orange-600" />
          <div className="text-xs">
            <span className="text-slate-400">Station: </span>
            <strong className="text-slate-900 font-bold">{selectedStation.name}</strong>
          </div>
        </div>
      </div>

      {/* Cumulative Stat Cards (1h, 6h, 12h, 24h, 72h, 7d) */}
      <RainfallStatCards metrics={data.metrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RainfallTrendChart data={data.trend} />
        <RainfallVsRiskChart data={data.correlation} />
      </div>

      {/* Regional Station Pluviometer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Regional Pluviometer Telemetry Network
            </h4>
            <p className="text-xs text-slate-500">
              Automatic Weather Stations (AWS) synoptic observations
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
            7 Active Sensors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Station Name</th>
                <th className="py-3 px-4">District / State</th>
                <th className="py-3 px-4">Current Rain</th>
                <th className="py-3 px-4">Slope Saturation</th>
                <th className="py-3 px-4">Hazard Risk</th>
                <th className="py-3 px-4">Telemetry Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MONITORED_STATIONS.map((stn) => {
                const isCurrent = stn.id === selectedStation.id;
                return (
                  <tr
                    key={stn.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCurrent ? 'bg-orange-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-900">
                      <div className="font-bold">{stn.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{stn.id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {stn.region}, {stn.state}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {stn.parameters.rainfall_mm} mm
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {stn.parameters.soil_saturation}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stn.riskLevel === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : stn.riskLevel === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {stn.riskScore}/100 ({stn.riskLevel})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {stn.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedStation(stn)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isCurrent
                            ? 'bg-orange-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Active Station' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
