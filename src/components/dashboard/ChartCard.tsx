import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CardConfig, ChartType } from '@/types/dashboard';
import { getDataSourceData } from '@/api';
import { useRequest } from '@/hooks/useRequest';
import { aggregateData } from '@/utils/aggregation';

const COLOR_PALETTE = [
  '#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D',
  '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00',
];

const CHART_TYPE_ICONS: Record<ChartType, string> = {
  bar: '📊',
  line: '📈',
  pie: '🍩',
};

interface ChartCardProps {
  config: CardConfig;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onChartTypeChange: (type: ChartType) => void;
}

export default function ChartCard({
  config,
  isEditing,
  onEdit,
  onRemove,
  onChartTypeChange,
}: ChartCardProps) {
  const { data: rawData, loading } = useRequest(
    () => getDataSourceData(config.dataSourceId),
    [config.dataSourceId]
  );

  const aggregatedData = useMemo(() => {
    if (!rawData) return [];
    return aggregateData(rawData, config.groupByField, config.valueFields, config.aggregation);
  }, [rawData, config.groupByField, config.valueFields, config.aggregation]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          加载中...
        </div>
      );
    }

    if (aggregatedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          暂无数据
        </div>
      );
    }

    if (config.chartType === 'pie') {
      const pieData = aggregatedData.map(d => ({
        name: String(d[config.groupByField]),
        value: Number(d[config.valueFields[0]] ?? 0),
      }));

      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (config.chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={aggregatedData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.groupByField} tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {config.valueFields.map((field, index) => (
              <Line
                key={field}
                type="monotone"
                dataKey={field}
                name={field}
                stroke={COLOR_PALETTE[index % COLOR_PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={aggregatedData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={config.groupByField} tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {config.valueFields.map((field, index) => (
            <Bar
              key={field}
              dataKey={field}
              name={field}
              fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b min-h-[44px]">
        <span className="text-sm font-medium truncate">{config.title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {/* Chart type switchers */}
          {(['bar', 'line', 'pie'] as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => onChartTypeChange(type)}
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                config.chartType === type
                  ? 'bg-[#1664FF]/10 text-[#1664FF]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={type === 'bar' ? '柱状图' : type === 'line' ? '折线图' : '饼图'}
            >
              {CHART_TYPE_ICONS[type]}
            </button>
          ))}
          {isEditing && (
            <>
              <button
                onClick={onEdit}
                className="ml-1 px-1.5 py-0.5 text-xs text-[#1664FF] hover:bg-[#1664FF]/10 rounded"
                title="编辑"
              >
                ✎
              </button>
              <button
                onClick={onRemove}
                className="px-1.5 py-0.5 text-xs text-[#F53F3F] hover:bg-[#F53F3F]/10 rounded"
                title="删除"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 p-2 min-h-0">
        {renderChart()}
      </div>
    </div>
  );
}
