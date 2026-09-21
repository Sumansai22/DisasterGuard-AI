import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { RainfallCorrelationPoint } from '../../types/rainfall';
import { Activity } from 'lucide-react';

interface RainfallVsRiskChartProps {
  data: RainfallCorrelationPoint[];
  height?: number;
}

export const RainfallVsRiskChart: React.FC<RainfallVsRiskChartProps> = ({
  data,
  height = 320,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Rainfall vs Risk Correlation Model
            </h4>
            <p className="text-xs text-slate-500">
              Random Forest Risk Score (%) vs Cumulative Precipitation (mm)
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
          Non-linear Pore Saturation
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="rainfall"
              unit="mm"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              unit="%"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
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
                name === 'simulatedRisk' ? `${val}% Risk` : `${val} Incidents`,
                name === 'simulatedRisk' ? 'Simulated AI Risk Score' : 'Historical Debris Incidents',
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar
              yAxisId="right"
              dataKey="actualIncidents"
              name="Historical Landslide Events"
              fill="#cbd5e1"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="simulatedRisk"
              name="AI Predicted Risk Score (%)"
              stroke="#ea580c"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ea580c' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
