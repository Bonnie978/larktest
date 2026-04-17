import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DataAggregator } from './DataAggregator';
import type { CardConfig } from './ChartBuilder';

interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#1664FF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1', '#14C9C9'];

const ChartCard: React.FC<ChartCardProps> = ({ config, isEditing, onEdit, onDelete }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/api/datasource/${config.dataSourceId}/data`);
      const json = await res.json();
      if (json.code === 0) {
        const aggregated = DataAggregator.aggregate({
          data: json.data,
          dimension: config.dimension,
          metrics: config.metrics,
          aggregation: config.aggregation,
        });
        setChartData(aggregated);
      } else {
        setError('数据加载失败');
      }
    } catch {
      setError('无法连接到数据服务');
    } finally {
      setLoading(false);
    }
  }, [config.dataSourceId, config.dimension, config.metrics, config.aggregation]);

  useEffect(() => { loadData(); }, [loadData]);

  const renderChart = () => {
    if (loading) {
      return <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">加载中...</div>;
    }
    if (error) {
      return <div className="h-48 flex items-center justify-center text-destructive text-sm">{error}</div>;
    }
    if (chartData.length === 0) {
      return <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>;
    }

    const { chartType, dimension, metrics } = config;

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dimension} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {metrics.map((m, idx) => (
              <Bar key={m} dataKey={m} fill={COLORS[idx % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dimension} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {metrics.map((m, idx) => (
              <Line key={m} type="monotone" dataKey={m} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      const metric = metrics[0];
      return (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={chartData} dataKey={metric} nameKey={dimension} cx="50%" cy="50%" outerRadius={80} label>
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
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
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h3 className="text-sm font-semibold truncate">{config.title}</h3>
        {isEditing && (
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(config.id)}>编辑</Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(config.id)}>删除</Button>
          </div>
        )}
      </div>
      <CardContent className="flex-1 pt-0 pb-3">{renderChart()}</CardContent>
    </Card>
  );
};

export default ChartCard;
