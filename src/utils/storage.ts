import { dataSourceMeta } from '@/config/dataSources';
import type { ChartConfig, DataSourceType } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard-charts';

export function validateChartConfig(config: unknown): config is ChartConfig {
  if (!config || typeof config !== 'object') return false;

  const chart = config as ChartConfig;
  const meta = dataSourceMeta[chart.dataSource as DataSourceType];
  if (!meta) return false;

  const dimensionValid = meta.dimensions.some(item => item.field === chart.dimension);
  const metricsValid = Array.isArray(chart.metrics)
    && chart.metrics.length > 0
    && chart.metrics.every(metric => meta.metrics.some(item => item.field === metric));
  const layoutValid = !!chart.layout
    && ['x', 'y', 'w', 'h'].every(key => typeof chart.layout[key as keyof typeof chart.layout] === 'number');

  return typeof chart.id === 'string'
    && typeof chart.title === 'string'
    && dimensionValid
    && metricsValid
    && layoutValid;
}

export function loadCharts(): ChartConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(validateChartConfig);
  } catch {
    return [];
  }
}

export function saveCharts(charts: ChartConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(charts.filter(validateChartConfig)));
  } catch (e) {
    console.error('Failed to save charts to localStorage', e);
  }
}
