import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { ChartType } from '@/types/dashboard';
import { aggregateData } from '@/utils/aggregation';
import type { AggregationType } from '@/types/dashboard';

const COLOR_PALETTE = [
  '#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D',
  '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00',
];

interface ChartPreviewProps {
  rawData: Record<string, any>[];
  groupByField: string;
  valueFields: string[];
  fieldLabels: Record<string, string>;
  chartType: ChartType;
  aggregation: AggregationType;
  title?: string;
}

export default function ChartPreview({
  rawData,
  groupByField,
  valueFields,
  fieldLabels,
  chartType,
  aggregation,
  title,
}: ChartPreviewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const data = aggregateData(rawData, groupByField, valueFields, aggregation);
    const categories = data.map(d => String(d[groupByField]));

    let option: echarts.EChartsOption;

    if (chartType === 'pie') {
      const pieData = data.map(d => ({
        name: String(d[groupByField]),
        value: Number(d[valueFields[0]] ?? 0),
      }));
      option = {
        title: title ? { text: title, left: 'center', textStyle: { fontSize: 14 } } : undefined,
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        color: COLOR_PALETTE,
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: pieData,
          label: { formatter: '{b}\n{d}%' },
        }],
      };
    } else {
      const series = valueFields.map((field, i) => ({
        name: fieldLabels[field] || field,
        type: chartType as 'bar' | 'line',
        data: data.map(d => Number(d[field] ?? 0)),
        ...(chartType === 'line' ? { smooth: true, symbolSize: 6 } : {}),
        ...(chartType === 'bar' ? {
          itemStyle: { borderRadius: [2, 2, 0, 0] },
        } : {}),
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      }));
      option = {
        title: title ? { text: title, left: 'center', textStyle: { fontSize: 14 } } : undefined,
        tooltip: { trigger: 'axis' },
        legend: { bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '12%', top: '15%', containLabel: true },
        xAxis: { type: 'category', data: categories },
        yAxis: { type: 'value' },
        color: COLOR_PALETTE,
        series,
      };
    }

    chartInstance.current.setOption(option, true);

    return () => {};
  }, [rawData, groupByField, valueFields, chartType, aggregation, title, fieldLabels]);

  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[300px]">
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
}
