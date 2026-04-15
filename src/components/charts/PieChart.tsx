import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/constants/dashboard';
import type { ChartProps } from './BarChart';

export default function PieChartComponent({
  data,
  groupByField,
  valueFields,
  fieldLabels,
  height = 280,
}: ChartProps) {
  const dataKey = valueFields[0];
  const total = data.reduce((sum, d) => sum + (Number(d[dataKey]) || 0), 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={groupByField}
          innerRadius={50}
          outerRadius={110}
          label={({ name, value }) => {
            const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
            return `${name} ${pct}%`;
          }}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #E5E6EB',
            borderRadius: 6,
          }}
          formatter={(value: number) => [
            `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
            fieldLabels[dataKey] || dataKey,
          ]}
        />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  );
}
