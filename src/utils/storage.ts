import type { ChartConfig } from '@/types/dashboard';

const STORAGE_KEY = 'dashboard-charts';
const STORAGE_KEY_V2 = 'dashboard-v2';

// Legacy storage for Dashboard.tsx
export function loadCharts(): ChartConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChartConfig[];
  } catch {
    return [];
  }
}

export function saveCharts(charts: ChartConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
  } catch (e) {
    console.error('Failed to save charts to localStorage', e);
  }
}

// New dashboard-v2 storage for DashboardEditor.tsx
export interface CardConfig {
  id: string;
  title: string;
  dataSourceId: string;
  chartType: 'bar' | 'line' | 'pie';
  groupByField: string;
  valueFields: string[];
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'none';
}

export interface GridLayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardCard {
  config: CardConfig;
  grid: GridLayoutItem;
}

export interface DashboardConfig {
  version: number;
  cards: DashboardCard[];
}

const getDefaultCards = (): DashboardCard[] => [
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

export function loadDashboard(): DashboardCard[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_V2);
    if (!saved) return getDefaultCards();
    
    const config: DashboardConfig = JSON.parse(saved);
    
    // Version validation
    if (config.version !== 2) {
      console.warn('Dashboard version mismatch, falling back to default');
      return getDefaultCards();
    }
    
    // Structure validation
    if (!Array.isArray(config.cards)) {
      console.warn('Invalid dashboard cards structure, falling back to default');
      return getDefaultCards();
    }
    
    // Validate each card has required fields
    const isValid = config.cards.every(
      card =>
        card.config &&
        card.config.id &&
        card.config.title &&
        card.grid &&
        typeof card.grid.x === 'number' &&
        typeof card.grid.y === 'number' &&
        typeof card.grid.w === 'number' &&
        typeof card.grid.h === 'number'
    );
    
    if (!isValid) {
      console.warn('Invalid card structure, falling back to default');
      return getDefaultCards();
    }
    
    return config.cards;
  } catch (error) {
    console.error('Failed to load dashboard from localStorage', error);
    return getDefaultCards();
  }
}

export function saveDashboard(cards: DashboardCard[]): void {
  try {
    const config: DashboardConfig = {
      version: 2,
      cards,
    };
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save dashboard to localStorage', error);
  }
}
