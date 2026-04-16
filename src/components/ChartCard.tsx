import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pencil, Trash2 } from 'lucide-react';
import type { CardConfig, ChartType } from '@/types/dashboard';
import { DataAggregator } from '@/lib/DataAggregator';
import { request } from '@/api/request';

interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onChartTypeChange: (id: string, type: ChartType) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ChartCard({ config, isEditing, onEdit, onDelete }: ChartCardProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [config]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const raw = await request<Record<string, unknown>[]>(`/datasource/${config.dataSourceId}/data`);
      const aggregated = DataAggregator.aggregate({
        data: raw,
        dimension: config.dimension,
        metrics: config.metrics,
        aggregation: config.aggregation,
      });
      setData(aggregated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (loading) return <div className="flex items-center justify-center h-64">加载中...</div>;
    if (error) return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>;
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-64">暂无数据</div>;

    const { chartType, dimension, metrics } = config;

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dimension} />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map((m, i) => <Bar key={m} dataKey={m} fill={COLORS[i % COLORS.length]} />)}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dimension} />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map((m, i) => <Line key={m} type="monotone" dataKey={m} stroke={COLORS[i % COLORS.length]} />)}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      const pieData = data.map(row => ({
        name: String(row[dimension]),
        value: Number(row[metrics[0]] ?? 0),
      }));
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{config.title}</CardTitle>
        {isEditing && (
          <div className="flex gap-2">
            <button onClick={() => onEdit(config.id)} className="p-1 hover:bg-gray-100 rounded">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(config.id)} className="p-1 hover:bg-gray-100 rounded text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
