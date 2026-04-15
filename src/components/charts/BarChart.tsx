import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/constants/dashboard';

export interface ChartProps {
  data: Record<string, any>[];
  groupByField: string;
  valueFields: string[];
  fieldLabels: Record<string, string>;
  height?: number | string;
}

export default function BarChartComponent({
  data,
  groupByField,
  valueFields,
  fieldLabels,
  height = '100%',
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
          <Bar
            key={field}
            dataKey={field}
            name={fieldLabels[field] || field}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
}
