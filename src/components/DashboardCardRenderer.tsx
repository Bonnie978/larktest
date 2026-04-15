// src/components/DashboardCardRenderer.tsx
import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getDataSourceData } from '@/api';
import { aggregate } from '@/lib/aggregationEngine';
import { useRequest } from '@/hooks/useRequest';
import type { CardConfig, ChartType } from '@/types/dashboard';

const COLORS = ['#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D', '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00'];

const CHART_LABELS: Record<ChartType, string> = {
  bar: '柱状图',
  line: '折线图',
  pie: '饼图',
  number: '数值',
  table: '表格',
};

const RADIAN = Math.PI / 180;
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

interface DashboardCardRendererProps {
  config: CardConfig;
  onChartTypeChange?: (type: ChartType) => void;
}

export default function DashboardCardRenderer({ config, onChartTypeChange }: DashboardCardRendererProps) {
  const fetcher = useCallback(() => getDataSourceData(config.dataSourceId), [config.dataSourceId]);
  const { data: rawData } = useRequest(fetcher, [config.dataSourceId]);

  const chartData = rawData
    ? aggregate({
        data: rawData,
        groupByField: config.groupByField,
        valueFields: config.valueFields,
        aggregation: config.aggregation,
      })
    : [];

  const tickStyle = { fontSize: 12, fill: '#86909C' };
  const tooltipStyle = { backgroundColor: '#fff', border: '1px solid #E5E6EB', borderRadius: 4 };

  // 根据配置推断支持的图表类型
  const supportedTypes: ChartType[] = ['bar', 'line', 'pie'];

  const renderChart = () => {
    if (chartData.length === 0) {
      return <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">加载中...</div>;
    }

    switch (config.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.groupByField} tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {config.valueFields.map((field, i) => (
                <Bar key={field} dataKey={field} fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.groupByField} tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {config.valueFields.map((field, i) => (
                <Line key={field} type="monotone" dataKey={field} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={config.valueFields[0]}
                nameKey={config.groupByField}
                cx="50%" cy="50%" outerRadius={100}
                label={renderPieLabel} labelLine={false}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-0 pt-3 px-4 flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        {onChartTypeChange && (
          <div className="flex gap-1">
            {supportedTypes.map((type) => (
              <Button
                key={type}
                size="xs"
                variant={config.chartType === type ? 'default' : 'outline'}
                onClick={() => onChartTypeChange(type)}
              >
                {CHART_LABELS[type]}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-2">{renderChart()}</CardContent>
    </Card>
  );
}
