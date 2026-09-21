import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BrainCircuit } from 'lucide-react';

interface FeatureImportanceChartProps {
  data: { feature: string; importance: number; description: string }[];
  height?: number;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
  data,
  height = 340,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Global Feature Importance (Random Forest Gini Index)
            </h4>
            <p className="text-xs text-slate-500">
              Mean Decrease in Impurity across all 100 Decision Trees
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          9 Features Evaluated
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              unit=""
            />
            <YAxis
              type="category"
              dataKey="feature"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              width={120}
              tick={{ fontWeight: 600, fontFamily: 'monospace' }}
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
              formatter={(val: any, name: string, item: any) => [
                `${(val * 100).toFixed(1)}% (Gini weight: ${val})`,
                item.payload.description || 'Feature Importance',
              ]}
            />
            <Bar
              dataKey="importance"
              name="Gini Importance"
              fill="#ea580c"
              radius={[0, 6, 6, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
