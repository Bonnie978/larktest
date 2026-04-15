import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/constants/dashboard';
import type { ChartProps } from './BarChart';

export default function LineChartComponent({
  data,
  groupByField,
  valueFields,
  fieldLabels,
  height = 280,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
        <XAxis dataKey={groupByField} tick={{ fontSize: 11, fill: '#86909C' }} />
        <YAxis tick={{ fontSize: 11, fill: '#86909C' }} />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #E5E6EB',
            borderRadius: 6,
          }}
        />
        <Legend />
        {valueFields.map((field, i) => (
          <Line
            key={field}
            type="monotone"
            dataKey={field}
            name={fieldLabels[field] || field}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  );
}
