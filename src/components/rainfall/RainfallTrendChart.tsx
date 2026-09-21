import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { HourlyRainfall } from '../../types/rainfall';
import { CloudRain } from 'lucide-react';

interface RainfallTrendChartProps {
  data: HourlyRainfall[];
  title?: string;
  height?: number;
}

export const RainfallTrendChart: React.FC<RainfallTrendChartProps> = ({
  data,
  title = 'Rainfall Trend (24-Hour Telemetry)',
  height = 320,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">
              Hourly precipitation (mm) vs Red-Alert threshold (25mm/hr)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          Auto-updated IMD Radar
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              unit="mm"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '0.75rem',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
              }}
              formatter={(val: any, name: string) => [
                `${val} mm`,
                name === 'rainfall' ? 'Hourly Rain' : 'Cumulative',
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <ReferenceLine
              y={25}
              label={{
                value: 'Flash Alert Threshold (25mm/h)',
                fill: '#ef4444',
                fontSize: 10,
                position: 'top',
              }}
              stroke="#ef4444"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="rainfall"
              name="Hourly Rainfall (mm)"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#rainGradient)"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Rain (mm)"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
