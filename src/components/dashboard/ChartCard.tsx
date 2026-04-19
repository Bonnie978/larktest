import { useEffect, useRef, useMemo } from 'react';
import * as echarts from 'echarts';
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
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const { data: rawData, loading } = useRequest(
    () => getDataSourceData(config.dataSourceId),
    [config.dataSourceId]
  );

  const aggregatedData = useMemo(() => {
    if (!rawData) return [];
    return aggregateData(rawData, config.groupByField, config.valueFields, config.aggregation);
  }, [rawData, config.groupByField, config.valueFields, config.aggregation]);

  useEffect(() => {
    if (!chartRef.current || aggregatedData.length === 0) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const categories = aggregatedData.map(d => String(d[config.groupByField]));

    let option: echarts.EChartsOption;

    if (config.chartType === 'pie') {
      const pieData = aggregatedData.map(d => ({
        name: String(d[config.groupByField]),
        value: Number(d[config.valueFields[0]] ?? 0),
      }));
      option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        color: COLOR_PALETTE,
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: pieData,
          label: { formatter: '{b}\n{d}%', fontSize: 11 },
        }],
      };
    } else {
      const series = config.valueFields.map((field, i) => ({
        name: field,
        type: config.chartType as 'bar' | 'line',
        data: aggregatedData.map(d => Number(d[field] ?? 0)),
        ...(config.chartType === 'line' ? { smooth: true, symbolSize: 6 } : {}),
        ...(config.chartType === 'bar' ? {
          itemStyle: { borderRadius: [2, 2, 0, 0] },
        } : {}),
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      }));

      option = {
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0, textStyle: { fontSize: 11 } },
        grid: { left: '3%', right: '4%', bottom: '14%', top: '8%', containLabel: true },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: { fontSize: 11, rotate: categories.length > 6 ? 30 : 0 },
        },
        yAxis: { type: 'value', axisLabel: { fontSize: 11 } },
        color: COLOR_PALETTE,
        series,
      };
    }

    chartInstance.current.setOption(option, true);
  }, [aggregatedData, config]);

  // Resize observer
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    observer.observe(chartRef.current);
    return () => {
      observer.disconnect();
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

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
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            加载中...
          </div>
        ) : (
          <div ref={chartRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
