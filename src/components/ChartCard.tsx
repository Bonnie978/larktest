import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Table, { type Column } from '@/components/Table';
import type { ChartType } from '@/types/dashboard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ChartConfig {
  xKey?: string;
  bars?: { dataKey: string; name: string; fill: string }[];
  lines?: { dataKey: string; name: string; stroke: string }[];
  pieDataKey?: string;
  pieNameKey?: string;
}

const COLORS = [
  '#1664FF',
  '#14C9C9',
  '#78D3F8',
  '#9FDB1D',
  '#F7BA1E',
  '#722ED1',
  '#F53F3F',
  '#FF7D00',
];

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  table: '表格',
  bar: '柱状图',
  line: '折线图',
  pie: '饼图',
};

const RADIAN = Math.PI / 180;
function renderPieLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

interface ChartCardProps {
  title: string;
  chartType: ChartType;
  supportedTypes: ChartType[];
  data: any[];
  columns?: Column<any>[];
  chartConfig: ChartConfig;
  onChartTypeChange?: (type: ChartType) => void;
}

export default function ChartCard({
  title,
  chartType: controlledType,
  supportedTypes,
  data,
  columns,
  chartConfig,
  onChartTypeChange,
}: ChartCardProps) {
  const [internalType, setInternalType] = useState(controlledType);
  const chartType = onChartTypeChange ? controlledType : internalType;

  const handleTypeChange = (type: ChartType) => {
    if (onChartTypeChange) {
      onChartTypeChange(type);
    } else {
      setInternalType(type);
    }
  };

  const tickStyle = { fontSize: 12, fill: '#86909C' };

  const renderChart = () => {
    switch (chartType) {
      case 'table':
        return columns ? (
          <div className="px-0">
            <Table columns={columns} data={data} rowKey={(r: any) => JSON.stringify(r)} />
          </div>
        ) : null;

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xKey} tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E6EB',
                  borderRadius: 4,
                }}
              />
              <Legend />
              {(chartConfig.bars ?? []).map((bar) => (
                <Bar
                  key={bar.dataKey}
                  dataKey={bar.dataKey}
                  name={bar.name}
                  fill={bar.fill}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartConfig.xKey} tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E6EB',
                  borderRadius: 4,
                }}
              />
              <Legend />
              {(chartConfig.lines ?? []).map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.stroke}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey={chartConfig.pieDataKey ?? 'value'}
                nameKey={chartConfig.pieNameKey ?? 'name'}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderPieLabel}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E6EB',
                  borderRadius: 4,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-0 pt-4 px-5 flex-row items-center justify-between">
        <CardTitle className="text-[15px] font-medium">{title}</CardTitle>
        {supportedTypes.length > 1 && (
          <div className="flex gap-1">
            {supportedTypes.map((type) => (
              <Button
                key={type}
                size="xs"
                variant={chartType === type ? 'default' : 'outline'}
                onClick={() => handleTypeChange(type)}
              >
                {CHART_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-5 pb-4 pt-3">{renderChart()}</CardContent>
    </Card>
  );
}
