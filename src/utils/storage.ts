import type { Layout } from 'react-grid-layout';
import type { AggregationType } from './aggregation';

export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: 'bar' | 'line' | 'pie';
  groupByField: string;
  valueFields: string[];
  aggregation: AggregationType;
}

export interface DashboardCard {
  i: string;
  config: CardConfig;
}

export interface DashboardState {
  version: number;
  cards: DashboardCard[];
  layouts: Layout[];
}

const STORAGE_KEY = 'dashboard-v2';

const DEFAULT_CARDS: DashboardCard[] = [
  {
    i: 'card-1',
    config: {
      id: 'default-1',
      title: '产线产量完成情况',
      dataSourceId: 'line-production',
      chartType: 'bar',
      groupByField: 'lineName',
      valueFields: ['planned', 'actual'],
      aggregation: 'none'
    }
  },
  {
    i: 'card-2',
    config: {
      id: 'default-2',
      title: '近7天不良率趋势',
      dataSourceId: 'weekly-defects',
      chartType: 'line',
      groupByField: 'date',
      valueFields: ['defectRate'],
      aggregation: 'none'
    }
  },
  {
    i: 'card-3',
    config: {
      id: 'default-3',
      title: '不良类型分布',
      dataSourceId: 'quality',
      chartType: 'pie',
      groupByField: 'defectType',
      valueFields: ['defectCount'],
      aggregation: 'sum'
    }
  }
];

const DEFAULT_LAYOUTS: Layout[] = [
  { i: 'card-1', x: 0, y: 0, w: 6, h: 4 },
  { i: 'card-2', x: 6, y: 0, w: 6, h: 4 },
  { i: 'card-3', x: 0, y: 4, w: 6, h: 4 }
];

export function getDefaultDashboard(): DashboardState {
  return {
    version: 2,
    cards: [...DEFAULT_CARDS],
    layouts: DEFAULT_LAYOUTS.map(l => ({ ...l })),
  };
}

export function loadDashboard(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultDashboard();
    const parsed = JSON.parse(raw) as DashboardState;
    if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.layouts)) {
      return getDefaultDashboard();
    }
    return parsed;
  } catch {
    return getDefaultDashboard();
  }
}

export function saveDashboard(state: DashboardState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearDashboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}
