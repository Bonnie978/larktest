import type { DashboardCard, AggregationType } from '@/types/dashboard';

export const STORAGE_KEY = 'dashboard-v2';

export const LAYOUT_VERSION = 2;

export const GRID_CONFIG = {
  cols: 12,
  rowHeight: 70,
  margin: [12, 12] as [number, number],
  containerPadding: [0, 0] as [number, number],
  minW: 4,
  minH: 4,
};

export const CHART_COLORS = [
  '#1664FF',
  '#14C9C9',
  '#78D3F8',
  '#9FDB1D',
  '#F7BA1E',
  '#722ED1',
  '#F53F3F',
  '#FF7D00',
];

export const AGGREGATION_OPTIONS: { label: string; value: AggregationType }[] = [
  { label: '无聚合', value: 'none' },
  { label: '求和', value: 'sum' },
  { label: '平均值', value: 'avg' },
  { label: '计数', value: 'count' },
  { label: '最大值', value: 'max' },
];

export const CHART_TYPE_OPTIONS = [
  { label: '柱状图', value: 'bar' as const, icon: 'BarChart3' },
  { label: '折线图', value: 'line' as const, icon: 'TrendingUp' },
  { label: '饼图', value: 'pie' as const, icon: 'PieChart' },
];

export const DATASOURCE_ICONS: Record<string, string> = {
  'line-production': '🏭',
  'equipment': '⚙️',
  'quality': '🔍',
  'orders': '📋',
  'weekly-defects': '📈',
};

export const DEFAULT_DASHBOARD: DashboardCard[] = [
  {
    config: {
      id: 'default-1',
      title: '产线产量完成情况',
      dataSourceId: 'line-production',
      chartType: 'bar',
      groupByField: 'lineName',
      valueFields: ['planned', 'actual'],
      aggregation: 'none',
    },
    grid: { x: 0, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-2',
      title: '近7天不良率趋势',
      dataSourceId: 'weekly-defects',
      chartType: 'line',
      groupByField: 'date',
      valueFields: ['defectRate'],
      aggregation: 'none',
    },
    grid: { x: 6, y: 0, w: 6, h: 4 },
  },
  {
    config: {
      id: 'default-3',
      title: '不良类型分布',
      dataSourceId: 'quality',
      chartType: 'pie',
      groupByField: 'defectType',
      valueFields: ['defectCount'],
      aggregation: 'sum',
    },
    grid: { x: 0, y: 4, w: 6, h: 4 },
  },
];
