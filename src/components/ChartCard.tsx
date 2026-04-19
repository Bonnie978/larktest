import React, { useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aggregate } from '@/utils/aggregate';
import type { CardConfig } from './ChartBuilder';

interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D', '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00'];

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
        const aggregated = aggregate({
          data: json.data,
          groupByField: config.dimension,
          valueFields: config.metrics,
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

  const getChartOption = () => {
    if (chartData.length === 0) return null;
    const { chartType, dimension, metrics } = config;
    const dimValues = chartData.map((d) => d[dimension]);

    if (chartType === 'bar') {
      return {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { left: 50, right: 20, top: 10, bottom: 40 },
        xAxis: { type: 'category', data: dimValues, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
        series: metrics.map((m, idx) => ({
          name: m,
          type: 'bar',
          data: chartData.map((d) => d[m]),
          itemStyle: { color: COLORS[idx % COLORS.length], borderRadius: [4, 4, 0, 0] },
        })),
      };
    }

    if (chartType === 'line') {
      return {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { left: 50, right: 20, top: 10, bottom: 40 },
        xAxis: { type: 'category', data: dimValues, axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
        series: metrics.map((m, idx) => ({
          name: m,
          type: 'line',
          smooth: true,
          data: chartData.map((d) => d[m]),
          lineStyle: { color: COLORS[idx % COLORS.length] },
          itemStyle: { color: COLORS[idx % COLORS.length] },
        })),
      };
    }

    if (chartType === 'pie') {
      const metric = metrics[0];
      return {
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            data: chartData.map((d, idx) => ({
              name: d[dimension],
              value: d[metric],
              itemStyle: { color: COLORS[idx % COLORS.length] },
            })),
            label: { show: true },
          },
        ],
      };
    }

    return null;
  };

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

    const option = getChartOption();
    if (!option) return null;

    return <ReactECharts option={option} style={{ height: '240px' }} />;
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
