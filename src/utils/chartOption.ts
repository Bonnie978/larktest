import type { ChartType } from '@/types/dashboard';

const COLOR_PALETTE = [
  '#1664FF', '#14C9C9', '#78D3F8', '#9FDB1D',
  '#F7BA1E', '#722ED1', '#F53F3F', '#FF7D00',
];

export function buildChartOption(
  chartType: ChartType,
  data: Record<string, unknown>[],
  groupByField: string,
  valueFields: string[],
): Record<string, unknown> {
  const categories = data.map((d) => String(d[groupByField] ?? ''));

  if (chartType === 'pie') {
    const field = valueFields[0] || '';
    const pieData = data.map((d) => ({
      name: String(d[groupByField] ?? ''),
      value: Number(d[field] ?? 0),
    }));
    return {
      color: COLOR_PALETTE,
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: pieData,
          label: { formatter: '{b}\n{d}%' },
          emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' } },
        },
      ],
    };
  }

  // bar / line
  const series = valueFields.map((field, idx) => ({
    name: field,
    type: chartType,
    data: data.map((d) => Number(d[field] ?? 0)),
    ...(chartType === 'bar'
      ? { barMaxWidth: 40, itemStyle: { borderRadius: [4, 4, 0, 0] } }
      : { smooth: true, symbol: 'circle', symbolSize: 6 }),
    color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
  }));

  return {
    color: COLOR_PALETTE,
    tooltip: { trigger: 'axis' },
    legend: valueFields.length > 1 ? { data: valueFields, bottom: 0 } : undefined,
    grid: { left: '3%', right: '4%', bottom: valueFields.length > 1 ? '15%' : '3%', containLabel: true },
    xAxis: { type: 'category', data: categories, axisLabel: { interval: 0, rotate: categories.length > 6 ? 30 : 0 } },
    yAxis: { type: 'value' },
    series,
  };
}
