import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { AggregatedData, ChartType } from '@/types/dashboard';

interface SimpleChartProps {
  data: AggregatedData[];
  chartType: ChartType;
}

const COLORS = ['#1664FF', '#3CC9A3', '#FF7D00', '#F53F3F', '#6AA1FF', '#7BE188', '#FFB980', '#FF8F8F'];

function RechartsBar({ data }: { data: AggregatedData[] }) {
  if (!data.length || !data[0].data.length) return <EmptyState />;
  const chartData = data[0].data.map(d => ({ name: d.category, value: d.value }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="value" fill="#1664FF" radius={[2, 2, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function RechartsLine({ data }: { data: AggregatedData[] }) {
  if (!data.length || !data[0].data.length) return <EmptyState />;
  const chartData = data[0].data.map(d => ({ name: d.category, value: d.value }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#1664FF" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RechartsPie({ data }: { data: AggregatedData[] }) {
  if (!data.length || !data[0].data.length) return <EmptyState />;
  const chartData = data[0].data.map(d => ({ name: d.category, value: d.value }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ strokeWidth: 1 }} fontSize={10}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
      暂无数据
    </div>
  );
}

export default function SimpleChart({ data, chartType }: SimpleChartProps) {
  const chart = useMemo(() => {
    switch (chartType) {
      case 'bar':
        return <RechartsBar data={data} />;
      case 'line':
      case 'area':
        return <RechartsLine data={data} />;
      case 'pie':
        return <RechartsPie data={data} />;
      default:
        return <RechartsBar data={data} />;
    }
  }, [data, chartType]);

  return <div className="w-full h-full p-2">{chart}</div>;
}
